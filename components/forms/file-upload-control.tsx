"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/form-builder/controls";
import type { UploadRef } from "@/lib/form-builder/types";
import { liftApi } from "./lift-api";

interface FileUploadControlProps {
  id: string;
  slug: string;
  value: UploadRef[];
  onChange: (value: UploadRef[]) => void;
  maxFiles: number;
  accept?: string[];
  describedBy?: string;
  disabled?: boolean;
}

/** Uploads files to the server immediately and stores references as the answer. */
export function FileUploadControl({ id, slug, value, onChange, maxFiles, accept, describedBy, disabled }: FileUploadControlProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const allowed = accept?.length ? accept : [...ALLOWED_UPLOAD_TYPES];
  const remaining = Math.max(0, maxFiles - value.length);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: UploadRef[] = [];
    for (const file of selected) {
      if (!allowed.includes(file.type)) {
        toast.error(`${file.name}: this file type is not allowed`);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`${file.name}: files must be smaller than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`);
        continue;
      }
      try {
        uploaded.push(await liftApi.upload(slug, file));
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload failed"}`);
      }
    }
    setUploading(false);
    if (uploaded.length) onChange([...value, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        multiple={maxFiles > 1}
        accept={allowed.join(",")}
        aria-describedby={describedBy}
        disabled={disabled || uploading || remaining === 0}
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <Button type="button" variant="outline" disabled={disabled || uploading || remaining === 0} onClick={() => inputRef.current?.click()}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {uploading ? "Uploading..." : remaining === 0 ? "File limit reached" : "Choose file"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Up to {maxFiles} file{maxFiles === 1 ? "" : "s"}, {MAX_UPLOAD_BYTES / 1024 / 1024} MB each. PDF, Word, Excel, CSV, or image.
      </p>
      {value.length > 0 && (
        <ul className="space-y-1" aria-label="Uploaded files">
          {value.map((file) => (
            <li key={file.uploadId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.fileName}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${file.fileName}`}
                onClick={() => onChange(value.filter((item) => item.uploadId !== file.uploadId))}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
