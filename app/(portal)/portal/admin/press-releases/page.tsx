'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import type { PressRelease } from '@/lib/press-releases-schema';

export default function AdminPressReleasesPage() {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [filteredReleases, setFilteredReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPressReleases();
  }, []);

  useEffect(() => {
    filterReleases();
  }, [pressReleases, searchQuery]);

  const fetchPressReleases = async () => {
    if (!db) return;

    try {
      const releasesRef = collection(db, 'pressReleases');
      const q = query(releasesRef, orderBy('releaseDate', 'desc'));
      const snapshot = await getDocs(q);
      
      const releases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PressRelease[];

      setPressReleases(releases);
    } catch (error) {
      console.error('Error fetching press releases:', error);
      toast.error('Failed to load press releases');
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

    setFilteredReleases(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this press release?')) return;
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'pressReleases', id));
      setPressReleases(prev => prev.filter(r => r.id !== id));
      toast.success('Press release deleted');
    } catch (error) {
      console.error('Error deleting press release:', error);
      toast.error('Failed to delete press release');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Press Releases</h1>
          <p className="text-muted-foreground">Manage your press releases</p>
        </div>
        <Link href="/portal/admin/press-releases/create">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Press Release
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
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

      {/* Press Releases List */}
      {filteredReleases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No press releases found</p>
            <Link href="/portal/admin/press-releases/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Press Release
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReleases.map(release => (
            <Card key={release.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(release.status)}>
                        {release.status}
                      </Badge>
                      <Badge variant="outline">{release.category}</Badge>
                      {release.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{release.title}</CardTitle>
                    <CardDescription>
                      {release.location} • {format(release.releaseDate.toDate(), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/press-releases/${release.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/portal/admin/press-releases/${release.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(release.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {release.content.substring(0, 200)}...
                </p>
                <div className="flex items-center gap-2">
                  {release.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {release.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{release.tags.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
