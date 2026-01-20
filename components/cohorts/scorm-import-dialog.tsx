"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ScormImportDialogProps {
  cohortId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScormImportDialog({
  cohortId,
  open,
  onOpenChange,
  onSuccess,
}: ScormImportDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith(".zip")) {
        setError("Please select a valid SCORM package (.zip file)");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a SCORM package file");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress("Uploading SCORM package...");

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      setProgress("Parsing SCORM manifest...");

      // Upload and import SCORM package
      const response = await fetch(`/api/cohorts/${cohortId}/import-scorm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to import SCORM package");
      }

      const data = await response.json();

      setProgress("Creating curriculum modules...");
      setSuccess(true);
      
      toast.success(`SCORM package imported successfully! Created ${data.modules.length} modules.`);

      // Reset form
      setTimeout(() => {
        setFile(null);
        setProgress("");
        setSuccess(false);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error("SCORM import error:", err);
      setError(err.message || "Failed to import SCORM package");
      toast.error("Failed to import SCORM package");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import SCORM Package</DialogTitle>
          <DialogDescription>
            Upload a SCORM 1.2 or SCORM 2004 package (.zip file) to automatically create curriculum modules and sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                SCORM package imported successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">SCORM Package File</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {progress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{progress}</span>
            </div>
          )}

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-semibold">What happens during import:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>SCORM package is parsed and validated</li>
              <li>Course structure is extracted from manifest</li>
              <li>Modules and sessions are automatically created</li>
              <li>Content is stored in Firebase (compressed)</li>
              <li>Resources are linked to curriculum</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import SCORM
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
