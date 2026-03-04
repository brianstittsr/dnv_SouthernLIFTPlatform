'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PressReleaseWizard } from '@/components/admin/press-release-wizard';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import type { PressRelease, PressReleaseFormData } from '@/lib/press-releases-schema';

export default function EditPressReleasePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [pressRelease, setPressRelease] = useState<PressRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPressRelease();
    }
  }, [id]);

  const fetchPressRelease = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, 'pressReleases', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setPressRelease({
          id: docSnap.id,
          ...docSnap.data()
        } as PressRelease);
      } else {
        toast.error('Press release not found');
        router.push('/portal/admin/press-releases');
      }
    } catch (error) {
      console.error('Error fetching press release:', error);
      toast.error('Failed to load press release');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: PressReleaseFormData) => {
    if (!db) {
      toast.error('Database not initialized');
      return;
    }

    try {
      const docRef = doc(db, 'pressReleases', id);
      
      await updateDoc(docRef, {
        ...formData,
        releaseDate: Timestamp.fromDate(formData.releaseDate),
        updatedAt: Timestamp.now(),
        publishedAt: formData.status === 'published' && !pressRelease?.publishedAt 
          ? Timestamp.now() 
          : pressRelease?.publishedAt,
      });

      toast.success('Press release updated successfully');
      router.push('/portal/admin/press-releases');
    } catch (error) {
      console.error('Error updating press release:', error);
      toast.error('Failed to update press release');
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
      <div className="container mx-auto px-4 py-8">
        <p>Press release not found</p>
        <Link href="/portal/admin/press-releases">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Press Releases
          </Button>
        </Link>
      </div>
    );
  }

  // Convert PressRelease to PressReleaseFormData
  const initialData: PressReleaseFormData = {
    title: pressRelease.title,
    subtitle: pressRelease.subtitle,
    location: pressRelease.location,
    releaseDate: pressRelease.releaseDate.toDate(),
    content: pressRelease.content,
    bulletPoints: '',
    boilerplate: pressRelease.boilerplate,
    contactInfo: pressRelease.contactInfo,
    logos: pressRelease.logos,
    attachments: pressRelease.attachments,
    tags: pressRelease.tags,
    category: pressRelease.category,
    status: pressRelease.status,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/portal/admin/press-releases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Press Releases
            </Button>
          </Link>
        </div>
        
        <PressReleaseWizard
          initialData={initialData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
