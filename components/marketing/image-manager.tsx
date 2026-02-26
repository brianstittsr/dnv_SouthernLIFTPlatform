"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllImages,
  saveImageToManager,
  deleteImageFromManager,
  StoredImage,
} from "@/lib/firebase-hero";
import { ImagePlus, Trash2, Upload, X, ImageIcon, Check } from "lucide-react";
import { toast } from "sonner";

interface ImageManagerProps {
  onSelectImage?: (imageUrl: string) => void;
  selectedImage?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
}

export function ImageManager({
  onSelectImage,
  selectedImage,
  allowUpload = true,
  allowDelete = true,
}: ImageManagerProps) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState("gallery");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const loadedImages = await getAllImages();
      setImages(loadedImages);
    } catch (error) {
      console.error("Failed to load images:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert to base64
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          // Save to Image Manager
          const storedImage = await saveImageToManager(
            file.name,
            base64String,
            file.type
          );

          setImages((prev) => [storedImage, ...prev]);
          toast.success("Image uploaded successfully");
          
          // Auto-select if callback provided
          if (onSelectImage) {
            onSelectImage(storedImage.imageUrl);
          }
          
          setSelectedTab("gallery");
        } catch (error) {
          console.error("Failed to save image:", error);
          toast.error("Failed to save image");
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (image: StoredImage) => {
    if (!confirm(`Are you sure you want to delete "${image.name}"?`)) return;

    try {
      await deleteImageFromManager(image.id, image.storagePath);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success("Image deleted");
      
      // Clear preview if it was the deleted image
      if (previewImage === image.imageUrl) {
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image");
    }
  };

  const formatFileSize = (bytes: nuemerging businessr): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: { seconds: nuemerging businessr; nanoseconds: nuemerging businessr }): string => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            {allowUpload && <TabsTrigger value="upload">Upload New</TabsTrigger>}
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No images uploaded yet</p>
                {allowUpload && (
                  <Button
                    variant="link"
                    onClick={() => setSelectedTab("upload")}
                    className="mt-2"
                  >
                    Upload your first image
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === image.imageUrl
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      if (onSelectImage) {
                        onSelectImage(image.imageUrl);
                      }
                      setPreviewImage(image.imageUrl);
                    }}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Selection indicator */}
                    {selectedImage === image.imageUrl && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-white text-xs truncate">{image.name}</p>
                      <p className="text-white/70 text-xs">
                        {formatFileSize(image.size)}
                      </p>
                      <p className="text-white/50 text-xs">
                        {formatDate(image.createdAt)}
                      </p>
                    </div>

                    {/* Delete button */}
                    {allowDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image);
                        }}
                        className="absolute top-2 left-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Preview section */}
            {previewImage && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preview</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full max-h-[200px] object-contain rounded-lg"
                />
              </div>
            )}
          </TabsContent>

          {allowUpload && (
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports JPG, PNG, WebP • Max 5MB
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    {isUploading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                        Uploading... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Select Image
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Dialog wrapper for Image Manager
interface ImageManagerDialogProps extends ImageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function ImageManagerDialog({
  open,
  onOpenChange,
  title = "Select Image",
  ...props
}: ImageManagerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ImageManager {...props} />
      </DialogContent>
    </Dialog>
  );
}
