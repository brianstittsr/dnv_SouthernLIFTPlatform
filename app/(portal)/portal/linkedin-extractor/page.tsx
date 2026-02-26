"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  Linkedin,
  Download,
  Link2,
  FileText,
  Loader2,
  Copy,
  Eye,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Hash,
  AlertCircle,
  CheckCircle,
  ClipboardPaste,
  Globe,
  Sparkles,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkedInArticle, ExtractionResult } from "@/lib/linkedin-extractor";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog/types";

export default function LinkedInExtractorPage() {
  const [activeTab, setActiveTab] = useState("url");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set()
  );
  const [previewArticle, setPreviewArticle] =
    useState<LinkedInArticle | null>(null);

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportCategory, setExportCategory] = useState<BlogCategory>("Thought Leadership & Case Studies");
  const [articleCategories, setArticleCategories] = useState<Record<string, BlogCategory>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  // URL extraction state
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Paste state
  const [pastedHtml, setPastedHtml] = useState("");
  const [pastedText, setPastedText] = useState("");

  // Extracted articles
  const [extractedArticles, setExtractedArticles] = useState<
    LinkedInArticle[]
  >([]);

  const extractFromUrl = async () => {
    if (!linkedinUrl.trim()) return;
    setIsExtracting(true);
    setExtractionResult(null);

    try {
      const response = await fetch("/api/linkedin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkedinUrl, method: "url" }),
      });

      const result: ExtractionResult = await response.json();
      setExtractionResult(result);

      if (result.success && result.articles.length > 0) {
        setExtractedArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.url));
          const newArticles = result.articles.filter(
            (a) => !existingIds.has(a.url)
          );
          return [...prev, ...newArticles];
        });
      }
    } catch (error) {
      setExtractionResult({
        success: false,
        articles: [],
        totalFound: 0,
        error: "Failed to connect to extraction service.",
        method: "fetch",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const extractFromHtml = async () => {
    if (!pastedHtml.trim()) return;
    setIsExtracting(true);
    setExtractionResult(null);

    try {
      const response = await fetch("/api/linkedin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: pastedHtml, method: "paste-html" }),
      });

      const result: ExtractionResult = await response.json();
      setExtractionResult(result);

      if (result.success && result.articles.length > 0) {
        setExtractedArticles((prev) => [...prev, ...result.articles]);
      }
    } catch {
      setExtractionResult({
        success: false,
        articles: [],
        totalFound: 0,
        error: "Failed to parse HTML content.",
        method: "manual",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const extractFromText = async () => {
    if (!pastedText.trim()) return;
    setIsExtracting(true);
    setExtractionResult(null);

    try {
      const response = await fetch("/api/linkedin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pastedText, method: "paste-text" }),
      });

      const result: ExtractionResult = await response.json();
      setExtractionResult(result);

      if (result.success && result.articles.length > 0) {
        setExtractedArticles((prev) => [...prev, ...result.articles]);
      }
    } catch {
      setExtractionResult({
        success: false,
        articles: [],
        totalFound: 0,
        error: "Failed to parse text content.",
        method: "manual",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleArticleSelection = (id: string) => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedArticles.size === extractedArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(extractedArticles.map((a) => a.id)));
    }
  };

  const removeArticle = (id: string) => {
    setExtractedArticles((prev) => prev.filter((a) => a.id !== id));
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const copySelectedAsJson = () => {
    const selected = extractedArticles.filter((a) =>
      selectedArticles.has(a.id)
    );
    navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
  };

  const copySelectedAsMarkdown = () => {
    const selected = extractedArticles.filter((a) =>
      selectedArticles.has(a.id)
    );
    const markdown = selected
      .map(
        (a) =>
          `# ${a.title}\n\n**Author:** ${a.author}\n**Date:** ${a.publishedDate}\n**URL:** ${a.url}\n\n${a.content}\n\n${a.tags.map((t) => `#${t}`).join(" ")}\n\n---`
      )
      .join("\n\n");
    navigator.clipboard.writeText(markdown);
  };

  const openExportDialog = () => {
    // Initialize per-article categories with the default
    const cats: Record<string, BlogCategory> = {};
    extractedArticles.forEach((a) => {
      if (selectedArticles.has(a.id)) {
        cats[a.id] = articleCategories[a.id] || exportCategory;
      }
    });
    setArticleCategories(cats);
    setExportResult(null);
    setShowExportDialog(true);
  };

  const applyDefaultCategoryToAll = () => {
    const cats: Record<string, BlogCategory> = {};
    extractedArticles.forEach((a) => {
      if (selectedArticles.has(a.id)) {
        cats[a.id] = exportCategory;
      }
    });
    setArticleCategories(cats);
  };

  const exportSelectedAsBlogPosts = async () => {
    const selected = extractedArticles.filter((a) =>
      selectedArticles.has(a.id)
    );
    if (selected.length === 0) return;

    setIsExporting(true);
    setExportResult(null);

    try {
      const articlesToImport = selected.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        excerpt: a.excerpt,
        author: a.author || "KDM & Associates",
        publishedDate: a.publishedDate,
        url: a.url,
        tags: a.tags,
        category: articleCategories[a.id] || exportCategory,
        imageUrl: a.imageUrl,
      }));

      const response = await fetch("/api/blog/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: articlesToImport }),
      });

      const result = await response.json();

      if (response.ok && result.imported > 0) {
        setExportResult({
          success: true,
          message: `Successfully imported ${result.imported} article${result.imported !== 1 ? "s" : ""} as blog posts. They will appear on the blog after the next build/deploy.`,
        });
        // Remove exported articles from the list
        const exportedIds = new Set(selected.map((a) => a.id));
        setExtractedArticles((prev) =>
          prev.filter((a) => !exportedIds.has(a.id))
        );
        setSelectedArticles(new Set());
      } else {
        setExportResult({
          success: false,
          message: result.error || "Failed to import articles.",
        });
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: "Failed to connect to the import service.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <Linkedin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                LinkedIn Article Extractor
                <Badge variant="secondary" className="text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Import
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Extract articles from LinkedIn profiles and company pages
              </p>
            </div>
          </div>
          {extractedArticles.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {extractedArticles.length} article
                {extractedArticles.length !== 1 ? "s" : ""} extracted
              </Badge>
              {selectedArticles.size > 0 && (
                <Badge className="bg-blue-600">
                  {selectedArticles.size} selected
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel: Extraction Controls */}
        <div className="w-[480px] border-r flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="border-b px-4 pt-2">
              <TabsList className="h-10 w-full">
                <TabsTrigger value="url" className="gap-2 flex-1">
                  <Globe className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="paste-text" className="gap-2 flex-1">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="paste-html" className="gap-2 flex-1">
                  <FileText className="h-4 w-4" />
                  Paste HTML
                </TabsTrigger>
              </TabsList>
            </div>

            {/* URL Tab */}
            <TabsContent
              value="url"
              className="flex-1 m-0 min-h-0 overflow-auto"
            >
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Link2 className="h-4 w-4 text-blue-600" />
                      LinkedIn URL
                    </CardTitle>
                    <CardDescription>
                      Enter a LinkedIn profile, company page, or article URL
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin-url">URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="linkedin-url"
                          placeholder="https://www.linkedin.com/in/username or /company/name"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && extractFromUrl()
                          }
                        />
                        <Button
                          onClick={extractFromUrl}
                          disabled={!linkedinUrl.trim() || isExtracting}
                        >
                          {isExtracting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">Supported URL types:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>
                          Profile: linkedin.com/in/
                          <span className="text-blue-600">username</span>
                        </li>
                        <li>
                          Company: linkedin.com/company/
                          <span className="text-blue-600">name</span>
                        </li>
                        <li>
                          Article: linkedin.com/pulse/
                          <span className="text-blue-600">article-title</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 bg-aemerging businessr-50 border border-aemerging businessr-200 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-aemerging businessr-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-aemerging businessr-800">
                          <p className="font-medium">Note about LinkedIn access</p>
                          <p className="mt-1">
                            LinkedIn restricts automated access to most content.
                            If URL extraction doesn&apos;t work, use the{" "}
                            <strong>Paste Text</strong> or{" "}
                            <strong>Paste HTML</strong> tabs to manually copy
                            content from LinkedIn.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Extraction Result Feedback */}
                {extractionResult && (
                  <Card
                    className={cn(
                      "border-2",
                      extractionResult.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {extractionResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="text-sm">
                          {extractionResult.success ? (
                            <p className="text-green-800">
                              Successfully extracted{" "}
                              <strong>
                                {extractionResult.totalFound} article
                                {extractionResult.totalFound !== 1 ? "s" : ""}
                              </strong>
                              {extractionResult.profileName && (
                                <> from {extractionResult.profileName}</>
                              )}
                            </p>
                          ) : (
                            <div className="text-red-800">
                              <p className="font-medium">Extraction failed</p>
                              <p className="mt-1">{extractionResult.error}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Paste Text Tab */}
            <TabsContent
              value="paste-text"
              className="flex-1 m-0 min-h-0 overflow-auto"
            >
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardPaste className="h-4 w-4 text-blue-600" />
                      Paste Article Text
                    </CardTitle>
                    <CardDescription>
                      Copy and paste article text directly from LinkedIn.
                      Separate multiple articles with --- on a new line.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={`Paste your LinkedIn article text here...\n\nArticle Title\n\nArticle content goes here. You can paste the full text of any LinkedIn article or post.\n\n#Hashtag1 #Hashtag2\n\n---\n\nSecond Article Title\n\nSecond article content...`}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      rows={14}
                      className="font-mono text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {pastedText.length > 0
                          ? `${pastedText.split(/\s+/).filter((w) => w).length} words`
                          : "No content"}
                      </p>
                      <Button
                        onClick={extractFromText}
                        disabled={!pastedText.trim() || isExtracting}
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Extract Articles
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">
                      How to copy from LinkedIn:
                    </h4>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Open the LinkedIn article or post in your browser</li>
                      <li>Select all the article text (Ctrl+A or Cmd+A)</li>
                      <li>Copy the text (Ctrl+C or Cmd+C)</li>
                      <li>Paste it in the text area above</li>
                      <li>
                        For multiple articles, separate them with{" "}
                        <code className="bg-muted px-1 rounded">---</code>
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                {extractionResult && activeTab === "paste-text" && (
                  <Card
                    className={cn(
                      "border-2",
                      extractionResult.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {extractionResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <p
                          className={cn(
                            "text-sm",
                            extractionResult.success
                              ? "text-green-800"
                              : "text-red-800"
                          )}
                        >
                          {extractionResult.success
                            ? `Extracted ${extractionResult.totalFound} article${extractionResult.totalFound !== 1 ? "s" : ""}`
                            : extractionResult.error}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Paste HTML Tab */}
            <TabsContent
              value="paste-html"
              className="flex-1 m-0 min-h-0 overflow-auto"
            >
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Paste Page HTML
                    </CardTitle>
                    <CardDescription>
                      Paste the HTML source of a LinkedIn page for deeper
                      extraction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste HTML source here... (Right-click > View Page Source, or use browser DevTools)"
                      value={pastedHtml}
                      onChange={(e) => setPastedHtml(e.target.value)}
                      rows={14}
                      className="font-mono text-xs"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {pastedHtml.length > 0
                          ? `${pastedHtml.length.toLocaleString()} characters`
                          : "No content"}
                      </p>
                      <Button
                        onClick={extractFromHtml}
                        disabled={!pastedHtml.trim() || isExtracting}
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Parse HTML
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">
                      How to get page HTML:
                    </h4>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Open the LinkedIn page in your browser</li>
                      <li>
                        Right-click and select{" "}
                        <strong>View Page Source</strong> (or press Ctrl+U)
                      </li>
                      <li>Select all (Ctrl+A) and copy (Ctrl+C)</li>
                      <li>Paste the HTML in the text area above</li>
                    </ol>
                  </CardContent>
                </Card>

                {extractionResult && activeTab === "paste-html" && (
                  <Card
                    className={cn(
                      "border-2",
                      extractionResult.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {extractionResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <p
                          className={cn(
                            "text-sm",
                            extractionResult.success
                              ? "text-green-800"
                              : "text-red-800"
                          )}
                        >
                          {extractionResult.success
                            ? `Extracted ${extractionResult.totalFound} article${extractionResult.totalFound !== 1 ? "s" : ""}`
                            : extractionResult.error}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Extracted Articles */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          {extractedArticles.length > 0 && (
            <div className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedArticles.size === extractedArticles.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {selectedArticles.size} of {extractedArticles.length} selected
                </span>
              </div>
              {selectedArticles.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySelectedAsMarkdown}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Markdown
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySelectedAsJson}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy JSON
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={openExportDialog}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Export as Blog Posts
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Articles List */}
          <ScrollArea className="flex-1">
            {extractedArticles.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Linkedin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No articles extracted yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter a LinkedIn URL or paste article content to begin
                    extracting articles. Extracted articles will appear here.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Globe className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs font-medium">URL Extract</p>
                      <p className="text-xs text-muted-foreground">
                        Auto-fetch
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <ClipboardPaste className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs font-medium">Paste Text</p>
                      <p className="text-xs text-muted-foreground">
                        Manual copy
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <FileText className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs font-medium">Paste HTML</p>
                      <p className="text-xs text-muted-foreground">
                        Deep parse
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {extractedArticles.map((article) => (
                  <Card
                    key={article.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedArticles.has(article.id) &&
                        "ring-2 ring-blue-500 bg-blue-50/50"
                    )}
                    onClick={() => toggleArticleSelection(article.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            selectedArticles.has(article.id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          )}
                        >
                          {selectedArticles.has(article.id) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {article.title}
                            </h3>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewArticle(article);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {article.url && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(article.url, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeArticle(article.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {article.excerpt || article.content.substring(0, 150)}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author}
                            </div>
                            {article.publishedDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  article.publishedDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.max(
                                1,
                                Math.ceil(
                                  article.content.split(/\s+/).length / 200
                                )
                              )}{" "}
                              min read
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {article.source}
                            </Badge>
                          </div>

                          {article.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              {article.tags.slice(0, 5).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {article.tags.length > 5 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{article.tags.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewArticle}
        onOpenChange={() => setPreviewArticle(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {previewArticle && (
            <>
              <DialogHeader>
                <DialogTitle>{previewArticle.title}</DialogTitle>
                <DialogDescription>
                  <span className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {previewArticle.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(
                        previewArticle.publishedDate
                      ).toLocaleDateString()}
                    </span>
                    {previewArticle.url && (
                      <a
                        href={previewArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on LinkedIn
                      </a>
                    )}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                {previewArticle.content}
              </div>
              {previewArticle.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-1">
                  {previewArticle.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `# ${previewArticle.title}\n\n${previewArticle.content}`
                    );
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewArticle(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export as Blog Posts Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Export as Blog Posts
            </DialogTitle>
            <DialogDescription>
              Choose a blog category for each article, then import them into the
              platform&apos;s blog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Default category selector */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Default Category</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDefaultCategoryToAll}
                >
                  Apply to All
                </Button>
              </div>
              <Select
                value={exportCategory}
                onValueChange={(v) => setExportCategory(v as BlogCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Per-article category assignment */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Articles to Import ({selectedArticles.size})
              </Label>
              {extractedArticles
                .filter((a) => selectedArticles.has(a.id))
                .map((article) => (
                  <div
                    key={article.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <p className="text-sm font-medium line-clamp-1">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        Category:
                      </Label>
                      <Select
                        value={
                          articleCategories[article.id] || exportCategory
                        }
                        onValueChange={(v) =>
                          setArticleCategories((prev) => ({
                            ...prev,
                            [article.id]: v as BlogCategory,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOG_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.author}</span>
                      <span>
                        {Math.max(
                          1,
                          Math.ceil(
                            article.content.split(/\s+/).length / 200
                          )
                        )}{" "}
                        min read
                      </span>
                      {article.tags.length > 0 && (
                        <span>{article.tags.length} tags</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Export result feedback */}
            {exportResult && (
              <div
                className={cn(
                  "p-3 rounded-lg border-2 flex items-start gap-2",
                  exportResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                )}
              >
                {exportResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={cn(
                    "text-sm",
                    exportResult.success ? "text-green-800" : "text-red-800"
                  )}
                >
                  {exportResult.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
            >
              {exportResult?.success ? "Done" : "Cancel"}
            </Button>
            {!exportResult?.success && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={exportSelectedAsBlogPosts}
                disabled={isExporting || selectedArticles.size === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Import {selectedArticles.size} Article
                    {selectedArticles.size !== 1 ? "s" : ""} to Blog
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
