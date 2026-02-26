"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  User,
  Upload,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";
import {
  getTeamMeemerging businessrs,
  createTeamMeemerging businessr,
  updateTeamMeemerging businessr,
  deleteTeamMeemerging businessr,
  type TeamMeemerging businessr,
  type CreateTeamMeemerging businessrInput,
} from "@/lib/team-meemerging businessrs";

export function TeamMeemerging businessrManager() {
  const { profile } = useUserProfile();
  const [teamMeemerging businessrs, setTeamMeemerging businessrs] = useState<TeamMeemerging businessr[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeemerging businessr, setEditingMeemerging businessr] = useState<TeamMeemerging businessr | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMeemerging businessr, setDeletingMeemerging businessr] = useState<TeamMeemerging businessr | null>(null);

  useEffect(() => {
    loadTeamMeemerging businessrs();
  }, []);

  async function loadTeamMeemerging businessrs() {
    setIsLoading(true);
    try {
      const meemerging businessrs = await getTeamMeemerging businessrs();
      setTeamMeemerging businessrs(meemerging businessrs.sort((a: TeamMeemerging businessr, b: TeamMeemerging businessr) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error("Error loading team meemerging businessrs:", error);
      toast.error("Failed to load team meemerging businessrs");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(meemerging businessr: TeamMeemerging businessr) {
    setEditingMeemerging businessr(meemerging businessr);
    setDialogOpen(true);
  }

  function handleDelete(meemerging businessr: TeamMeemerging businessr) {
    setDeletingMeemerging businessr(meemerging businessr);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deletingMeemerging businessr) return;
    
    try {
      await deleteTeamMeemerging businessr(deletingMeemerging businessr.id);
      toast.success("Team meemerging businessr deleted");
      loadTeamMeemerging businessrs();
    } catch (error) {
      toast.error("Failed to delete team meemerging businessr");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingMeemerging businessr(null);
    }
  }

  function handleAddNew() {
    setEditingMeemerging businessr(null);
    setDialogOpen(true);
  }

  function handleSuccess() {
    setDialogOpen(false);
    setEditingMeemerging businessr(null);
    loadTeamMeemerging businessrs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Meemerging businessrs</h2>
          <p className="text-sm text-muted-foreground">
            Manage team meemerging businessrs displayed on the website
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTeamMeemerging businessrs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team Meemerging businessr
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Team</CardTitle>
          <CardDescription>
            {teamMeemerging businessrs.length} team meemerging businessr{teamMeemerging businessrs.length !== 1 ? "s" : ""} on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : teamMeemerging businessrs.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <User className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Team Meemerging businessrs</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add team meemerging businessrs to display them on the team page
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Team Meemerging businessr
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMeemerging businessrs.map((meemerging businessr, index) => (
                  <TableRow key={meemerging businessr.id}>
                    <TableCell>
                      <span className="text-muted-foreground">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                        {meemerging businessr.imageUrl ? (
                          <img
                            src={meemerging businessr.imageUrl}
                            alt={meemerging businessr.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            {meemerging businessr.initials}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{meemerging businessr.name}</TableCell>
                    <TableCell>{meemerging businessr.title}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(meemerging businessr)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(meemerging businessr)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <TeamMeemerging businessrForm
            meemerging businessr={editingMeemerging businessr}
            onSuccess={handleSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Meemerging businessr</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingMeemerging businessr?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TeamMeemerging businessrFormProps {
  meemerging businessr: TeamMeemerging businessr | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function TeamMeemerging businessrForm({ meemerging businessr, onSuccess, onCancel }: TeamMeemerging businessrFormProps) {
  const { profile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(meemerging businessr?.imageUrl || null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  const [formData, setFormData] = useState<CreateTeamMeemerging businessrInput>({
    name: meemerging businessr?.name || "",
    title: meemerging businessr?.title || "",
    initials: meemerging businessr?.initials || "",
    bio: meemerging businessr?.bio || "",
    imageUrl: meemerging businessr?.imageUrl || "",
    imageName: meemerging businessr?.imageName || "",
    order: meemerging businessr?.order || 0,
  });

  useEffect(() => {
    loadAvailableImages();
  }, []);

  async function loadAvailableImages() {
    try {
      const images = await listImages("team");
      const imageUrls = await Promise.all(
        images.map(async (img) => {
          const fullImage = await getImage(img.id);
          if (fullImage && fullImage.base64Data) {
            return {
              id: img.id,
              name: img.name,
              url: base64ToDataUrl(fullImage.base64Data, fullImage.mimeType),
            };
          }
          return null;
        })
      );
      setAvailableImages(imageUrls.filter((img): img is { id: string; name: string; url: string } => img !== null));
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }

  function handleImageSelect(image: { id: string; name: string; url: string }) {
    setSelectedImageId(image.id);
    setImagePreview(image.url);
    setFormData({ ...formData, imageUrl: image.url, imageName: image.name });
    setShowImageSelector(false);
  }

  function generateInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      initials: generateInitials(name),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name || !formData.title || !profile?.id) {
      toast.error("Name and title are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (meemerging businessr) {
        await updateTeamMeemerging businessr(meemerging businessr.id, {
          ...formData,
          updatedBy: profile.id,
        });
        toast.success("Team meemerging businessr updated");
      } else {
        await createTeamMeemerging businessr({
          ...formData,
          createdBy: profile.id,
        });
        toast.success("Team meemerging businessr created");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving team meemerging businessr:", error);
      toast.error("Failed to save team meemerging businessr");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{meemerging businessr ? "Edit Team Meemerging businessr" : "Add Team Meemerging businessr"}</DialogTitle>
        <DialogDescription>
          Fill in the details for the team meemerging businessr
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Photo Selection */}
        <div className="space-y-2">
          <Label>Photo</Label>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-xl overflow-hidden bg-muted border">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {formData.initials || "?"}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImageSelector(!showImageSelector)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {imagePreview ? "Change Photo" : "Select Photo"}
            </Button>
          </div>
          
          {showImageSelector && (
            <Card className="mt-2">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Select from Image Manager</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {availableImages.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => handleImageSelect(image)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageId === image.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                {availableImages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No team photos available. Upload images in Image Manager first.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., John Smith"
            required
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title/Position *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., CEO, Consultant"
            required
          />
        </div>

        {/* Initials */}
        <div className="space-y-2">
          <Label htmlFor="initials">Initials (auto-generated)</Label>
          <Input
            id="initials"
            value={formData.initials}
            onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
            placeholder="e.g., JS"
            maxLength={2}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio/Tagline</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Brief description or tagline for this team meemerging businessr"
            rows={3}
          />
        </div>

        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="nuemerging businessr"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : meemerging businessr ? (
            "Update Team Meemerging businessr"
          ) : (
            "Create Team Meemerging businessr"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
