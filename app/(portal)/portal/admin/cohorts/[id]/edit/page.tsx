"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
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

export default function EditCohortPage() {
  const params = useParams();
  const router = useRouter();
  const cohortId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    facilitatorName: "",
    facilitatorId: "",
    cohortStartDate: "",
    cohortEndDate: "",
    estimatedDurationWeeks: 12,
    maxParticipants: 50,
    priceInCents: 0,
    compareAtPriceInCents: 0,
    status: "draft",
    difficultyLevel: "intermediate",
    isPublished: false,
    thumbnailUrl: "",
  });

  useEffect(() => {
    loadCohort();
  }, [cohortId]);

  async function loadCohort() {
    if (!db) {
      toast.error("Database connection not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cohortDoc = await getDoc(doc(db, "cohorts", cohortId));

      if (!cohortDoc.exists()) {
        toast.error("Cohort not found");
        router.push("/portal/admin/cohorts");
        return;
      }

      const data = cohortDoc.data();
      
      // Convert Firestore timestamps to date strings
      const startDate = data.cohortStartDate?.toDate
        ? data.cohortStartDate.toDate().toISOString().split("T")[0]
        : "";
      const endDate = data.cohortEndDate?.toDate
        ? data.cohortEndDate.toDate().toISOString().split("T")[0]
        : "";

      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        facilitatorName: data.facilitatorName || "",
        facilitatorId: data.facilitatorId || "",
        cohortStartDate: startDate,
        cohortEndDate: endDate,
        estimatedDurationWeeks: data.estimatedDurationWeeks || 12,
        maxParticipants: data.maxParticipants || 50,
        priceInCents: data.priceInCents || 0,
        compareAtPriceInCents: data.compareAtPriceInCents || 0,
        status: data.status || "draft",
        difficultyLevel: data.difficultyLevel || "intermediate",
        isPublished: data.isPublished || false,
        thumbnailUrl: data.thumbnailUrl || "",
      });
    } catch (error) {
      console.error("Error loading cohort:", error);
      toast.error("Failed to load cohort");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
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

      const updateData: any = {
        ...formData,
        cohortStartDate: formData.cohortStartDate
          ? Timestamp.fromDate(new Date(formData.cohortStartDate))
          : null,
        cohortEndDate: formData.cohortEndDate
          ? Timestamp.fromDate(new Date(formData.cohortEndDate))
          : null,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "cohorts", cohortId), updateData);

      toast.success("Cohort updated successfully");
      router.push(`/portal/admin/cohorts/${cohortId}`);
    } catch (error) {
      console.error("Error updating cohort:", error);
      toast.error("Failed to update cohort");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cohort...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/portal/admin/cohorts/${cohortId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Cohort</h1>
            <p className="text-muted-foreground mt-1">Update cohort information and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/portal/admin/cohorts/${cohortId}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core details about the cohort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Cohort Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              placeholder="Describe what students will learn in this cohort..."
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
                value={formData.cohortStartDate}
                onChange={(e) => setFormData({ ...formData, cohortStartDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.cohortEndDate}
                onChange={(e) => setFormData({ ...formData, cohortEndDate: e.target.value })}
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
          <CardDescription>Control cohort status and visibility</CardDescription>
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
