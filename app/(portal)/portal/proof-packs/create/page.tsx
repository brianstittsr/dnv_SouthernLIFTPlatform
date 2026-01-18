"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { ProofPackWizard } from "@/components/proof-packs/proof-pack-wizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CreateProofPackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleComplete = async (wizardData: any) => {
    try {
      setCreating(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      // Create the proof pack with all wizard data
      const response = await fetch("/api/proof-packs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: wizardData.title,
          description: wizardData.description,
          lane: wizardData.lane,
          selectedCategories: wizardData.selectedCategories,
          packHealth: wizardData.packHealth,
          status: "draft",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create Proof Pack");
      }

      const data = await response.json();
      const proofPackId = data.id;

      // Upload documents for each category
      if (wizardData.documents && Object.keys(wizardData.documents).length > 0) {
        for (const [categoryId, files] of Object.entries(wizardData.documents)) {
          const fileArray = files as File[];
          if (fileArray.length === 0) continue;

          const formData = new FormData();
          formData.append("categoryId", categoryId);
          fileArray.forEach((file) => {
            formData.append("files", file);
          });

          await fetch(`/api/proof-packs/${proofPackId}/documents`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

      // Redirect to the proof pack detail page
      router.push(`/portal/proof-packs/${proofPackId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create Proof Pack");
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.push("/portal/proof-packs");
  };

  if (creating) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Creating your Proof Pack...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment if you're uploading documents.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ProofPackWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}
