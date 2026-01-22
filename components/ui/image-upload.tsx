"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { compressProfilePhoto, validateImageFile, formatFileSize, base64ToDataUrl } from '@/lib/image-compression';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (base64Data: string, mimeType: string) => void;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  description?: string;
  allowCamera?: boolean;
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  size = 'lg',
  label = 'Upload Photo',
  description = 'PNG or JPG. Images will be compressed to 400x400px.',
  allowCamera = false,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);

    try {
      // Compress image to square format for circular display
      const compressed = await compressProfilePhoto(file);
      
      // Create preview URL
      const dataUrl = base64ToDataUrl(compressed.base64Data, compressed.mimeType);
      setPreviewUrl(dataUrl);
      
      // Call onChange with base64 data
      onChange(compressed.base64Data, compressed.mimeType);
      
      console.log(`Image compressed: ${formatFileSize(compressed.size)} (${compressed.width}x${compressed.height})`);
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Failed to process image. Please try another file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 640 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    // Create square canvas
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 400;
    canvas.height = 400;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate crop for center square
    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;
    
    // Draw cropped image
    ctx.drawImage(video, x, y, size, size, 0, 0, 400, 400);
    
    // Convert to base64
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        await handleFileSelect(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.85);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Preview */}
        <div className="relative">
          <Avatar className={cn(sizeClasses[size], 'border-2 border-muted')}>
            {previewUrl && (
              <AvatarImage 
                src={previewUrl} 
                alt="Preview" 
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          {previewUrl && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Camera View */}
        {isCameraActive && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg border-2 border-primary"
              style={{ width: '320px', height: '320px', objectFit: 'cover' }}
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                onClick={capturePhoto}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Upload Buttons */}
        {!isCameraActive && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {label}
                </>
              )}
            </Button>

            {allowCamera && (
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                disabled={disabled || isUploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground text-center">
            {description}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-destructive text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
