'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Download, 
  Search, 
  Filter,
  FolderOpen,
  BookOpen,
  Presentation,
  FileSpreadsheet,
  File,
  Clock,
  Eye,
  Star,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile } from '@/contexts/user-profile-context';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'document' | 'video' | 'template' | 'presentation' | 'spreadsheet';
  fileUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  accessTier: 'all' | 'core-capture' | 'custom';
  tags: string[];
  viewCount: number;
  downloadCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RESOURCE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'proposals', label: 'Proposal Templates' },
  { value: 'compliance', label: 'Compliance Guides' },
  { value: 'capability', label: 'Capability Statements' },
  { value: 'training', label: 'Training Materials' },
  { value: 'webinars', label: 'Webinar Recordings' },
  { value: 'tools', label: 'Tools & Calculators' },
  { value: 'case-studies', label: 'Case Studies' },
];

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'document', label: 'Documents', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'template', label: 'Templates', icon: File },
  { value: 'presentation', label: 'Presentations', icon: Presentation },
  { value: 'spreadsheet', label: 'Spreadsheets', icon: FileSpreadsheet },
];

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Federal Proposal Template - Technical Volume',
    description: 'Comprehensive template for writing technical volumes in federal proposals. Includes section headers, evaluation criteria alignment, and best practices.',
    category: 'proposals',
    type: 'template',
    accessTier: 'core-capture',
    tags: ['proposal', 'technical', 'template'],
    viewCount: 234,
    downloadCount: 156,
    isFeatured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-01'),
  },
  {
    id: '2',
    title: 'CMMC Level 2 Compliance Checklist',
    description: 'Step-by-step checklist for achieving CMMC Level 2 certification. Covers all 110 practices with implementation guidance.',
    category: 'compliance',
    type: 'spreadsheet',
    accessTier: 'all',
    tags: ['cmmc', 'compliance', 'cybersecurity'],
    viewCount: 567,
    downloadCount: 423,
    isFeatured: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-05-15'),
  },
  {
    id: '3',
    title: 'Capability Statement Best Practices',
    description: 'Learn how to create compelling capability statements that win contracts. Includes examples from successful contractors.',
    category: 'capability',
    type: 'video',
    accessTier: 'all',
    tags: ['capability', 'marketing', 'video'],
    viewCount: 892,
    downloadCount: 0,
    isFeatured: false,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    title: 'GSA Schedule Pricing Calculator',
    description: 'Excel-based calculator for determining competitive GSA Schedule pricing. Includes market research data and margin analysis.',
    category: 'tools',
    type: 'spreadsheet',
    accessTier: 'core-capture',
    tags: ['gsa', 'pricing', 'calculator'],
    viewCount: 345,
    downloadCount: 289,
    isFeatured: false,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05'),
  },
  {
    id: '5',
    title: 'Teaming Agreement Template',
    description: 'Standard teaming agreement template for government contracting partnerships. Reviewed by legal experts.',
    category: 'proposals',
    type: 'document',
    accessTier: 'core-capture',
    tags: ['teaming', 'legal', 'template'],
    viewCount: 456,
    downloadCount: 378,
    isFeatured: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-06-10'),
  },
  {
    id: '6',
    title: 'Past Performance Write-Up Guide',
    description: 'How to write compelling past performance narratives that demonstrate your capabilities and win evaluator confidence.',
    category: 'proposals',
    type: 'document',
    accessTier: 'all',
    tags: ['past performance', 'proposal', 'writing'],
    viewCount: 678,
    downloadCount: 445,
    isFeatured: false,
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-02-28'),
  },
  {
    id: '7',
    title: 'SAM.gov Registration Walkthrough',
    description: 'Complete video walkthrough of the SAM.gov registration process. Updated for 2024 requirements.',
    category: 'training',
    type: 'video',
    accessTier: 'all',
    tags: ['sam.gov', 'registration', 'training'],
    viewCount: 1234,
    downloadCount: 0,
    isFeatured: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '8',
    title: 'Win Theme Development Workshop',
    description: 'Recording of our popular workshop on developing compelling win themes for government proposals.',
    category: 'webinars',
    type: 'video',
    accessTier: 'core-capture',
    tags: ['win themes', 'proposal', 'webinar'],
    viewCount: 234,
    downloadCount: 0,
    isFeatured: false,
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-05-15'),
  },
];

export default function ResourceLibraryPage() {
  const { profile } = useUserProfile();
  const [resources, setResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(SAMPLE_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Determine user's access tier based on membership
  const userTier = 'core-capture' as string; // In production, get from membership data

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, categoryFilter, typeFilter, activeTab]);

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by tab
    if (activeTab === 'featured') {
      filtered = filtered.filter(r => r.isFeatured);
    } else if (activeTab === 'recent') {
      filtered = filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    setFilteredResources(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'template': return File;
      case 'presentation': return Presentation;
      case 'spreadsheet': return FileSpreadsheet;
      default: return FileText;
    }
  };

  const canAccess = (resource: Resource) => {
    if (resource.accessTier === 'all') return true;
    if (resource.accessTier === 'core-capture' && ['core-capture', 'custom'].includes(userTier)) return true;
    if (resource.accessTier === 'custom' && userTier === 'custom') return true;
    return false;
  };

  const handleDownload = (resource: Resource) => {
    if (!canAccess(resource)) {
      alert('Upgrade your membership to access this resource.');
      return;
    }
    // In production, track download and provide file
    console.log('Downloading:', resource.title);
  };

  const handleView = (resource: Resource) => {
    if (!canAccess(resource)) {
      alert('Upgrade your membership to access this resource.');
      return;
    }
    // In production, open viewer or video player
    console.log('Viewing:', resource.title);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resource Library</h1>
          <p className="text-muted-foreground">
            Templates, guides, and training materials for government contractors
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 w-fit">
          <BookOpen className="h-4 w-4 mr-2" />
          {resources.length} Resources
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <FolderOpen className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredResources.length} of {resources.length} resources
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => {
            const TypeIcon = getTypeIcon(resource.type);
            const hasAccess = canAccess(resource);

            return (
              <Card key={resource.id} className={`flex flex-col ${!hasAccess ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {!hasAccess && (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3 line-clamp-2">{resource.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {resource.viewCount} views
                    </span>
                    {resource.type !== 'video' && (
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resource.downloadCount} downloads
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resource.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {resource.type === 'video' ? (
                    <Button 
                      className="w-full" 
                      variant={hasAccess ? 'default' : 'secondary'}
                      onClick={() => handleView(resource)}
                    >
                      {hasAccess ? (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Watch Video
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Upgrade to Watch
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={hasAccess ? 'default' : 'secondary'}
                      onClick={() => handleDownload(resource)}
                    >
                      {hasAccess ? (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Upgrade to Download
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
