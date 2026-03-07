"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowRight, ArrowLeft, Check, Star } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface TestimonialWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: any;
}

export function TestimonialWizard({ open, onOpenChange, onSuccess, editData }: TestimonialWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    quote: editData?.quote || "",
    clientName: editData?.clientName || "",
    clientTitle: editData?.clientTitle || "",
    companyName: editData?.companyName || "",
    companyIndustry: editData?.companyIndustry || "",
    companyLogoUrl: editData?.companyLogoUrl || "",
    rating: editData?.rating || 5,
    featured: editData?.featured || false,
    isActive: editData?.isActive !== undefined ? editData.isActive : true,
    displayOrder: editData?.displayOrder || 0,
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "testimonials");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData(prev => ({ ...prev, companyLogoUrl: data.url }));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editData?.id 
        ? `/api/admin/testimonials/${editData.id}`
        : "/api/admin/testimonials";
      
      const method = editData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save testimonial");

      toast.success(editData?.id ? "Testimonial updated successfully" : "Testimonial created successfully");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error("Failed to save testimonial");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      quote: "",
      clientName: "",
      clientTitle: "",
      companyName: "",
      companyIndustry: "",
      companyLogoUrl: "",
      rating: 5,
      featured: false,
      isActive: true,
      displayOrder: 0,
    });
  };

  const canProceedStep1 = formData.quote.trim().length > 0;
  const canProceedStep2 = formData.clientName.trim().length > 0 && formData.clientTitle.trim().length > 0;
  const canProceedStep3 = formData.companyName.trim().length > 0 && formData.companyIndustry.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData?.id ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {step === 1 ? "Testimonial Quote" : step === 2 ? "Client Information" : step === 3 ? "Company Details" : "Settings & Review"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Testimonial Quote */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Testimonial Quote</CardTitle>
                <CardDescription>Enter the client's testimonial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quote">Quote *</Label>
                  <Textarea
                    id="quote"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="Enter the testimonial quote..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.quote.length} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: r })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            r <= formData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.rating} star{formData.rating !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Client Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Details about the person giving the testimonial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g., Marcus Johnson"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientTitle">Client Title *</Label>
                  <Input
                    id="clientTitle"
                    value={formData.clientTitle}
                    onChange={(e) => setFormData({ ...formData, clientTitle: e.target.value })}
                    placeholder="e.g., CEO"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Company Details */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Information about the client's company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Johnson Tech Solutions"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyIndustry">Industry *</Label>
                  <Input
                    id="companyIndustry"
                    value={formData.companyIndustry}
                    onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                    placeholder="e.g., IT Services"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="flex-1"
                    />
                    {uploadingLogo && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {formData.companyLogoUrl && (
                    <div className="mt-2">
                      <Image
                        src={formData.companyLogoUrl}
                        alt="Company logo preview"
                        width={100}
                        height={100}
                        className="rounded border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Settings & Review */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Settings & Review</CardTitle>
                <CardDescription>Final settings and review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured Testimonial</Label>
                    <p className="text-sm text-muted-foreground">Show this testimonial prominently</p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">Display this testimonial on the website</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold">Review</h4>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Quote:</strong> {formData.quote.substring(0, 100)}...</p>
                    <p><strong>Client:</strong> {formData.clientName}, {formData.clientTitle}</p>
                    <p><strong>Company:</strong> {formData.companyName} ({formData.companyIndustry})</p>
                    <p><strong>Rating:</strong> {formData.rating} stars</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editData?.id ? "Update Testimonial" : "Create Testimonial"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
