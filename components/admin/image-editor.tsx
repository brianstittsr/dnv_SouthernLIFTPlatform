"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoomIn, ZoomOut, Move, Maximize2, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface ImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageName: string;
  onSave: (edits: ImageEdits) => void;
  initialEdits?: ImageEdits;
}

export interface ImageEdits {
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
  objectFit: "cover" | "contain" | "fill";
  width?: string;
  height?: string;
}

export function ImageEditor({
  open,
  onOpenChange,
  imageUrl,
  imageName,
  onSave,
  initialEdits,
}: ImageEditorProps) {
  const [scale, setScale] = useState(initialEdits?.scale || 100);
  const [positionX, setPositionX] = useState(initialEdits?.positionX || 50);
  const [positionY, setPositionY] = useState(initialEdits?.positionY || 50);
  const [rotation, setRotation] = useState(initialEdits?.rotation || 0);
  const [objectFit, setObjectFit] = useState<"cover" | "contain" | "fill">(
    initialEdits?.objectFit || "cover"
  );
  const [width, setWidth] = useState(initialEdits?.width || "100%");
  const [height, setHeight] = useState(initialEdits?.height || "auto");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;

    const deltaX = (e.clientX - dragStart.x) / 5;
    const deltaY = (e.clientY - dragStart.y) / 5;

    setPositionX(Math.max(0, Math.min(100, positionX + deltaX)));
    setPositionY(Math.max(0, Math.min(100, positionY + deltaY)));
    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleReset() {
    setScale(100);
    setPositionX(50);
    setPositionY(50);
    setRotation(0);
    setObjectFit("cover");
    setWidth("100%");
    setHeight("auto");
  }

  function handleSave() {
    const edits: ImageEdits = {
      scale,
      positionX,
      positionY,
      rotation,
      objectFit,
      width,
      height,
    };
    onSave(edits);
    onOpenChange(false);
    toast.success("Image settings saved");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Image: {imageName}</DialogTitle>
          <DialogDescription>
            Adjust the image position, size, and display settings
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div
              ref={containerRef}
              className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden border-2 border-border"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `scale(${scale / 100})`,
                  transition: isDragging ? "none" : "transform 0.2s",
                }}
              >
                <img
                  src={imageUrl}
                  alt={imageName}
                  className="max-w-full max-h-full"
                  style={{
                    objectFit,
                    objectPosition: `${positionX}% ${positionY}%`,
                    transform: `rotate(${rotation}deg)`,
                    width: width,
                    height: height,
                  }}
                  draggable={false}
                />
              </div>
              {isDragging && (
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Move className="h-3 w-3 inline mr-1" />
                  Drag to reposition
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setScale(Math.max(10, scale - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScale(Math.min(200, scale + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Scale: {scale}%</Label>
              <Slider
                value={[scale]}
                onValueChange={(v) => setScale(v[0])}
                min={10}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Horizontal Position: {positionX}%</Label>
              <Slider
                value={[positionX]}
                onValueChange={(v) => setPositionX(v[0])}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Vertical Position: {positionY}%</Label>
              <Slider
                value={[positionY]}
                onValueChange={(v) => setPositionY(v[0])}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Rotation: {rotation}°</Label>
              <Slider
                value={[rotation]}
                onValueChange={(v) => setRotation(v[0])}
                min={0}
                max={360}
                step={15}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Object Fit</Label>
              <Select value={objectFit} onValueChange={(v: any) => setObjectFit(v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (fill container)</SelectItem>
                  <SelectItem value="contain">Contain (fit inside)</SelectItem>
                  <SelectItem value="fill">Fill (stretch)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Width</Label>
                <Input
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="100%"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="auto"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>• Drag the image to reposition</p>
              <p>• Use sliders for precise control</p>
              <p>• Width/height accept CSS values (px, %, rem, etc.)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
