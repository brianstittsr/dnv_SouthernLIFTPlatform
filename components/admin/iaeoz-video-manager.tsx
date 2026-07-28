"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Youtube,
  Play,
  ExternalLink,
  RefreshCw,
  Loader2,
  X,
  Calendar,
  User,
  Building2,
  Tag,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  addIAEOZVideo,
  listAllIAEOZVideos,
  updateIAEOZVideo,
  deleteIAEOZVideo,
  extractYouTubeId,
  getYouTubeThumbnail,
  formatDuration,
  IAEOZ_VIDEO_TYPE_OPTIONS,
  type IAEOZVideoMetadata,
  type IAEOZVideoType,
} from "@/lib/firebase-iaeoz-videos";

interface IAEOZVideoFormData {
  title: string;
  description: string;
  youtubeUrl: string;
  year: string;
  type: IAEOZVideoType;
  speaker: string;
  organization: string;
  durationSeconds: string;
  viewCount: string;
}

const emptyForm: IAEOZVideoFormData = {
  title: "",
  description: "",
  youtubeUrl: "",
  year: new Date().getFullYear().toString(),
  type: "presentation",
  speaker: "",
  organization: "",
  durationSeconds: "",
  viewCount: "",
};

export function IAEOZVideoManager() {
  const { profile } = useUserProfile();
  const [videos, setVideos] = useState<IAEOZVideoMetadata[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<IAEOZVideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<IAEOZVideoMetadata | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [videos, searchQuery, filterYear, filterType, showInactive]);

  async function loadVideos() {
    setIsLoading(true);
    try {
      const loaded = await listAllIAEOZVideos();
      setVideos(loaded);
    } catch (error) {
      console.error("Error loading IAEOZ videos:", error);
      toast.error("Failed to load IAEOZ videos");
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...videos];

    if (!showInactive) {
      filtered = filtered.filter((v) => v.isActive);
    }

    if (filterYear !== "all") {
      filtered = filtered.filter((v) => v.year.toString() === filterYear);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((v) => v.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.speaker?.toLowerCase().includes(q) ||
          v.organization?.toLowerCase().includes(q)
      );
    }

    setFilteredVideos(filtered);
  }

  const uniqueYears = useMemo(() => {
    const years = new Set(videos.map((v) => v.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [videos]);

  const groupedByYear = useMemo(() => {
    const grouped: Record<number, IAEOZVideoMetadata[]> = {};
    filteredVideos.forEach((video) => {
      if (!grouped[video.year]) {
        grouped[video.year] = [];
      }
      grouped[video.year].push(video);
    });
    return grouped;
  }, [filteredVideos]);

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  async function handleDelete() {
    if (!deleteVideoId) return;
    setIsDeleting(true);
    try {
      const success = await deleteIAEOZVideo(deleteVideoId);
      if (success) {
        toast.success("Video deleted successfully");
        setVideos(videos.filter((v) => v.id !== deleteVideoId));
        setDeleteVideoId(null);
      } else {
        toast.error("Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleActive(video: IAEOZVideoMetadata) {
    const success = await updateIAEOZVideo(video.id, { isActive: !video.isActive });
    if (success) {
      setVideos(videos.map((v) => (v.id === video.id ? { ...v, isActive: !v.isActive } : v)));
      toast.success(`Video ${!video.isActive ? "activated" : "deactivated"}`);
    } else {
      toast.error("Failed to update video status");
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setFilterYear("all");
    setFilterType("all");
  }

  const hasActiveFilters = searchQuery || filterYear !== "all" || filterType !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IAEOZ Summit Videos</h2>
          <p className="text-sm text-muted-foreground">
            Manage YouTube videos from the IAEOZ Summit video archive
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadVideos} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">Total Videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueYears.length}</div>
            <p className="text-xs text-muted-foreground">Years Covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{videos.filter((v) => v.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{videos.filter((v) => !v.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find videos by keyword, year, or type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, speaker, description, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {IAEOZ_VIDEO_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={showInactive}
                onCheckedChange={setShowInactive}
                id="show-inactive"
              />
              <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
                Show inactive videos
              </Label>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredVideos.length} of {videos.length} videos
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Youtube className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Videos Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {hasActiveFilters
                ? "No videos match your filters. Try adjusting your search."
                : "Add your first IAEOZ Summit video to get started."}
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Video
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {sortedYears.map((year) => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-2xl font-bold tracking-tight">{year}</h3>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {groupedByYear[year].length} Videos
                </Badge>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedByYear[year].map((video) => (
                  <IAEOZVideoCard
                    key={video.id}
                    video={video}
                    onEdit={() => setEditingVideo(video)}
                    onDelete={() => setDeleteVideoId(video.id)}
                    onToggleActive={() => handleToggleActive(video)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <IAEOZVideoForm
            mode="add"
            onSubmit={async (formData) => {
              const youtubeId = extractYouTubeId(formData.youtubeUrl);
              if (!youtubeId) {
                toast.error("Invalid YouTube URL");
                return;
              }
              try {
                await addIAEOZVideo({
                  title: formData.title,
                  description: formData.description,
                  youtubeUrl: formData.youtubeUrl,
                  year: parseInt(formData.year),
                  type: formData.type,
                  speaker: formData.speaker || null,
                  organization: formData.organization || null,
                  durationSeconds: formData.durationSeconds ? parseInt(formData.durationSeconds) : 0,
                  viewCount: formData.viewCount ? parseInt(formData.viewCount) : 0,
                  createdBy: profile?.id,
                });
                toast.success("Video added successfully!");
                setAddDialogOpen(false);
                loadVideos();
              } catch (error: any) {
                toast.error(error.message || "Failed to add video");
              }
            }}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingVideo && (
            <IAEOZVideoForm
              mode="edit"
              video={editingVideo}
              onSubmit={async (formData) => {
                const success = await updateIAEOZVideo(editingVideo.id, {
                  title: formData.title,
                  description: formData.description,
                  year: parseInt(formData.year),
                  type: formData.type,
                  speaker: formData.speaker || null,
                  organization: formData.organization || null,
                  durationSeconds: formData.durationSeconds ? parseInt(formData.durationSeconds) : 0,
                  viewCount: formData.viewCount ? parseInt(formData.viewCount) : 0,
                });
                if (success) {
                  toast.success("Video updated successfully");
                  setEditingVideo(null);
                  loadVideos();
                } else {
                  toast.error("Failed to update video");
                }
              }}
              onCancel={() => setEditingVideo(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVideoId} onOpenChange={(open) => !open && setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ Video Card ============

interface IAEOZVideoCardProps {
  video: IAEOZVideoMetadata;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function IAEOZVideoCard({ video, onEdit, onDelete, onToggleActive }: IAEOZVideoCardProps) {
  return (
    <Card className={`overflow-hidden flex flex-col ${!video.isActive ? "opacity-60" : ""}`}>
      <div className="relative w-full aspect-video bg-muted">
        <img
          src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId, "medium")}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getYouTubeThumbnail(video.youtubeId, "medium");
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
          >
            <Play className="h-5 w-5 ml-0.5" />
          </a>
        </div>
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="secondary" className="text-xs capitalize">
            {video.type}
          </Badge>
          {!video.isActive && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
        {video.durationSeconds > 0 && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
            {formatDuration(video.durationSeconds)}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-sm line-clamp-2" title={video.title}>
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {video.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {video.speaker && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span className="truncate">{video.speaker}</span>
            </div>
          )}
          {video.organization && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{video.organization}</span>
            </div>
          )}
          {video.viewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              <span>{video.viewCount.toLocaleString()} views</span>
            </div>
          )}
        </div>

        <div className="flex gap-1.5 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(video.url, "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Watch
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleActive}>
            {video.isActive ? <Eye className="h-3 w-3" /> : <Eye className="h-3 w-3 opacity-50" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Video Form ============

interface IAEOZVideoFormProps {
  mode: "add" | "edit";
  video?: IAEOZVideoMetadata;
  onSubmit: (formData: IAEOZVideoFormData) => Promise<void>;
  onCancel: () => void;
}

function IAEOZVideoForm({ mode, video, onSubmit, onCancel }: IAEOZVideoFormProps) {
  const [formData, setFormData] = useState<IAEOZVideoFormData>(
    video
      ? {
          title: video.title,
          description: video.description || "",
          youtubeUrl: video.url,
          year: video.year.toString(),
          type: video.type,
          speaker: video.speaker || "",
          organization: video.organization || "",
          durationSeconds: video.durationSeconds ? video.durationSeconds.toString() : "",
          viewCount: video.viewCount ? video.viewCount.toString() : "",
        }
      : emptyForm
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(
    video?.youtubeId || null
  );

  useEffect(() => {
    if (mode === "add") {
      const id = extractYouTubeId(formData.youtubeUrl);
      setPreviewId(id);
    }
  }, [formData.youtubeUrl, mode]);

  function updateField<K extends keyof IAEOZVideoFormData>(field: K, value: IAEOZVideoFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!formData.title || (mode === "add" && !formData.youtubeUrl)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (mode === "add") {
      const youtubeId = extractYouTubeId(formData.youtubeUrl);
      if (!youtubeId) {
        toast.error("Invalid YouTube URL. Please check the link.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to save video");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "add" ? "Add IAEOZ Summit Video" : "Edit IAEOZ Summit Video"}</DialogTitle>
        <DialogDescription>
          {mode === "add"
            ? "Add a YouTube video to the IAEOZ Summit archive."
            : "Update video metadata. The YouTube link cannot be changed."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* YouTube URL */}
        <div>
          <Label htmlFor="youtubeUrl">YouTube URL *</Label>
          <Input
            id="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={(e) => updateField("youtubeUrl", e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
            disabled={isSubmitting || mode === "edit"}
          />
          {mode === "add" && (
            <p className="text-xs text-muted-foreground mt-1">
              Paste a YouTube video link
            </p>
          )}
        </div>

        {/* Thumbnail Preview */}
        {previewId && (
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={getYouTubeThumbnail(previewId, "medium")}
              alt="Video thumbnail preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getYouTubeThumbnail(previewId, "default");
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Video title"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Brief description of the video"
            disabled={isSubmitting}
            rows={2}
          />
        </div>

        {/* Year & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => updateField("year", e.target.value)}
              placeholder="2024"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateField("type", value as IAEOZVideoType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IAEOZ_VIDEO_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Speaker & Organization */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speaker">Speaker</Label>
            <Input
              id="speaker"
              value={formData.speaker}
              onChange={(e) => updateField("speaker", e.target.value)}
              placeholder="Speaker name"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => updateField("organization", e.target.value)}
              placeholder="Organization name"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Duration & Views */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="durationSeconds">Duration (seconds)</Label>
            <Input
              id="durationSeconds"
              type="number"
              value={formData.durationSeconds}
              onChange={(e) => updateField("durationSeconds", e.target.value)}
              placeholder="e.g., 2700 (45 min)"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="viewCount">View Count</Label>
            <Input
              id="viewCount"
              type="number"
              value={formData.viewCount}
              onChange={(e) => updateField("viewCount", e.target.value)}
              placeholder="e.g., 150"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title || (mode === "add" && !formData.youtubeUrl)}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === "add" ? "Adding..." : "Saving..."}
            </>
          ) : (
            <>
              {mode === "add" ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </>
              ) : (
                "Save Changes"
              )}
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
