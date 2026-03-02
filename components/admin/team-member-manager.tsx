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
  getTeammembers,
  createTeammember,
  updateTeammember,
  deleteTeammember,
  type Teammember,
  type CreateTeammemberInput,
} from "@/lib/team-members";

export function TeammemberManager() {
  const { profile } = useUserProfile();
  const [teammembers, setTeammembers] = useState<Teammember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingmember, setEditingmember] = useState<Teammember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingmember, setDeletingmember] = useState<Teammember | null>(null);

  useEffect(() => {
    loadTeammembers();
  }, []);

  async function loadTeammembers() {
    setIsLoading(true);
    try {
      const members = await getTeammembers();
      setTeammembers(members.sort((a: Teammember, b: Teammember) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(member: Teammember) {
    setEditingmember(member);
    setDialogOpen(true);
  }

  function handleDelete(member: Teammember) {
    setDeletingmember(member);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deletingmember) return;
    
    try {
      await deleteTeammember(deletingmember.id);
      toast.success("Team member deleted");
      loadTeammembers();
    } catch (error) {
      toast.error("Failed to delete team member");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingmember(null);
    }
  }

  function handleAddNew() {
    setEditingmember(null);
    setDialogOpen(true);
  }

  function handleSuccess() {
    setDialogOpen(false);
    setEditingmember(null);
    loadTeammembers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team members</h2>
          <p className="text-sm text-muted-foreground">
            Manage team members displayed on the website
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTeammembers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Team</CardTitle>
          <CardDescription>
            {teammembers.length} team member{teammembers.length !== 1 ? "s" : ""} on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : teammembers.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <User className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Team members</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add team members to display them on the team page
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Team member
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
                {teammembers.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <span className="text-muted-foreground">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            {member.initials}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.title}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member)}
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
          <TeammemberForm
            member={editingmember}
            onSuccess={handleSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingmember?.name}? This action cannot be undone.
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

interface TeammemberFormProps {
  member: Teammember | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function TeammemberForm({ member, onSuccess, onCancel }: TeammemberFormProps) {
  const { profile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(member?.imageUrl || null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  const [formData, setFormData] = useState<CreateTeammemberInput>({
    name: member?.name || "",
    title: member?.title || "",
    initials: member?.initials || "",
    bio: member?.bio || "",
    imageUrl: member?.imageUrl || "",
    imageName: member?.imageName || "",
    order: member?.order || 0,
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
      if (member) {
        await updateTeammember(member.id, {
          ...formData,
          updatedBy: profile.id,
        });
        toast.success("Team member updated");
      } else {
        await createTeammember({
          ...formData,
          createdBy: profile.id,
        });
        toast.success("Team member created");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{member ? "Edit Team member" : "Add Team member"}</DialogTitle>
        <DialogDescription>
          Fill in the details for the team member
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
            placeholder="Brief description or tagline for this team member"
            rows={3}
          />
        </div>

        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
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
          ) : member ? (
            "Update Team member"
          ) : (
            "Create Team member"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
