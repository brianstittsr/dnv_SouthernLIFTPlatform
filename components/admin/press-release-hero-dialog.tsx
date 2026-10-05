"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { ImageField } from "@/components/ui/image-field";
import { getHeroSlides, saveHeroSlide } from "@/lib/firebase-hero";
import type { HeroSlide } from "@/components/marketing/hero-carousel";
import type { PressRelease } from "@/lib/press-releases-schema";

interface PressReleaseHeroDialogProps {
  release: PressRelease | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function PressReleaseHeroDialog({
  release,
  open,
  onOpenChange,
}: PressReleaseHeroDialogProps) {
  const [headline, setHeadline] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [benefits, setBenefits] = useState("");
  const [ctaText, setCtaText] = useState("Read Press Release");
  const [isPublished, setIsPublished] = useState(true);
  const [bgImage, setBgImage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [stockCredit, setStockCredit] = useState<string | null>(null);

  useEffect(() => {
    if (!release || !open) return;
    setHeadline(release.title);
    setHighlightedText(release.category);
    setSubheadline(
      release.subtitle || stripHtml(release.content).slice(0, 180)
    );
    setBenefits(release.tags.slice(0, 3).join("\n"));
    setCtaText("Read Press Release");
    setIsPublished(release.status === "published");
    setBgImage("");
    setStockCredit(null);
    setKeyword(
      [release.category, ...release.tags.slice(0, 2), release.title]
        .filter(Boolean)
        .join(" ")
        .slice(0, 120)
    );
  }, [release, open]);

  const handleStockSearch = async () => {
    if (!keyword.trim()) {
      toast.error("Enter a keyword to search");
      return;
    }
    setSearching(true);
    try {
      const { getIdToken } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const user = auth?.currentUser;
      if (!user) {
        toast.error("You must be signed in");
        return;
      }
      const token = await getIdToken(user, true);
      const res = await fetch("/api/admin/hero-stock-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Search failed");
      setBgImage(result.image.url);
      setStockCredit(
        `${result.image.source}${result.image.author ? ` — ${result.image.author}` : ""}${result.image.description ? ` · ${result.image.description}` : ""}`
      );
      toast.success(`Image found on ${result.image.source}`);
    } catch (error: unknown) {
      console.error("Stock image search failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to find an image"
      );
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!release) return;
    if (!headline.trim()) {
      toast.error("Headline is required");
      return;
    }
    setCreating(true);
    try {
      const slides = await getHeroSlides();
      const order = slides.length
        ? Math.max(...slides.map((s) => s.order ?? 0)) + 1
        : 0;

      const slide: HeroSlide = {
        id: `press-${release.id}`,
        badge: "📰 Press Release",
        headline: headline.trim(),
        middleLine: release.location,
        highlightedText: highlightedText.trim(),
        subheadline: subheadline.trim(),
        benefits: benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        primaryCta: {
          text: ctaText.trim() || "Read Press Release",
          href: `/press-releases/${release.slug}`,
        },
        secondaryCta: { text: "", href: "" },
        isPublished,
        order,
        backgroundType: bgImage ? "image" : "animated",
        backgroundImage: bgImage || undefined,
        backgroundOverlay: true,
        backgroundOverlayOpacity: 40,
        fullScreenBg: true,
        showRibbon: true,
        ribbonColor: "dark",
        showWaves: false,
        highlightOnSecondLine: false,
      };

      await saveHeroSlide(slide);
      toast.success("Hero slide created — manage it under Hero Management");
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error creating hero slide:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create hero slide"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Hero Slide</DialogTitle>
          <DialogDescription>
            Generate a hero slide from &quot;{release?.title}&quot;. It will
            appear in Hero Management and on the homepage carousel when
            published.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pr-hero-headline">Headline</Label>
            <Input
              id="pr-hero-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pr-hero-highlight">Highlighted text</Label>
              <Input
                id="pr-hero-highlight"
                value={highlightedText}
                onChange={(e) => setHighlightedText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-hero-cta">Button text</Label>
              <Input
                id="pr-hero-cta"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pr-hero-sub">Subheadline</Label>
            <Textarea
              id="pr-hero-sub"
              rows={2}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pr-hero-benefits">
              Bullet points (one per line)
            </Label>
            <Textarea
              id="pr-hero-benefits"
              rows={3}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
            />
          </div>

          {/* Background image — stock search, gallery pick, or upload */}
          <div className="space-y-3 rounded-lg border p-4">
            <Label className="text-base">Background image</Label>

            <div className="space-y-2">
              <Label htmlFor="pr-hero-keyword" className="text-xs text-muted-foreground">
                Find an image on Pexels or Unsplash
              </Label>
              <div className="flex gap-2">
                <Input
                  id="pr-hero-keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleStockSearch();
                    }
                  }}
                  placeholder="Search keyword derived from slide content"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStockSearch}
                  disabled={searching}
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      Find
                    </>
                  )}
                </Button>
              </div>
              {stockCredit && (
                <p className="text-xs text-muted-foreground">
                  Source: {stockCredit}
                </p>
              )}
            </div>

            <ImageField
              label="Or pick from the image gallery / upload"
              value={bgImage}
              category="hero"
              aspectRatio="video"
              placeholder="Select a gallery image or upload a new one"
              onChange={(_id, url) => {
                setBgImage(url);
                setStockCredit(null);
              }}
              onClear={() => setBgImage("")}
            />

            {!bgImage && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                No image selected — the slide will use the animated background.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="pr-hero-published">Publish immediately</Label>
              <p className="text-xs text-muted-foreground">
                Slide will be visible on the homepage carousel
              </p>
            </div>
            <Switch
              id="pr-hero-published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          {release && (
            <div className="text-xs text-muted-foreground">
              Links to <Badge variant="secondary">/press-releases/{release.slug}</Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Hero Slide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
