"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, FolderOpen, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";
import {
  uploadImage,
  getImage,
  base64ToDataUrl,
} from "@/lib/firebase-images";
import { useUserProfile } from "@/contexts/user-profile-context";

interface AvatarUploadProps {
  currentAvatar?: string;
  initials?: string;
  onUpload: (base64Image: string) => Promise<void>;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-48 w-48",
};

export function AvatarUpload({ 
  currentAvatar, 
  initials = "U", 
  onUpload,
  size = "lg" 
}: AvatarUploadProps) {
  const { profile } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatar);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressDataUrl = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Avatars are displayed small — cap at 400x400 to stay well under
        // the Firestore document size limit
        let width = img.width;
        let height = img.height;
        const maxDimension = 400;
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const applyImage = async (dataUrl: string) => {
    setIsUploading(true);
    try {
      const compressed = await compressDataUrl(dataUrl);
      setPreviewUrl(compressed);
      await onUpload(compressed);
      toast.success("Profile image updated successfully");
      setOptionsOpen(false);
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to upload image. Please try again.");
      setPreviewUrl(currentAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGallerySelect = async (_imageId: string, imageUrl: string) => {
    await applyImage(imageUrl);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to the image gallery (compresses to fit Firestore)
      const imageName = file.name.replace(/\.[^/.]+$/, "");
      const imageId = await uploadImage(file, {
        name: imageName,
        category: "team",
        createdBy: profile?.id,
      });

      if (!imageId) {
        throw new Error("Image upload did not return an id");
      }

      const fullImage = await getImage(imageId);
      if (!fullImage) {
        throw new Error("Uploaded image could not be loaded");
      }

      const dataUrl = await compressDataUrl(
        base64ToDataUrl(fullImage.base64Data, fullImage.mimeType)
      );
      setPreviewUrl(dataUrl);
      await onUpload(dataUrl);
      toast.success("Image added to gallery and set as your photo");
      setOptionsOpen(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      setPreviewUrl(currentAvatar);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openOptions = () => {
    setOptionsOpen(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={previewUrl} alt="Profile" />
          <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={openOptions}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openOptions}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Change Image
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Choose from the image gallery or upload a new image.
      </p>

      {/* Options modal */}
      <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Profile Image</DialogTitle>
            <DialogDescription>
              Choose how you want to set your profile photo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto py-4 justify-start"
              onClick={() => setPickerOpen(true)}
              disabled={isUploading}
            >
              <FolderOpen className="h-5 w-5 mr-3 shrink-0" />
              <span className="text-left">
                <span className="block font-medium">Select from Image Gallery</span>
                <span className="block text-xs text-muted-foreground font-normal">
                  Pick an existing image from the library
                </span>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto py-4 justify-start"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 mr-3 shrink-0 animate-spin" />
              ) : (
                <Upload className="h-5 w-5 mr-3 shrink-0" />
              )}
              <span className="text-left">
                <span className="block font-medium">Upload New Image</span>
                <span className="block text-xs text-muted-foreground font-normal">
                  Add to the image gallery and set as your default photo
                </span>
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image gallery picker */}
      <ImagePicker
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setOptionsOpen(false);
        }}
        onSelect={handleGallerySelect}
        title="Select Profile Image"
        description="Choose an image from the gallery to use as your photo"
      />
    </div>
  );
}
