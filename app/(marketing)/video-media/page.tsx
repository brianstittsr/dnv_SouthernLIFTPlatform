"use client";

import { useState, useEffect, useMemo } from "react";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Play,
  Filter,
  X,
  Youtube,
  Clock,
  Tag,
  Star,
} from "lucide-react";
import {
  listVideos,
  getFeaturedVideos,
  getYouTubeThumbnail,
  type VideoMetadata,
  type VideoCategory,
  CATEGORY_OPTIONS,
} from "@/lib/firebase-videos";

// Metadata is defined separately for Next.js App Router
export const metadata = {
  title: "Video & Media Library - KDM & Associates",
  description: "Browse and search our video library featuring training, tutorials, webinars, and more.",
};

export default function VideoMediaPage() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<VideoMetadata | null>(null);

  // Fetch videos on mount
  useEffect(() => {
    async function fetchVideos() {
      try {
        const [allVideos, featured] = await Promise.all([
          listVideos(),
          getFeaturedVideos(6),
        ]);
        setVideos(allVideos);
        setFeaturedVideos(featured);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Extract unique tags from all videos
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    videos.forEach((video) => {
      video.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [videos]);

  // Filter videos based on search and filters
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch =
        searchQuery === "" ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.tags && video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
      const matchesTag = selectedTag === "all" || (video.tags && video.tags.includes(selectedTag));

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [videos, searchQuery, selectedCategory, selectedTag]);

  // Group videos by category
  const groupedVideos = useMemo(() => {
    const grouped: Record<string, VideoMetadata[]> = {};
    filteredVideos.forEach((video) => {
      if (!grouped[video.category]) {
        grouped[video.category] = [];
      }
      grouped[video.category].push(video);
    });
    return grouped;
  }, [filteredVideos]);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedVideos).sort();

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTag("all");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedTag !== "all";

  const getCategoryLabel = (value: string) => {
    return CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label || value;
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Youtube className="h-5 w-5 mr-2 inline" />
              Video Library
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Video & Media Center
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Browse our collection of training videos, tutorials, webinars, and more. 
              Search and filter by category, tags, and keywords.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      {!isLoading && featuredVideos.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold tracking-tight">Featured Videos</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setPlayingVideo(video)}
                  featured
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section id="videos" className="py-8 bg-muted/50 border-b sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as VideoCategory | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {allTags.length > 0 && (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredVideos.length} of {videos.length} videos
            </div>
          </div>
        </div>
      </section>

      {/* Videos by Category */}
      <section className="py-12 md:py-20 flex-1">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : sortedCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No videos available yet. Check back soon!"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-16">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight capitalize">
                      {getCategoryLabel(category)}
                    </h2>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {groupedVideos[category].length} Videos
                    </Badge>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedVideos[category].map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onClick={() => setPlayingVideo(video)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          {playingVideo && (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(playingVideo.youtubeId)}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <DialogHeader className="p-6 pt-4">
                <DialogTitle className="text-lg">{playingVideo.title}</DialogTitle>
                <DialogDescription className="text-sm">
                  {playingVideo.description || "No description available"}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Video Card Component
interface VideoCardProps {
  video: VideoMetadata;
  onClick: () => void;
  featured?: boolean;
}

function VideoCard({ video, onClick, featured = false }: VideoCardProps) {
  return (
    <Card
      className={`overflow-hidden group hover:shadow-xl transition-all cursor-pointer ${
        featured ? "border-2 border-yellow-200" : ""
      }`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId, "medium")}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 ml-1" />
          </div>
        </div>
        {featured && (
          <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-950 font-semibold">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {video.duration && (
          <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
            <Clock className="h-3 w-3 mr-1" />
            {video.duration}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </CardTitle>
        {video.description && (
          <CardDescription className="text-sm line-clamp-2">
            {video.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {video.category}
          </Badge>
          {video.tags?.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {video.tags && video.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{video.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
