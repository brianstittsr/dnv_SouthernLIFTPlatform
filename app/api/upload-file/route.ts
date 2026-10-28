import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/schema';
import { Timestamp } from 'firebase-admin/firestore';
import { extractPdfMarkdown, isPdf } from '@/lib/pdf-to-markdown';
import { storeFileBuffer } from '@/lib/file-store';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const userId = formData.get('userId') as string || '';
    const companyId = formData.get('companyId') as string || '';
    const attachmentType = formData.get('attachmentType') as string || 'other';
    const target = formData.get('target') as string || '';
    const documentType = formData.get('documentType') as string || 'Uncategorized';
    const uploadedBy = formData.get('uploadedBy') as string || 'Unknown';
    const uploaderUid = formData.get('uploaderUid') as string || '';

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

    // Get file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Member attachments are private to their owner; everything else is
    // public-facing content (logos, press attachments) served openly.
    const isMemberAttachment = Boolean(userId);
    const stored = await storeFileBuffer({
      buffer,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      category,
      isPublic: !isMemberAttachment,
      ownerUid: isMemberAttachment ? userId : null,
    });

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
            fileId: stored.fileId,
            fileUrl: stored.fileUrl,
            uploadedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          attachmentId = attachmentRef.id;
        }
      } catch (extractError) {
        console.error('PDF text extraction failed (file still stored):', extractError);
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
        fileId: stored.fileId,
        fileUrl: stored.fileUrl,
        uploadedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      attachmentId = attachmentRef.id;
    }

    // Portal Documents module: record the upload in the documents collection
    let documentId: string | undefined;
    if (db && target === 'documents') {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const fileKind = ['pdf'].includes(ext)
        ? 'pdf'
        : ['xlsx', 'xls', 'csv'].includes(ext)
          ? 'spreadsheet'
          : ['doc', 'docx', 'txt', 'md'].includes(ext)
            ? 'document'
            : ['ppt', 'pptx'].includes(ext)
              ? 'presentation'
              : ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
                ? 'image'
                : 'other';
      const docRef = await db.collection(COLLECTIONS.DOCUMENTS).add({
        name: file.name,
        type: fileKind,
        size: stored.sizeBytes >= 1024 * 1024
          ? `${(stored.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(stored.sizeBytes / 1024))} KB`,
        sizeBytes: stored.sizeBytes,
        folder: documentType,
        uploadedBy,
        uploaderUid: uploaderUid || null,
        uploadedAt: Timestamp.now(),
        shared: false,
        fileId: stored.fileId,
        downloadUrl: stored.fileUrl,
      });
      documentId = docRef.id;
    }

    return NextResponse.json({
      fileId: stored.fileId,
      fileUrl: stored.fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      attachmentId,
      documentId,
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
