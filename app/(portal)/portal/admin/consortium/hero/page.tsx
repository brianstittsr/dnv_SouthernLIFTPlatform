"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Eye,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import {
  HeroSlide,
  defaultHeroSlides,
  defaultSlideTemplate,
  backgroundOptions,
} from "@/lib/consortium-config";

interface HeroSlideWithTimestamps extends HeroSlide {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function ConsortiumHeroAdminPage() {
  const [slides, setSlides] = useState<HeroSlideWithTimestamps[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideWithTimestamps | null>(null);
  const [formData, setFormData] = useState({ ...defaultSlideTemplate, order: 0 });
  const [showingDefaults, setShowingDefaults] = useState(false);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    if (!db) {
      setSlides(defaultHeroSlides);
      setShowingDefaults(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const slidesQuery = query(
        collection(db, "consortiumHeroSlides"),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(slidesQuery);
      
      if (snapshot.empty) {
        setSlides(defaultHeroSlides);
        setShowingDefaults(true);
      } else {
        const loadedSlides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HeroSlideWithTimestamps[];
        setSlides(loadedSlides);
        setShowingDefaults(false);
      }
    } catch (error) {
      console.error("Error loading slides:", error);
      setSlides(defaultHeroSlides);
      setShowingDefaults(true);
      toast.error("Failed to load slides, showing defaults");
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultSlides = async () => {
    if (!db) return;

    try {
      setSaving(true);
      for (const slide of defaultHeroSlides) {
        const { id, ...slideData } = slide;
        await addDoc(collection(db, "consortiumHeroSlides"), {
          ...slideData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      toast.success("Default slides added to database");
      loadSlides();
    } catch (error) {
      console.error("Error seeding slides:", error);
      toast.error("Failed to seed default slides");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDialog = (slide?: HeroSlideWithTimestamps) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        ctaText: slide.ctaText,
        ctaLink: slide.ctaLink,
        backgroundImage: slide.backgroundImage || "",
        backgroundColor: slide.backgroundColor || defaultSlideTemplate.backgroundColor,
        textColor: slide.textColor,
        order: slide.order,
        isActive: slide.isActive,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        ...defaultSlideTemplate,
        order: slides.length + 1,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!db) return;

    if (!formData.title || !formData.ctaText || !formData.ctaLink) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      if (editingSlide) {
        await updateDoc(doc(db, "consortiumHeroSlides", editingSlide.id), {
          ...formData,
          updatedAt: Timestamp.now(),
        });
        toast.success("Slide updated successfully");
      } else {
        await addDoc(collection(db, "consortiumHeroSlides"), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        toast.success("Slide created successfully");
      }

      setDialogOpen(false);
      loadSlides();
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slide: HeroSlideWithTimestamps) => {
    if (!db) return;

    if (!confirm(`Are you sure you want to delete "${slide.title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "consortiumHeroSlides", slide.id));
      toast.success("Slide deleted successfully");
      loadSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast.error("Failed to delete slide");
    }
  };

  const handleToggleActive = async (slide: HeroSlideWithTimestamps) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, "consortiumHeroSlides", slide.id), {
        isActive: !slide.isActive,
        updatedAt: Timestamp.now(),
      });
      toast.success(`Slide ${slide.isActive ? "deactivated" : "activated"}`);
      loadSlides();
    } catch (error) {
      console.error("Error toggling slide:", error);
      toast.error("Failed to update slide");
    }
  };

  const handleReorder = async (slide: HeroSlideWithTimestamps, direction: "up" | "down") => {
    if (!db) return;

    const currentIndex = slides.findIndex((s) => s.id === slide.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const targetSlide = slides[targetIndex];

    try {
      await updateDoc(doc(db, "consortiumHeroSlides", slide.id), {
        order: targetSlide.order,
        updatedAt: Timestamp.now(),
      });
      await updateDoc(doc(db, "consortiumHeroSlides", targetSlide.id), {
        order: slide.order,
        updatedAt: Timestamp.now(),
      });
      loadSlides();
    } catch (error) {
      console.error("Error reordering slides:", error);
      toast.error("Failed to reorder slides");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-9xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Consortium Hero Slides</h1>
          <p className="text-muted-foreground">
            Manage the rotating carousel on the consortium page
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/consortium" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview Page
            </a>
          </Button>
          {showingDefaults && (
            <Button variant="outline" onClick={seedDefaultSlides} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Save Defaults to DB
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? "Edit Slide" : "Add New Slide"}
                </DialogTitle>
                <DialogDescription>
                  Configure the hero slide content and appearance
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="e.g., For Subject Matter Experts"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Connect. Collaborate. Win."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the value proposition"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">CTA Button Text *</Label>
                    <Input
                      id="ctaText"
                      value={formData.ctaText}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaText: e.target.value })
                      }
                      placeholder="e.g., Join the Consortium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">CTA Button Link *</Label>
                    <Input
                      id="ctaLink"
                      value={formData.ctaLink}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaLink: e.target.value })
                      }
                      placeholder="e.g., /register"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Select
                      value={formData.backgroundColor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, backgroundColor: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <Select
                      value={formData.textColor}
                      onValueChange={(value: "light" | "dark") =>
                        setFormData({ ...formData, textColor: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select text color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light (White)</SelectItem>
                        <SelectItem value="dark">Dark (Black)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Background Image URL (optional)</Label>
                  <Input
                    id="backgroundImage"
                    value={formData.backgroundImage}
                    onChange={(e) =>
                      setFormData({ ...formData, backgroundImage: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, this will override the background color
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSlide ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Slides</CardTitle>
          <CardDescription>
            {slides.length} slide{slides.length !== 1 ? "s" : ""} {showingDefaults ? "(showing defaults - click 'Save Defaults to DB' to persist)" : "configured"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No slides configured yet.</p>
              <p className="text-sm">Default slides will be shown on the consortium page.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide, index) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span>{slide.order}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{slide.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {slide.subtitle}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {slide.ctaLink}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={slide.isActive ? "default" : "secondary"}>
                        {slide.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReorder(slide, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReorder(slide, "down")}
                          disabled={index === slides.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(slide)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(slide)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(slide)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
}
