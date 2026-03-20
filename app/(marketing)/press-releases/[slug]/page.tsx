'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Download, Paperclip, File, Image, Share2, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { PressRelease } from '@/lib/press-releases-schema';
import { toast } from 'sonner';

export default function PressReleaseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [pressRelease, setPressRelease] = useState<PressRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPressRelease();
    }
  }, [slug]);

  const fetchPressRelease = async () => {
    if (!db) {
      console.error('Firebase not initialized');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching press release with slug:', slug);
      const releasesRef = collection(db, 'pressReleases');
      const q = query(
        releasesRef,
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      
      const snapshot = await getDocs(q);
      console.log('Query results:', snapshot.size, 'documents found');
      
      if (snapshot.empty) {
        console.warn('No press release found for slug:', slug);
        setPressRelease(null);
      } else {
        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log('Press release data:', data);
        setPressRelease({
          id: doc.id,
          ...data
        } as PressRelease);
      }
    } catch (error) {
      console.error('Error fetching press release:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error('Failed to load press release');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Check if there are PDF attachments
    const pdfAttachment = pressRelease?.attachments?.find(
      att => att.type === 'application/pdf' || att.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfAttachment) {
      // Open PDF in new tab for printing
      const printWindow = window.open(pdfAttachment.url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback if popup blocked
        toast.error('Please allow popups to print the PDF');
      }
    } else {
      // Print the webpage if no PDF attachment
      window.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pressRelease?.title || 'Press Release',
          text: pressRelease?.subtitle || '',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pressRelease) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Press Release Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The press release you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/press-releases">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Press Releases
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/press-releases" className="text-blue-200 hover:text-white transition-colors">
              Press Releases
            </Link>
            <span className="text-blue-300">/</span>
            <span className="text-blue-100">{pressRelease.category}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-6 print:hidden">
            <Link href="/press-releases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1"></div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Press Release Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <Badge className="mb-4" variant="secondary">
                  {pressRelease.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {pressRelease.title}
                </h1>
                {pressRelease.subtitle && (
                  <p className="text-xl text-muted-foreground">
                    {pressRelease.subtitle}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(pressRelease.releaseDate.toDate(), 'MMMM d, yyyy')}
                </div>
                {pressRelease.location && (
                  <div>
                    {pressRelease.location}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {pressRelease.content}
                </ReactMarkdown>
              </div>

              {/* Boilerplate */}
              {pressRelease.boilerplate && (
                <>
                  <Separator className="my-8" />
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-2">About KDM & Associates</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {pressRelease.boilerplate}
                    </p>
                  </div>
                </>
              )}

              {/* Attachments */}
              {pressRelease.attachments && pressRelease.attachments.length > 0 && (
                <>
                  <Separator className="my-8" />
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Attachments ({pressRelease.attachments.length})
                    </h3>
                    <div className="grid gap-3">
                      {pressRelease.attachments.map(attachment => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {attachment.type.startsWith('image/') ? (
                            <Image className="h-8 w-8 text-primary" />
                          ) : (
                            <File className="h-8 w-8 text-primary" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{attachment.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB • {attachment.type}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Contact Info */}
              {pressRelease.contactInfo && (
                <>
                  <Separator className="my-8" />
                  <div>
                    <h3 className="font-semibold mb-4">Media Contact</h3>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <p className="font-medium">{pressRelease.contactInfo.name}</p>
                      {pressRelease.contactInfo.title && (
                        <p className="text-sm text-muted-foreground">{pressRelease.contactInfo.title}</p>
                      )}
                      <div className="mt-3 space-y-1 text-sm">
                        <p>
                          <a 
                            href={`mailto:${pressRelease.contactInfo.email}`}
                            className="text-primary hover:underline"
                          >
                            {pressRelease.contactInfo.email}
                          </a>
                        </p>
                        {pressRelease.contactInfo.phone && (
                          <p>
                            <a 
                              href={`tel:${pressRelease.contactInfo.phone}`}
                              className="text-primary hover:underline"
                            >
                              {pressRelease.contactInfo.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tags */}
              {pressRelease.tags && pressRelease.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {pressRelease.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center print:hidden">
            <Link href="/press-releases">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Press Releases
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
