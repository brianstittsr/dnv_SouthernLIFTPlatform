"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/contexts/user-profile-context";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, MessageCircle, Send, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

const EXCLUDED_PATHS = ["/cmmc-training"];

export interface PopupField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "url" | "select" | "radio" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  enabled: boolean;
}

export interface PopupConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  successMessage: string;
  triggerDelay: number; // seconds before auto-showing (0 = never auto-show)
  showOnPages: string[]; // which pages to show on, empty = all
  position: "bottom-right" | "bottom-left" | "center";
  fields: PopupField[];
  productOptions: string[];
  productLabel: string;
  allowCustomProduct: boolean;
}

// Default configuration
export const defaultPopupConfig: PopupConfig = {
  enabled: true,
  title: "KDM & Associates",
  subtitle: "Schedule an introductory session to explore how we can help you win government contracts.",
  description: "Tell us about your business and contracting goals. We'll follow up with next steps.",
  buttonText: "Schedule Session",
  successMessage: "Thank you! We'll be in touch within 24 hours.",
  triggerDelay: 0,
  showOnPages: [],
  position: "bottom-right",
  fields: [
    { id: "name", type: "text", label: "Name", placeholder: "Full name", required: true, enabled: true },
    { id: "email", type: "email", label: "Email", placeholder: "Email", required: true, enabled: true },
    { id: "phone", type: "phone", label: "Phone", placeholder: "Phone", required: true, enabled: true },
    { id: "industry", type: "select", label: "Industry", placeholder: "Select your industry", required: true, enabled: true, options: ["Manufacturing", "Government", "Healthcare"] },
  ],
  productOptions: [],
  productLabel: "",
  allowCustomProduct: false,
};

interface ContactPopupProps {
  config?: PopupConfig;
}

export function ContactPopup({ config = defaultPopupConfig }: ContactPopupProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showTriggerButton, setShowTriggerButton] = useState(true);

  const isExcludedPath = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser || isExcludedPath) return;

    const shownKey = "kdm_booking_popup_shown";
    if (sessionStorage.getItem(shownKey) === "true") {
      return;
    }

    const timer = setTimeout(
      () => {
        setIsOpen(true);
        sessionStorage.setItem(shownKey, "true");
      },
      Math.max(0, config.triggerDelay) * 1000
    );

    return () => clearTimeout(timer);
  }, [config.triggerDelay, isExcludedPath]);

  if (!config.enabled || isExcludedPath) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const industry = formData.industry;
    if (!industry) return;

    const name = (formData.name || "").trim();
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ").trim();
    const email = (formData.email || "").trim();
    const phone = (formData.phone || "").trim();

    try {
      // Save to Firestore
      if (db) {
        await addDoc(collection(db, COLLECTIONS.BOOK_CALL_LEADS), {
          firstName: firstName || null,
          lastName: lastName || null,
          email: email,
          phone: phone,
          company: null,
          jobTitle: null,
          preferredDate: null,
          preferredTime: null,
          message: null,
          source: "popup",
          status: "new",
          industry,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Send confirmation email to user
      try {
        console.log("Sending email confirmation to:", email);
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName || "Valued",
            lastName: lastName || "Contact",
            email: email,
            phone: phone || undefined,
            company: "N/A",
            businessType: "N/A",
            service: "General Inquiry",
            message: `Popup form submission from ${industry} industry`,
            newsletter: false,
          }),
        });

        console.log("Email API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Email API error:", errorData);
          toast.error("Email notification failed", {
            description: errorData.error || "Could not send confirmation email",
          });
        } else {
          const data = await response.json();
          console.log("Confirmation email sent successfully:", data);
          toast.success("Email confirmation sent!");
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        toast.error("Email notification failed", {
          description: "Network error when sending confirmation",
        });
        // Continue - don't fail the submission if email fails
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setFormData({});
      }, 3000);
    } catch (error) {
      console.error("Popup submit error:", error);
    }
  };

  const updateField = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const enabledFields = config.fields.filter((f) => f.enabled);

  return (
    <>
      {/* Floating Trigger Button */}
      {showTriggerButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform",
            config.position === "bottom-right" && "bottom-6 right-6",
            config.position === "bottom-left" && "bottom-6 left-6",
            config.position === "center" && "bottom-6 right-6"
          )}
          aria-label="Contact us"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Popup Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-primary">V</span>
              <sup className="text-primary text-xl">+</sup>
              <DialogTitle className="text-xl text-primary font-semibold">
                {config.title}
              </DialogTitle>
            </div>
            <p className="text-base font-medium text-foreground">
              {config.subtitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-green-600">
                {config.successMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {enabledFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      className="bg-muted/50"
                      rows={3}
                    />
                  ) : field.type === "select" && field.options ? (
                    <Select
                      value={formData[field.id] || ""}
                      onValueChange={(value) => updateField(field.id, value)}
                    >
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type === "phone" ? "tel" : field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      className="bg-muted/50"
                    />
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full" size="lg" disabled={!formData.industry}>
                {config.buttonText}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
