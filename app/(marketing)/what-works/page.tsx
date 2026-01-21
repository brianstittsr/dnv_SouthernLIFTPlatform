'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Search, Filter, Play, Headphones, FileText, Video, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSortedWhatWorksArticles, getAllWhatWorksCategories, type WhatWorksArticle } from '@/lib/what-works-data';

const CATEGORIES = [
  { value: 'all', label: 'All Content' },
  ...getAllWhatWorksCategories().map(cat => ({ value: cat, label: cat }))
];

export default function WhatWorksPage() {
  const [filteredArticles, setFilteredArticles] = useState<WhatWorksArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    filterArticles();
  }, [searchQuery, categoryFilter]);

  const filterArticles = () => {
    let filtered = getSortedWhatWorksArticles();

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    setFilteredArticles(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Podcast':
        return <Headphones className="h-4 w-4" />;
      case 'Video':
        return <Video className="h-4 w-4" />;
      case 'Interview':
        return <Mic className="h-4 w-4" />;
      case 'Newsletter':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Podcast: 'bg-purple-100 text-purple-800',
      Video: 'bg-red-100 text-red-800',
      Interview: 'bg-blue-100 text-blue-800',
      Newsletter: 'bg-green-100 text-green-800',
      Article: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            What Works
          </h1>
          <p className="text-xl text-green-100 max-w-2xl">
            Insights, stories, and strategies from successful minority-owned businesses in federal contracting. 
            Learn what works from those who've done it.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles, podcasts, videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {article.featuredImage && (
                  <div className="relative h-48 w-full bg-muted">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    {(article.videoUrl || article.podcastUrl) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-8 w-8 text-primary ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(article.category)}>
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(article.category)}
                        {article.category}
                      </span>
                    </Badge>
                    {article.duration && (
                      <span className="text-xs text-muted-foreground">
                        {article.duration}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(article.publishedDate, 'MMM d, yyyy')}
                  </div>
                  {article.author && (
                    <p className="text-sm text-muted-foreground mt-2">
                      By {article.author}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/what-works/${article.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {article.videoUrl || article.podcastUrl ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Watch/Listen
                        </>
                      ) : (
                        'Read More'
                      )}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-green-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Share Your Success Story
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Have a success story to share? We'd love to feature your journey and insights 
            to help other minority-owned businesses succeed in federal contracting.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Submit Your Story
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
