"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Video,
  Globe,
  FileText,
  Ticket,
  Users,
  Building2,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { toast } from "sonner";
import {
  type EventFormat,
  generateSlug,
} from "@/lib/types/event-management";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: "basics", title: "Event Basics", description: "Name, dates, and format", icon: <FileText className="h-5 w-5" /> },
  { id: "location", title: "Location", description: "Venue and virtual details", icon: <MapPin className="h-5 w-5" /> },
  { id: "description", title: "Description", description: "Event details and branding", icon: <Sparkles className="h-5 w-5" /> },
  { id: "tickets", title: "Tickets", description: "Pricing and registration", icon: <Ticket className="h-5 w-5" /> },
  { id: "review", title: "Review", description: "Confirm and create", icon: <Check className="h-5 w-5" /> },
];

interface EventFormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  format: EventFormat;
  virtualEventUrl: string;
  livestreamUrl: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueCountry: string;
  venueMapUrl: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  featuredImage: string;
  bannerImage: string;
  tags: string;
  isTicketed: boolean;
  isFree: boolean;
  maxAttendees: number;
  registrationDeadline: string;
  ticketTypes: TicketTypeForm[];
}

interface TicketTypeForm {
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  benefits: string;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
}

const DEFAULT_FORM: EventFormData = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  shortDescription: "",
  startDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
  endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
  startTime: "09:00",
  endTime: "17:00",
  timezone: "America/New_York",
  format: "hybrid",
  virtualEventUrl: "",
  livestreamUrl: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  venueState: "",
  venueCountry: "USA",
  venueMapUrl: "",
  organizerName: "KDM & Associates",
  organizerEmail: "info@kdm-assoc.com",
  organizerPhone: "",
  featuredImage: "",
  bannerImage: "",
  tags: "",
  isTicketed: true,
  isFree: false,
  maxAttendees: 500,
  registrationDeadline: "",
  ticketTypes: [
    { name: "General Admission", description: "Standard event access", price: 0, currency: "USD", quantity: 100, benefits: "" },
  ],
};

interface EventCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (eventId: string, eventData: any) => void;
}

