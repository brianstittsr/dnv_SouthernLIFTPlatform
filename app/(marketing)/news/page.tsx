import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import { getAllArticles } from "@/lib/articles-data";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "Stay informed with the latest news, insights, and updates from KDM Associates on quality management, ISO certification, CMMC compliance, and industry trends.",
};

// Get all articles from the data file
const allArticles = getAllArticles();
const featuredArticles = allArticles.slice(0, 2);
const recentArticles = allArticles.slice(2);

const categories = [
  "All Articles",
  "Compliance",
  "ISO Standards",
  "Industry Insights",
  "Success Stories",
  "Cybersecurity",
  "Quality Management",
  "Certification"
];

export default function NewsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              News & Insights
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Stay Ahead with{" "}
              <span className="text-primary">Industry Insights</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Expert perspectives on quality management, compliance, and industry trends 
              to help you make informed decisions and stay competitive.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Featured Articles</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden group hover:shadow-xl transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Newspaper className="h-16 w-16 text-primary/40" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="group/btn" asChild>
                    <Link href={`/news/${article.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Recent Articles</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/news/${article.slug}`}>
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

      {/* Newsletter Signup */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Stay Informed with Our Newsletter
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get the latest insights, industry updates, and expert tips delivered 
                directly to your inbox every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button size="lg" className="flex-1" asChild>
                  <Link href="/contact?newsletter=true">
                    Subscribe Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Award className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Achieve Quality Excellence?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Let our experts guide you through your certification and compliance journey.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
