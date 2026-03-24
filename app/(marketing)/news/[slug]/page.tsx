import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { getAllArticles, getArticleBySlug } from "@/lib/articles-data";

// Get all articles from centralized data file
const allArticles = getAllArticles();
const articlesMap = Object.fromEntries(
  allArticles.map(article => [article.slug, article])
);

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesMap[slug];
  
  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = articlesMap[slug];

  if (!article) {
    notFound();
  }

  return (
    <>
      {/* Back Navigation */}
      <section className="py-8 border-b">
        <div className="container">
          <Button variant="ghost" asChild>
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
        </div>
      </section>

      {/* Article Image */}
      {article.image && (
        <section className="py-0">
          <div className="relative w-full h-96">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>
      )}

      {/* Article Header */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4">{article.category}</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(article.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <span>•</span>
            <span>{article.author}</span>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {article.excerpt}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={idx} className="text-3xl font-bold mt-12 mb-6">{paragraph.replace('## ', '')}</h2>;
              } else if (paragraph.startsWith('### ')) {
                return <h3 key={idx} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('### ', '')}</h3>;
              } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={idx} className="font-bold text-lg mt-6 mb-3">{paragraph.replace(/\*\*/g, '')}</p>;
              } else {
                return <p key={idx} className="text-muted-foreground leading-relaxed mb-6">{paragraph}</p>;
              }
            })}
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-8 border-y">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Share this article:</span>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Need Expert Guidance?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our team of experts is here to help you navigate the complexities of government contracting, 
                compliance, and business development.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">
                  Schedule a Consultation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
