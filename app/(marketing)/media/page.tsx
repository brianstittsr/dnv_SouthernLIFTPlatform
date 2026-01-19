import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  FileText,
  Download,
  ExternalLink,
  Play,
  ArrowRight,
  Newspaper,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Media & Press",
  description:
    "Access KDM Associates media resources including videos, press releases, case studies, and downloadable guides on quality management and compliance.",
};

// Video resources from crawled content
const videos = [
  {
    id: "iso-certification-overview",
    title: "ISO Certification Process Overview",
    description: "Learn about the ISO certification process and how KDM Associates can help your organization achieve certification.",
    platform: "YouTube",
    thumbnail: "/images/videos/iso-process.jpg",
    duration: "8:45",
    category: "ISO Certification"
  },
  {
    id: "cmmc-explained",
    title: "CMMC 2.0 Explained",
    description: "Understanding the new CMMC 2.0 requirements and how to prepare for certification.",
    platform: "YouTube",
    thumbnail: "/images/videos/cmmc-explained.jpg",
    duration: "12:30",
    category: "CMMC Compliance"
  },
  {
    id: "client-success-precision",
    title: "Client Success Story: Precision Manufacturing",
    description: "Hear how Precision Manufacturing achieved AS9100 certification with KDM Associates.",
    platform: "Vimeo",
    thumbnail: "/images/videos/success-story.jpg",
    duration: "6:15",
    category: "Success Stories"
  }
];

const pressReleases = [
  {
    id: "mbda-transition",
    title: "KDM Associates Assumes MBDA Federal Procurement Center Operations",
    date: "2025-11-15",
    excerpt: "Strategic transition brings new leadership and enhanced support for minority-owned businesses in federal contracting.",
    category: "Company News"
  },
  {
    id: "cmmc-partnership",
    title: "KDM Associates Announces CMMC Registered Practitioner Partnership",
    date: "2025-10-20",
    excerpt: "New partnership expands CMMC compliance services for defense contractors nationwide.",
    category: "Partnerships"
  },
  {
    id: "iso-milestone",
    title: "KDM Associates Celebrates 500th Successful ISO Certification",
    date: "2025-09-10",
    excerpt: "Milestone achievement demonstrates commitment to quality excellence across aerospace and defense industries.",
    category: "Milestones"
  }
];

const downloadableResources = [
  {
    id: "iso-9001-guide",
    title: "ISO 9001:2015 Implementation Guide",
    description: "Comprehensive guide to implementing ISO 9001 quality management systems.",
    type: "PDF Guide",
    pages: 45,
    category: "ISO Standards"
  },
  {
    id: "cmmc-checklist",
    title: "CMMC Level 2 Readiness Checklist",
    description: "Complete checklist to assess your organization's CMMC compliance readiness.",
    type: "PDF Checklist",
    pages: 12,
    category: "CMMC Compliance"
  },
  {
    id: "supplier-audit-template",
    title: "Supplier Audit Template",
    description: "Professional template for conducting supplier quality audits.",
    type: "Excel Template",
    pages: 8,
    category: "Quality Management"
  },
  {
    id: "gap-analysis-tool",
    title: "Gap Analysis Tool",
    description: "Identify gaps in your current quality management system.",
    type: "Excel Tool",
    pages: 15,
    category: "Assessment Tools"
  }
];

export default function MediaPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Media & Resources
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Explore Our{" "}
              <span className="text-primary">Media Library</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Access videos, press releases, case studies, and downloadable resources 
              to support your quality management and compliance journey.
            </p>
          </div>
        </div>
      </section>

      {/* Video Resources */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Video Resources</h2>
            <p className="text-lg text-muted-foreground">
              Watch our expert-led videos on quality management, certification, and compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden group hover:shadow-xl transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4" variant="secondary">
                    {video.duration}
                  </Badge>
                </div>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-xs">
                    {video.category}
                  </Badge>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/media/videos/${video.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Watch Video
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Press Releases</h2>
            <p className="text-lg text-muted-foreground">
              Stay updated with our latest company news and announcements.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl">
            {pressReleases.map((release) => (
              <Card key={release.id} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{release.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(release.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {release.title}
                  </CardTitle>
                  <CardDescription>
                    {release.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" asChild>
                    <Link href={`/media/press/${release.id}`}>
                      Read Full Release
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Downloadable Resources</h2>
            <p className="text-lg text-muted-foreground">
              Free guides, templates, and tools to support your quality management initiatives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {downloadableResources.map((resource) => (
              <Card key={resource.id} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs mb-1">
                        {resource.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {resource.type} • {resource.pages} pages
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/contact?resource=${resource.id}`}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Resource
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Newspaper className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Need More Information?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Contact our team for custom resources, media inquiries, or partnership opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/news">
                View News
                <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
