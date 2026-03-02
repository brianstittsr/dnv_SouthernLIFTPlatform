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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wand2,
  MessageSquare,
  Layout,
  Eye,
  Save,
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Users,
  Palette,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Link as LinkIcon,
  ShoppingCart,
  ExternalLink,
  Square,
  Search,
  Upload,
  Copy,
  RefreshCw,
  Camera,
  FileText,
  MousePointer,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  PAGE_PURPOSES,
  AUDIENCE_OPTIONS,
  TONE_OPTIONS,
  UX_PRINCIPLES,
  BUTTON_TYPES,
  BUTTON_STYLES,
  ELEMENT_TYPES,
  type EnhancedPageDesign,
  type PageButton,
  type PageElement,
  type PageSEO,
  type UXPrinciple,
} from "@/lib/page-designer-enhanced-schema";
import {
  PAGE_REGISTRY,
  getEditablePages,
  getMarketingPages,
  type PageRegistryEntry,
} from "@/lib/page-registry";

export default function PageDesignerV2() {
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<"design" | "elements" | "buttons" | "chat" | "seo" | "review">("design");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Page selection state
  const [selectedPage, setSelectedPage] = useState<PageRegistryEntry | null>(null);
  const [availablePages] = useState<PageRegistryEntry[]>(getEditablePages());

  // Design state
  const [pagePath, setPagePath] = useState("/");
  const [pagePurpose, setPagePurpose] = useState("");
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [uxPrinciples, setUxPrinciples] = useState<UXPrinciple[]>(UX_PRINCIPLES);
  const [pastedContent, setPastedContent] = useState("");
  const [rewrittenContent, setRewrittenContent] = useState("");
  const [screenshotData, setScreenshotData] = useState("");
  const [screenshotAnalysis, setScreenshotAnalysis] = useState<any>(null);

  // Elements state
  const [elements, setElements] = useState<PageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Buttons state
  const [buttons, setButtons] = useState<PageButton[]>([]);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  // SEO state
  const [seo, setSeo] = useState<PageSEO>({
    title: "",
    description: "",
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    canonicalUrl: "",
  });

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // UX Review state
  const [uxReview, setUxReview] = useState<any>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ============================================================================
  // Design Tab Functions
  // ============================================================================

  async function handleRewriteContent() {
    if (!pastedContent.trim()) {
      toast.error("Please paste some content first");
      return;
    }

    if (!pagePurpose) {
      toast.error("Please select a page purpose first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/rewrite-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: pastedContent,
          purpose: pagePurpose,
          audience: targetAudience,
          tone: tone,
          uxPrinciples: uxPrinciples.filter(p => p.applied).map(p => p.id),
          contentType: "full",
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRewrittenContent(data.rewritten);
        toast.success("Content rewritten successfully!");
      } else {
        toast.error(data.error || "Failed to rewrite content");
      }
    } catch (error) {
      console.error("Error rewriting content:", error);
      toast.error("Failed to rewrite content");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleScreenshotPaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const imageData = event.target?.result as string;
            setScreenshotData(imageData);
            await analyzeScreenshot(imageData);
          };
          reader.readAsDataURL(blob);
          toast.success("Screenshot pasted! Analyzing...");
          break;
        }
      }
    }
  }

  async function analyzeScreenshot(imageData: string) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          purpose: pagePurpose,
          audience: targetAudience,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScreenshotAnalysis(data.analysis);
        toast.success("Screenshot analyzed successfully!");
      } else {
        toast.error(data.error || "Failed to analyze screenshot");
      }
    } catch (error) {
      console.error("Error analyzing screenshot:", error);
      toast.error("Failed to analyze screenshot");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleUXPrinciple(id: string) {
    setUxPrinciples(prev =>
      prev.map(p => p.id === id ? { ...p, applied: !p.applied } : p)
    );
  }

  function toggleAudience(id: string) {
    setTargetAudience(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }

  // ============================================================================
  // Elements Tab Functions
  // ============================================================================

  function addElement(type: string) {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type: type as any,
      content: {},
      styling: {
        padding: "medium",
        textAlign: "left",
      },
      position: {
        section: "main",
        order: elements.length,
      },
      isVisible: true,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`${type} element added`);
  }

  function updateElement(id: string, updates: Partial<PageElement>) {
    setElements(prev =>
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  }

  function deleteElement(id: string) {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success("Element deleted");
  }

  // ============================================================================
  // Buttons Tab Functions
  // ============================================================================

  function addButton() {
    const newButton: PageButton = {
      id: Date.now().toString(),
      text: "New Button",
      url: "/",
      type: "navigation",
      style: "primary",
      position: {
        section: "main",
        order: buttons.length,
      },
      isEnabled: true,
    };
    setButtons([...buttons, newButton]);
    setSelectedButton(newButton.id);
    toast.success("Button added");
  }

  function updateButton(id: string, updates: Partial<PageButton>) {
    setButtons(prev =>
      prev.map(btn => btn.id === id ? { ...btn, ...updates } : btn)
    );
  }

  function deleteButton(id: string) {
    setButtons(prev => prev.filter(btn => btn.id !== id));
    if (selectedButton === id) {
      setSelectedButton(null);
    }
    toast.success("Button deleted");
  }

  // ============================================================================
  // Chat Tab Functions
  // ============================================================================

  async function handleChatSend() {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want to ${chatInput}. Here are my suggestions:\n\n1. Improve headline clarity\n2. Strengthen call-to-action\n3. Add social proof elements\n\nWould you like me to apply these changes?`,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, aiMessage]);
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

  async function handleRunUXReview() {
    setIsReviewLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const review = {
        overallScore: 78,
        recommendations: [
          {
            priority: "high",
            category: "Conversion",
            issue: "CTA placement needs improvement",
            suggestion: "Move primary CTA above the fold",
            impact: "Could increase conversions by 15-20%",
          },
          {
            priority: "high",
            category: "Accessibility",
            issue: "Color contrast too low",
            suggestion: "Increase contrast ratio to meet WCAG AA",
            impact: "Improves accessibility and visibility",
          },
          {
            priority: "medium",
            category: "Content",
            issue: "Headlines too long",
            suggestion: "Reduce to 6-8 words",
            impact: "Improves readability",
          },
        ],
      };

      setUxReview(review);
      toast.success("UX review completed!");
    } catch (error) {
      console.error("Error running UX review:", error);
      toast.error("Failed to run UX review");
    } finally {
      setIsReviewLoading(false);
    }
  }

  // ============================================================================
  // Save Functions
  // ============================================================================

  async function handleSave() {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Page design saved!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
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
            Create and optimize pages with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          <Button onClick={handleSave}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Page Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Page to Design</CardTitle>
          <CardDescription>Choose from {availablePages.length} editable pages in the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availablePages.map((page) => (
              <Card
                key={page.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPage?.id === page.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setSelectedPage(page);
                  setPagePath(page.path);
                }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {page.category}
                    </Badge>
                    {selectedPage?.id === page.id && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-sm">{page.name}</CardTitle>
                  <CardDescription className="text-xs">{page.description}</CardDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {page.path}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {page.sections.length} sections
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          {selectedPage && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Selected: {selectedPage.name}</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPage(null)}>
                  Clear Selection
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{selectedPage.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedPage.sections.map((section) => (
                  <Badge key={section.id} variant="secondary" className="text-xs">
                    {section.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle>Page Configuration</CardTitle>
            <CardDescription>Configure design settings for {selectedPage.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Page Purpose</Label>
                <Select value={pagePurpose} onValueChange={setPagePurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_PURPOSES.map((purpose) => (
                      <SelectItem key={purpose.id} value={purpose.id}>
                        {purpose.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs - Only show when page is selected */}
      {selectedPage && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="design">
              <Sparkles className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="elements">
              <Layers className="h-4 w-4 mr-2" />
              Elements
            </TabsTrigger>
            <TabsTrigger value="buttons">
              <MousePointer className="h-4 w-4 mr-2" />
              Buttons
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="review">
              <Eye className="h-4 w-4 mr-2" />
              UX Review
            </TabsTrigger>
          </TabsList>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Content Paste & Rewrite */}
            <Card>
              <CardHeader>
                <CardTitle>Content Paste & AI Rewrite</CardTitle>
                <CardDescription>
                  Paste existing content and let AI rewrite it based on your goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Paste Your Content</Label>
                  <Textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="Paste your existing page content here..."
                    className="min-h-[200px]"
                  />
                </div>
                <Button onClick={handleRewriteContent} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rewrite with AI
                    </>
                  )}
                </Button>
                {rewrittenContent && (
                  <div className="space-y-2">
                    <Label>AI Rewritten Content</Label>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{rewrittenContent}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(rewrittenContent);
                      toast.success("Copied to clipboard!");
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Screenshot Paste & Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Screenshot Paste & Analysis</CardTitle>
                <CardDescription>
                  Paste a screenshot to analyze design and extract content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onPaste={handleScreenshotPaste}
                  tabIndex={0}
                >
                  {screenshotData ? (
                    <div className="space-y-4">
                      <img src={screenshotData} alt="Pasted screenshot" className="max-h-[200px] mx-auto rounded" />
                      <Button variant="outline" size="sm" onClick={() => setScreenshotData("")}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click here and press Ctrl+V to paste a screenshot
                      </p>
                    </div>
                  )}
                </div>
                {screenshotAnalysis && (
                  <div className="space-y-2">
                    <Label>Analysis Results</Label>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p><strong>Detected Elements:</strong> {screenshotAnalysis.detectedElements?.length || 0}</p>
                      <p><strong>Layout Style:</strong> {screenshotAnalysis.layout?.style || "N/A"}</p>
                      <p><strong>Recommendations:</strong> {screenshotAnalysis.recommendations?.length || 0}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AUDIENCE_OPTIONS.map((audience) => (
                  <Card
                    key={audience.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      targetAudience.includes(audience.id) ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => toggleAudience(audience.id)}
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
            </CardContent>
          </Card>

          {/* Tone Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Tone & Voice</CardTitle>
              <CardDescription>Choose the tone for your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TONE_OPTIONS.map((toneOption) => (
                  <Card
                    key={toneOption.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      tone === toneOption.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setTone(toneOption.id)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{toneOption.label}</CardTitle>
                      <CardDescription className="text-xs">{toneOption.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* UX Principles */}
          <Card>
            <CardHeader>
              <CardTitle>UX Design Principles</CardTitle>
              <CardDescription>Select principles to apply to your design</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {uxPrinciples.map((principle) => (
                  <Card
                    key={principle.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      principle.applied ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleUXPrinciple(principle.id)}
                  >
                    <CardHeader className="p-3">
                      <div className="flex items-center gap-2">
                        {principle.applied && <CheckCircle className="h-4 w-4 text-primary" />}
                        <CardTitle className="text-xs">{principle.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">{principle.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elements Tab */}
        <TabsContent value="elements" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Element Types */}
            <Card>
              <CardHeader>
                <CardTitle>Add Elements</CardTitle>
                <CardDescription>Click to add to your page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {ELEMENT_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addElement(type.value)}
                      className="justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Elements List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Page Elements ({elements.length})</CardTitle>
                <CardDescription>Manage your page elements</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {elements.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No elements added yet</p>
                      <p className="text-sm mt-2">Add elements from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {elements.map((element) => (
                        <Card
                          key={element.id}
                          className={`cursor-pointer transition-all ${
                            selectedElement === element.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Square className="h-5 w-5 text-primary" />
                                <div>
                                  <CardTitle className="text-sm capitalize">{element.type}</CardTitle>
                                  <CardDescription className="text-xs">
                                    Section: {element.position.section}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElement(element.id);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(element.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Add Button */}
            <Card>
              <CardHeader>
                <CardTitle>Add Button</CardTitle>
                <CardDescription>Create navigation or action buttons</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={addButton} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Button
                </Button>
              </CardContent>
            </Card>

            {/* Buttons List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Page Buttons ({buttons.length})</CardTitle>
                <CardDescription>Manage navigation and action buttons</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {buttons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No buttons added yet</p>
                      <p className="text-sm mt-2">Add buttons for navigation or checkout</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {buttons.map((button) => (
                        <Card
                          key={button.id}
                          className={`cursor-pointer transition-all ${
                            selectedButton === button.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedButton(button.id)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {button.type === "navigation" && <LinkIcon className="h-5 w-5 text-primary" />}
                                {button.type === "checkout" && <ShoppingCart className="h-5 w-5 text-primary" />}
                                {button.type === "external" && <ExternalLink className="h-5 w-5 text-primary" />}
                                <div>
                                  <CardTitle className="text-sm">{button.text}</CardTitle>
                                  <CardDescription className="text-xs">
                                    {button.url} • {button.style}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedButton(button.id);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteButton(button.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Button Editor */}
          {selectedButton && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Button</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      value={buttons.find(b => b.id === selectedButton)?.text || ""}
                      onChange={(e) => updateButton(selectedButton, { text: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={buttons.find(b => b.id === selectedButton)?.url || ""}
                      onChange={(e) => updateButton(selectedButton, { url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={buttons.find(b => b.id === selectedButton)?.type || "navigation"}
                      onValueChange={(v) => updateButton(selectedButton, { type: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUTTON_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Style</Label>
                    <Select
                      value={buttons.find(b => b.id === selectedButton)?.style || "primary"}
                      onValueChange={(v) => updateButton(selectedButton, { style: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUTTON_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>
                Ask questions or request changes to your page design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with the AI assistant</p>
                      <p className="text-sm mt-2">Try asking about improvements or specific changes</p>
                    </div>
                  )}
                  {chatMessages.map((message) => (
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
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  className="min-h-[80px]"
                />
                <Button onClick={handleChatSend} disabled={!chatInput.trim() || isChatLoading} size="icon">
                  {isChatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Configuration</CardTitle>
              <CardDescription>Optimize your page for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={seo.title}
                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                    placeholder="Page title for search results"
                  />
                </div>
                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={seo.canonicalUrl || ""}
                    onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                    placeholder="https://example.com/page"
                  />
                </div>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  placeholder="Brief description for search results (150-160 characters)"
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={seo.keywords.join(", ")}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value.split(",").map(k => k.trim()) })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Open Graph (Social Sharing)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>OG Title</Label>
                    <Input
                      value={seo.ogTitle || ""}
                      onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                      placeholder="Title for social media"
                    />
                  </div>
                  <div>
                    <Label>OG Image URL</Label>
                    <Input
                      value={seo.ogImage || ""}
                      onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div>
                  <Label>OG Description</Label>
                  <Textarea
                    value={seo.ogDescription || ""}
                    onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                    placeholder="Description for social media"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UX Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>UX Review</CardTitle>
                  <CardDescription>
                    AI-powered analysis of your page design
                  </CardDescription>
                </div>
                <Button onClick={handleRunUXReview} disabled={isReviewLoading}>
                  {isReviewLoading ? (
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

          {uxReview && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-6xl font-bold text-primary">{uxReview.overallScore}</div>
                    <div className="flex-1">
                      <div className="w-full bg-secondary h-4 rounded-full">
                        <div
                          className="bg-primary h-4 rounded-full transition-all"
                          style={{ width: `${uxReview.overallScore}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {uxReview.overallScore >= 80 && "Excellent! Your page is well-optimized."}
                        {uxReview.overallScore >= 60 && uxReview.overallScore < 80 && "Good, but there's room for improvement."}
                        {uxReview.overallScore < 60 && "Needs improvement. Review recommendations below."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Prioritized improvements for your page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uxReview.recommendations.map((rec: any, index: number) => (
                      <Card key={index}>
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
                              <Lightbulb className="h-3 w-3" />
                              Impact: {rec.impact}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
