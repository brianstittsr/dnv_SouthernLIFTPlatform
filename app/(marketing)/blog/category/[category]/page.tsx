import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";
import { getAllBlogPosts, BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

function categoryFromSlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find(
    (c) => c.toLowerCase().replace(/[&\s]+/g, "-") === slug
  );
}

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({
    category: category.toLowerCase().replace(/[&\s]+/g, "-"),
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = categoryFromSlug(categorySlug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category} | KDM Blog`,
    description: `Expert articles on ${category} for small businesses seeking government contracts and defense manufacturing opportunities.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = categoryFromSlug(categorySlug);

  if (!category) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();
  const posts = allPosts.filter((p) => p.category === category);

  return (
    <>
      {/* SEO: Breadcrumb Structured Data */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://kdm-assoc.com" },
          { name: "Blog", url: "https://kdm-assoc.com/blog" },
          { name: category, url: `https://kdm-assoc.com/blog/category/${categorySlug}` },
        ]}
      />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-gray-400 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              Category
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {category}
            </h1>

            <p className="mt-4 text-lg text-gray-300">
              {posts.length} article{posts.length !== 1 ? "s" : ""} in this category
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.slug} className="group hover:shadow-lg transition-all flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
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

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Start Your Defense Contracting Journey?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join the KDM Consortium Platform to access opportunities, resources, and expert guidance.
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
