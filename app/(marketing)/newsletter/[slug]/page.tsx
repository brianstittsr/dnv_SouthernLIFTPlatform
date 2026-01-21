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
  Download,
  Share2,
  Mail,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { getNewsletterBySlug, type Newsletter } from "@/lib/newsletter-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const newsletter = getNewsletterBySlug(slug);
  
  if (!newsletter) {
    return {
      title: "Newsletter Not Found",
    };
  }

  return {
    title: `${newsletter.title} - Newsletter`,
    description: newsletter.description,
  };
}

async function generatePDF(newsletter: Newsletter) {
  // This would be called client-side to generate PDF
  return `/api/newsletter/generate-pdf?slug=${newsletter.slug}`;
}

export default async function NewsletterDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const newsletter = getNewsletterBySlug(slug);

  if (!newsletter) {
    notFound();
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/newsletter" 
            className="inline-flex items-center text-sm text-indigo-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newsletters
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {newsletter.category}
            </Badge>
            {newsletter.volume && (
              <Badge variant="outline" className="border-white text-white">
                {newsletter.volume}
              </Badge>
            )}
            {newsletter.issue && (
              <Badge variant="outline" className="border-white text-white">
                {newsletter.issue}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {newsletter.title}
          </h1>
          {newsletter.subtitle && (
            <p className="text-xl text-indigo-100 max-w-3xl mb-4">
              {newsletter.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 text-indigo-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(newsletter.publishedDate, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-8">
            <Button asChild>
              <a href={`/api/newsletter/generate-pdf?slug=${newsletter.slug}`} download>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Featured Image */}
          {newsletter.featuredImage && (
            <div className="mb-8">
              <img
                src={newsletter.featuredImage}
                alt={newsletter.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <p className="text-xl text-muted-foreground leading-relaxed">
              {newsletter.description}
            </p>
          </div>

          {/* Highlights */}
          {newsletter.highlights && newsletter.highlights.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">In This Issue</h3>
                <ul className="space-y-2">
                  {newsletter.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Separator className="my-8" />

          {/* Newsletter Content */}
          <div className="prose prose-lg max-w-none">
            {newsletter.content.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {newsletter.tags && newsletter.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {newsletter.tags.map((tag, index) => (
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
                <h3 className="text-lg font-semibold mb-1">Share this newsletter</h3>
                <p className="text-sm text-muted-foreground">
                  Help others stay informed
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
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(newsletter.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
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
                  onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(newsletter.title)}&body=${encodeURIComponent(shareUrl)}`}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Newsletter Archive CTA */}
          <div className="mt-12 text-center">
            <Link href="/newsletter">
              <Button size="lg">
                View All Newsletters
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
