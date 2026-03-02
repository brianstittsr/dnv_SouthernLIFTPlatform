/**
 * Resume Upload and Compression Utilities
 * Handles resume file compression and base64 conversion for Firebase storage
 */

const MAX_RESUME_SIZE = 900 * 1024; // 900KB to stay under 1MB Firebase limit

export async function compressAndConvertResume(file: File): Promise<{
  base64Data: string;
  fileName: string;
  fileSize: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        let base64Data = arrayBufferToBase64(arrayBuffer);
        let currentSize = base64Data.length;

        // If it's a PDF and too large, we need to inform the user
        // PDFs can't be compressed like images, so we enforce size limit
        if (file.type === 'application/pdf') {
          if (currentSize > MAX_RESUME_SIZE) {
            reject(new Error('PDF file is too large. Please ensure your resume is under 900KB.'));
            return;
          }
          
          resolve({
            base64Data: `data:${file.type};base64,${base64Data}`,
            fileName: file.name,
            fileSize: currentSize
          });
          return;
        }

        // For Word documents, also enforce size limit
        if (file.type.includes('word') || file.type.includes('document')) {
          if (currentSize > MAX_RESUME_SIZE) {
            reject(new Error('Document file is too large. Please ensure your resume is under 900KB.'));
            return;
          }

          resolve({
            base64Data: `data:${file.type};base64,${base64Data}`,
            fileName: file.name,
            fileSize: currentSize
          });
          return;
        }

        // For text files, we can compress by removing extra whitespace
        if (file.type === 'text/plain') {
          const text = new TextDecoder().decode(arrayBuffer);
          const compressed = text.replace(/\s+/g, ' ').trim();
          const blob = new Blob([compressed], { type: 'text/plain' });
          const compressedBuffer = await blob.arrayBuffer();
          base64Data = arrayBufferToBase64(compressedBuffer);
          currentSize = base64Data.length;

          if (currentSize > MAX_RESUME_SIZE) {
            reject(new Error('Text file is too large even after compression.'));
            return;
          }

          resolve({
            base64Data: `data:text/plain;base64,${base64Data}`,
            fileName: file.name,
            fileSize: currentSize
          });
          return;
        }

        // For other file types, just check size
        if (currentSize > MAX_RESUME_SIZE) {
          reject(new Error('File is too large. Please ensure your resume is under 900KB.'));
          return;
        }

        resolve({
          base64Data: `data:${file.type};base64,${base64Data}`,
          fileName: file.name,
          fileSize: currentSize
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB before compression
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF, Word documents, and text files are allowed'
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function extractTextFromPaste(text: string): string {
  // Clean up pasted text
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '  ') // Replace tabs with spaces
    .trim();
}
