"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/components/marketing/hero-carousel";
import {
  getHeroSlides,
  saveHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/lib/firebase-hero";
import { ImageField } from "@/components/ui/image-field";
import { toast } from "sonner";

// Mock data - in production this would come from a database
const initialSlides: HeroSlide[] = [
  {
    id: "press-release-hubzone",
    badge: "🎉 Major Partnership Announcement",
    headline: "KDM Consortium &",
    middleLine: "&",
    highlightedText: "HUBZone Council",
    subheadline: "Launching a Whole of Government Team Approach to build a National HUBZone Digital Ecosystem. Accelerating small business success and strengthening federal contracting opportunities.",
    benefits: ["Digital Ecosystem Platform", "2026 National HUBZone Conference", "Federal Contracting Support"],
    primaryCta: { text: "Read Press Release", href: "/press-releases/kdm-consortium-hubzone-council-digital-ecosystem" },
    secondaryCta: { text: "Join the Consortium", href: "/consortium" },
    isPublished: true,
    order: 0,
    backgroundType: "image",
    backgroundImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
    backgroundOverlay: true,
    backgroundOverlayOpacity: 60,
  },
  {
    id: "1",
    badge: "Introducing EDGE-X™ — Next-Gen Manufacturing Intelligence",
    headline: "Win OEM Contracts.",
    middleLine: "&",
    highlightedText: "Transform",
    subheadline: "We help small- and mid-sized U.S. manufacturers become qualified suppliers through ISO certification, operational readiness, and supplier development.",
    benefits: ["OEM Supplier Qualification", "ISO/QMS Certification", "Industry 4.0 Ready"],
    primaryCta: { text: "Get Your Free Assessment", href: "/contact" },
    secondaryCta: { text: "See Success Stories", href: "/case-studies" },
    isPublished: true,
    order: 1,
  },
  {
    id: "2",
    badge: "V+ TwinEDGE™ — Digital Twin Solutions",
    headline: "Visualize Your Factory.",
    highlightedText: "Optimize",
    subheadline: "Create digital replicas of your manufacturing processes to simulate, analyze, and improve operations before making costly physical changes.",
    benefits: ["Real-time Monitoring", "Predictive Analytics", "Process Simulation"],
    primaryCta: { text: "Explore Digital Twins", href: "/services/twinedge" },
    secondaryCta: { text: "Watch Demo", href: "/demo" },
    isPublished: true,
    order: 2,
  },
  {
    id: "3",
    badge: "V+ IntellEDGE™ — AI-Powered Insights",
    headline: "Make Smarter Decisions.",
    highlightedText: "Faster",
    subheadline: "Leverage artificial intelligence to gain actionable insights from your manufacturing data, predict maintenance needs, and optimize production schedules.",
    benefits: ["AI-Driven Analytics", "Predictive Maintenance", "Smart Scheduling"],
    primaryCta: { text: "Discover AI Solutions", href: "/services/intelledge" },
    secondaryCta: { text: "Learn More", href: "/about" },
    isPublished: true,
    order: 3,
  },
  {
    id: "4",
    badge: "Reshoring Initiative Partner",
    headline: "Bring Manufacturing",
    highlightedText: "Home",
    subheadline: "Join the reshoring movement. We help companies navigate the complexities of bringing manufacturing back to the United States with comprehensive support.",
    benefits: ["Supply Chain Security", "Quality Control", "Job Creation"],
    primaryCta: { text: "Start Reshoring", href: "/services/reshoring" },
    secondaryCta: { text: "View Case Studies", href: "/case-studies" },
    isPublished: false,
    order: 4,
  },
  {
    id: "5",
    badge: "KDM Insights & Resources",
    headline: "Explore Our Latest Blogs",
    highlightedText: "Blogs",
    subheadline: "Stay informed with expert insights on government contracting, certifications, and business growth strategies. Our blog features practical advice from industry leaders.",
    benefits: ["Expert Insights", "Industry Updates", "Practical Tips"],
    primaryCta: { text: "Read Our Blog", href: "/blog" },
    secondaryCta: { text: "", href: "" },
    isPublished: false,
    order: 5,
  },
  {
    id: "6",
    badge: "Join the KDM Network",
    headline: "KDM Consortium",
    highlightedText: "Consortium",
    subheadline: "Connect with a powerful network of businesses, partners, and mentors. The KDM Consortium provides access to teaming opportunities, shared resources, and collaborative growth.",
    benefits: ["Networking Events", "Teaming Opportunities", "Mentorship Programs"],
    primaryCta: { text: "Join the Consortium", href: "/consortium" },
    secondaryCta: { text: "", href: "" },
    isPublished: false,
    order: 6,
  },
  {
    id: "7",
    badge: "Upcoming Opportunities",
    headline: "KDM Events",
    highlightedText: "Events",
    subheadline: "Attend workshops, webinars, and networking events designed to help you succeed in government contracting. Learn from experts and connect with potential partners.",
    benefits: ["Workshops & Training", "Networking Sessions", "Expert Panels"],
    primaryCta: { text: "View Events", href: "/events" },
    secondaryCta: { text: "Register Now", href: "/events/register" },
    isPublished: false,
    order: 7,
  },
  {
    id: "8",
    badge: "Cybersecurity Certification",
    headline: "Join Our CMMC Cohort",
    highlightedText: "CMMC Cohort",
    subheadline: "Prepare for CMMC certification with guided support. Our cohort program helps small businesses meet cybersecurity requirements for government contracts.",
    benefits: ["CMMC Guidance", "Cohort Learning", "Compliance Support"],
    primaryCta: { text: "Join Cohort", href: "/cmmc-cohort" },
    secondaryCta: { text: "Learn About CMMC", href: "/services/cmmc" },
    isPublished: false,
    order: 8,
  },
  {
    id: "9",
    badge: "Government Contracting Excellence",
    headline: "Strategic Value+",
    highlightedText: "Partnership",
    subheadline: "KDM & Associates and Strategic Value+ unite to deliver unparalleled support for small businesses. Combined expertise for accelerated government contracting success.",
    benefits: ["Combined Expertise", "Expanded Resources", "Accelerated Growth"],
    primaryCta: { text: "Learn More", href: "/about" },
    secondaryCta: { text: "Contact Us", href: "/contact" },
    isPublished: false,
    order: 9,
  },
];

const wizardSteps = [
  { id: 1, title: "Content", description: "Source, headline & subheadline" },
  { id: 2, title: "Details", description: "Benefits and call-to-action" },
  { id: 3, title: "Design", description: "Background, styling & overlay" },
  { id: 4, title: "Review", description: "Preview and publish" },
];

interface SlideFormData {
  badge: string;
  headline: string;
  middleLine: string;
  highlightedText: string;
  subheadline: string;
  benefits: string[];
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  isPublished: boolean;
  fullScreenBg: boolean;
  showRibbon: boolean;
  ribbonColor: "light" | "dark";
  backgroundType: "animated" | "image";
  backgroundImage: string;
  backgroundOverlay: boolean;
  backgroundOverlayOpacity: number;
  showWaves: boolean;
  highlightOnSecondLine: boolean;
  youtubeUrl: string;
  youtubeTranscript: string;
}

const emptyFormData: SlideFormData = {
  badge: "",
  headline: "",
  middleLine: "",
  highlightedText: "",
  subheadline: "",
  benefits: ["", "", ""],
  primaryCtaText: "",
  primaryCtaHref: "",
  secondaryCtaText: "",
  secondaryCtaHref: "",
  isPublished: false,
  fullScreenBg: true,
  showRibbon: true,
  ribbonColor: "dark",
  backgroundType: "animated",
  backgroundImage: "",
  backgroundOverlay: true,
  backgroundOverlayOpacity: 40,
  showWaves: false,
  highlightOnSecondLine: false,
  youtubeUrl: "",
  youtubeTranscript: "",
};

export default function HeroManagementPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(emptyFormData);
  const [showImageManager, setShowImageManager] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Load slides from Firebase on mount
  useEffect(() => {
    loadSlidesFromFirebase();
  }, []);

  const loadSlidesFromFirebase = async () => {
    try {
      setIsLoading(true);
      const firebaseSlides = await getHeroSlides();
      // If no slides in Firebase, use initial data
      if (firebaseSlides.length === 0) {
        // Seed initial slides to Firebase
        for (const slide of initialSlides) {
          await saveHeroSlide(slide);
        }
        setSlides(initialSlides);
      } else {
        setSlides(firebaseSlides);
      }
    } catch (error) {
      console.error("Failed to load slides from Firebase:", error);
      toast.error("Failed to load slides. Using default data.");
      setSlides(initialSlides);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm("This will delete all existing slides and re-seed with the default slides including the HUBZone Council slide. Are you sure?")) {
      return;
    }

    try {
      setIsSaving(true);
      // Delete all existing slides
      const firebaseSlides = await getHeroSlides();
      for (const slide of firebaseSlides) {
        await deleteHeroSlide(slide.id);
      }
      
      // Re-seed with initial slides
      for (const slide of initialSlides) {
        await saveHeroSlide(slide);
      }
      
      // Reload slides
      await loadSlidesFromFirebase();
      toast.success("Slides reset to defaults successfully. HUBZone Council slide added.");
    } catch (error) {
      console.error("Failed to reset slides:", error);
      toast.error("Failed to reset slides.");
    } finally {
      setIsSaving(false);
    }
  };

  const openWizard = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        badge: slide.badge,
        headline: slide.headline,
        middleLine: slide.middleLine ?? "",
        highlightedText: slide.highlightedText,
        subheadline: slide.subheadline,
        benefits: [...slide.benefits, "", ""].slice(0, 3),
        primaryCtaText: slide.primaryCta.text,
        primaryCtaHref: slide.primaryCta.href,
        secondaryCtaText: slide.secondaryCta.text,
        secondaryCtaHref: slide.secondaryCta.href,
        isPublished: slide.isPublished,
        fullScreenBg: slide.fullScreenBg ?? true,
        showRibbon: slide.showRibbon ?? true,
        ribbonColor: slide.ribbonColor ?? "dark",
        backgroundType: slide.backgroundType ?? "animated",
        backgroundImage: slide.backgroundImage ?? "",
        backgroundOverlay: slide.backgroundOverlay ?? true,
        backgroundOverlayOpacity: slide.backgroundOverlayOpacity ?? 40,
        showWaves: slide.showWaves ?? false,
        highlightOnSecondLine: slide.highlightOnSecondLine ?? false,
        youtubeUrl: "",
        youtubeTranscript: "",
      });
    } else {
      setEditingSlide(null);
      setFormData(emptyFormData);
    }
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setEditingSlide(null);
    setFormData(emptyFormData);
    setWizardStep(1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const slideData: HeroSlide = {
        id: editingSlide?.id || Date.now().toString(),
        badge: formData.badge,
        headline: formData.headline,
        highlightedText: formData.highlightedText,
        subheadline: formData.subheadline,
        benefits: formData.benefits.filter(b => b.trim() !== ""),
        primaryCta: { text: formData.primaryCtaText, href: formData.primaryCtaHref },
        secondaryCta: { text: formData.secondaryCtaText, href: formData.secondaryCtaHref },
        isPublished: formData.isPublished,
        order: editingSlide?.order || slides.length + 1,
        fullScreenBg: formData.fullScreenBg,
        showRibbon: formData.showRibbon,
        ribbonColor: formData.ribbonColor,
        backgroundType: formData.backgroundType,
        backgroundImage: formData.backgroundImage,
        backgroundOverlay: formData.backgroundOverlay,
        backgroundOverlayOpacity: formData.backgroundOverlayOpacity,
        showWaves: formData.showWaves,
        highlightOnSecondLine: formData.highlightOnSecondLine,
      };

      // Only include middleLine if it has a value
      if (formData.middleLine && formData.middleLine.trim() !== "") {
        slideData.middleLine = formData.middleLine;
      }

      await saveHeroSlide(slideData);

      if (editingSlide) {
        setSlides(slides.map(s => s.id === editingSlide.id ? slideData : s));
      } else {
        setSlides([...slides, slideData]);
      }
      toast.success(editingSlide ? "Slide updated" : "Slide created");
      closeWizard();
    } catch (error) {
      console.error("Failed to save slide:", error);
      toast.error("Failed to save slide");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    
    try {
      await deleteHeroSlide(id);
      setSlides(slides.filter(s => s.id !== id));
      toast.success("Slide deleted");
    } catch (error) {
      console.error("Failed to delete slide:", error);
      toast.error("Failed to delete slide");
    }
  };

  const togglePublish = async (id: string) => {
    const slide = slides.find(s => s.id === id);
    if (!slide) return;

    const updatedSlide = { ...slide, isPublished: !slide.isPublished };
    
    try {
      await saveHeroSlide(updatedSlide);
      setSlides(slides.map(s => s.id === id ? updatedSlide : s));
      toast.success(updatedSlide.isPublished ? "Slide published" : "Slide unpublished");
    } catch (error) {
      console.error("Failed to update slide:", error);
      toast.error("Failed to update slide");
    }
  };

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const index = slides.findIndex(s => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    ) return;

    const newSlides = [...slides];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    
    // Update order values
    newSlides.forEach((slide, i) => {
      slide.order = i + 1;
    });
    
    setSlides(newSlides);

    // Save to Firebase
    try {
      await reorderHeroSlides(newSlides);
    } catch (error) {
      console.error("Failed to reorder slides:", error);
      toast.error("Failed to save order");
    }
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleTranscribeYouTube = async () => {
    if (!formData.youtubeUrl) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setIsTranscribing(true);
    try {
      const response = await fetch('/api/transcribe-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: formData.youtubeUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMessage = error.error || 'Failed to transcribe video';
        if (error.details) {
          errorMessage += `\n\n${error.details}`;
        }
        if (error.suggestion) {
          errorMessage += `\n\nTip: ${error.suggestion}`;
        }
        toast.error(errorMessage);
        console.error('[Hero] Transcription error:', error);
        return;
      }

      const data = await response.json();
      setFormData({ ...formData, youtubeTranscript: data.transcript });
      toast.success('Video transcribed successfully!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe YouTube video');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-9xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Carousel Management</h1>
          <p className="text-muted-foreground">
            Manage the rotating hero slides on the homepage
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            disabled={isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={() => openWizard()}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Slide
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Slides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : slides.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : slides.filter(s => s.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : slides.filter(s => !s.isPublished).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slides List */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Slides</CardTitle>
          <CardDescription>
            Drag to reorder slides. Published slides will appear in the carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "flex items-center gap-4 p-4 border rounded-lg",
                  !slide.isPublished && "bg-muted/50"
                )}
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveSlide(slide.id, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveSlide(slide.id, "down")}
                    disabled={index === slides.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={slide.isPublished ? "default" : "secondary"}>
                      {slide.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Order: {slide.order}</span>
                  </div>
                  <h3 className="font-semibold truncate">
                    {slide.headline} <span className="text-primary">{slide.highlightedText}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{slide.badge}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish(slide.id)}
                    title={slide.isPublished ? "Unpublish" : "Publish"}
                  >
                    {slide.isPublished ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openWizard(slide)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent 
          className="sm:max-w-[600px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingSlide ? "Edit Hero Slide" : "Create New Hero Slide"}
            </DialogTitle>
            <DialogDescription>
              Step {wizardStep} of {wizardSteps.length}: {wizardSteps[wizardStep - 1]?.title || 'Step ' + wizardStep}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6 gap-1 overflow-x-auto">
            {wizardSteps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                    wizardStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : wizardStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {wizardStep > step.id ? <Check className="h-3 w-3" /> : step.id}
                </div>
                {index < wizardSteps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-shrink-0",
                      wizardStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                    style={{ width: '6px' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto overflow-x-hidden w-full">
            {wizardStep === 1 && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Content Source</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose to transcribe a YouTube video or paste text directly to populate your slide content.
                  </p>

                  {/* YouTube Transcription Option */}
                  <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
                    <h5 className="font-medium">Option 1: Transcribe YouTube Video</h5>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeUrl">YouTube URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="youtubeUrl"
                          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          value={formData.youtubeUrl}
                          onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleTranscribeYouTube()}
                          disabled={!formData.youtubeUrl || isTranscribing}
                          className="whitespace-nowrap"
                        >
                          {isTranscribing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Transcribing...
                            </>
                          ) : (
                            'Transcribe'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Text Paste Option */}
                  <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
                    <h5 className="font-medium">Option 2: Paste Text Directly</h5>
                    <div className="space-y-2">
                      <Label htmlFor="pasteText">Paste your content text</Label>
                      <Textarea
                        id="pasteText"
                        placeholder="Paste your video transcript, article, or any content text here..."
                        rows={3}
                        className="w-full resize-none"
                        onChange={(e) => {
                          setFormData({ ...formData, youtubeTranscript: e.target.value });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (formData.youtubeTranscript) {
                            toast.success('Text ready to use');
                          } else {
                            toast.error('Please paste some text first');
                          }
                        }}
                        className="w-full"
                      >
                        Use This Text
                      </Button>
                    </div>
                  </div>

                  {/* Preview of current transcript/text */}
                  {formData.youtubeTranscript && (
                    <div className="space-y-2 border rounded-lg p-4 bg-blue-50">
                      <Label className="font-medium">Content Preview</Label>
                      <div className="bg-white p-3 rounded border max-h-[150px] overflow-y-auto text-sm">
                        {formData.youtubeTranscript}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData({ ...formData, subheadline: formData.youtubeTranscript });
                            toast.success('Text added to subheadline');
                          }}
                          className="flex-1"
                        >
                          Use as Subheadline
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const words = formData.youtubeTranscript.split(/\s+/);
                            const headline = words.slice(0, 3).join(' ');
                            setFormData({ ...formData, headline });
                            toast.success('First 3 words added to headline');
                          }}
                          className="flex-1"
                        >
                          Use as Headline
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Skip button for users without content */}
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setWizardStep(2)}
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      Skip this step (no video or text)
                    </Button>
                  </div>
                </div>

                {/* Basic Info Section */}
                <div className="space-y-2 max-w-full min-w-0 pt-4 border-t">
                  <h4 className="font-medium text-lg">Basic Information</h4>
                  <Label htmlFor="badge">Badge Text</Label>
                  <div className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                    <Input
                      id="badge"
                      placeholder="e.g., Introducing EDGE-X™"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full box-border"
                      style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-full min-w-0">
                  <Label htmlFor="headline">Headline</Label>
                  <div className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                    <Input
                      id="headline"
                      placeholder="e.g., Win OEM Contracts."
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full box-border"
                      style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-full min-w-0">
                  <Label htmlFor="middleLine">Middle Line (3rd line - optional)</Label>
                  <div className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                    <Input
                      id="middleLine"
                      placeholder="e.g., &"
                      value={formData.middleLine}
                      onChange={(e) => setFormData({ ...formData, middleLine: e.target.value })}
                      className="w-full box-border"
                      style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}
                    />
                  </div>
                </div>
                <div className="space-y-2 max-w-full min-w-0">
                  <Label htmlFor="highlightedText">Highlighted Text (shown in green)</Label>
                  <div className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                    <Input
                      id="highlightedText"
                      placeholder="e.g., Transform"
                      value={formData.highlightedText}
                      onChange={(e) => setFormData({ ...formData, highlightedText: e.target.value })}
                      className="w-full box-border"
                      style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="highlightOnSecondLine" className="text-sm font-medium">Highlighted on Second Line</Label>
                    <p className="text-xs text-muted-foreground">Put highlighted text on its own line</p>
                  </div>
                  <Switch
                    id="highlightOnSecondLine"
                    checked={formData.highlightOnSecondLine}
                    onCheckedChange={(checked) => setFormData({ ...formData, highlightOnSecondLine: checked })}
                  />
                </div>
              </>
            )}

            {wizardStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Textarea
                    id="subheadline"
                    placeholder="Describe your value proposition..."
                    value={formData.subheadline}
                    onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                    rows={2}
                    className="w-full resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key Benefits (up to 3)</Label>
                  {formData.benefits.map((benefit, index) => (
                    <Input
                      key={index}
                      placeholder={`Benefit ${index + 1}`}
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      className="w-full"
                    />
                  ))}
                </div>
                <div className="space-y-4 pt-2 border-t">
                  <h4 className="font-medium">Primary Call-to-Action</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryCtaText">Button Text</Label>
                      <Input
                        id="primaryCtaText"
                        placeholder="e.g., Get Your Free Assessment"
                        value={formData.primaryCtaText}
                        onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryCtaHref">Link URL</Label>
                      <Input
                        id="primaryCtaHref"
                        placeholder="e.g., /contact"
                        value={formData.primaryCtaHref}
                        onChange={(e) => setFormData({ ...formData, primaryCtaHref: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Secondary Call-to-Action</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryCtaText">Button Text</Label>
                      <Input
                        id="secondaryCtaText"
                        placeholder="e.g., See Success Stories"
                        value={formData.secondaryCtaText}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryCtaHref">Link URL</Label>
                      <Input
                        id="secondaryCtaHref"
                        placeholder="e.g., /case-studies"
                        value={formData.secondaryCtaHref}
                        onChange={(e) => setFormData({ ...formData, secondaryCtaHref: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {wizardStep === 3 && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className="font-medium text-lg">Background Type</h4>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, backgroundType: "animated" })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.backgroundType === "animated"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded mb-2 flex items-center justify-center">
                        <span className="text-xl">✨</span>
                      </div>
                      <span className="font-medium text-sm">Animated</span>
                      <p className="text-xs text-muted-foreground">Floating particles</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, backgroundType: "image" })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        formData.backgroundType === "image"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="h-12 bg-muted rounded mb-2 flex items-center justify-center">
                        <span className="text-xl">🖼️</span>
                      </div>
                      <span className="font-medium text-sm">Custom Image</span>
                      <p className="text-xs text-muted-foreground">Upload your own</p>
                    </button>
                  </div>
                </div>

                {formData.backgroundType === "image" && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Background Image</h4>
                    <div className="p-3 border rounded-lg space-y-3">
                      {formData.backgroundImage ? (
                        <div className="relative">
                          <img
                            src={formData.backgroundImage}
                            alt="Background preview"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData({ ...formData, backgroundImage: "" })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <ImageField
                          imageId={formData.backgroundImage}
                          onChange={(imageId, imageUrl) => setFormData({ ...formData, backgroundImage: imageUrl })}
                          category="hero"
                          label="Background Image"
                        />
                      )}

                      <div className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <Label htmlFor="fullScreenBg" className="text-sm font-medium">Full Screen</Label>
                          <p className="text-xs text-muted-foreground">Enable full-screen display</p>
                        </div>
                        <Switch
                          id="fullScreenBg"
                          checked={formData.fullScreenBg}
                          onCheckedChange={(checked) => setFormData({ ...formData, fullScreenBg: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <Label htmlFor="showWaves" className="text-sm font-medium">Show Waves</Label>
                          <p className="text-xs text-muted-foreground">Enable animated wave background</p>
                        </div>
                        <Switch
                          id="showWaves"
                          checked={formData.showWaves}
                          onCheckedChange={(checked) => setFormData({ ...formData, showWaves: checked })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className="font-medium text-lg">Text Visibility</h4>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="showRibbon" className="text-sm font-medium">Show Ribbon</Label>
                      <p className="text-xs text-muted-foreground">Better text visibility</p>
                    </div>
                    <Switch
                      id="showRibbon"
                      checked={formData.showRibbon}
                      onCheckedChange={(checked) => setFormData({ ...formData, showRibbon: checked })}
                    />
                  </div>

                  {formData.showRibbon && (
                    <div className="p-3 border rounded-lg space-y-2">
                      <Label className="text-sm">Ribbon Color</Label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, ribbonColor: "dark" })}
                          className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                            formData.ribbonColor === "dark"
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="h-6 bg-slate-900 rounded mb-1" />
                          <span className="text-xs font-medium">Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, ribbonColor: "light" })}
                          className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                            formData.ribbonColor === "light"
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="h-6 bg-slate-100 rounded mb-1" />
                          <span className="text-xs font-medium">Light</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {formData.backgroundType === "image" && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-lg">Overlay</h4>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label htmlFor="backgroundOverlay" className="text-sm font-medium">Dark Overlay</Label>
                        <p className="text-xs text-muted-foreground">Better text readability</p>
                      </div>
                      <Switch
                        id="backgroundOverlay"
                        checked={formData.backgroundOverlay}
                        onCheckedChange={(checked) => setFormData({ ...formData, backgroundOverlay: checked })}
                      />
                    </div>

                    {formData.backgroundOverlay && (
                      <div className="space-y-2 p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <Label htmlFor="overlayOpacity" className="text-sm">Opacity</Label>
                          <span className="text-sm text-muted-foreground">{formData.backgroundOverlayOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          id="overlayOpacity"
                          min="0"
                          max="100"
                          value={formData.backgroundOverlayOpacity}
                          onChange={(e) => setFormData({ ...formData, backgroundOverlayOpacity: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <div 
                  className="relative p-4 rounded-lg overflow-hidden min-h-[200px]"
                  style={{
                    backgroundImage: formData.backgroundType === "image" && formData.backgroundImage 
                      ? `url(${formData.backgroundImage})` 
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: formData.backgroundType === "image" && formData.backgroundImage ? undefined : '#000',
                  }}
                >
                  {/* Background Overlay */}
                  {formData.backgroundType === "image" && formData.backgroundOverlay && (
                    <div 
                      className="absolute inset-0 bg-black"
                      style={{ opacity: formData.backgroundOverlayOpacity / 100 }}
                    />
                  )}
                  
                  {/* Text Ribbon */}
                  {formData.showRibbon && (
                    <div 
                      className={`absolute inset-0 ${formData.ribbonColor === "dark" ? "bg-slate-900/80" : "bg-slate-100/80"}`}
                    />
                  )}
                  
                  {/* Content */}
                  <div className={`relative z-10 ${formData.showRibbon ? (formData.ribbonColor === "dark" ? "text-white" : "text-slate-900") : "text-white"}`}>
                    <Badge variant="outline" className={`mb-2 border-primary/50 ${formData.showRibbon && formData.ribbonColor === "light" ? "text-primary" : "text-primary"}`}>
                      {formData.badge || "Badge text"}
                    </Badge>
                    <h2 className={cn(
                      "text-2xl font-bold",
                      (formData.highlightOnSecondLine || formData.middleLine) && "flex flex-col items-center"
                    )}>
                      <span className="block">{formData.headline || "Headline"}</span>
                      {formData.middleLine && (
                        <span className="block">{formData.middleLine}</span>
                      )}
                      <span className="block text-primary">{formData.highlightedText || "Highlighted"}</span>
                    </h2>
                    <p className="mt-2 text-sm opacity-90">
                      {formData.subheadline || "Subheadline text"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.benefits.filter(b => b).map((benefit, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="publish">Publish immediately</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this slide visible on the homepage
                    </p>
                  </div>
                  <Switch
                    id="publish"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => wizardStep === 1 ? closeWizard() : setWizardStep(wizardStep - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {wizardStep === 1 ? "Cancel" : "Back"}
            </Button>
            {wizardStep < 4 ? (
              <Button onClick={() => setWizardStep(wizardStep + 1)}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {editingSlide ? "Save Changes" : "Create Slide"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
