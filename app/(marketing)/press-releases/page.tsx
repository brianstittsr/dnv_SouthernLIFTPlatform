'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Search, Filter, FileText, Download, Paperclip, File, Image, Upload, Sparkles, Copy, Check, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
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
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedRelease, setGeneratedRelease] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [markdownGuideOpen, setMarkdownGuideOpen] = useState(false);

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
      <section className="relative text-white py-16 overflow-hidden">
        {/* Background Image from Pexels */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/85" />
        
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Press Releases
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Stay informed with the latest news and announcements from KDM & Associates.
          </p>
        </div>
      </section>

      {/* AI Generator Button */}
      <section className="container mx-auto px-4 pt-8">
        <div className="flex justify-end mb-4">
          <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Press Release with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  AI Press Release Generator
                </DialogTitle>
                <DialogDescription>
                  Paste text or upload a document (Word, PDF, Image) to generate a professional press release.
                </DialogDescription>
              </DialogHeader>
              
              <PressReleaseGenerator
                inputText={inputText}
                setInputText={setInputText}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                generatedRelease={generatedRelease}
                setGeneratedRelease={setGeneratedRelease}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                copied={copied}
                setCopied={setCopied}
                markdownGuideOpen={markdownGuideOpen}
                setMarkdownGuideOpen={setMarkdownGuideOpen}
              />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 pb-8">
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
                  
                  {/* Attachments */}
                  {release.attachments && release.attachments.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        Attachments ({release.attachments.length})
                      </p>
                      <div className="space-y-1">
                        {release.attachments.slice(0, 2).map(attachment => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            {attachment.type.startsWith('image/') ? (
                              <Image className="h-3 w-3" />
                            ) : (
                              <File className="h-3 w-3" />
                            )}
                            <span className="truncate">{attachment.name}</span>
                          </a>
                        ))}
                        {release.attachments.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{release.attachments.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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

// Press Release Generator Component
interface PressReleaseGeneratorProps {
  inputText: string;
  setInputText: (text: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  generatedRelease: string;
  setGeneratedRelease: (text: string) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  markdownGuideOpen: boolean;
  setMarkdownGuideOpen: (open: boolean) => void;
}

function PressReleaseGenerator({
  inputText,
  setInputText,
  uploadedFile,
  setUploadedFile,
  generatedRelease,
  setGeneratedRelease,
  isGenerating,
  setIsGenerating,
  copied,
  setCopied,
  markdownGuideOpen,
  setMarkdownGuideOpen,
}: PressReleaseGeneratorProps) {
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, Word, Image, or Text files.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    setUploadedFile(file);
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const handleGenerate = async () => {
    if (!inputText && !uploadedFile) {
      toast.error('Please provide text or upload a file');
      return;
    }

    setIsGenerating(true);
    setGeneratedRelease('');

    try {
      const formData = new FormData();
      
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      } else {
        formData.append('text', inputText);
      }

      const response = await fetch('/api/generate-press-release', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate press release');
      }

      const data = await response.json();
      setGeneratedRelease(data.pressRelease);
      toast.success('Press release generated successfully!');
    } catch (error) {
      console.error('Error generating press release:', error);
      toast.error('Failed to generate press release. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRelease);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setUploadedFile(null);
    setGeneratedRelease('');
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Paste Your Content
            </label>
            <Dialog open={markdownGuideOpen} onOpenChange={setMarkdownGuideOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Markdown Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Markdown Quick Reference
                  </DialogTitle>
                  <DialogDescription>
                    Common markdown syntax to format your press release content
                  </DialogDescription>
                </DialogHeader>
                <MarkdownGuideContent />
              </DialogContent>
            </Dialog>
          </div>
          <Textarea
            placeholder="Paste your text here... (e.g., announcement details, event information, company news)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full"
            disabled={!!uploadedFile}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-sm text-muted-foreground">OR</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Document
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={!!inputText}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-10 w-10 text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Word, Image, or Text files (max 10MB)
                </p>
              </div>
            </label>
          </div>
          {uploadedFile && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFile(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={(!inputText && !uploadedFile) || isGenerating}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Press Release
            </>
          )}
        </Button>
        {(inputText || uploadedFile || generatedRelease) && (
          <Button variant="outline" onClick={handleClear} size="lg">
            Clear
          </Button>
        )}
      </div>

      {/* Generated Output */}
      {generatedRelease && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">
              Generated Press Release
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {generatedRelease}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Markdown Guide Content Component
function MarkdownGuideContent() {
  return (
    <div className="space-y-6">
      {/* Basic Syntax */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Basic Syntax</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Headings</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                # H1<br />
                ## H2<br />
                ### H3
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Bold</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                **bold text**
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Italic</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                *italicized text*
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Blockquote</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                &gt; blockquote
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Ordered List</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                1. First item<br />
                2. Second item<br />
                3. Third item
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Unordered List</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                - First item<br />
                - Second item<br />
                - Third item
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Inline Code</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                `code`
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Horizontal Rule</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ---
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Link</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                [title](https://www.example.com)
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Image</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ![alt text](image.jpg)
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Syntax */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Extended Syntax</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Table</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block whitespace-pre">
{`| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |`}
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Fenced Code Block</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ```<br />
                {`{`}<br />
                &nbsp;&nbsp;"key": "value"<br />
                {`}`}<br />
                ```
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Strikethrough</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                ~~The world is flat.~~
              </code>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Task List</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded block">
                - [x] Write the press release<br />
                - [ ] Update the website<br />
                - [ ] Contact the media
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Press Releases</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use <strong>**bold**</strong> for company names and key announcements</li>
          <li>• Use <em>*italics*</em> for quotes from executives</li>
          <li>• Use <strong>## headings</strong> to organize sections</li>
          <li>• Use bullet points (-) for listing key highlights or benefits</li>
          <li>• Use horizontal rules (---) to separate major sections</li>
        </ul>
      </div>
    </div>
  );
}
