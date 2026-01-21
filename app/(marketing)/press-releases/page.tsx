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
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { PressRelease } from '@/lib/press-releases-schema';
import { PRESS_RELEASE_CATEGORIES } from '@/lib/press-releases-schema';

const CATEGORIES = [
  { value: 'all', label: 'All Press Releases' },
  ...PRESS_RELEASE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
];

export default function PressReleasesPage() {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [filteredReleases, setFilteredReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchPressReleases();
  }, []);

  useEffect(() => {
    filterReleases();
  }, [pressReleases, searchQuery, categoryFilter]);

  const fetchPressReleases = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const releasesRef = collection(db, 'pressReleases');
      const q = query(
        releasesRef,
        where('status', '==', 'published'),
        orderBy('releaseDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const releases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PressRelease[];

      setPressReleases(releases);
    } catch (error) {
      console.error('Error fetching press releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReleases = () => {
    let filtered = [...pressReleases];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(release =>
        release.title.toLowerCase().includes(query) ||
        release.content.toLowerCase().includes(query) ||
        release.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(release => release.category === categoryFilter);
    }

    setFilteredReleases(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Partnership: 'bg-blue-100 text-blue-800',
      Award: 'bg-yellow-100 text-yellow-800',
      'Contract Win': 'bg-green-100 text-green-800',
      Event: 'bg-purple-100 text-purple-800',
      Announcement: 'bg-orange-100 text-orange-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Press Releases
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Stay informed with the latest news and announcements from KDM & Associates.
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
                  placeholder="Search press releases..."
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

        {/* Press Releases Grid */}
        {filteredReleases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No press releases found</h3>
            <p className="text-muted-foreground">
              Check back soon for the latest news and announcements.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReleases.map(release => (
              <Card key={release.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(release.category)}>
                      {release.category}
                    </Badge>
                    {release.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{release.title}</CardTitle>
                  {release.subtitle && (
                    <CardDescription className="line-clamp-1">
                      {release.subtitle}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    {format(release.releaseDate.toDate(), 'MMMM d, yyyy')}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {release.content.substring(0, 150)}...
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/press-releases/${release.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Read Full Release
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Media Inquiries
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            For press inquiries, interviews, or additional information, please contact our media relations team.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Media Relations
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
