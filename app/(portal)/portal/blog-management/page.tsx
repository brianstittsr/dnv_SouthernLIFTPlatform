"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  BookOpen,
  Search,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Hash,
  Loader2,
  Filter,
  LayoutGrid,
  List,
  CheckCircle,
  AlertCircle,
  Linkedin,
  FileText,
  Plus,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog/types";

interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: BlogCategory;
  tags: string[];
  readTime: number;
  source?: string;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [rewriteDialogOpen, setRewriteDialogOpen] = useState(false);
  const [rewriteUrl, setRewriteUrl] = useState("");
  const [rewriting, setRewriting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [postsRes, visRes] = await Promise.all([
        fetch("/api/blog/manage/posts"),
        fetch("/api/blog/manage"),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.data || []);
      }

      if (visRes.ok) {
        const visData = await visRes.json();
        setVisibility(visData.data || {});
      }
    } catch (error) {
      console.error("Error fetching blog data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleVisibility = async (slug: string) => {
    const currentlyHidden = visibility[slug] || false;
    const newHidden = !currentlyHidden;

    setTogglingSlug(slug);

    try {
      const response = await fetch("/api/blog/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, hidden: newHidden }),
      });

      if (response.ok) {
        setVisibility((prev) => ({ ...prev, [slug]: newHidden }));
        setToast({
          message: `"${posts.find((p) => p.slug === slug)?.title}" ${newHidden ? "unpublished" : "published"}`,
          type: "success",
        });
      } else {
        setToast({ message: "Failed to update visibility", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to connect to server", type: "error" });
    } finally {
      setTogglingSlug(null);
    }
  };

  const publishAll = async () => {
    const hiddenPosts = filteredPosts.filter((p) => visibility[p.slug]);
    if (hiddenPosts.length === 0) return;

    setTogglingSlug("__bulk__");
    try {
      const response = await fetch("/api/blog/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: hiddenPosts.map((p) => ({ slug: p.slug, hidden: false })),
        }),
      });

      if (response.ok) {
        const newVis = { ...visibility };
        hiddenPosts.forEach((p) => {
          newVis[p.slug] = false;
        });
        setVisibility(newVis);
        setToast({
          message: `Published ${hiddenPosts.length} article${hiddenPosts.length !== 1 ? "s" : ""}`,
          type: "success",
        });
      }
    } catch {
      setToast({ message: "Failed to bulk update", type: "error" });
    } finally {
      setTogglingSlug(null);
    }
  };

  const unpublishAll = async () => {
    const visiblePosts = filteredPosts.filter((p) => !visibility[p.slug]);
    if (visiblePosts.length === 0) return;

    setTogglingSlug("__bulk__");
    try {
      const response = await fetch("/api/blog/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: visiblePosts.map((p) => ({ slug: p.slug, hidden: true })),
        }),
      });

      if (response.ok) {
        const newVis = { ...visibility };
        visiblePosts.forEach((p) => {
          newVis[p.slug] = true;
        });
        setVisibility(newVis);
        setToast({
          message: `Unpublished ${visiblePosts.length} article${visiblePosts.length !== 1 ? "s" : ""}`,
          type: "success",
        });
      }
    } catch {
      setToast({ message: "Failed to bulk update", type: "error" });
    } finally {
      setTogglingSlug(null);
    }
  };

  const rewriteFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewriteUrl.trim()) return;
    setRewriting(true);

    try {
      const response = await fetch("/api/blog/rewrite-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rewriteUrl.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to rewrite article");
      }

      setToast({
        message: `Created blog, hero slide, and image: ${data.data.title}`,
        type: "success",
      });
      setRewriteDialogOpen(false);
      setRewriteUrl("");
      fetchData();
    } catch (error) {
      console.error("Error rewriting article:", error);
      setToast({
        message: error instanceof Error ? error.message : "Failed to rewrite article",
        type: "error",
      });
    } finally {
      setRewriting(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    const isHidden = visibility[post.slug] || false;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && !isHidden) ||
      (statusFilter === "hidden" && isHidden);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = posts.filter((p) => !visibility[p.slug]).length;
  const hiddenCount = posts.filter((p) => visibility[p.slug]).length;
  const importedCount = posts.filter(
    (p) => p.source === "imported"
  ).length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toast notification */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all",
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Blog Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage article visibility and review all blog content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Eye className="h-3 w-3" />
              {publishedCount} published
            </Badge>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <EyeOff className="h-3 w-3" />
              {hiddenCount} hidden
            </Badge>
            {importedCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Linkedin className="h-3 w-3" />
                {importedCount} imported
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles by title, excerpt, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[220px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BLOG_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Dialog open={rewriteDialogOpen} onOpenChange={setRewriteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Wand2 className="h-3 w-3 mr-1" />
                Rewrite from URL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>AI Rewrite from URL</DialogTitle>
                <DialogDescription>
                  Enter a URL to an article. We&apos;ll extract the metadata, use AI to rewrite it, and add it to the blog, image manager, and hero carousel.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={rewriteFromUrl} className="space-y-4">
                <div>
                  <Label htmlFor="rewriteUrl">Article URL</Label>
                  <Input
                    id="rewriteUrl"
                    type="url"
                    placeholder="https://example.com/article"
                    value={rewriteUrl}
                    onChange={(e) => setRewriteUrl(e.target.value)}
                    required
                    disabled={rewriting}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRewriteDialogOpen(false)}
                    disabled={rewriting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!rewriteUrl.trim() || rewriting}
                  >
                    {rewriting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Rewrite & Add
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.location.href = "/portal/blog-management/new"}
          >
            <Plus className="h-3 w-3 mr-1" />
            Create New Blog
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={publishAll}
            disabled={togglingSlug === "__bulk__"}
          >
            <Eye className="h-3 w-3 mr-1" />
            Publish All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={unpublishAll}
            disabled={togglingSlug === "__bulk__"}
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Unpublish All
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No blog articles have been created yet"}
              </p>
            </div>
          </div>
        ) : viewMode === "list" ? (
          <div className="divide-y">
            {filteredPosts.map((post) => {
              const isHidden = visibility[post.slug] || false;
              const isToggling = togglingSlug === post.slug;

              return (
                <div
                  key={post.slug}
                  className={cn(
                    "px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors",
                    isHidden && "opacity-60"
                  )}
                >
                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={!isHidden}
                      onCheckedChange={() => toggleVisibility(post.slug)}
                      disabled={isToggling || togglingSlug === "__bulk__"}
                    />
                    {isToggling && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {isHidden ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground gap-1"
                      >
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="text-xs bg-green-600 gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Live
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">
                        {post.title}
                      </h3>
                      {post.source === "imported" && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 flex-shrink-0"
                        >
                          <Linkedin className="h-2.5 w-2.5 mr-0.5" />
                          Import
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}m
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() =>
                      window.open(`/blog/${post.slug}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const isHidden = visibility[post.slug] || false;
              const isToggling = togglingSlug === post.slug;

              return (
                <Card
                  key={post.slug}
                  className={cn(
                    "transition-all",
                    isHidden && "opacity-60 border-dashed"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isHidden ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground gap-1"
                            >
                              <EyeOff className="h-2.5 w-2.5" />
                              Hidden
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] bg-green-600 gap-1">
                              <Eye className="h-2.5 w-2.5" />
                              Live
                            </Badge>
                          )}
                          {post.source === "imported" && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              <Linkedin className="h-2.5 w-2.5 mr-0.5" />
                              Import
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Switch
                          checked={!isHidden}
                          onCheckedChange={() =>
                            toggleVisibility(post.slug)
                          }
                          disabled={
                            isToggling || togglingSlug === "__bulk__"
                          }
                        />
                        {isToggling && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>·</span>
                        <span>
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>{post.readTime}m</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          window.open(`/blog/${post.slug}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
