import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  User,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail
} from "lucide-react";
import { getWhatWorksArticleBySlug, type WhatWorksArticle } from "@/lib/what-works-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getWhatWorksArticleBySlug(slug);
  
  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} - What Works`,
    description: article.excerpt,
  };
}

function VideoPlayer({ videoEmbedId, title }: { videoEmbedId: string; title: string }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoEmbedId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function PodcastPlayer({ podcastUrl, title }: { podcastUrl: string; title: string }) {
  return (
    <div className="w-full">
      <audio controls className="w-full">
        <source src={podcastUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default async function WhatWorksArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getWhatWorksArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = article.title;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/what-works" 
            className="inline-flex items-center text-sm text-green-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to What Works
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {article.category}
            </Badge>
            {article.duration && (
              <Badge variant="outline" className="border-white text-white">
                <Clock className="h-3 w-3 mr-1" />
                {article.duration}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-green-100">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {article.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(article.publishedDate, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Video/Podcast Player */}
          {article.videoEmbedId && (
            <div className="mb-8">
              <VideoPlayer videoEmbedId={article.videoEmbedId} title={article.title} />
            </div>
          )}

          {article.podcastUrl && !article.videoEmbedId && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Listen to Podcast</h3>
                  <PodcastPlayer podcastUrl={article.podcastUrl} title={article.title} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Featured Image (if no video) */}
          {!article.videoEmbedId && article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="mb-8">
            <p className="text-xl text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <Separator className="my-8" />

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                    {items.map((item, i) => (
                      <li key={i} className="text-muted-foreground">
                        {item.replace(/^- \*\*(.+?)\*\*: /, (match, p1) => {
                          return `<strong>${p1}:</strong> `;
                        }).replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Share Section */}
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Share this article</h3>
                <p className="text-sm text-muted-foreground">
                  Help others learn what works
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Related Content CTA */}
          <div className="mt-12 text-center">
            <Link href="/what-works">
              <Button size="lg">
                Explore More What Works Content
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
