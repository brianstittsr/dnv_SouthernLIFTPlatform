"use client";

import { useRef, useState } from "react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/schema";
import { resizeImage } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Upload, X, Building2 } from "lucide-react";
import { toast } from "sonner";

interface CompanyLogoUploadDialogProps {
  teamMemberId: string;
  companyName?: string;
  currentLogo?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (logo: string) => void;
}

export function CompanyLogoUploadDialog({
  teamMemberId,
  companyName,
  currentLogo,
  open,
  onOpenChange,
  onUpdated,
}: CompanyLogoUploadDialogProps) {
  const [logo, setLogo] = useState(currentLogo || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const resized = await resizeImage(file, {
        maxDimension: 400,
        maxBytes: 300 * 1024,
      });
      setLogo(resized);
      toast.success("Logo preview updated");
    } catch (error) {
      console.error("Error resizing company logo:", error);
      toast.error("Failed to process image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!db) {
      toast.error("Firebase not initialized");
      return;
    }

    setSaving(true);
    try {
      const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
      const teamMemberSnap = await getDoc(teamMemberRef);
      const firebaseUid = teamMemberSnap.exists() ? (teamMemberSnap.data()?.firebaseUid as string | undefined) : undefined;

      const updates = {
        "companyIntelligence.companyLogo": logo || "",
        companyLogo: logo || "",
        updatedAt: Timestamp.now(),
      };

      await updateDoc(teamMemberRef, updates);

      if (firebaseUid) {
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUid);
        await updateDoc(userRef, {
          "companyIntelligence.companyLogo": logo || "",
          companyLogo: logo || "",
          updatedAt: Timestamp.now(),
        });
      }

      onUpdated?.(logo);
      toast.success("Company logo saved");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving company logo:", error);
      toast.error("Failed to save company logo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Company Logo</DialogTitle>
          <DialogDescription>
            {companyName ? `Upload a logo for ${companyName}.` : "Upload a company logo."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt="Company logo preview"
                className="h-32 w-32 rounded-xl object-contain border bg-muted"
              />
            ) : (
              <div className="h-32 w-32 rounded-xl bg-muted flex flex-col items-center justify-center border">
                <Building2 className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">No logo</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {logo ? "Replace Logo" : "Upload Logo"}
            </Button>
            {logo && (
              <Button variant="ghost" size="icon" onClick={() => setLogo("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Recommended 400x400px. Images are resized to 300KB max.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Logo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