export function EventCreationWizard({ open, onOpenChange, onEventCreated }: EventCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<EventFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basics
        if (!form.name.trim()) newErrors.name = "Event name is required";
        if (!form.startDate) newErrors.startDate = "Start date is required";
        if (form.endDate && form.endDate < form.startDate) {
          newErrors.endDate = "End date must be after start date";
        }
        break;
      case 1: // Location
        if (form.format !== "virtual" && !form.venueName.trim()) {
          newErrors.venueName = "Venue name is required for in-person events";
        }
        if (form.format !== "in-person" && !form.virtualEventUrl.trim()) {
          newErrors.virtualEventUrl = "Virtual event URL is required";
        }
        break;
      case 2: // Description
        if (!form.description.trim()) newErrors.description = "Description is required";
        break;
      case 3: // Tickets
        if (form.isTicketed && !form.isFree) {
          form.ticketTypes.forEach((ticket, i) => {
            if (!ticket.name.trim()) newErrors[`ticket_${i}_name`] = "Ticket name required";
            if (ticket.price < 0) newErrors[`ticket_${i}_price`] = "Price must be positive";
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreate = async () => {
    if (!db) {
      toast.error("Database not available");
      return;
    }

    if (!validateStep(currentStep)) return;

    setSaving(true);
    try {
      const eventData = {
        title: form.name,
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        tagline: form.tagline,
        description: form.description,
        shortDescription: form.shortDescription || form.description.substring(0, 200),
        startDate: Timestamp.fromDate(new Date(`${form.startDate}T${form.startTime}`)),
        endDate: Timestamp.fromDate(new Date(`${form.endDate || form.startDate}T${form.endTime}`)),
        startTime: form.startTime,
        endTime: form.endTime,
        timezone: form.timezone,
        locationType: form.format,
        format: form.format,
        virtualLink: form.virtualEventUrl,
        virtualEventUrl: form.virtualEventUrl,
        livestreamUrl: form.livestreamUrl,
        location: form.venueName,
        venue: {
          name: form.venueName,
          address: form.venueAddress,
          city: form.venueCity,
          state: form.venueState,
          country: form.venueCountry,
          mapUrl: form.venueMapUrl,
        },
        organizer: {
          name: form.organizerName,
          contactEmail: form.organizerEmail,
          contactPhone: form.organizerPhone,
        },
        imageUrl: form.featuredImage,
        featuredImage: form.featuredImage,
        bannerImage: form.bannerImage,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: "draft",
        isFeatured: false,
        isTicketed: form.isTicketed,
        maxAttendees: form.maxAttendees,
        currentAttendees: 0,
        registrationDeadline: form.registrationDeadline 
          ? Timestamp.fromDate(new Date(form.registrationDeadline)) 
          : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const eventRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventData);

      // Create ticket types if ticketed event
      if (form.isTicketed && form.ticketTypes.length > 0) {
        for (let i = 0; i < form.ticketTypes.length; i++) {
          const ticket = form.ticketTypes[i];
          await addDoc(collection(db, COLLECTIONS.EVENT_TICKET_TYPES), {
            eventId: eventRef.id,
            name: ticket.name,
            description: ticket.description,
            price: form.isFree ? 0 : ticket.price,
            currency: ticket.currency,
            available: ticket.quantity,
            sold: 0,
            benefits: ticket.benefits ? ticket.benefits.split("\n").filter(Boolean) : [],
            earlyBirdPrice: ticket.earlyBirdPrice,
            earlyBirdDeadline: ticket.earlyBirdDeadline 
              ? Timestamp.fromDate(new Date(ticket.earlyBirdDeadline)) 
              : null,
            order: i,
            isVisible: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      }

      toast.success("Event created successfully!");
      onEventCreated(eventRef.id, { ...eventData, id: eventRef.id });
      
      // Reset form
      setForm(DEFAULT_FORM);
      setCurrentStep(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const updateTicketType = (index: number, field: keyof TicketTypeForm, value: any) => {
    const updated = [...form.ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, ticketTypes: updated });
  };

  const addTicketType = () => {
    setForm({
      ...form,
      ticketTypes: [
        ...form.ticketTypes,
        { name: "", description: "", price: 0, currency: "USD", quantity: 50, benefits: "" },
      ],
    });
  };

  const removeTicketType = (index: number) => {
    if (form.ticketTypes.length > 1) {
      setForm({
        ...form,
        ticketTypes: form.ticketTypes.filter((_, i) => i !== index),
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="IAEOZ Summit 2025"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="iaeoz-summit-2025"
              />
              <p className="text-xs text-muted-foreground">Your event will be at: /events/{form.slug || "your-event"}</p>
            </div>

            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Powering Agriculture & Energy Innovation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={errors.endDate ? "border-destructive" : ""}
                />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                    <SelectItem value="America/Puerto_Rico">Atlantic (AT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Format</Label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "in-person", label: "In-Person", icon: <MapPin className="h-5 w-5" /> },
                  { value: "virtual", label: "Virtual", icon: <Video className="h-5 w-5" /> },
                  { value: "hybrid", label: "Hybrid", icon: <Globe className="h-5 w-5" /> },
                ].map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${form.format === option.value ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`}
                    onClick={() => setForm({ ...form, format: option.value as EventFormat })}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      {option.icon}
                      <span className="mt-2 text-sm font-medium">{option.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: // Location
        return (
          <div className="space-y-6">
            {form.format !== "virtual" && (
              <>
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Physical Venue
                </h3>
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label>Venue Name *</Label>
                    <Input
                      value={form.venueName}
                      onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                      placeholder="Caribe Hilton Hotel"
                      className={errors.venueName ? "border-destructive" : ""}
                    />
                    {errors.venueName && <p className="text-sm text-destructive">{errors.venueName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      value={form.venueAddress}
                      onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                      placeholder="1 San Geronimo Street"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={form.venueCity}
                        onChange={(e) => setForm({ ...form, venueCity: e.target.value })}
                        placeholder="San Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State/Province</Label>
                      <Input
                        value={form.venueState}
                        onChange={(e) => setForm({ ...form, venueState: e.target.value })}
                        placeholder="PR"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={form.venueCountry}
                        onChange={(e) => setForm({ ...form, venueCountry: e.target.value })}
                        placeholder="USA"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Google Maps URL</Label>
                    <Input
                      value={form.venueMapUrl}
                      onChange={(e) => setForm({ ...form, venueMapUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </>
            )}

            {form.format !== "in-person" && (
              <>
                <h3 className="font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4" /> Virtual Event
                </h3>
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label>Virtual Event URL *</Label>
                    <Input
                      value={form.virtualEventUrl}
                      onChange={(e) => setForm({ ...form, virtualEventUrl: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                      className={errors.virtualEventUrl ? "border-destructive" : ""}
                    />
                    {errors.virtualEventUrl && <p className="text-sm text-destructive">{errors.virtualEventUrl}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Livestream URL (optional)</Label>
                    <Input
                      value={form.livestreamUrl}
                      onChange={(e) => setForm({ ...form, livestreamUrl: e.target.value })}
                      placeholder="https://youtube.com/live/..."
                    />
                  </div>
                </div>
              </>
            )}

            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Organizer
            </h3>
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={form.organizerName}
                    onChange={(e) => setForm({ ...form, organizerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={form.organizerEmail}
                    onChange={(e) => setForm({ ...form, organizerEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={form.organizerPhone}
                  onChange={(e) => setForm({ ...form, organizerPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Description
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Event Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your event in detail..."
                rows={6}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="A brief summary for listings and previews..."
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{form.shortDescription.length}/200 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="agriculture, energy, innovation, networking"
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Featured Image URL
                </Label>
                <Input
                  value={form.featuredImage}
                  onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Banner Image URL
                </Label>
                <Input
                  value={form.bannerImage}
                  onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {(form.featuredImage || form.bannerImage) && (
              <div className="grid grid-cols-2 gap-4">
                {form.featuredImage && (
                  <div className="space-y-2">
                    <Label>Featured Preview</Label>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img src={form.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {form.bannerImage && (
                  <div className="space-y-2">
                    <Label>Banner Preview</Label>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img src={form.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3: // Tickets
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isTicketed}
                    onCheckedChange={(checked) => setForm({ ...form, isTicketed: checked })}
                  />
                  <Label>Require Registration</Label>
                </div>
                {form.isTicketed && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isFree}
                      onCheckedChange={(checked) => setForm({ ...form, isFree: checked })}
                    />
                    <Label>Free Event</Label>
                  </div>
                )}
              </div>
            </div>

            {form.isTicketed && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Attendees</Label>
                    <Input
                      type="number"
                      value={form.maxAttendees}
                      onChange={(e) => setForm({ ...form, maxAttendees: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Deadline</Label>
                    <Input
                      type="date"
                      value={form.registrationDeadline}
                      onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Ticket Types</h3>
                    <Button variant="outline" size="sm" onClick={addTicketType}>
                      Add Ticket Type
                    </Button>
                  </div>

                  {form.ticketTypes.map((ticket, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Ticket {index + 1}</Badge>
                          {form.ticketTypes.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => removeTicketType(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ticket Name *</Label>
                            <Input
                              value={ticket.name}
                              onChange={(e) => updateTicketType(index, "name", e.target.value)}
                              placeholder="General Admission"
                              className={errors[`ticket_${index}_name`] ? "border-destructive" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price {form.isFree ? "(Free)" : "*"}</Label>
                            <Input
                              type="number"
                              value={form.isFree ? 0 : ticket.price}
                              onChange={(e) => updateTicketType(index, "price", parseFloat(e.target.value) || 0)}
                              disabled={form.isFree}
                              className={errors[`ticket_${index}_price`] ? "border-destructive" : ""}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={ticket.description}
                            onChange={(e) => updateTicketType(index, "description", e.target.value)}
                            placeholder="What's included with this ticket"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Quantity Available</Label>
                            <Input
                              type="number"
                              value={ticket.quantity}
                              onChange={(e) => updateTicketType(index, "quantity", parseInt(e.target.value) || 0)}
                            />
                          </div>
                          {!form.isFree && (
                            <div className="space-y-2">
                              <Label>Early Bird Price</Label>
                              <Input
                                type="number"
                                value={ticket.earlyBirdPrice || ""}
                                onChange={(e) => updateTicketType(index, "earlyBirdPrice", parseFloat(e.target.value) || undefined)}
                                placeholder="Optional"
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Benefits (one per line)</Label>
                          <Textarea
                            value={ticket.benefits}
                            onChange={(e) => updateTicketType(index, "benefits", e.target.value)}
                            placeholder="Access to all sessions&#10;Networking lunch&#10;Event swag bag"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {!form.isTicketed && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    This event will be open to all without registration.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{form.name || "Untitled Event"}</CardTitle>
                <CardDescription>{form.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dates:</span>
                    <p className="font-medium">
                      {form.startDate && format(new Date(form.startDate), "MMM d, yyyy")}
                      {form.endDate && form.endDate !== form.startDate && ` - ${format(new Date(form.endDate), "MMM d, yyyy")}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{form.startTime} - {form.endTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium capitalize">{form.format}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">
                      {form.format === "virtual" ? "Virtual Event" : form.venueName || "TBD"}
                    </p>
                  </div>
                </div>

                {form.description && (
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="text-sm mt-1 line-clamp-3">{form.description}</p>
                  </div>
                )}

                {form.isTicketed && (
                  <div>
                    <span className="text-muted-foreground text-sm">Tickets:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.ticketTypes.map((ticket, i) => (
                        <Badge key={i} variant="secondary">
                          {ticket.name}: {form.isFree ? "Free" : `$${ticket.price}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {form.tags && (
                  <div>
                    <span className="text-muted-foreground text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.tags.split(",").map((tag, i) => (
                        <Badge key={i} variant="outline">{tag.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Your event will be created as a <strong>draft</strong></li>
                <li>• You can add speakers, schedule, and sponsors</li>
                <li>• Publish when ready to accept registrations</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Follow the steps to set up your event
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2 py-4 border-b">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted"
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className="hidden md:inline text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
