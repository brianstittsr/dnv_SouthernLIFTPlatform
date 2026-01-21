'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Search, Filter, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSortedNewsletters, getAllNewsletterCategories, type Newsletter } from '@/lib/newsletter-data';

const CATEGORIES = [
  { value: 'all', label: 'All Newsletters' },
  ...getAllNewsletterCategories().map(cat => ({ value: cat, label: cat }))
];

export default function NewsletterPage() {
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    filterNewsletters();
  }, [searchQuery, categoryFilter]);

  const filterNewsletters = () => {
    let filtered = getSortedNewsletters();

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(newsletter =>
        newsletter.title.toLowerCase().includes(query) ||
        newsletter.description.toLowerCase().includes(query) ||
        newsletter.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(newsletter => newsletter.category === categoryFilter);
    }

    setFilteredNewsletters(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Monthly: 'bg-blue-100 text-blue-800',
      'Special Edition': 'bg-purple-100 text-purple-800',
      'Annual Report': 'bg-green-100 text-green-800',
      'Policy Brief': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Newsletters
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl">
            Stay informed with our monthly newsletters featuring insights, opportunities, and success stories 
            from the world of minority business development and federal contracting.
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
                  placeholder="Search newsletters..."
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

        {/* Newsletter Grid */}
        {filteredNewsletters.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No newsletters found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNewsletters.map(newsletter => (
              <Card key={newsletter.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {newsletter.featuredImage && (
                  <div className="relative h-48 w-full bg-muted">
                    <img
                      src={newsletter.featuredImage}
                      alt={newsletter.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(newsletter.category)}>
                      {newsletter.category}
                    </Badge>
                    {newsletter.volume && (
                      <Badge variant="outline" className="text-xs">
                        {newsletter.volume}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{newsletter.title}</CardTitle>
                  {newsletter.subtitle && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {newsletter.subtitle}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {newsletter.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(newsletter.publishedDate, 'MMMM yyyy')}
                  </div>
                  {newsletter.highlights && newsletter.highlights.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Highlights:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {newsletter.highlights.slice(0, 2).map((highlight, i) => (
                          <li key={i} className="line-clamp-1">• {highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 flex gap-2">
                  <Link href={`/newsletter/${newsletter.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Read More
                    </Button>
                  </Link>
                  {newsletter.pdfUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={newsletter.pdfUrl} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Subscription CTA */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Get the latest insights, opportunities, and success stories delivered directly to your inbox every month.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white text-gray-900"
            />
            <Button size="lg" variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
