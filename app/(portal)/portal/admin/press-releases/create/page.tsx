'use client';

import { useRouter } from 'next/navigation';
import { PressReleaseWizard } from '@/components/admin/press-release-wizard';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import type { PressReleaseFormData } from '@/lib/press-releases-schema';

export default function CreatePressReleasePage() {
  const router = useRouter();
  const user = auth?.currentUser;

  const handleSave = async (formData: PressReleaseFormData) => {
    if (!db || !user) {
      toast.error('Not authenticated');
      return;
    }

    try {
      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const pressReleaseData = {
        ...formData,
        slug,
        releaseDate: Timestamp.fromDate(formData.releaseDate),
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: formData.status === 'published' ? Timestamp.now() : null
      };

      await addDoc(collection(db, 'pressReleases'), pressReleaseData);
      toast.success('Press release created successfully');
      router.push('/portal/admin/press-releases');
    } catch (error) {
      console.error('Error creating press release:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PressReleaseWizard onSave={handleSave} />
    </div>
  );
}
