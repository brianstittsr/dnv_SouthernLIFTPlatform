import { NextRequest, NextResponse } from 'next/server';
import { storage, db } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/schema';
import { Timestamp } from 'firebase-admin/firestore';
import { extractPdfMarkdown, isPdf } from '@/lib/pdf-to-markdown';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const userId = formData.get('userId') as string || '';
    const companyId = formData.get('companyId') as string || '';
    const attachmentType = formData.get('attachmentType') as string || 'other';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeFileName}`;
    const storagePath = `uploads/${category}/${fileName}`;

    // Get file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage using Admin SDK (always keep original as backup)
    const bucket = storage.bucket();
    const fileUpload = bucket.file(storagePath);
    
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          size: file.size.toString(),
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible and get URL
    await fileUpload.makePublic();
    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // If PDF, extract text and store as markdown in Firestore
    let attachmentId: string | undefined;
    let markdownContent: string | null = null;
    let pageCount = 0;
    let pdfMetadata: { title?: string; author?: string; subject?: string } = {};

    if (isPdf(file.type, file.name)) {
      try {
        const extraction = await extractPdfMarkdown(buffer);
        markdownContent = extraction.markdown;
        pageCount = extraction.pageCount;
        pdfMetadata = extraction.metadata;

        // Store markdown content in Firestore member_attachments collection
        if (db && userId) {
          const attachmentRef = await db.collection(COLLECTIONS.MEMBER_ATTACHMENTS).add({
            userId,
            companyId: companyId || null,
            type: attachmentType,
            originalFileName: file.name,
            originalFileType: file.type,
            originalFileSize: file.size,
            markdownContent,
            pageCount,
            metadata: pdfMetadata,
            storagePath,
            uploadedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          attachmentId = attachmentRef.id;
        }
      } catch (extractError) {
        console.error('PDF text extraction failed (file still uploaded to storage):', extractError);
      }
    } else if (db && userId) {
      // Non-PDF: store metadata only with null markdown content
      const attachmentRef = await db.collection(COLLECTIONS.MEMBER_ATTACHMENTS).add({
        userId,
        companyId: companyId || null,
        type: attachmentType,
        originalFileName: file.name,
        originalFileType: file.type,
        originalFileSize: file.size,
        markdownContent: null,
        pageCount: 0,
        metadata: {},
        storagePath,
        uploadedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      attachmentId = attachmentRef.id;
    }

    return NextResponse.json({
      fileId: fileName,
      fileUrl: downloadUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      attachmentId,
      markdownExtracted: markdownContent !== null,
      pageCount,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
