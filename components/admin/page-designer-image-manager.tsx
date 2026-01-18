"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Upload,
  Settings,
} from "lucide-react";
import { ImagePicker } from "./image-picker";
import { ImageEditor, type ImageEdits } from "./image-editor";
import type { ImageMetadata } from "@/lib/firebase-images";
import { toast } from "sonner";

export interface PageImage {
  id: string;
  imageId: string;
  imageUrl: string;
  metadata: ImageMetadata;
  edits?: ImageEdits;
  caption?: string;
  altText?: string;
  position: number;
}

interface PageDesignerImageManagerProps {
  sectionId: string;
  sectionName: string;
  images: PageImage[];
  onImagesChange: (images: PageImage[]) => void;
  maxImages?: number;
}

export function PageDesignerImageManager({
  sectionId,
  sectionName,
  images,
  onImagesChange,
  maxImages,
}: PageDesignerImageManagerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PageImage | null>(null);

  function handleAddImage(imageId: string, imageUrl: string, metadata: ImageMetadata) {
    const newImage: PageImage = {
      id: `${sectionId}-${Date.now()}`,
      imageId,
      imageUrl,
      metadata,
      position: images.length,
      altText: metadata.description || metadata.name,
    };
    onImagesChange([...images, newImage]);
    toast.success("Image added to section");
  }

  function handleEditImage(image: PageImage) {
    setSelectedImage(image);
    setEditorOpen(true);
  }

  function handleSaveEdits(edits: ImageEdits) {
    if (!selectedImage) return;

    const updatedImages = images.map((img) =>
      img.id === selectedImage.id ? { ...img, edits } : img
    );
    onImagesChange(updatedImages);
    setSelectedImage(null);
  }

  function handleRemoveImage(imageId: string) {
    const updatedImages = images
      .filter((img) => img.id !== imageId)
      .map((img, index) => ({ ...img, position: index }));
    onImagesChange(updatedImages);
    toast.success("Image removed");
  }

  function handleMoveImage(imageId: string, direction: "up" | "down") {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[currentIndex], updatedImages[newIndex]] = [
      updatedImages[newIndex],
      updatedImages[currentIndex],
    ];

    updatedImages.forEach((img, index) => {
      img.position = index;
    });

    onImagesChange(updatedImages);
  }

  const canAddMore = !maxImages || images.length < maxImages;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images for {sectionName}
              </CardTitle>
              <CardDescription>
                Manage images for this section
                {maxImages && ` (${images.length}/${maxImages})`}
              </CardDescription>
            </div>
            <Button
              onClick={() => setPickerOpen(true)}
              disabled={!canAddMore}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No images added yet</p>
              <p className="text-sm mt-1">Click "Add Image" to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {images.map((image, index) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.imageUrl}
                          alt={image.altText || image.metadata.name}
                          className="w-full h-full object-cover"
                          style={
                            image.edits
                              ? {
                                  transform: `scale(${image.edits.scale / 100}) rotate(${
                                    image.edits.rotation
                                  }deg)`,
                                  objectFit: image.edits.objectFit,
                                  objectPosition: `${image.edits.positionX}% ${image.edits.positionY}%`,
                                }
                              : undefined
                          }
                        />
                        {image.edits && (
                          <Badge
                            variant="secondary"
                            className="absolute top-1 right-1 text-xs"
                          >
                            <Settings className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{image.metadata.name}</h4>
                        {image.metadata.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {image.metadata.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {image.metadata.category}
                          </Badge>
                          {image.metadata.width && image.metadata.height && (
                            <Badge variant="outline" className="text-xs">
                              {image.metadata.width}x{image.metadata.height}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Position {index + 1}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditImage(image)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveImage(image.id, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveImage(image.id, "down")}
                          disabled={index === images.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <ImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddImage}
        title={`Add Image to ${sectionName}`}
        description="Select an image from the library or upload a new one"
      />

      {selectedImage && (
        <ImageEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          imageUrl={selectedImage.imageUrl}
          imageName={selectedImage.metadata.name}
          onSave={handleSaveEdits}
          initialEdits={selectedImage.edits}
        />
      )}
    </>
  );
}
