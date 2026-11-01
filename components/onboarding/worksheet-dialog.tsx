"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface WorksheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Preparation dialog shown before the LIFT client onboarding wizard:
 * download the Word worksheet to gather answers offline, or upload a
 * completed worksheet and the answers are parsed into the saved draft the
 * wizard restores.
 */
export function WorksheetDialog({ open, onOpenChange }: WorksheetDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const startWizard = () => {
    onOpenChange(false);
    router.push("/portal/onboarding");
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) throw new Error("Please sign in again before uploading.");

      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/onboarding/worksheet", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body,
      });
      const result = (await response.json().catch(() => ({}))) as {
        data?: { fieldsFilled: number };
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Could not read the worksheet");

      toast.success("Worksheet loaded", {
        description: `${result.data?.fieldsFilled ?? 0} fields were filled in for you — review them in the wizard.`,
      });
      startWizard();
    } catch (error) {
      console.error("Worksheet upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Could not read the worksheet");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prepare for LIFT onboarding</DialogTitle>
          <DialogDescription>
            The wizard asks about your business, certifications, and goals.
            You can gather everything first with our Word worksheet — or
            upload it once completed and we&apos;ll fill the fields for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/api/onboarding/worksheet" download>
              <FileDown className="mr-2 h-4 w-4" />
              Download the Word worksheet
            </a>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Reading your worksheet..." : "Upload your completed worksheet"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button className="w-full" onClick={startWizard}>
            <Play className="mr-2 h-4 w-4" />
            Start the onboarding wizard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
