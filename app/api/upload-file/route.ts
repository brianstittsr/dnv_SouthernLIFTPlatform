import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/schema';
import { Timestamp } from 'firebase-admin/firestore';
import { extractDocxMarkdown, extractPdfMarkdown, isDocx, isPdf, isPlainText } from '@/lib/pdf-to-markdown';
import { storeFileBuffer } from '@/lib/file-store';
import { USER_ROLES } from '@/lib/rbac-types';

const VALID_ROLE_KEYS = new Set<string>(['all', ...Object.keys(USER_ROLES)]);

/** Parses the allowedRoles form field — 'all' or USER_ROLES keys only. */
function parseAllowedRoles(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== 'string' || !raw) return ['all'];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ['all'];
    const roles = parsed.filter(
      (value): value is string => typeof value === 'string' && VALID_ROLE_KEYS.has(value)
    );
    return roles.length > 0 ? [...new Set(roles)] : ['all'];
  } catch {
    return ['all'];
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
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
    const allowedRoles = parseAllowedRoles(formData.get('allowedRoles'));

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

    // Member attachments and portal Documents files are private — document
    // visibility is checked per-role in the files route against the linked
    // documents record. Everything else (logos, press attachments) is served
    // openly.
    const isMemberAttachment = Boolean(userId);
    const isDocumentsUpload = target === 'documents';
    const stored = await storeFileBuffer({
      buffer,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      category,
      isPublic: !(isMemberAttachment || isDocumentsUpload),
      ownerUid: isMemberAttachment ? userId : (uploaderUid || null),
    });

    // Extract text as markdown for AI use (PDF, .docx, .txt/.md), then record
    // the attachment in Firestore member_attachments.
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
      } catch (extractError) {
        console.error('PDF text extraction failed (file still stored):', extractError);
      }
    } else if (isDocx(file.type, file.name)) {
      try {
        markdownContent = await extractDocxMarkdown(buffer);
      } catch (extractError) {
        console.error('DOCX text extraction failed (file still stored):', extractError);
      }
    } else if (isPlainText(file.type, file.name)) {
      try {
        markdownContent = buffer.toString('utf8');
      } catch (extractError) {
        console.error('Text extraction failed (file still stored):', extractError);
      }
    }

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
        companyId: companyId || null,
        allowedRoles,
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
