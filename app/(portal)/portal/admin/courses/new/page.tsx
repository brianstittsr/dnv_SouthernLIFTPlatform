"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    facilitatorName: "",
    facilitatorId: "",
    courseStartDate: "",
    courseEndDate: "",
    estimatedDurationWeeks: 12,
    maxParticipants: 50,
    priceInCents: 0,
    compareAtPriceInCents: 0,
    status: "draft",
    difficultyLevel: "intermediate",
    isPublished: false,
    thumbnailUrl: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  async function handleCreate() {
    if (!db) {
      toast.error("Database connection not available");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSaving(true);

      const courseData: any = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        courseStartDate: formData.courseStartDate
          ? Timestamp.fromDate(new Date(formData.courseStartDate))
          : null,
        courseEndDate: formData.courseEndDate
          ? Timestamp.fromDate(new Date(formData.courseEndDate))
          : null,
        currentParticipants: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "courses"), courseData);

      toast.success("Course created successfully");
      router.push(`/portal/admin/courses/${docRef.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const parseCurrency = (value: string) => {
    return Math.round(parseFloat(value || "0") * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/portal/admin/courses")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground mt-1">Set up a new training course</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/portal/admin/courses")}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Course
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core details about the course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="e.g., CMMC Level 2 Advanced"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., cmmc-level-2-advanced"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this course..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facilitatorName">Facilitator Name</Label>
              <Input
                id="facilitatorName"
                value={formData.facilitatorName}
                onChange={(e) => setFormData({ ...formData, facilitatorName: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & Capacity</CardTitle>
          <CardDescription>Dates and enrollment limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.courseStartDate}
                onChange={(e) => setFormData({ ...formData, courseStartDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.courseEndDate}
                onChange={(e) => setFormData({ ...formData, courseEndDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDurationWeeks}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedDurationWeeks: parseInt(e.target.value) || 12 })
                }
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })
                }
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set enrollment pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formatCurrency(formData.priceInCents)}
                onChange={(e) =>
                  setFormData({ ...formData, priceInCents: parseCurrency(e.target.value) })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Compare At Price (USD)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                value={formatCurrency(formData.compareAtPriceInCents)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compareAtPriceInCents: parseCurrency(e.target.value),
                  })
                }
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Original price to show savings (optional)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Visibility</CardTitle>
          <CardDescription>Control course status and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="enrolling">Enrolling</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
              <Label>Published (visible to students)</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
