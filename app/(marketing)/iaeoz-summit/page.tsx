"use client";

import { useState, useMemo } from "react";
import { IAEOZHeroCarousel } from "@/components/iaeoz/hero-carousel";
import { iaeozHeroSlides } from "@/lib/iaeoz-config";

// Image Placeholder Component
function VideoThumbnail({ video }: { video: Video }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="object-cover w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex flex-col items-center justify-center p-4 text-center">
        <Play className="h-12 w-12 text-emerald-600 mb-2" />
        <span className="text-xs font-medium text-emerald-800 line-clamp-2">{video.title}</span>
      </div>
    );
  }

  return (
    <img
      src={video.thumbnail_url || `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
      alt={video.title}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Play, Search, Filter, X, Calendar, User, Building2, Tag, Mic } from "lucide-react";
import videoData from "@/iaeoz_summit_videos.json";

interface Video {
  id: string;
  title: string;
  url: string;
  description: string;
  year: number;
  type: string;
  speaker: string | null;
  organization: string | null;
  duration_seconds: number;
  view_count: number;
  thumbnail_url: string;
}

interface VideoData {
  channel: {
    name: string;
    handle: string;
    url: string;
    description: string;
  };
  videos_by_year: Record<string, Video[]>;
  speakers: Array<{
    name: string;
    organization: string | null;
    videos: string[];
  }>;
  statistics: {
    total_videos: number;
    years_covered: number[];
    videos_by_year_count: Record<string, number>;
    unique_speakers: number;
  };
}

const data = videoData as VideoData;

// Flatten videos for filtering
const allVideos = Object.entries(data.videos_by_year).flatMap(([year, videos]) =>
  videos.map((video) => ({ ...video, year: parseInt(year) }))
);

// Get unique values for filters
const uniqueSpeakers = Array.from(new Set(allVideos.map((v) => v.speaker).filter((s): s is string => s !== null))).sort();
const uniqueOrganizations = Array.from(new Set(allVideos.map((v) => v.organization).filter(Boolean))).sort() as string[];
const uniqueTypes = Array.from(new Set(allVideos.map((v) => v.type))).sort();
const uniqueYears = Array.from(new Set(allVideos.map((v) => v.year))).sort((a, b) => b - a);

export default function IAEOZSummitPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const filteredVideos = useMemo(() => {
    return allVideos.filter((video) => {
      const matchesSearch =
        searchQuery === "" ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.organization && video.organization.toLowerCase().includes(searchQuery.toLowerCase()));

  const matchesSpeaker = selectedSpeaker === "all" || video.speaker === selectedSpeaker;
      const matchesYear = selectedYear === "all" || video.year.toString() === selectedYear;
      const matchesType = selectedType === "all" || video.type === selectedType;
      const matchesOrganization = selectedOrganization === "all" || video.organization === selectedOrganization;

      return matchesSearch && matchesSpeaker && matchesYear && matchesType && matchesOrganization;
    });
  }, [searchQuery, selectedSpeaker, selectedYear, selectedType, selectedOrganization]);

  const groupedVideos = useMemo(() => {
    const grouped: Record<number, Video[]> = {};
    filteredVideos.forEach((video) => {
      if (!grouped[video.year]) {
        grouped[video.year] = [];
      }
      grouped[video.year].push(video);
    });
    return grouped;
  }, [filteredVideos]);

  const sortedYears = Object.keys(groupedVideos)
    .map(number)
    .sort((a, b) => b - a);

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/Embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpeaker("all");
    setSelectedYear("all");
    setSelectedType("all");
    setSelectedOrganization("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSpeaker !== "all" ||
    selectedYear !== "all" ||
    selectedType !== "all" ||
    selectedOrganization !== "all";

  return (
    <>
      {/* Hero Carousel */}
      <IAEOZHeroCarousel slides={iaeozHeroSlides} />

      {/* Archive Title */}
      <div className="bg-muted/50 pt-8 pb-4">
        <div className="container">
          <h2 className="text-2xl font-bold text-center">
            IAEOZ Summit Video Archive Quick Search
          </h2>
        </div>
      </div>

      {/* Search and Filter Section */}
      <section id="videos" className="py-8 bg-muted/50 border-b sticky top-20 z-30">
        <div className="container">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, speaker, description, or organization..."
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

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} ({data.statistics.videos_by_year_count[year.toString()] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Speakers</SelectItem>
                  {uniqueSpeakers.map((speaker) => (
                    <SelectItem key={speaker} value={speaker}>
                      {speaker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {uniqueOrganizations.map((org) => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredVideos.length} of {data.statistics.total_videos} videos
            </div>
          </div>
        </div>
      </section>

      {/* Videos by Year */}
      <section className="py-12 md:py-20">
        <div className="container">
          {sortedYears.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {sortedYears.map((year) => (
                <div key={year}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">{year}</h2>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {groupedVideos[year].length} Videos
                    </Badge>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedVideos[year].map((video) => (
                      <Card
                        key={video.id}
                        className="overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => setPlayingVideo(video)}
                      >
                        {/* Thumbnail */}
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <VideoThumbnail video={video} />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute bottom-3 right-3">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                              <Play className="h-5 w-5 text-emerald-700 ml-0.5" />
                            </div>
                          </div>
                          <Badge className="absolute top-3 right-3 capitalize" variant="secondary">
                            {video.type.replace("_", " ")}
                          </Badge>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-700 transition-colors">
                            {video.title}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {video.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{video.speaker || "N/A"}</span>
                            </div>

                            {video.organization && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span>{video.organization}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{year}</span>
                            </div>

                            {video.type && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Tag className="h-4 w-4" />
                                <span className="capitalize">{video.type.replace("_", " ")}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Featured Speakers</h2>
            <p className="text-muted-foreground">
              Industry leaders and experts who have presented at IAEOZ Summit conferences
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {data.speakers?.map((speaker) => (
              <Card
                key={speaker.name}
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedSpeaker(speaker.name)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{speaker.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {speaker.organization}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className="text-xs">
                    {speaker.videos.length} {speaker.videos.length === 1 ? "Video" : "Videos"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          {playingVideo && (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(playingVideo.id)}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <DialogHeader className="p-6 pt-4">
                <DialogTitle className="text-lg">{playingVideo.title}</DialogTitle>
                <DialogDescription className="text-sm">
                  {playingVideo.speaker || "Unknown Speaker"}
                  {playingVideo.organization && ` • ${playingVideo.organization}`}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
