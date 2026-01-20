"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

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
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Compress and convert to base64
      const base64 = await compressAndConvertImage(file);
      
      // Check if compressed image is still too large (Firebase limit is ~1MB for a field)
      // Base64 is ~33% larger than binary, so target ~700KB binary = ~930KB base64
      const base64Size = base64.length;
      const estimatedKB = base64Size / 1024;
      
      if (estimatedKB > 900) {
        toast.error("Image is too large even after compression. Please use a smaller image.");
        setIsUploading(false);
        return;
      }
      
      // Create preview
      setPreviewUrl(base64);
      
      // Call the upload handler
      await onUpload(base64);
      
      toast.success("Profile image updated successfully");
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

  const compressAndConvertImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate new dimensions (max 400x400 for avatars)
          let width = img.width;
          let height = img.height;
          const maxDimension = 400;
          
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas (this compresses it)
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality setting
          // Start with 0.8 quality, will reduce if still too large
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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
            onClick={handleButtonClick}
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
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG or GIF. Images will be compressed to 400x400px.
      </p>
    </div>
  );
}
