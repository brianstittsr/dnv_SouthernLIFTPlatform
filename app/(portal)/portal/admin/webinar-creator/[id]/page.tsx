"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WizardStepper } from "@/app/(portal)/portal/admin/webinar-creator/components/WizardStepper";
import { BasicInfoStep } from "@/app/(portal)/portal/admin/webinar-creator/components/BasicInfoStep";
import { LandingPageStep } from "@/app/(portal)/portal/admin/webinar-creator/components/LandingPageStep";
import { ConfirmationPageStep } from "@/app/(portal)/portal/admin/webinar-creator/components/ConfirmationPageStep";
import { GHLIntegrationStep } from "@/app/(portal)/portal/admin/webinar-creator/components/GHLIntegrationStep";
import { PreviewPublishStep } from "@/app/(portal)/portal/admin/webinar-creator/components/PreviewPublishStep";
import { Webinar, getDefaultWebinar } from "@/lib/types/webinar";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, Loader2, Video } from "lucide-react";

const STEPS = [
  { id: "basic-info", title: "Basic Info" },
  { id: "landing-page", title: "Landing Page" },
  { id: "confirmation", title: "Confirmation" },
  { id: "integration", title: "Integration" },
  { id: "preview", title: "Preview & Publish" },
];

export default function WebinarWizardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<Webinar>>(getDefaultWebinar());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchWebinar();
    }
  }, [id]);

  const fetchWebinar = async () => {
    try {
      const response = await fetch(`/api/admin/webinars/${id}`);
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      } else {
        toast.error("Webinar not found");
        router.push("/portal/admin/webinar-creator");
      }
    } catch (error) {
      console.error("Error fetching webinar:", error);
      toast.error("Failed to load webinar");
    } finally {
      setLoading(false);
    }
  };

  const updateData = (updates: Partial<Webinar>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async (showToast = true) => {
    setSaving(true);
    try {
      const url = isNew ? "/api/admin/webinars" : `/api/admin/webinars/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        if (showToast) toast.success(isNew ? "Webinar created!" : "Webinar saved!");
        if (isNew && result.data?.id) {
          router.push(`/portal/admin/webinar-creator/${result.data.id}`);
        }
        return result.data;
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error: any) {
      console.error("Error saving webinar:", error);
      toast.error(error.message || "Failed to save webinar");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // Auto-save on next
      await handleSave(false);
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-9xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/portal/admin/webinar-creator")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isNew ? "Create New Webinar" : "Edit Webinar"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {data.title || "Untitled Webinar"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Progress
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <WizardStepper 
            steps={STEPS} 
            currentStep={currentStep} 
            onStepClick={(index) => {
              if (index < currentStep) setCurrentStep(index);
            }}
          />
        </CardHeader>
        <CardContent className="pt-10">
          {currentStep === 0 && <BasicInfoStep data={data} updateData={updateData} />}
          {currentStep === 1 && <LandingPageStep data={data} updateData={updateData} />}
          {currentStep === 2 && <ConfirmationPageStep data={data} updateData={updateData} />}
          {currentStep === 3 && <GHLIntegrationStep data={data} updateData={updateData} />}
          {currentStep === 4 && <PreviewPublishStep data={data} updateData={updateData} onSave={handleSave} />}
        </CardContent>
        <div className="flex items-center justify-between p-6 border-t bg-muted/50">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={currentStep === STEPS.length - 1 || saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Next Step <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
