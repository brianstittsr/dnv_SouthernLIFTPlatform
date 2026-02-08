import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Share2,
  BookOpen,
} from "lucide-react";
import { allBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | KDM Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getBlogPostsByCategory(post.category)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const currentIndex = allBlogPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex < allBlogPosts.length - 1 ? allBlogPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allBlogPosts[currentIndex - 1] : null;

  return (
    <>
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
              {post.category}
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            <p className="mt-6 text-lg text-gray-300">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border">
              {post.content.split("\n").map((line, i) => {
                if (line.startsWith("## Ready to Take the Next Step?")) {
                  return (
                    <div key={i} className="not-prose mt-12 p-8 bg-primary/5 border-2 border-primary/20 rounded-xl">
                      <h2 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h2>
                      <p className="text-muted-foreground mb-6">
                        Whether you&apos;re a small manufacturer seeking defense contracts, a government buyer
                        looking for qualified suppliers, or a business owner pursuing CMMC certification,
                        KDM &amp; Associates and the V+KDM Consortium are here to help.
                      </p>
                      <p className="font-semibold mb-4">Join the KDM Consortium Platform today:</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" asChild>
                          <Link href="/register?type=sme">
                            Register as Supplier (SME)
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                          <Link href="/register?type=buyer">
                            Register as Government Buyer
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 italic">
                        Schedule a free introductory session to learn how we can accelerate your path
                        to government contracting success.
                      </p>
                    </div>
                  );
                }

                if (line.startsWith("# ")) {
                  return <h1 key={i} className="text-3xl font-bold mt-10 mb-4">{line.replace("# ", "")}</h1>;
                }
                if (line.startsWith("## ") && !line.includes("Ready to Take")) {
                  return <h2 key={i}>{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={i}>{line.replace("### ", "")}</h3>;
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={i}><strong>{line.replace(/\*\*/g, "")}</strong></p>;
                }
                if (line.startsWith("- **")) {
                  const match = line.match(/^- \*\*(.+?)\*\*\s*[—–-]?\s*(.*)/);
                  if (match) {
                    return (
                      <li key={i}>
                        <strong>{match[1]}</strong>
                        {match[2] ? ` — ${match[2]}` : ""}
                      </li>
                    );
                  }
                  return <li key={i} dangerouslySetInnerHTML={{ __html: line.replace(/^- /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} dangerouslySetInnerHTML={{ __html: line.replace(/^- /, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />;
                }
                if (line.startsWith("- [ ] ")) {
                  return <li key={i} className="list-none"><input type="checkbox" disabled className="mr-2" />{line.replace("- [ ] ", "")}</li>;
                }
                if (line.startsWith("| ") && line.includes("|")) {
                  const cells = line.split("|").filter(Boolean).map((c) => c.trim());
                  if (cells.every((c) => c.match(/^[-:]+$/))) return null;
                  return (
                    <tr key={i}>
                      {cells.map((cell, j) => (
                        <td key={j} dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                      ))}
                    </tr>
                  );
                }
                if (line.startsWith("1. ") || line.match(/^\d+\. /)) {
                  return <li key={i} dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>') }} />;
              })}
            </article>
          </div>
        </div>
      </section>

      {/* Post Navigation */}
      <section className="py-8 border-t border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto flex justify-between">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors max-w-[45%]"
              >
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{prevPost.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors text-right max-w-[45%]"
              >
                <span className="truncate">{nextPost.title}</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight mb-8">
                More in {post.category}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Card key={related.slug} className="group hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {related.readTime} min
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${related.slug}`}>
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
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start Your Defense Contracting Journey
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join the KDM Consortium Platform and connect with opportunities, resources, and
            expert guidance.
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
