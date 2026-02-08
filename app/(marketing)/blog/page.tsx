import { Metadata } from "next";
import Link from "next/link";
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
} from "lucide-react";
import { getAllBlogPosts, BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog";
import { BlogListJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "KDM Blog | Defense Manufacturing, CMMC, & Government Contracting Insights",
  description:
    "Expert articles on U.S. manufacturing, critical minerals, CMMC certification, defense contracting, access to capital, and opportunity zones for small businesses.",
  keywords: [
    "defense manufacturing blog",
    "CMMC certification guide",
    "government contracting insights",
    "critical minerals strategy",
    "minority business defense contracts",
    "manufacturing reshoring",
    "opportunity zones investment",
    "small business capital access",
    "defense industrial base",
    "supply chain resilience",
  ],
  alternates: {
    canonical: "https://kdm-assoc.com/blog",
  },
  openGraph: {
    title: "KDM Blog | Defense Manufacturing, CMMC, & Government Contracting Insights",
    description:
      "Expert articles on U.S. manufacturing, critical minerals, CMMC certification, defense contracting, access to capital, and opportunity zones for small businesses.",
    url: "https://kdm-assoc.com/blog",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KDM & Associates Blog - Defense Manufacturing & Government Contracting Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KDM Blog | Defense Manufacturing & Government Contracting",
    description:
      "Expert articles on CMMC, defense manufacturing, critical minerals, and government contracting for small businesses.",
  },
};

const categoryIcons: Record<BlogCategory, React.ElementType> = {
  "U.S. Manufacturing": Factory,
  "Critical Minerals": Gem,
  "Defense Contracting & CMMC": Shield,
  "Access to Capital": DollarSign,
  "Opportunity Zones": MapPin,
  "Cross-Cutting Strategic Topics": Layers,
  "Thought Leadership & Case Studies": Lightbulb,
};

const categoryColors: Record<BlogCategory, string> = {
  "U.S. Manufacturing": "bg-blue-100 text-blue-800",
  "Critical Minerals": "bg-emerald-100 text-emerald-800",
  "Defense Contracting & CMMC": "bg-purple-100 text-purple-800",
  "Access to Capital": "bg-amber-100 text-amber-800",
  "Opportunity Zones": "bg-rose-100 text-rose-800",
  "Cross-Cutting Strategic Topics": "bg-cyan-100 text-cyan-800",
  "Thought Leadership & Case Studies": "bg-indigo-100 text-indigo-800",
};

export default async function BlogPage() {
  const allPosts = await getAllBlogPosts();
  const featuredPosts = allPosts.slice(0, 3);
  const remainingPosts = allPosts.slice(3);
  return (
    <>
      {/* SEO: Blog List Structured Data */}
      <BlogListJsonLd
        posts={allPosts.map((p) => ({
          title: p.title,
          url: `https://kdm-assoc.com/blog/${p.slug}`,
          datePublished: p.date,
          author: p.author,
          excerpt: p.excerpt,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://kdm-assoc.com" },
          { name: "Blog", url: "https://kdm-assoc.com/blog" },
        ]}
      />

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              KDM Blog
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Insights for{" "}
              <span className="text-primary">Defense-Ready</span> Businesses
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Expert perspectives on manufacturing, CMMC certification, defense contracting,
              critical minerals, and strategies for small businesses seeking government contracts.
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap gap-3 justify-center">
            {BLOG_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <Link
                  key={category}
                  href={`/blog/category/${encodeURIComponent(category.toLowerCase().replace(/[&\s]+/g, "-"))}`}
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

      {/* Featured Articles */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Featured Articles</h2>
            <p className="mt-2 text-muted-foreground">Our latest and most impactful content</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {featuredPosts.map((post) => {
              const Icon = categoryIcons[post.category];
              return (
                <Card key={post.slug} className="overflow-hidden group hover:shadow-xl transition-all flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="h-16 w-16 text-primary/40" />
                    </div>
                  </div>
                  <CardHeader className="flex-1">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <Badge className={categoryColors[post.category]} variant="secondary">
                        {post.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-3">
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
                          {post.readTime} min read
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
              );
            })}
          </div>
        </div>
      </section>

      {/* All Articles by Category */}
      {BLOG_CATEGORIES.map((category) => {
        const categoryPosts = remainingPosts.filter((p) => p.category === category);
        if (categoryPosts.length === 0) return null;
        const Icon = categoryIcons[category];

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
                  <Link href={`/blog/category/${encodeURIComponent(category.toLowerCase().replace(/[&\s]+/g, "-"))}`}>
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPosts.slice(0, 6).map((post) => (
                  <Card key={post.slug} className="group hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Badge className={categoryColors[post.category]} variant="secondary">
                          {post.category}
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
            Ready to Start Your Defense Contracting Journey?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join the KDM Consortium Platform to access opportunities, resources, and expert
            guidance for winning government contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/register?type=sme">
                Register as Supplier (SME)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/register?type=buyer">
                Register as Government Buyer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
