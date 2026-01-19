"use client";

import { useState, useEffect, useRef } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Wand2,
  MessageSquare,
  Layout,
  Eye,
  Save,
  History,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  Users,
  Palette,
  Layers,
  FileText,
  BarChart3,
  Award,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  PUBLIC_PAGES,
  PAGE_GOALS,
  AUDIENCE_OPTIONS,
  STYLE_OPTIONS,
  getPageDesign,
  savePageDesign,
  updatePageDesign,
  saveDesignHistory,
  getDesignHistory,
  getTemplates,
  saveConversation,
  updateConversation,
  saveUXReview,
  getLatestUXReview,
  type PublicPage,
  type PageDesign,
  type DesignContent,
  type SectionDesign,
  type LayoutTemplate,
  type AIMessage,
  type UXReview,
  type SectionType,
} from "@/lib/firebase-page-designer";
import { PageDesignerImageManager, type PageImage } from "@/components/admin/page-designer-image-manager";

// ============================================================================
// Main Component
// ============================================================================

export default function PageDesignerPage() {
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<"wizard" | "chat" | "templates" | "review" | "images">("wizard");
  const [selectedPage, setSelectedPage] = useState<PublicPage | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentDesign, setCurrentDesign] = useState<PageDesign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageImages, setPageImages] = useState<Record<string, any[]>>({});

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardMode, setWizardMode] = useState<"create" | "update">("create");
  const [wizardData, setWizardData] = useState({
    goal: "",
    audience: [] as string[],
    tone: "",
    colorScheme: "",
    layout: "",
    sections: [] as string[],
    headline: "",
    subheadline: "",
    cta: "",
  });

  // Chat state
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Templates state
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [templateFilter, setTemplateFilter] = useState<SectionType | "all">("all");

  // UX Review state
  const [uxReview, setUxReview] = useState<UXReview | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Load page design when page is selected
  useEffect(() => {
    if (selectedPage) {
      loadPageDesign(selectedPage.id);
    }
  }, [selectedPage]);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [templateFilter]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ============================================================================
  // Data Loading Functions
  // ============================================================================

  async function loadPageDesign(pageId: string) {
    setIsLoading(true);
    try {
      const design = await getPageDesign(pageId);
      setCurrentDesign(design);
      
      if (design) {
        toast.success("Page design loaded");
      } else {
        toast.info("No existing design found. Create a new one!");
      }
    } catch (error) {
      console.error("Error loading page design:", error);
      toast.error("Failed to load page design");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const filter = templateFilter === "all" ? undefined : templateFilter;
      const loadedTemplates = await getTemplates(filter);
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    }
  }

  // ============================================================================
  // Wizard Functions
  // ============================================================================

  function handleWizardNext() {
    if (wizardStep < 7) {
      setWizardStep(wizardStep + 1);
    }
  }

  function handleWizardBack() {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  }

  async function handleWizardGenerate() {
    if (!selectedPage || !profile?.id) {
      toast.error("Please select a page first");
      return;
    }

    setIsLoading(true);
    try {
      // Mock AI generation - replace with actual AI API call
      const generatedContent: DesignContent = {
        sections: wizardData.sections.map((sectionId, index) => {
          const section = selectedPage.sections.find(s => s.id === sectionId);
          return {
            sectionId,
            sectionType: section?.type || "content",
            content: {
              headline: index === 0 ? wizardData.headline : `Section ${index + 1} Headline`,
              subheadline: index === 0 ? wizardData.subheadline : `Section ${index + 1} description`,
              cta: index === 0 ? { text: wizardData.cta, link: "#", style: "primary" } : undefined,
            },
            styling: {
              backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
              textColor: "#1f2937",
              padding: "large",
              alignment: "center",
            },
          };
        }),
        globalStyles: {
          primaryColor: wizardData.colorScheme.includes("blue") ? "#3b82f6" : "#8b5cf6",
          secondaryColor: "#64748b",
          fontFamily: "Inter, sans-serif",
          spacing: "comfortable",
        },
        metadata: {
          title: selectedPage.name,
          description: selectedPage.description,
          keywords: [wizardData.goal, ...wizardData.audience],
        },
      };

      const newDesign: Omit<PageDesign, "id"> = {
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        content: generatedContent,
        version: currentDesign ? currentDesign.version + 1 : 1,
        status: "draft",
        createdBy: profile.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const designId = await savePageDesign(newDesign);
      
      if (designId) {
        // Save to history
        await saveDesignHistory({
          designId,
          pageId: selectedPage.id,
          content: generatedContent,
          version: newDesign.version,
          changeDescription: "Generated from wizard",
          createdBy: profile.id,
          createdAt: new Date(),
        });

        setCurrentDesign({ ...newDesign, id: designId });
        toast.success("Page design generated successfully!");
        setWizardStep(1);
        setActiveTab("chat");
      } else {
        toast.error("Failed to save design");
      }
    } catch (error) {
      console.error("Error generating design:", error);
      toast.error("Failed to generate design");
    } finally {
      setIsLoading(false);
    }
  }

  // ============================================================================
  // Chat Functions
  // ============================================================================

  async function handleChatSend() {
    if (!chatInput.trim() || !profile?.id) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Mock AI response - replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want to ${chatInput}. Here's what I suggest:\n\n1. Update the headline to be more compelling\n2. Add social proof elements\n3. Strengthen the call-to-action\n\nWould you like me to apply these changes?`,
        timestamp: new Date(),
        appliedChanges: false,
      };

      setChatMessages(prev => [...prev, aiMessage]);
      
      // Save conversation
      if (selectedPage) {
        await saveConversation({
          pageId: selectedPage.id,
          sectionId: selectedSection || undefined,
          messages: [...chatMessages, userMessage, aiMessage],
          context: {
            currentPage: selectedPage.name,
            currentSection: selectedSection || undefined,
            designGoal: wizardData.goal,
          },
          createdBy: profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      toast.error("Failed to get AI response");
    } finally {
      setIsChatLoading(false);
    }
  }

  // ============================================================================
  // UX Review Functions
  // ============================================================================

  async function handleUXReview() {
    if (!selectedPage || !currentDesign || !profile?.id) {
      toast.error("Please select a page with a design first");
      return;
    }

    setIsReviewLoading(true);
    try {
      // Mock UX review - replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const review: Omit<UXReview, "id"> = {
        pageId: selectedPage.id,
        designId: currentDesign.id!,
        overallScore: 78,
        categories: {
          visualHierarchy: {
            score: 82,
            feedback: "Good use of headings and spacing",
            improvements: ["Increase contrast between sections", "Add more visual breaks"],
          },
          contentClarity: {
            score: 75,
            feedback: "Clear messaging but could be more concise",
            improvements: ["Shorten headlines", "Use bullet points for features"],
          },
          brandConsistency: {
            score: 85,
            feedback: "Strong brand alignment",
            improvements: ["Ensure consistent button styles"],
          },
          conversionOptimization: {
            score: 70,
            feedback: "CTA placement could be improved",
            improvements: ["Add urgency to CTAs", "Include social proof near CTAs"],
          },
          mobileExperience: {
            score: 80,
            feedback: "Responsive but needs optimization",
            improvements: ["Reduce text size on mobile", "Simplify navigation"],
          },
          accessibility: {
            score: 72,
            feedback: "Some accessibility issues found",
            improvements: ["Add alt text to images", "Improve color contrast"],
          },
        },
        recommendations: [
          {
            id: "1",
            priority: "high",
            category: "Conversion",
            issue: "CTA button placement below the fold",
            suggestion: "Move primary CTA above the fold in hero section",
            impact: "Could increase conversions by 15-20%",
            effort: "low",
          },
          {
            id: "2",
            priority: "high",
            category: "Accessibility",
            issue: "Insufficient color contrast on CTA buttons",
            suggestion: "Increase contrast ratio to meet WCAG AA standards",
            impact: "Improves accessibility and visibility",
            effort: "low",
          },
          {
            id: "3",
            priority: "medium",
            category: "Content",
            issue: "Headlines are too long",
            suggestion: "Reduce headline length to 6-8 words",
            impact: "Improves readability and engagement",
            effort: "medium",
          },
        ],
        accessibilityIssues: [
          {
            id: "a1",
            severity: "serious",
            wcagLevel: "AA",
            issue: "Color contrast ratio below 4.5:1",
            location: "CTA buttons",
            fix: "Use darker button color or lighter text",
          },
          {
            id: "a2",
            severity: "moderate",
            wcagLevel: "A",
            issue: "Missing alt text on images",
            location: "Feature section images",
            fix: "Add descriptive alt text to all images",
          },
        ],
        brandMetrics: {
          colorConsistency: 88,
          toneConsistency: 82,
          messagingAlignment: 85,
          visualIdentity: 90,
        },
        createdBy: profile.id,
        createdAt: new Date(),
      };

      const reviewId = await saveUXReview(review);
      if (reviewId) {
        setUxReview({ ...review, id: reviewId });
        toast.success("UX review completed!");
      }
    } catch (error) {
      console.error("Error performing UX review:", error);
      toast.error("Failed to perform UX review");
    } finally {
      setIsReviewLoading(false);
    }
  }

  // ============================================================================
  // Save Functions
  // ============================================================================

  async function handleSaveDesign() {
    if (!currentDesign || !currentDesign.id) {
      toast.error("No design to save");
      return;
    }

    setIsLoading(true);
    try {
      const success = await updatePageDesign(currentDesign.id, {
        content: currentDesign.content,
        updatedAt: new Date(),
      });

      if (success) {
        toast.success("Design saved successfully!");
      } else {
        toast.error("Failed to save design");
      }
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePublishDesign() {
    if (!currentDesign || !currentDesign.id) {
      toast.error("No design to publish");
      return;
    }

    setIsLoading(true);
    try {
      const success = await updatePageDesign(currentDesign.id, {
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      });

      if (success) {
        setCurrentDesign({ ...currentDesign, status: "published", publishedAt: new Date() });
        toast.success("Design published successfully!");
      } else {
        toast.error("Failed to publish design");
      }
    } catch (error) {
      console.error("Error publishing design:", error);
      toast.error("Failed to publish design");
    } finally {
      setIsLoading(false);
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            AI Page Designer
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and optimize your SVP platform pages with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          {currentDesign && (
            <>
              <Button variant="outline" onClick={handleSaveDesign} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handlePublishDesign} disabled={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Page Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Page</CardTitle>
          <CardDescription>Choose which page you want to design or edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PUBLIC_PAGES.map((page) => (
              <Card
                key={page.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPage?.id === page.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedPage(page)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{page.name}</CardTitle>
                  <CardDescription className="text-xs">{page.description}</CardDescription>
                  <Badge variant="secondary" className="mt-2 w-fit">
                    {page.sections.length} sections
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Only show if page is selected */}
      {selectedPage && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="wizard">
              <Sparkles className="h-4 w-4 mr-2" />
              Wizard
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Layout className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="review">
              <Eye className="h-4 w-4 mr-2" />
              UX Review
            </TabsTrigger>
          </TabsList>

          {/* Wizard Tab */}
          <TabsContent value="wizard" className="space-y-4">
            <WizardContent
              step={wizardStep}
              mode={wizardMode}
              data={wizardData}
              selectedPage={selectedPage}
              onDataChange={setWizardData}
              onModeChange={setWizardMode}
              onNext={handleWizardNext}
              onBack={handleWizardBack}
              onGenerate={handleWizardGenerate}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <ChatContent
              messages={chatMessages}
              input={chatInput}
              isLoading={isChatLoading}
              selectedPage={selectedPage}
              selectedSection={selectedSection}
              onInputChange={setChatInput}
              onSectionChange={setSelectedSection}
              onSend={handleChatSend}
              chatEndRef={chatEndRef}
            />
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <ImagesContent
              selectedPage={selectedPage}
              pageImages={pageImages}
              onImagesChange={setPageImages}
            />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <TemplatesContent
              templates={templates}
              filter={templateFilter}
              onFilterChange={setTemplateFilter}
            />
          </TabsContent>

          {/* UX Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <UXReviewContent
              review={uxReview}
              isLoading={isReviewLoading}
              onRunReview={handleUXReview}
              currentDesign={currentDesign}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* No Page Selected State */}
      {!selectedPage && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Wand2 className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Select a Page to Get Started</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose a page from above to start designing with AI assistance. You can create new designs or edit existing ones.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Wizard Content Component
// ============================================================================

interface WizardContentProps {
  step: number;
  mode: "create" | "update";
  data: any;
  selectedPage: PublicPage;
  onDataChange: (data: any) => void;
  onModeChange: (mode: "create" | "update") => void;
  onNext: () => void;
  onBack: () => void;
  onGenerate: () => void;
  isLoading: boolean;
}

function WizardContent({
  step,
  mode,
  data,
  selectedPage,
  onDataChange,
  onModeChange,
  onNext,
  onBack,
  onGenerate,
  isLoading,
}: WizardContentProps) {
  const totalSteps = 7;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Design Wizard - Step {step} of {totalSteps}</CardTitle>
            <CardDescription>
              {step === 1 && "Choose your design mode"}
              {step === 2 && "Define your page goal"}
              {step === 3 && "Select target audience"}
              {step === 4 && "Choose visual style"}
              {step === 5 && "Select page sections"}
              {step === 6 && "Add key content"}
              {step === 7 && "Review and generate"}
            </CardDescription>
          </div>
          <Badge variant="outline">{selectedPage.name}</Badge>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-secondary h-2 rounded-full mt-4">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Mode Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  mode === "create" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onModeChange("create")}
              >
                <CardHeader>
                  <Sparkles className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle className="text-lg">Create New</CardTitle>
                  <CardDescription>
                    Start from scratch with AI-generated content
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  mode === "update" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onModeChange("update")}
              >
                <CardHeader>
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle className="text-lg">Update Existing</CardTitle>
                  <CardDescription>
                    Modify and improve current page design
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">What's the primary goal of this page?</label>
            <div className="grid grid-cols-2 gap-3">
              {PAGE_GOALS.map((goal) => (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.goal === goal.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => onDataChange({ ...data, goal: goal.id })}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <CardTitle className="text-sm">{goal.label}</CardTitle>
                        <CardDescription className="text-xs">{goal.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Audience Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Who is your target audience? (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-3">
              {AUDIENCE_OPTIONS.map((audience) => (
                <Card
                  key={audience.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.audience.includes(audience.id) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    const newAudience = data.audience.includes(audience.id)
                      ? data.audience.filter((a: string) => a !== audience.id)
                      : [...data.audience, audience.id];
                    onDataChange({ ...data, audience: newAudience });
                  }}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <CardTitle className="text-sm">{audience.label}</CardTitle>
                        <CardDescription className="text-xs">{audience.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Style Selection */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Tone & Voice</label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.tone.map((tone) => (
                  <Card
                    key={tone.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      data.tone === tone.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onDataChange({ ...data, tone: tone.id })}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{tone.label}</CardTitle>
                      <CardDescription className="text-xs">{tone.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Color Scheme</label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.colorScheme.map((scheme) => (
                  <Card
                    key={scheme.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      data.colorScheme === scheme.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onDataChange({ ...data, colorScheme: scheme.id })}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{scheme.label}</CardTitle>
                      <CardDescription className="text-xs">{scheme.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Layout Style</label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.layout.map((layout) => (
                  <Card
                    key={layout.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      data.layout === layout.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onDataChange({ ...data, layout: layout.id })}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{layout.label}</CardTitle>
                      <CardDescription className="text-xs">{layout.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Section Selection */}
        {step === 5 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">
              Select sections for this page (minimum 2)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {selectedPage.sections.filter(s => s.isEditable).map((section) => (
                <Card
                  key={section.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.sections.includes(section.id) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    const newSections = data.sections.includes(section.id)
                      ? data.sections.filter((s: string) => s !== section.id)
                      : [...data.sections, section.id];
                    onDataChange({ ...data, sections: newSections });
                  }}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <Layers className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <CardTitle className="text-sm">{section.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {section.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            {data.sections.length < 2 && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                Please select at least 2 sections
              </p>
            )}
          </div>
        )}

        {/* Step 6: Content Input */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Main Headline</label>
              <Input
                placeholder="Enter your main headline..."
                value={data.headline}
                onChange={(e) => onDataChange({ ...data, headline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subheadline</label>
              <Input
                placeholder="Enter supporting text..."
                value={data.subheadline}
                onChange={(e) => onDataChange({ ...data, subheadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Call-to-Action Text</label>
              <Input
                placeholder="e.g., Get Started, Learn More..."
                value={data.cta}
                onChange={(e) => onDataChange({ ...data, cta: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Design Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Mode:</span>
                  <p className="font-medium capitalize">{mode}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Goal:</span>
                  <p className="font-medium">
                    {PAGE_GOALS.find(g => g.id === data.goal)?.label || "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Audience:</span>
                  <p className="font-medium">{data.audience.length} selected</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sections:</span>
                  <p className="font-medium">{data.sections.length} selected</p>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground text-sm">Headline:</span>
                <p className="font-medium">{data.headline || "Not set"}</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Ready to generate!
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    AI will create a complete page design based on your preferences. You can refine it using the AI Chat after generation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={step === 1 || isLoading}
          >
            Back
          </Button>
          {step < totalSteps ? (
            <Button
              onClick={onNext}
              disabled={
                isLoading ||
                (step === 2 && !data.goal) ||
                (step === 3 && data.audience.length === 0) ||
                (step === 4 && (!data.tone || !data.colorScheme || !data.layout)) ||
                (step === 5 && data.sections.length < 2) ||
                (step === 6 && (!data.headline || !data.subheadline || !data.cta))
              }
            >
              Next
            </Button>
          ) : (
            <Button onClick={onGenerate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Design
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Chat Content Component
// ============================================================================

interface ChatContentProps {
  messages: AIMessage[];
  input: string;
  isLoading: boolean;
  selectedPage: PublicPage;
  selectedSection: string | null;
  onInputChange: (value: string) => void;
  onSectionChange: (value: string | null) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

function ChatContent({
  messages,
  input,
  isLoading,
  selectedPage,
  selectedSection,
  onInputChange,
  onSectionChange,
  onSend,
  chatEndRef,
}: ChatContentProps) {
  const quickActions = [
    "Improve headline",
    "Add social proof",
    "Strengthen CTA",
    "Simplify content",
    "Add urgency",
    "Improve mobile layout",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chat Area */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Chat Assistant</CardTitle>
          <CardDescription>
            Ask questions or request changes to your page design
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with the AI assistant</p>
                  <p className="text-sm mt-2">Try asking about improvements or specific changes</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.appliedChanges && (
                      <Badge variant="secondary" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Changes Applied
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                className="min-h-[80px]"
              />
              <Button onClick={onSend} disabled={!input.trim() || isLoading} size="icon">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Page</label>
            <p className="text-sm text-muted-foreground mt-1">{selectedPage.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Focus Section</label>
            <Select value={selectedSection || "all"} onValueChange={(v) => onSectionChange(v === "all" ? null : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {selectedPage.sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">Quick Actions</label>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => onInputChange(action)}
                  className="text-xs"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Templates Content Component
// ============================================================================

interface TemplatesContentProps {
  templates: LayoutTemplate[];
  filter: SectionType | "all";
  onFilterChange: (filter: SectionType | "all") => void;
}

function TemplatesContent({ templates, filter, onFilterChange }: TemplatesContentProps) {
  const sectionTypes: (SectionType | "all")[] = [
    "all",
    "hero",
    "features",
    "testimonials",
    "cta",
    "pricing",
    "team",
    "faq",
    "contact",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Templates</CardTitle>
        <CardDescription>
          Pre-built section templates with best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {sectionTypes.map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm mt-2">Try selecting a different section type</p>
            </div>
          )}
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Popularity: {template.popularity}/100</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// UX Review Content Component
// ============================================================================

interface UXReviewContentProps {
  review: UXReview | null;
  isLoading: boolean;
  onRunReview: () => void;
  currentDesign: PageDesign | null;
}

function UXReviewContent({ review, isLoading, onRunReview, currentDesign }: UXReviewContentProps) {
  if (!currentDesign) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <Eye className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No Design to Review</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create a page design first using the Wizard, then come back here to get AI-powered UX insights.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>UX Review</CardTitle>
              <CardDescription>
                AI-powered analysis of your page design
              </CardDescription>
            </div>
            <Button onClick={onRunReview} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Run UX Review
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Review Results */}
      {review && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold text-primary">{review.overallScore}</div>
                <div className="flex-1">
                  <div className="w-full bg-secondary h-4 rounded-full">
                    <div
                      className="bg-primary h-4 rounded-full transition-all"
                      style={{ width: `${review.overallScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.overallScore >= 80 && "Excellent! Your page is well-optimized."}
                    {review.overallScore >= 60 && review.overallScore < 80 && "Good, but there's room for improvement."}
                    {review.overallScore < 60 && "Needs improvement. Review recommendations below."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(review.categories).map(([key, category]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-sm font-bold">{category.score}/100</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{category.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Prioritized improvements for your page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {review.recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                rec.priority === "high"
                                  ? "destructive"
                                  : rec.priority === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                          <CardTitle className="text-sm">{rec.issue}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {rec.suggestion}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Impact: {rec.impact}
                        </span>
                        <span>Effort: {rec.effort}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Issues */}
          {review.accessibilityIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Issues</CardTitle>
                <CardDescription>WCAG compliance issues found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {review.accessibilityIssues.map((issue) => (
                    <Card key={issue.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            className={`h-5 w-5 flex-shrink-0 ${
                              issue.severity === "critical"
                                ? "text-red-500"
                                : issue.severity === "serious"
                                ? "text-orange-500"
                                : "text-yellow-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                WCAG {issue.wcagLevel}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {issue.severity}
                              </Badge>
                            </div>
                            <CardTitle className="text-sm">{issue.issue}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Location: {issue.location}
                            </CardDescription>
                            <p className="text-xs text-muted-foreground mt-2">
                              <strong>Fix:</strong> {issue.fix}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Color Consistency</span>
                    <span className="text-sm font-bold">{review.brandMetrics.colorConsistency}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${review.brandMetrics.colorConsistency}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tone Consistency</span>
                    <span className="text-sm font-bold">{review.brandMetrics.toneConsistency}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${review.brandMetrics.toneConsistency}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messaging Alignment</span>
                    <span className="text-sm font-bold">{review.brandMetrics.messagingAlignment}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${review.brandMetrics.messagingAlignment}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visual Identity</span>
                    <span className="text-sm font-bold">{review.brandMetrics.visualIdentity}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${review.brandMetrics.visualIdentity}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Images Content Component
// ============================================================================

interface ImagesContentProps {
  selectedPage: PublicPage;
  pageImages: Record<string, PageImage[]>;
  onImagesChange: (images: Record<string, PageImage[]>) => void;
}

function ImagesContent({
  selectedPage,
  pageImages,
  onImagesChange,
}: ImagesContentProps) {
  function handleSectionImagesChange(sectionId: string, images: PageImage[]) {
    onImagesChange({
      ...pageImages,
      [sectionId]: images,
    });
  }

  const editableSections = selectedPage.sections.filter(s => s.isEditable);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Images</CardTitle>
          <CardDescription>
            Manage images for each section of your page. Upload, position, and resize images for optimal display.
          </CardDescription>
        </CardHeader>
      </Card>

      {editableSections.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Editable Sections</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This page has no editable sections that support images.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {editableSections.map((section) => (
            <PageDesignerImageManager
              key={section.id}
              sectionId={section.id}
              sectionName={section.name}
              images={pageImages[section.id] || []}
              onImagesChange={(images) => handleSectionImagesChange(section.id, images)}
              maxImages={section.type === "hero" ? 1 : section.type === "team" ? 20 : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
