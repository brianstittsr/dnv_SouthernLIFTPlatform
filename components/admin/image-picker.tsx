"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Image as ImageIcon, Upload, Check, Search } from "lucide-react";
import { toast } from "sonner";
import {
  listImages,
  getImage,
  uploadImage,
  base64ToDataUrl,
  type ImageCategory,
  type ImageMetadata,
  type ImageUploadOptions,
} from "@/lib/firebase-images";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Textarea } from "@/components/ui/textarea";

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

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageId: string, imageUrl: string, metadata: ImageMetadata) => void;
  filterCategory?: ImageCategory;
  title?: string;
  description?: string;
}

export function ImagePicker({
  open,
  onOpenChange,
  onSelect,
  filterCategory,
  title = "Select Image",
  description = "Choose an image from the library or upload a new one",
}: ImagePickerProps) {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory | "all">(
    filterCategory || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open, selectedCategory]);

  async function loadImages() {
    setIsLoading(true);
    try {
      const category = selectedCategory === "all" ? undefined : selectedCategory;
      const loadedImages = await listImages(category);
      setImages(loadedImages);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredImages = images.filter((img) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      img.name.toLowerCase().includes(query) ||
      img.description?.toLowerCase().includes(query) ||
      img.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  async function handleImageSelect(image: ImageMetadata) {
    try {
      const fullImage = await getImage(image.id);
      if (fullImage) {
        const imageUrl = base64ToDataUrl(fullImage.base64Data, fullImage.mimeType);
        onSelect(image.id, imageUrl, image);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      toast.error("Failed to select image");
    }
  }

  function handleUploadSuccess() {
    setActiveTab("library");
    loadImages();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              <ImageIcon className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as ImageCategory | "all")}
              >
                <SelectTrigger className="w-[180px]">
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

            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No images match your search"
                      : "No images found in this category"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredImages.map((image) => (
                    <ImageThumbnail
                      key={image.id}
                      image={image}
                      onSelect={() => handleImageSelect(image)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload">
            <QuickUploadForm onSuccess={handleUploadSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ImageThumbnailProps {
  image: ImageMetadata;
  onSelect: () => void;
}

function ImageThumbnail({ image, onSelect }: ImageThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div
      className="group relative cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
      onClick={onSelect}
    >
      <div className="aspect-square bg-muted">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={image.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Check className="h-8 w-8 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white text-xs font-medium truncate">{image.name}</p>
        <div className="flex gap-1 mt-1">
          <Badge variant="secondary" className="text-xs">
            {image.category}
          </Badge>
        </div>
      </div>
    </div>
  );
}

interface QuickUploadFormProps {
  onSuccess: () => void;
}

function QuickUploadForm({ onSuccess }: QuickUploadFormProps) {
  const { profile } = useUserProfile();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ImageCategory>("other");
  const [isUploading, setIsUploading] = useState(false);

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
        description: description || undefined,
        category,
        createdBy: profile.id,
      };

      await uploadImage(file, options);
      toast.success("Image uploaded successfully!");

      setFile(null);
      setPreview(null);
      setName("");
      setDescription("");
      setCategory("other");

      onSuccess();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="quick-file">Image File *</Label>
        <Input
          id="quick-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {preview && (
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
        </div>
      )}

      <div>
        <Label htmlFor="quick-name">Name *</Label>
        <Input
          id="quick-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., team-member-john"
          disabled={isUploading}
        />
      </div>

      <div>
        <Label htmlFor="quick-description">Description</Label>
        <Textarea
          id="quick-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          disabled={isUploading}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="quick-category">Category *</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ImageCategory)}
          disabled={isUploading}
        >
          <SelectTrigger id="quick-category">
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

      <Button onClick={handleUpload} disabled={!file || !name || isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload & Select
          </>
        )}
      </Button>
    </div>
  );
}
