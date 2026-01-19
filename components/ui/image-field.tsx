"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";
import {
  uploadImage,
  getImage,
  base64ToDataUrl,
  type ImageCategory,
  type ImageMetadata,
} from "@/lib/firebase-images";
import { useUserProfile } from "@/contexts/user-profile-context";

interface ImageFieldProps {
  value?: string;
  imageId?: string;
  onChange: (imageId: string, imageUrl: string, metadata?: ImageMetadata) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  category?: ImageCategory;
  className?: string;
  aspectRatio?: "square" | "video" | "banner" | "auto";
  disabled?: boolean;
  required?: boolean;
  showLabel?: boolean;
}

export function ImageField({
  value,
  imageId,
  onChange,
  onClear,
  label = "Image",
  placeholder = "Click to select an image",
  category = "other",
  className = "",
  aspectRatio = "auto",
  disabled = false,
  required = false,
  showLabel = true,
}: ImageFieldProps) {
  const { profile } = useUserProfile();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[3/1]",
    auto: "min-h-[120px]",
  };

  const handleImageSelect = (
    selectedImageId: string,
    imageUrl: string,
    metadata: ImageMetadata
  ) => {
    onChange(selectedImageId, imageUrl, metadata);
    setIsPickerOpen(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const imageName = file.name.replace(/\.[^/.]+$/, "");
      const newImageId = await uploadImage(file, {
        name: imageName,
        category: category,
        createdBy: profile?.id,
      });

      if (newImageId) {
        const fullImage = await getImage(newImageId);
        if (fullImage) {
          const imageUrl = base64ToDataUrl(fullImage.base64Data, fullImage.mimeType);
          onChange(newImageId, imageUrl, {
            id: newImageId,
            name: imageName,
            category: category,
            mimeType: fullImage.mimeType,
            width: fullImage.width,
            height: fullImage.height,
            size: fullImage.size,
            createdAt: new Date(),
            isActive: true,
          });
          toast.success("Image uploaded and saved to library");
        }
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  const openFilePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-muted/50"}
          ${aspectClasses[aspectRatio]}
        `}
        onClick={() => !disabled && setIsPickerOpen(true)}
      >
        {isLoading || isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isUploading ? "Uploading..." : "Loading..."}
              </p>
            </div>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPickerOpen(true);
                }}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Change
              </Button>
              {onClear && (
                <Button size="sm" variant="destructive" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {imageId && (
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 text-xs"
              >
                From Library
              </Badge>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center mb-3">
              {placeholder}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPickerOpen(true);
                }}
                disabled={disabled}
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Library
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={openFilePicker}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      <ImagePicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleImageSelect}
        filterCategory={category}
        title={`Select ${label}`}
        description="Choose from the image library or upload a new image"
      />
    </div>
  );
}
