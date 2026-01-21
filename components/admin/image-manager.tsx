"use client";

import { useState, useEffect, useRef } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Upload,
  Trash2,
  Edit,
  Image as ImageIcon,
  Loader2,
  Copy,
  Check,
  X,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadImage,
  listImages,
  getImage,
  deleteImage,
  updateImageMetadata,
  base64ToDataUrl,
  type ImageCategory,
  type ImageMetadata,
  type ImageUploadOptions,
  SITE_IMAGE_KEYS,
} from "@/lib/firebase-images";

const CATEGORY_OPTIONS: { value: ImageCategory; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "about", label: "About" },
  { value: "team", label: "Team" },
  { value: "services", label: "Services" },
  { value: "testimonials", label: "Testimonials" },
  { value: "logos", label: "Logos" },
  { value: "icons", label: "Icons" },
  { value: "backgrounds", label: "Backgrounds" },
  { value: "marketing", label: "Marketing" },
  { value: "portal", label: "Portal" },
  { value: "other", label: "Other" },
];

export function ImageManager() {
  const { profile } = useUserProfile();
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ImageCategory | "all">("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadImages();
  }, [filterCategory]);

  async function loadImages() {
    setIsLoading(true);
    try {
      const category = filterCategory === "all" ? undefined : filterCategory;
      const loadedImages = await listImages(category);
      setImages(loadedImages);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  }

  function handleUploadSuccess() {
    setUploadDialogOpen(false);
    loadImages();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Image Library</h2>
          <p className="text-sm text-muted-foreground">
            Manage images stored in Firebase (max 1MB per image)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadImages} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ImageUploadForm onSuccess={handleUploadSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter by Category</CardTitle>
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value as ImageCategory | "all")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {Object.keys(SITE_IMAGE_KEYS).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predefined Site Image Keys</CardTitle>
            <CardDescription>
              Use these keys to reference specific site images in your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(SITE_IMAGE_KEYS).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <code className="text-xs flex-1">{value}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(value);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <FileImage className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Images Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filterCategory === "all"
                ? "Upload your first image to get started."
                : `No images in the "${filterCategory}" category.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} onUpdate={loadImages} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ImageUploadFormProps {
  onSuccess: () => void;
}

function ImageUploadForm({ onSuccess }: ImageUploadFormProps) {
  const { profile } = useUserProfile();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ImageCategory>("other");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setFile(selectedFile);
    setName(selectedFile.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }

  async function handleUpload() {
    if (!file || !name || !profile?.id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      const options: ImageUploadOptions = {
        name,
        category,
        createdBy: profile.id,
        ...(description && { description }),
        ...(tags && { tags: tags.split(",").map((t) => t.trim()) }),
      };

      await uploadImage(file, options);
      toast.success("Image uploaded successfully!");
      
      setFile(null);
      setPreview(null);
      setName("");
      setDescription("");
      setCategory("other");
      setTags("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogDescription>
          Upload an image to Firebase. Images larger than 1MB will be automatically compressed.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="file">Image File *</Label>
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {file && (
            <p className="text-xs text-muted-foreground mt-1">
              Size: {(file.size / 1024).toFixed(2)} KB
              {file.size > 1024 * 1024 && " (will be compressed)"}
            </p>
          )}
        </div>

        {preview && (
          <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., hero-main, about-team-photo"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use a unique, descriptive name (lowercase with hyphens)
          </p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the image"
            disabled={isUploading}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as ImageCategory)}
            disabled={isUploading}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Comma-separated tags for organization
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || !name || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

interface ImageCardProps {
  image: ImageMetadata;
  onUpdate: () => void;
}

function ImageCard({ image, onUpdate }: ImageCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadImage();
  }, [image.id]);

  async function loadImage() {
    setIsLoading(true);
    try {
      const fullImage = await getImage(image.id);
      if (fullImage) {
        const url = base64ToDataUrl(fullImage.base64Data, fullImage.mimeType);
        setImageUrl(url);
      }
    } catch (error) {
      console.error("Error loading image:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyId() {
    navigator.clipboard.writeText(image.id);
    setCopiedId(true);
    toast.success("Image ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const success = await deleteImage(image.id);
      if (success) {
        toast.success("Image deleted successfully");
        setDeleteDialogOpen(false);
        onUpdate();
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative w-full h-48 bg-muted">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={image.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold truncate">{image.name}</h3>
            {image.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {image.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {image.category}
            </Badge>
            {image.width && image.height && (
              <Badge variant="outline" className="text-xs">
                {image.width}x{image.height}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {(image.size / 1024).toFixed(0)} KB
            </Badge>
          </div>

          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopyId}
            >
              {copiedId ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              ID
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{image.name}"? This action cannot be undone.
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <ImageEditForm
            image={image}
            onSuccess={() => {
              setEditDialogOpen(false);
              onUpdate();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ImageEditFormProps {
  image: ImageMetadata;
  onSuccess: () => void;
}

function ImageEditForm({ image, onSuccess }: ImageEditFormProps) {
  const [name, setName] = useState(image.name);
  const [description, setDescription] = useState(image.description || "");
  const [category, setCategory] = useState<ImageCategory>(image.category);
  const [tags, setTags] = useState(image.tags?.join(", ") || "");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleUpdate() {
    if (!name) {
      toast.error("Name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const success = await updateImageMetadata(image.id, {
        name,
        description: description || undefined,
        category,
        tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
      });

      if (success) {
        toast.success("Image updated successfully");
        onSuccess();
      } else {
        toast.error("Failed to update image");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Image</DialogTitle>
        <DialogDescription>
          Update image metadata. The image file itself cannot be changed.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-name">Name *</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div>
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUpdating}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="edit-category">Category *</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as ImageCategory)}
            disabled={isUpdating}
          >
            <SelectTrigger id="edit-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-tags">Tags</Label>
          <Input
            id="edit-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            disabled={isUpdating}
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleUpdate} disabled={!name || isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
