"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { createCohort } from "@/lib/firebase-cohorts";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

export default function CreateCohortPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    facilitatorName: (profile as any).name || (profile as any).displayName || "",
    facilitatorBio: "",
    cohortStartDate: "",
    cohortEndDate: "",
    maxParticipants: 30,
    estimatedDurationWeeks: 12,
    difficultyLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
    priceInCents: 0,
    isFree: true,
    tags: "",
    learningOutcomes: "",
    prerequisites: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a cohort title");
      return;
    }
    
    if (!formData.cohortStartDate || !formData.cohortEndDate) {
      toast.error("Please set cohort start and end dates");
      return;
    }
    
    try {
      setSaving(true);
      
      const cohortData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        facilitatorId: profile.id,
        facilitatorName: formData.facilitatorName,
        facilitatorBio: formData.facilitatorBio || null,
        cohortStartDate: Timestamp.fromDate(new Date(formData.cohortStartDate)),
        cohortEndDate: Timestamp.fromDate(new Date(formData.cohortEndDate)),
        maxParticipants: formData.maxParticipants,
        currentParticipants: 0,
        estimatedDurationWeeks: formData.estimatedDurationWeeks,
        status: "draft" as const,
        difficultyLevel: formData.difficultyLevel,
        priceInCents: formData.isFree ? 0 : formData.priceInCents,
        isFree: formData.isFree,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        learningOutcomes: formData.learningOutcomes ? formData.learningOutcomes.split("\n").filter(l => l.trim()) : [],
        prerequisites: formData.prerequisites ? formData.prerequisites.split("\n").filter(p => p.trim()) : [],
        isPublished: false,
      };
      
      const cohortId = await createCohort(cohortData);
      
      toast.success("Cohort created successfully!");
      router.push(`/portal/instructor/cohorts/${cohortId}/curriculum`);
    } catch (error: any) {
      console.error("Error creating cohort:", error);
      toast.error("Failed to create cohort");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cohorts
        </Button>
        <h1 className="text-3xl font-bold">Create New Cohort</h1>
        <p className="text-muted-foreground">Set up a new training cohort for your participants</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-4xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about your cohort</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Cohort Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., CMMC Fundamentals - Fast Track"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="cmmc-fundamentals-fast-track"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from title, but you can customize it
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what participants will learn in this cohort..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Facilitator Information */}
          <Card>
            <CardHeader>
              <CardTitle>Facilitator Information</CardTitle>
              <CardDescription>Information about the cohort facilitator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facilitatorName">Facilitator Name</Label>
                <Input
                  id="facilitatorName"
                  value={formData.facilitatorName}
                  onChange={(e) => setFormData({ ...formData, facilitatorName: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <Label htmlFor="facilitatorBio">Facilitator Bio (optional)</Label>
                <Textarea
                  id="facilitatorBio"
                  value={formData.facilitatorBio}
                  onChange={(e) => setFormData({ ...formData, facilitatorBio: e.target.value })}
                  placeholder="Brief bio about your expertise..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Capacity</CardTitle>
              <CardDescription>Set cohort dates and participant limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.cohortStartDate}
                    onChange={(e) => setFormData({ ...formData, cohortStartDate: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.cohortEndDate}
                    onChange={(e) => setFormData({ ...formData, cohortEndDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.estimatedDurationWeeks}
                    onChange={(e) => setFormData({ ...formData, estimatedDurationWeeks: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, difficultyLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set cohort pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isFree" className="cursor-pointer">
                  This cohort is free
                </Label>
              </div>
              
              {!formData.isFree && (
                <div>
                  <Label htmlFor="price">Price (in cents)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.priceInCents}
                    onChange={(e) => setFormData({ ...formData, priceInCents: parseInt(e.target.value) })}
                    placeholder="e.g., 350000 for $3,500.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter amount in cents (e.g., 350000 = $3,500.00)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Learning outcomes, prerequisites, and tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="learningOutcomes">Learning Outcomes (one per line)</Label>
                <Textarea
                  id="learningOutcomes"
                  value={formData.learningOutcomes}
                  onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                  placeholder="Understand CMMC framework&#10;Implement security controls&#10;Prepare for certification"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="prerequisites">Prerequisites (one per line)</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="Basic cybersecurity knowledge&#10;Access to company systems"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="CMMC, Cybersecurity, Compliance"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Cohort
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
