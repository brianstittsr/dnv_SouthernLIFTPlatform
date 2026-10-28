import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  ArrowRight,
  Clock,
  Factory,
  Shield,
  DollarSign,
  MapPin,
  Layers,
  Lightbulb,
  Gem,
  FileSearch,
  Network,
  Cpu,
  Briefcase,
  Landmark,
  Building2,
  Sprout,
  Newspaper,
} from "lucide-react";
import { getAllBlogPosts, type BlogCategory } from "@/lib/blog";
import {
  blogCategorySlug,
  displayBlogCategory,
  getBlogCategories,
  postMatchesCategory,
} from "@/lib/blog/lift";
import { getProgramBranding } from "@/lib/branding";
import { BlogListJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

const branding = getProgramBranding();

export const metadata: Metadata = {
  title: branding.blogTitle,
  description: branding.blogDescription,
  keywords: branding.blogKeywords,
  alternates: {
    canonical: `${branding.siteUrl}/blog`,
  },
  openGraph: {
    title: branding.blogTitle,
    description: branding.blogDescription,
    url: `${branding.siteUrl}/blog`,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${branding.blogName} - ${branding.siteName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: branding.blogTitle,
    description: branding.blogDescription,
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  "U.S. Manufacturing": Factory,
  "Critical Minerals": Gem,
  "Defense Contracting & CMMC": Shield,
  "Access to Capital": DollarSign,
  "Opportunity Zones": MapPin,
  "Cross-Cutting Strategic Topics": Layers,
  "Thought Leadership & Case Studies": Lightbulb,
  "Contract Opportunities": FileSearch,
  "Supply Chain Resilience": Network,
  "AI & Cybersecurity": Cpu,
  "Business Formation & Entrepreneurship": Briefcase,
  "Capital Readiness": DollarSign,
  "Procurement Readiness": Landmark,
  "Advanced Manufacturing (AM Lab)": Factory,
  "Digital & AI Adoption": Cpu,
  "Agriculture & Rural Enterprise": Sprout,
  "LIFT News & Success Stories": Newspaper,
};

const categoryColors: Record<string, string> = {
  "U.S. Manufacturing": "bg-blue-100 text-blue-800",
  "Critical Minerals": "bg-emerald-100 text-emerald-800",
  "Defense Contracting & CMMC": "bg-purple-100 text-purple-800",
  "Access to Capital": "bg-amber-100 text-amber-800",
  "Opportunity Zones": "bg-rose-100 text-rose-800",
  "Cross-Cutting Strategic Topics": "bg-cyan-100 text-cyan-800",
  "Thought Leadership & Case Studies": "bg-indigo-100 text-indigo-800",
  "Contract Opportunities": "bg-orange-100 text-orange-800",
  "Supply Chain Resilience": "bg-teal-100 text-teal-800",
  "AI & Cybersecurity": "bg-slate-100 text-slate-800",
  "Business Formation & Entrepreneurship": "bg-cyan-100 text-cyan-800",
  "Capital Readiness": "bg-amber-100 text-amber-800",
  "Procurement Readiness": "bg-purple-100 text-purple-800",
  "Advanced Manufacturing (AM Lab)": "bg-blue-100 text-blue-800",
  "Digital & AI Adoption": "bg-slate-100 text-slate-800",
  "Agriculture & Rural Enterprise": "bg-emerald-100 text-emerald-800",
  "LIFT News & Success Stories": "bg-indigo-100 text-indigo-800",
};

const categoryFallbackImages: Record<BlogCategory, string> = {
  "U.S. Manufacturing": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  "Critical Minerals": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
  "Defense Contracting & CMMC": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Access to Capital": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  "Opportunity Zones": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  "Cross-Cutting Strategic Topics": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  "Thought Leadership & Case Studies": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
  "Contract Opportunities": "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=800&q=80",
  "Supply Chain Resilience": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
  "AI & Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
};

// LIFT-topic fallback imagery (small business, rural, advising, workshops).
const liftFallbackImages: Record<string, string> = {
  "Business Formation & Entrepreneurship": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  "Capital Readiness": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  "Procurement Readiness": "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=800&q=80",
  "Advanced Manufacturing (AM Lab)": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  "Digital & AI Adoption": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  "Agriculture & Rural Enterprise": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
  "LIFT News & Success Stories": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
};

function postImage(post: { imageUrl?: string; category: BlogCategory }): string {
  if (post.imageUrl) return post.imageUrl;
  if (branding.isLift) {
    const liftCat = displayBlogCategory(post as never);
    return liftFallbackImages[liftCat] || "/og-image.png";
  }
  return categoryFallbackImages[post.category];
}

export default async function BlogPage() {
  const allPosts = await getAllBlogPosts();
  const categories = getBlogCategories();

  return (
    <>
      {/* SEO: Blog List Structured Data */}
      <BlogListJsonLd
        posts={allPosts.map((p) => ({
          title: p.title,
          url: `${branding.siteUrl}/blog/${p.slug}`,
          datePublished: p.date,
          author: p.author,
          excerpt: p.excerpt,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: branding.siteUrl },
          { name: "Blog", url: `${branding.siteUrl}/blog` },
        ]}
      />

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              {branding.blogName}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {branding.isLift ? (
                <>
                  Resources for{" "}
                  <span className="text-primary">Rural Louisiana</span> Businesses
                </>
              ) : (
                <>
                  Insights for{" "}
                  <span className="text-primary">Defense-Ready</span> Businesses
                </>
              )}
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              {branding.blogDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Building2;
              return (
                <Link
                  key={category}
                  href={`/blog/category/${encodeURIComponent(blogCategorySlug(category))}`}
                >
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Articles by Category */}
      {categories.map((category) => {
        const categoryPosts = allPosts.filter((p) =>
          postMatchesCategory(p, category),
        );
        if (categoryPosts.length === 0) return null;
        const Icon = categoryIcons[category] || Building2;

        return (
          <section key={category} className="py-12 md:py-16 even:bg-muted/30">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog/category/${encodeURIComponent(blogCategorySlug(category))}`}>
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPosts.slice(0, 6).map((post) => (
                  <Card key={post.slug} className="group hover:shadow-lg transition-all overflow-hidden">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <Image
                        src={postImage(post)}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Badge className={categoryColors[displayBlogCategory(post)]} variant="secondary">
                          {displayBlogCategory(post)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime} min
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`}>
                            Read
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {branding.blogCtaTitle}
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            {branding.blogCtaBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href={branding.blogCtaPrimaryHref}>
                {branding.blogCtaPrimaryLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href={branding.blogCtaSecondaryHref}>
                {branding.blogCtaSecondaryLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
