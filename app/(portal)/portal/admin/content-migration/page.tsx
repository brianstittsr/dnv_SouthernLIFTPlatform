"use client";

import { useState, useEffect, useRef } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { ClientCrawler, CrawlCallbacks } from "@/lib/utils/client-crawler";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe,
  Download,
  Play,
  Pause,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  FileDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  ExternalLink,
  FolderOpen,
  BarChart3,
  Settings,
  Search,
  Filter,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import {
  mockCrawlProgress,
  mockSiteStructure,
  mockCrawledPages,
  mockImages,
  mockVideos,
  mockDocuments,
  mockMigrationReport,
} from "@/lib/mock-data/content-migration-mock-data";
import {
  CrawlProgress,
  CrawledPage,
  ImageAsset,
  VideoAsset,
  DocumentAsset,
  MigrationReport,
  SiteStructure,
} from "@/lib/types/content-migration";
import { CrawlProgressModal, CrawlStep } from "@/components/content-migration/crawl-progress-modal";

export default function ContentMigrationPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const crawlerRef = useRef<ClientCrawler | null>(null);

  // Crawl state
  const [crawlProgress, setCrawlProgress] = useState<CrawlProgress | null>(null);
  const [siteStructure, setSiteStructure] = useState<SiteStructure | null>(null);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [documents, setDocuments] = useState<DocumentAsset[]>([]);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);

  // Crawl config
  const [targetUrl, setTargetUrl] = useState("https://www.kdm-assoc.com");
  const [maxPages, setMaxPages] = useState(100);
  const [crawlDelay, setCrawlDelay] = useState(1500);
  const [downloadImages, setDownloadImages] = useState(true);
  const [downloadDocuments, setDownloadDocuments] = useState(true);

  // Filters
  const [pageTypeFilter, setPageTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [crawlSteps, setCrawlSteps] = useState<CrawlStep[]>([]);
  const [currentCrawlUrl, setCurrentCrawlUrl] = useState<string>("");
  const [recentCrawledPages, setRecentCrawledPages] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [useMockData]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        setCrawlProgress(mockCrawlProgress);
        setSiteStructure(mockSiteStructure);
        setCrawledPages(mockCrawledPages);
        setImages(mockImages);
        setVideos(mockVideos);
        setDocuments(mockDocuments);
        setMigrationReport(mockMigrationReport);
      } else {
        // Load from API/Firestore
        setCrawlProgress(null);
        setSiteStructure(null);
        setCrawledPages([]);
        setImages([]);
        setVideos([]);
        setDocuments([]);
        setMigrationReport(null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load content migration data");
    } finally {
      setLoading(false);
    }
  };

  const initializeCrawlSteps = () => {
    const initialSteps: CrawlStep[] = [
      { id: "init", label: "Initializing crawler", status: "pending" },
      { id: "crawling", label: "Crawling pages", status: "pending", count: 0 },
      { id: "images", label: "Extracting images", status: "pending", count: 0 },
      { id: "videos", label: "Extracting videos", status: "pending", count: 0 },
      { id: "documents", label: "Extracting documents", status: "pending", count: 0 },
      { id: "report", label: "Generating report", status: "pending" },
      { id: "saving", label: "Saving to disk", status: "pending" },
    ];
    setCrawlSteps(initialSteps);
    return initialSteps;
  };

  const updateCrawlStep = (stepId: string, updates: Partial<CrawlStep>) => {
    setCrawlSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const startCrawl = async () => {
    // Initialize steps and show modal
    initializeCrawlSteps();
    setShowProgressModal(true);
    setRecentCrawledPages([]);
    setCurrentCrawlUrl("");
    
    toast.info("Starting website crawl...");
    
    if (useMockData) {
      // Mock mode - simulate crawl progress with steps
      updateCrawlStep("init", { status: "in_progress" });
      await new Promise(r => setTimeout(r, 500));
      updateCrawlStep("init", { status: "completed" });
      updateCrawlStep("crawling", { status: "in_progress" });
      
      setCrawlProgress({
        ...mockCrawlProgress,
        status: "running",
        pagesCrawled: 0,
        pagesRemaining: mockCrawlProgress.totalPagesDiscovered,
      });
      
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 5;
        if (progress >= 100) {
          clearInterval(interval);
          updateCrawlStep("crawling", { status: "completed", count: mockCrawledPages.length });
          updateCrawlStep("images", { status: "completed", count: mockImages.length });
          updateCrawlStep("videos", { status: "completed", count: mockVideos.length });
          updateCrawlStep("documents", { status: "completed", count: mockDocuments.length });
          updateCrawlStep("report", { status: "in_progress" });
          await new Promise(r => setTimeout(r, 500));
          updateCrawlStep("report", { status: "completed" });
          updateCrawlStep("saving", { status: "in_progress" });
          await new Promise(r => setTimeout(r, 1000));
          updateCrawlStep("saving", { status: "completed" });
          
          setCrawlProgress(mockCrawlProgress);
          setCrawledPages(mockCrawledPages);
          setImages(mockImages);
          setVideos(mockVideos);
          setDocuments(mockDocuments);
          setMigrationReport(mockMigrationReport);
          toast.success("Crawl completed!");
        } else {
          const pagesCrawled = Math.floor((progress / 100) * mockCrawlProgress.totalPagesDiscovered);
          updateCrawlStep("crawling", { count: pagesCrawled });
          updateCrawlStep("images", { status: "in_progress", count: Math.floor(pagesCrawled * 2) });
          updateCrawlStep("videos", { status: "in_progress", count: Math.floor(pagesCrawled * 0.1) });
          updateCrawlStep("documents", { status: "in_progress", count: Math.floor(pagesCrawled * 0.3) });
          setCrawlProgress(prev => prev ? {
            ...prev,
            pagesCrawled,
            pagesRemaining: prev.totalPagesDiscovered - pagesCrawled,
          } : null);
        }
      }, 500);
    } else {
      // Live mode - use client-side crawler
      try {
        updateCrawlStep("init", { status: "in_progress", detail: "Authenticating..." });
        
        const { auth } = await import("@/lib/firebase");
        const currentUser = auth?.currentUser;
        
        if (!currentUser) {
          updateCrawlStep("init", { status: "error", detail: "Not logged in" });
          toast.error("You must be logged in to start a crawl");
          return;
        }

        const token = await currentUser.getIdToken();
        updateCrawlStep("init", { status: "completed", detail: "Ready" });
        updateCrawlStep("crawling", { status: "in_progress", detail: targetUrl });

        // Clear previous data
        setCrawledPages([]);
        setImages([]);
        setVideos([]);
        setDocuments([]);
        setMigrationReport(null);

        const callbacks: CrawlCallbacks = {
          onProgress: (progress) => {
            setCrawlProgress(progress);
            updateCrawlStep("crawling", { 
              count: progress.pagesCrawled,
              detail: `${progress.pagesCrawled}/${progress.totalPagesDiscovered} pages`
            });
          },
          onPageCrawled: (page) => {
            setCrawledPages(prev => [...prev, page]);
            setCurrentCrawlUrl(page.url);
            setRecentCrawledPages(prev => [page.url, ...prev].slice(0, 10));
          },
          onImageFound: (image) => {
            setImages(prev => {
              const newImages = [...prev, image];
              updateCrawlStep("images", { status: "in_progress", count: newImages.length });
              return newImages;
            });
          },
          onVideoFound: (video) => {
            setVideos(prev => {
              const newVideos = [...prev, video];
              updateCrawlStep("videos", { status: "in_progress", count: newVideos.length });
              return newVideos;
            });
          },
          onDocumentFound: (doc) => {
            setDocuments(prev => {
              const newDocs = [...prev, doc];
              updateCrawlStep("documents", { status: "in_progress", count: newDocs.length });
              return newDocs;
            });
          },
          onError: (url, error) => {
            console.error(`Crawl error for ${url}:`, error);
          },
          onComplete: async (pages, imgs, vids, docs) => {
            updateCrawlStep("crawling", { status: "completed", count: pages.length });
            updateCrawlStep("images", { status: "completed", count: imgs.length });
            updateCrawlStep("videos", { status: "completed", count: vids.length });
            updateCrawlStep("documents", { status: "completed", count: docs.length });
            
            // Generate report
            updateCrawlStep("report", { status: "in_progress", detail: "Analyzing content..." });
            generateReport(pages, imgs, vids, docs);
            updateCrawlStep("report", { status: "completed" });
            
            // Auto-save to disk
            updateCrawlStep("saving", { status: "in_progress", detail: "Writing files..." });
            try {
              const response = await fetch("/api/content-migration/save-content", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  pages,
                  images: imgs,
                  videos: vids,
                  documents: docs,
                  report: null, // Will be set after generateReport
                }),
              });
              
              if (response.ok) {
                const result = await response.json();
                updateCrawlStep("saving", { 
                  status: "completed", 
                  detail: `Saved ${result.savedFiles.length} files` 
                });
              } else {
                updateCrawlStep("saving", { status: "error", detail: "Failed to save" });
              }
            } catch (err) {
              updateCrawlStep("saving", { status: "error", detail: "Save error" });
            }
            
            toast.success(`Crawl completed! Found ${pages.length} pages, ${imgs.length} images, ${vids.length} videos`);
          },
        };
        
        const crawler = new ClientCrawler(
          {
            targetUrl,
            maxPages,
            crawlDelay,
            downloadImages,
            downloadDocuments,
            authToken: token,
          },
          callbacks
        );

        crawlerRef.current = crawler;
        crawler.start();
      } catch (error: any) {
        console.error("Error starting crawl:", error);
        updateCrawlStep("init", { status: "error", detail: error.message });
        toast.error(error.message || "Failed to start crawl");
        setCrawlProgress(prev => prev ? { ...prev, status: "failed" } : null);
      }
    }
  };

  const generateReport = (pages: CrawledPage[], imgs: ImageAsset[], vids: VideoAsset[], docs: DocumentAsset[]) => {
    const pagesByType: Record<string, number> = {};
    let totalWordCount = 0;

    pages.forEach(page => {
      pagesByType[page.pageType] = (pagesByType[page.pageType] || 0) + 1;
      totalWordCount += page.wordCount;
    });

    const report: MigrationReport = {
      siteUrl: targetUrl,
      crawlDate: new Date().toISOString(),
      summary: {
        totalPages: pages.length,
        pagesByType,
        totalImages: imgs.length,
        totalVideos: vids.length,
        totalDocuments: docs.length,
        totalWordCount,
      },
      contentAudit: {
        highValuePages: [...pages].sort((a, b) => b.wordCount - a.wordCount).slice(0, 10).map(p => p.url),
        outdatedContent: [],
        duplicateContent: [],
        missingMetadata: pages.filter(p => !p.metadata.metaDescription).map(p => p.url),
      },
      migrationPriority: {
        priority1: pages.filter(p => ["home", "contact", "services"].includes(p.pageType)).map(p => p.url),
        priority2: pages.filter(p => ["about", "team", "case-study"].includes(p.pageType)).map(p => p.url),
        priority3: pages.filter(p => ["blog", "resources"].includes(p.pageType)).map(p => p.url),
        archive: pages.filter(p => p.pageType === "other").map(p => p.url),
      },
      urlMapping: pages.map(p => ({
        oldUrl: p.url,
        newUrl: `/${p.slug}`,
        redirectType: "301" as const,
        notes: "Auto-generated",
      })),
      mediaOptimization: {
        imagesNeedingCompression: [],
        imagesNeedingAltText: imgs.filter(img => !img.alt).map(img => img.sourceUrl),
        brokenMediaLinks: [],
      },
      contentGaps: [],
      recommendations: [
        `Review ${pages.filter(p => !p.metadata.metaDescription).length} pages missing meta descriptions`,
        `Add alt text to ${imgs.filter(img => !img.alt).length} images`,
        "Configure URL redirects from old to new URLs",
        "Test all pages after migration",
      ],
    };

    setMigrationReport(report);
  };

  const pollCrawlProgress = async (jobId: string, token: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/content-migration/crawl?jobId=${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch crawl status");
        }

        const job = await response.json();
        
        setCrawlProgress({
          ...job.progress,
          status: job.status,
        });

        if (job.status === "completed" || job.status === "failed") {
          clearInterval(pollInterval);
          if (job.status === "completed") {
            toast.success("Crawl completed!");
            // Load the crawled data
            loadCrawledData(jobId, token);
          } else {
            toast.error("Crawl failed");
          }
        }
      } catch (error) {
        console.error("Error polling crawl status:", error);
      }
    }, 2000);
  };

  const loadCrawledData = async (jobId: string, token: string) => {
    try {
      // Load pages
      const pagesResponse = await fetch(`/api/content-migration/pages?jobId=${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pagesResponse.ok) {
        const { pages } = await pagesResponse.json();
        setCrawledPages(pages);
      }

      // Load report
      const reportResponse = await fetch(`/api/content-migration/report?jobId=${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reportResponse.ok) {
        const report = await reportResponse.json();
        setMigrationReport(report);
      }
    } catch (error) {
      console.error("Error loading crawled data:", error);
    }
  };

  const pauseCrawl = () => {
    if (crawlerRef.current) {
      crawlerRef.current.pause();
    }
    toast.info("Crawl paused");
    setCrawlProgress(prev => prev ? { ...prev, status: "paused" } : null);
  };

  const resumeCrawl = () => {
    if (crawlerRef.current) {
      crawlerRef.current.resume();
    }
    toast.info("Crawl resumed");
    setCrawlProgress(prev => prev ? { ...prev, status: "running" } : null);
  };

  const stopCrawl = () => {
    if (crawlerRef.current) {
      crawlerRef.current.stop();
    }
    toast.info("Crawl stopped");
    setCrawlProgress(prev => prev ? { ...prev, status: "failed" } : null);
  };

  const exportReport = () => {
    if (!migrationReport) return;
    
    const blob = new Blob([JSON.stringify(migrationReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "migration-report.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const saveToDisk = async () => {
    if (crawledPages.length === 0) {
      toast.error("No crawled data to save");
      return;
    }

    try {
      const { auth } = await import("@/lib/firebase");
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        toast.error("Not authenticated");
        return;
      }

      const token = await currentUser.getIdToken();
      toast.info("Saving crawled content to disk...");

      const response = await fetch("/api/content-migration/save-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pages: crawledPages,
          images: images,
          videos: videos,
          documents: documents,
          report: migrationReport,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save content");
      }

      const result = await response.json();
      toast.success(`Saved ${result.savedFiles.length} files to ${result.outputDir}`);
      console.log("[Save] Content saved:", result);
    } catch (error: any) {
      console.error("Error saving to disk:", error);
      toast.error(error.message || "Failed to save content");
    }
  };

  const filteredPages = crawledPages.filter(page => {
    if (pageTypeFilter !== "all" && page.pageType !== pageTypeFilter) return false;
    if (searchQuery && !page.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !page.url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Idle</Badge>;
    }
  };

  const getPageTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      home: "bg-purple-100 text-purple-800",
      about: "bg-blue-100 text-blue-800",
      services: "bg-green-100 text-green-800",
      blog: "bg-orange-100 text-orange-800",
      contact: "bg-pink-100 text-pink-800",
      "case-study": "bg-cyan-100 text-cyan-800",
      resources: "bg-yellow-100 text-yellow-800",
      legal: "bg-gray-100 text-gray-800",
      other: "bg-slate-100 text-slate-800",
    };
    return <Badge className={colors[type] || colors.other}>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Migration</h1>
          <p className="text-muted-foreground">
            Crawl and migrate content from the KDM Associates website
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DataToggle useMockData={useMockData} onToggle={setUseMockData} />
          <Button variant="outline" onClick={saveToDisk} disabled={crawledPages.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save to Disk
          </Button>
          <Button variant="outline" onClick={exportReport} disabled={!migrationReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Crawl Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Crawler
              </CardTitle>
              <CardDescription>
                Configure and run the content crawler
              </CardDescription>
            </div>
            {crawlProgress && getStatusBadge(crawlProgress.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crawl Configuration */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPages">Max Pages</Label>
              <Input
                id="maxPages"
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crawlDelay">Crawl Delay (ms)</Label>
              <Input
                id="crawlDelay"
                type="number"
                value={crawlDelay}
                onChange={(e) => setCrawlDelay(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={downloadImages}
                  onCheckedChange={setDownloadImages}
                />
                <Label>Download Images</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={downloadDocuments}
                  onCheckedChange={setDownloadDocuments}
                />
                <Label>Download Documents</Label>
              </div>
            </div>
          </div>

          {/* Crawl Controls */}
          <div className="flex items-center gap-4">
            {crawlProgress?.status === "running" ? (
              <Button variant="outline" onClick={pauseCrawl}>
                <Pause className="h-4 w-4 mr-2" />
                Pause Crawl
              </Button>
            ) : crawlProgress?.status === "paused" ? (
              <Button onClick={resumeCrawl}>
                <Play className="h-4 w-4 mr-2" />
                Resume Crawl
              </Button>
            ) : (
              <Button onClick={startCrawl}>
                <Play className="h-4 w-4 mr-2" />
                Start Crawl
              </Button>
            )}
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Progress */}
          {crawlProgress && (
            <div className="space-y-4">
              <Separator />
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{crawlProgress.pagesCrawled}</div>
                  <div className="text-sm text-muted-foreground">Pages Crawled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{crawlProgress.imagesFound}</div>
                  <div className="text-sm text-muted-foreground">Images Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{crawlProgress.videosFound}</div>
                  <div className="text-sm text-muted-foreground">Videos Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{crawlProgress.documentsFound}</div>
                  <div className="text-sm text-muted-foreground">Documents Found</div>
                </div>
              </div>
              {crawlProgress.status === "running" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((crawlProgress.pagesCrawled / crawlProgress.totalPagesDiscovered) * 100)}%</span>
                  </div>
                  <Progress value={(crawlProgress.pagesCrawled / crawlProgress.totalPagesDiscovered) * 100} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pages ({crawledPages.length})
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images ({images.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Report
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {migrationReport && (
            <>
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{migrationReport.summary.totalPages}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{migrationReport.summary.totalImages}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Videos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{migrationReport.summary.totalVideos}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Word Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{migrationReport.summary.totalWordCount.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Pages by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Pages by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {Object.entries(migrationReport.summary.pagesByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        {getPageTypeBadge(type)}
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Migration Priority */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Priority 1 (Critical)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <ul className="space-y-2">
                        {migrationReport.migrationPriority.priority1.map((url, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Content Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Missing Metadata ({migrationReport.contentAudit.missingMetadata.length})</h4>
                          <ul className="space-y-1">
                            {migrationReport.contentAudit.missingMetadata.slice(0, 5).map((url, i) => (
                              <li key={i} className="text-sm text-muted-foreground truncate">{url}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Images Needing Alt Text ({migrationReport.mediaOptimization.imagesNeedingAltText.length})</h4>
                          <ul className="space-y-1">
                            {migrationReport.mediaOptimization.imagesNeedingAltText.slice(0, 5).map((url, i) => (
                              <li key={i} className="text-sm text-muted-foreground truncate">{url}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {migrationReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={pageTypeFilter} onValueChange={setPageTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="about">About</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
                <SelectItem value="resources">Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pages Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Words</TableHead>
                    <TableHead className="text-right">Images</TableHead>
                    <TableHead>Crawled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.url}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {page.title}
                      </TableCell>
                      <TableCell>{getPageTypeBadge(page.pageType)}</TableCell>
                      <TableCell className="max-w-xs">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary truncate"
                        >
                          {page.slug}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right">{page.wordCount}</TableCell>
                      <TableCell className="text-right">{page.media.images.length}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(page.crawledAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <Card key={image.id}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {image.downloaded ? (
                      <img
                        src={image.sourceUrl}
                        alt={image.alt || "Image"}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{image.context}</Badge>
                      <Badge variant={image.downloaded ? "default" : "secondary"}>
                        {image.downloaded ? "Downloaded" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{image.alt || "No alt text"}</p>
                    <p className="text-xs text-muted-foreground truncate">{image.sourceUrl}</p>
                    {image.width && image.height && (
                      <p className="text-xs text-muted-foreground">
                        {image.width} x {image.height} • {image.format.toUpperCase()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title || "Video thumbnail"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Video className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{video.platform}</Badge>
                      {video.duration && (
                        <span className="text-sm text-muted-foreground">{video.duration}</span>
                      )}
                    </div>
                    <p className="font-medium">{video.title || "Untitled Video"}</p>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    )}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Watch Video
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Link Text</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.fileName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.fileType.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{doc.linkText}</TableCell>
                      <TableCell>
                        {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.downloaded ? "default" : "secondary"}>
                          {doc.downloaded ? "Downloaded" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          {migrationReport && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Migration Report</CardTitle>
                    <CardDescription>
                      Generated on {new Date(migrationReport.crawlDate).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button onClick={exportReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(migrationReport, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Crawl Progress Modal */}
      <CrawlProgressModal
        open={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        crawlProgress={crawlProgress}
        steps={crawlSteps}
        currentUrl={currentCrawlUrl}
        recentPages={recentCrawledPages}
        onCancel={stopCrawl}
      />
    </div>
  );
}
