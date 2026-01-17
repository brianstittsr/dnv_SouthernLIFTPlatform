"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Video,
  Users,
  MoreVertical,
  Star,
  Loader2,
  Globe,
  Mic2,
  Ticket,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  Save,
  Copy,
  UserPlus,
  GripVertical,
} from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { toast } from "sonner";
import {
  type EventFormat,
  type EventStatus,
  type SpeakerRole,
  type SessionType,
  DEFAULT_EVENT_FORM,
  DEFAULT_SPEAKER_FORM,
  DEFAULT_SESSION_FORM,
  generateSlug,
  SESSION_TYPE_LABELS,
  SPEAKER_ROLE_LABELS,
} from "@/lib/types/event-management";
import { EventCreationWizard } from "@/components/events/event-creation-wizard";
import { TicketManager } from "@/components/events/ticket-manager";
import { SponsorManager } from "@/components/events/sponsor-manager";
import { RegistrationManager } from "@/components/events/registration-manager";

interface EventDoc {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  shortDescription: string;
  startDate: Timestamp;
  endDate: Timestamp;
  timezone: string;
  venue: { name: string; address: string; city: string; state: string; country: string; mapUrl?: string };
  format: EventFormat;
  virtualEventUrl?: string;
  livestreamUrl?: string;
  organizer: { name: string; logo?: string; website?: string; contactEmail: string; contactPhone?: string };
  featuredImage: string;
  bannerImage?: string;
  gallery: string[];
  videoUrl?: string;
  hotelInfo?: { name: string; bookingUrl: string; groupRate?: number; groupRateDeadline?: Timestamp; description?: string };
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string;
  tags: string[];
  status: EventStatus;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

interface SpeakerDoc {
  id: string;
  eventId: string;
  name: string;
  title: string;
  organization: string;
  photo: string;
  bio: string;
  shortBio?: string;
  role: SpeakerRole;
  featured: boolean;
  email?: string;
  linkedin?: string;
  order: number;
  isVisible: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface DayDoc {
  id: string;
  eventId: string;
  date: Timestamp;
  dayNumber: number;
  dayName: string;
  theme?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SessionDoc {
  id: string;
  dayId: string;
  eventId: string;
  title: string;
  description?: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  duration: number;
  room?: string;
  speakerIds: string[];
  order: number;
  isVisible: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const statusColors: Record<EventStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-800",
};

const formatColors: Record<EventFormat, string> = {
  "in-person": "bg-blue-100 text-blue-800",
  virtual: "bg-purple-100 text-purple-800",
  hybrid: "bg-cyan-100 text-cyan-800",
};

export default function EventManagerPage() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventDoc | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [eventForm, setEventForm] = useState(DEFAULT_EVENT_FORM);
  const [saving, setSaving] = useState(false);
  const [speakers, setSpeakers] = useState<SpeakerDoc[]>([]);
  const [days, setDays] = useState<DayDoc[]>([]);
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [speakerDialogOpen, setSpeakerDialogOpen] = useState(false);
  const [speakerForm, setSpeakerForm] = useState(DEFAULT_SPEAKER_FORM);
  const [editingSpeaker, setEditingSpeaker] = useState<SpeakerDoc | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState(DEFAULT_SESSION_FORM);
  const [editingSession, setEditingSession] = useState<SessionDoc | null>(null);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!db) { setLoading(false); return; }
      try {
        const q = query(collection(db, COLLECTIONS.EVENTS), orderBy("startDate", "desc"));
        const snapshot = await getDocs(q);
        const list: EventDoc[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.title || data.name || "",
            slug: data.slug || generateSlug(data.title || ""),
            tagline: data.tagline || data.shortDescription || "",
            description: data.description || "",
            shortDescription: data.shortDescription || "",
            startDate: data.startDate,
            endDate: data.endDate || data.startDate,
            timezone: data.timezone || "America/New_York",
            venue: data.venue || { name: data.location || "", address: "", city: "", state: "", country: "USA" },
            format: data.locationType || data.format || "hybrid",
            virtualEventUrl: data.virtualLink || "",
            organizer: data.organizer || { name: "KDM & Associates", contactEmail: "info@kdm-assoc.com" },
            featuredImage: data.imageUrl || "",
            gallery: data.gallery || [],
            tags: data.tags || [],
            status: data.status || "draft",
            featured: data.isFeatured || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            createdBy: data.createdBy || "",
          } as EventDoc);
        });
        setEvents(list);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent || !db) return;
    const firestore = db;
    const fetchData = async () => {
      try {
        const sq = query(collection(firestore, COLLECTIONS.EVENT_SPEAKERS), where("eventId", "==", selectedEvent.id));
        const ss = await getDocs(sq);
        setSpeakers(ss.docs.map(d => ({ id: d.id, ...d.data() } as SpeakerDoc)));

        const dq = query(collection(firestore, COLLECTIONS.EVENT_DAYS), where("eventId", "==", selectedEvent.id));
        const ds = await getDocs(dq);
        const daysList = ds.docs.map(d => ({ id: d.id, ...d.data() } as DayDoc));
        setDays(daysList);
        if (daysList.length > 0) setSelectedDayId(daysList[0].id);

        const sessq = query(collection(firestore, COLLECTIONS.EVENT_SESSIONS), where("eventId", "==", selectedEvent.id));
        const sesss = await getDocs(sessq);
        setSessions(sesss.docs.map(d => ({ id: d.id, ...d.data() } as SessionDoc)));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      const start = selectedEvent.startDate?.toDate?.() || new Date();
      const end = selectedEvent.endDate?.toDate?.() || start;
      setEventForm({
        ...DEFAULT_EVENT_FORM,
        name: selectedEvent.name,
        slug: selectedEvent.slug,
        tagline: selectedEvent.tagline,
        description: selectedEvent.description,
        shortDescription: selectedEvent.shortDescription,
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        timezone: selectedEvent.timezone,
        format: selectedEvent.format,
        virtualEventUrl: selectedEvent.virtualEventUrl || "",
        venueName: selectedEvent.venue?.name || "",
        venueAddress: selectedEvent.venue?.address || "",
        venueCity: selectedEvent.venue?.city || "",
        venueState: selectedEvent.venue?.state || "",
        venueCountry: selectedEvent.venue?.country || "USA",
        organizerName: selectedEvent.organizer?.name || "",
        organizerEmail: selectedEvent.organizer?.contactEmail || "",
        featuredImage: selectedEvent.featuredImage,
        tags: selectedEvent.tags?.join(", ") || "",
        status: selectedEvent.status,
        featured: selectedEvent.featured,
      });
    }
  }, [selectedEvent]);

  const backToList = () => {
    setSelectedEvent(null);
    setSpeakers([]);
    setDays([]);
    setSessions([]);
    setEventForm(DEFAULT_EVENT_FORM);
  };

  const handleSaveEvent = async () => {
    if (!db || !selectedEvent) return;
    if (!eventForm.name || !eventForm.startDate) {
      toast.error("Name and start date required");
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: eventForm.name,
        name: eventForm.name,
        slug: eventForm.slug || generateSlug(eventForm.name),
        tagline: eventForm.tagline,
        description: eventForm.description,
        shortDescription: eventForm.shortDescription,
        startDate: Timestamp.fromDate(new Date(eventForm.startDate)),
        endDate: Timestamp.fromDate(new Date(eventForm.endDate || eventForm.startDate)),
        timezone: eventForm.timezone,
        locationType: eventForm.format,
        format: eventForm.format,
        virtualLink: eventForm.virtualEventUrl,
        location: eventForm.venueName,
        venue: { name: eventForm.venueName, address: eventForm.venueAddress, city: eventForm.venueCity, state: eventForm.venueState, country: eventForm.venueCountry },
        organizer: { name: eventForm.organizerName, contactEmail: eventForm.organizerEmail },
        imageUrl: eventForm.featuredImage,
        featuredImage: eventForm.featuredImage,
        tags: eventForm.tags ? eventForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        status: eventForm.status,
        isFeatured: eventForm.featured,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, COLLECTIONS.EVENTS, selectedEvent.id), data);
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, ...data } as EventDoc : e));
      toast.success("Event saved");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!db || !eventForm.name || !eventForm.startDate) {
      toast.error("Name and start date required");
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: eventForm.name,
        name: eventForm.name,
        slug: eventForm.slug || generateSlug(eventForm.name),
        tagline: eventForm.tagline,
        description: eventForm.description,
        shortDescription: eventForm.shortDescription,
        startDate: Timestamp.fromDate(new Date(eventForm.startDate)),
        endDate: Timestamp.fromDate(new Date(eventForm.endDate || eventForm.startDate)),
        timezone: eventForm.timezone,
        locationType: eventForm.format,
        format: eventForm.format,
        virtualLink: eventForm.virtualEventUrl,
        location: eventForm.venueName,
        venue: { name: eventForm.venueName, address: eventForm.venueAddress, city: eventForm.venueCity, state: eventForm.venueState, country: eventForm.venueCountry },
        organizer: { name: eventForm.organizerName || "KDM & Associates", contactEmail: eventForm.organizerEmail || "info@kdm-assoc.com" },
        imageUrl: eventForm.featuredImage,
        tags: eventForm.tags ? eventForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        status: "draft",
        isFeatured: false,
        currentAttendees: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, COLLECTIONS.EVENTS), data);
      const newEvent = { ...data, id: ref.id, featuredImage: eventForm.featuredImage || "", gallery: [], featured: false, createdBy: "" } as EventDoc;
      setEvents([newEvent, ...events]);
      setCreateEventDialogOpen(false);
      setEventForm(DEFAULT_EVENT_FORM);
      setSelectedEvent(newEvent);
      toast.success("Event created");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDay = async () => {
    if (!db || !selectedEvent) return;
    try {
      const num = days.length + 1;
      const start = selectedEvent.startDate?.toDate?.() || new Date();
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + num - 1);
      const data = {
        eventId: selectedEvent.id,
        date: Timestamp.fromDate(dayDate),
        dayNumber: num,
        dayName: format(dayDate, "EEEE"),
        theme: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, COLLECTIONS.EVENT_DAYS), data);
      const newDay = { ...data, id: ref.id } as DayDoc;
      setDays([...days, newDay]);
      setSelectedDayId(newDay.id);
      toast.success(`Day ${num} added`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add day");
    }
  };

  const handleSaveSpeaker = async () => {
    if (!db || !selectedEvent || !speakerForm.name) {
      toast.error("Speaker name required");
      return;
    }
    setSaving(true);
    try {
      const data = {
        eventId: selectedEvent.id,
        name: speakerForm.name,
        title: speakerForm.title,
        organization: speakerForm.organization,
        photo: speakerForm.photo,
        bio: speakerForm.bio,
        role: speakerForm.role,
        featured: speakerForm.featured,
        order: speakerForm.order,
        isVisible: speakerForm.isVisible,
        updatedAt: Timestamp.now(),
      };
      if (editingSpeaker) {
        await updateDoc(doc(db, COLLECTIONS.EVENT_SPEAKERS, editingSpeaker.id), data);
        setSpeakers(speakers.map(s => s.id === editingSpeaker.id ? { ...s, ...data } as SpeakerDoc : s));
        toast.success("Speaker updated");
      } else {
        const ref = await addDoc(collection(db, COLLECTIONS.EVENT_SPEAKERS), { ...data, createdAt: Timestamp.now() });
        setSpeakers([...speakers, { ...data, id: ref.id, createdAt: Timestamp.now() } as SpeakerDoc]);
        toast.success("Speaker added");
      }
      setSpeakerDialogOpen(false);
      setSpeakerForm(DEFAULT_SPEAKER_FORM);
      setEditingSpeaker(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save speaker");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSession = async () => {
    if (!db || !selectedEvent || !selectedDayId || !sessionForm.title) {
      toast.error("Session title required");
      return;
    }
    setSaving(true);
    try {
      const [sh, sm] = sessionForm.startTime.split(":").map(Number);
      const [eh, em] = sessionForm.endTime.split(":").map(Number);
      const duration = (eh * 60 + em) - (sh * 60 + sm);
      const data = {
        eventId: selectedEvent.id,
        dayId: selectedDayId,
        title: sessionForm.title,
        description: sessionForm.description,
        type: sessionForm.type,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        duration,
        room: sessionForm.room,
        speakerIds: sessionForm.speakerIds,
        order: sessionForm.order,
        isVisible: sessionForm.isVisible,
        updatedAt: Timestamp.now(),
      };
      if (editingSession) {
        await updateDoc(doc(db, COLLECTIONS.EVENT_SESSIONS, editingSession.id), data);
        setSessions(sessions.map(s => s.id === editingSession.id ? { ...s, ...data } as SessionDoc : s));
        toast.success("Session updated");
      } else {
        const ref = await addDoc(collection(db, COLLECTIONS.EVENT_SESSIONS), { ...data, createdAt: Timestamp.now() });
        setSessions([...sessions, { ...data, id: ref.id, createdAt: Timestamp.now() } as SessionDoc]);
        toast.success("Session added");
      }
      setSessionDialogOpen(false);
      setSessionForm(DEFAULT_SESSION_FORM);
      setEditingSession(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  const formatEventDate = (e: EventDoc) => {
    const start = e.startDate?.toDate?.() || new Date();
    const end = e.endDate?.toDate?.() || start;
    if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) return format(start, "MMM d, yyyy");
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={backToList}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedEvent.name}</h1>
              <p className="text-muted-foreground">{formatEventDate(selectedEvent)}</p>
            </div>
            <Badge className={statusColors[selectedEvent.status]}>{selectedEvent.status}</Badge>
            <Badge className={formatColors[selectedEvent.format]}>{selectedEvent.format}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href={`/events/${selectedEvent.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />Preview
              </a>
            </Button>
            <Button onClick={handleSaveEvent} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="general"><FileText className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="location"><MapPin className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="schedule"><Calendar className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="speakers"><Mic2 className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="tickets"><Ticket className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="sponsors"><Building2 className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="registrations"><Users className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Name *</Label>
                    <Input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Slug</Label>
                    <div className="flex gap-2">
                      <Input value={eventForm.slug} onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })} />
                      <Button variant="outline" size="icon" onClick={() => setEventForm({ ...eventForm, slug: generateSlug(eventForm.name) })}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={eventForm.tagline} onChange={(e) => setEventForm({ ...eventForm, tagline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={4} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="date" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={eventForm.format} onValueChange={(v) => setEventForm({ ...eventForm, format: v as EventFormat })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={eventForm.status} onValueChange={(v) => setEventForm({ ...eventForm, status: v as EventStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input value={eventForm.tags} onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })} placeholder="agriculture, energy" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Venue</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Venue Name</Label>
                  <Input value={eventForm.venueName} onChange={(e) => setEventForm({ ...eventForm, venueName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={eventForm.venueAddress} onChange={(e) => setEventForm({ ...eventForm, venueAddress: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={eventForm.venueCity} onChange={(e) => setEventForm({ ...eventForm, venueCity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={eventForm.venueState} onChange={(e) => setEventForm({ ...eventForm, venueState: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={eventForm.venueCountry} onChange={(e) => setEventForm({ ...eventForm, venueCountry: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Schedule</h2>
              <Button onClick={handleAddDay}><Plus className="h-4 w-4 mr-2" />Add Day</Button>
            </div>
            {days.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>No days added yet</p>
                <Button className="mt-4" onClick={handleAddDay}><Plus className="h-4 w-4 mr-2" />Add Day</Button>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {days.map((d) => (
                    <Button key={d.id} variant={selectedDayId === d.id ? "default" : "outline"} onClick={() => setSelectedDayId(d.id)}>
                      Day {d.dayNumber}: {d.dayName}
                    </Button>
                  ))}
                </div>
                {selectedDayId && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{days.find(d => d.id === selectedDayId)?.dayName} Sessions</CardTitle>
                      <Button onClick={() => { setEditingSession(null); setSessionForm({ ...DEFAULT_SESSION_FORM, order: sessions.filter(s => s.dayId === selectedDayId).length }); setSessionDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />Add Session
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {sessions.filter(s => s.dayId === selectedDayId).length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No sessions</p>
                      ) : (
                        <div className="space-y-3">
                          {sessions.filter(s => s.dayId === selectedDayId).sort((a, b) => a.order - b.order).map((s) => (
                            <div key={s.id} className="flex items-center gap-4 p-4 border rounded-lg">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{s.title}</span>
                                  <Badge variant="secondary">{SESSION_TYPE_LABELS[s.type]}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">{s.startTime} - {s.endTime}</div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingSession(s); setSessionForm({ ...DEFAULT_SESSION_FORM, title: s.title, description: s.description || "", type: s.type, startTime: s.startTime, endTime: s.endTime, room: s.room || "", order: s.order, isVisible: s.isVisible, speakerIds: s.speakerIds || [] }); setSessionDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => { if (!db) return; await deleteDoc(doc(db, COLLECTIONS.EVENT_SESSIONS, s.id)); setSessions(sessions.filter(x => x.id !== s.id)); toast.success("Deleted"); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="speakers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Speakers ({speakers.length})</h2>
              <Button onClick={() => { setEditingSpeaker(null); setSpeakerForm({ ...DEFAULT_SPEAKER_FORM, order: speakers.length }); setSpeakerDialogOpen(true); }}>
                <UserPlus className="h-4 w-4 mr-2" />Add Speaker
              </Button>
            </div>
            {speakers.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Mic2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>No speakers yet</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {speakers.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {s.photo ? <img src={s.photo} alt={s.name} className="h-full w-full object-cover" /> : <Users className="h-8 w-8 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{s.name}</h3>
                            {s.featured && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{s.title}</p>
                          <p className="text-sm text-muted-foreground">{s.organization}</p>
                          <Badge variant="secondary" className="mt-2">{SPEAKER_ROLE_LABELS[s.role]}</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingSpeaker(s); setSpeakerForm({ ...DEFAULT_SPEAKER_FORM, name: s.name, title: s.title, organization: s.organization, photo: s.photo, bio: s.bio, role: s.role, featured: s.featured, order: s.order, isVisible: s.isVisible }); setSpeakerDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={async () => { if (!db) return; await deleteDoc(doc(db, COLLECTIONS.EVENT_SPEAKERS, s.id)); setSpeakers(speakers.filter(x => x.id !== s.id)); toast.success("Removed"); }}>
                              <Trash2 className="h-4 w-4 mr-2" />Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManager eventId={selectedEvent.id} eventName={selectedEvent.name} />
          </TabsContent>
          <TabsContent value="sponsors">
            <SponsorManager eventId={selectedEvent.id} />
          </TabsContent>
          <TabsContent value="registrations">
            <RegistrationManager eventId={selectedEvent.id} eventName={selectedEvent.name} />
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
                <CardDescription>Configure event options and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Payment Integration</h3>
                  <p className="text-sm text-muted-foreground">Configure Stripe and PayPal for ticket sales</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-purple-600">S</span>
                        </div>
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-sm text-muted-foreground">Credit card payments</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-blue-600">P</span>
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-muted-foreground">PayPal checkout</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold">Danger Zone</h3>
                  <Button variant="destructive" size="sm">Delete Event</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={speakerDialogOpen} onOpenChange={setSpeakerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSpeaker ? "Edit Speaker" : "Add Speaker"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={speakerForm.name} onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title</Label><Input value={speakerForm.title} onChange={(e) => setSpeakerForm({ ...speakerForm, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Organization</Label><Input value={speakerForm.organization} onChange={(e) => setSpeakerForm({ ...speakerForm, organization: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Photo URL</Label><Input value={speakerForm.photo} onChange={(e) => setSpeakerForm({ ...speakerForm, photo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={speakerForm.bio} onChange={(e) => setSpeakerForm({ ...speakerForm, bio: e.target.value })} rows={3} /></div>
              <div className="space-y-2"><Label>Role</Label>
                <Select value={speakerForm.role} onValueChange={(v) => setSpeakerForm({ ...speakerForm, role: v as SpeakerRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="speaker">Speaker</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="panelist">Panelist</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="producer">Producer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSpeakerDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSpeaker} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSession ? "Edit Session" : "Add Session"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={sessionForm.description} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })} /></div>
                <div className="space-y-2"><Label>End Time</Label><Input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })} /></div>
                <div className="space-y-2"><Label>Room</Label><Input value={sessionForm.room} onChange={(e) => setSessionForm({ ...sessionForm, room: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Type</Label>
                <Select value={sessionForm.type} onValueChange={(v) => setSessionForm({ ...sessionForm, type: v as SessionType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="panel">Panel</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSession} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Manager</h1>
          <p className="text-muted-foreground">Create and manage multi-day events with speakers, schedules, and registrations</p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">Create your first event to get started</p>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Create Event
          </Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEvent(e)}>
              {e.featuredImage && <div className="h-32 bg-muted overflow-hidden"><img src={e.featuredImage} alt={e.name} className="w-full h-full object-cover" /></div>}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className={statusColors[e.status]}>{e.status}</Badge>
                  <Badge className={formatColors[e.format]}>{e.format}</Badge>
                  {e.featured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                </div>
                <CardTitle className="text-lg">{e.name}</CardTitle>
                <CardDescription>{formatEventDate(e)}</CardDescription>
              </CardHeader>
              <CardContent>
                {e.shortDescription && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{e.shortDescription}</p>}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {e.format === "virtual" ? <Video className="h-4 w-4" /> : e.format === "hybrid" ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  <span>{e.venue?.name || e.venue?.city || "Location TBD"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Enter the basic details for your event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Event Name *</Label><Input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} placeholder="IAEOZ Summit 2025" /></div>
              <div className="space-y-2"><Label>URL Slug</Label><Input value={eventForm.slug} onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })} placeholder="iaeoz-summit-2025" /></div>
            </div>
            <div className="space-y-2"><Label>Tagline</Label><Input value={eventForm.tagline} onChange={(e) => setEventForm({ ...eventForm, tagline: e.target.value })} placeholder="Powering Agriculture & Energy Innovation" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Format</Label>
                <Select value={eventForm.format} onValueChange={(v) => setEventForm({ ...eventForm, format: v as EventFormat })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Venue Name</Label><Input value={eventForm.venueName} onChange={(e) => setEventForm({ ...eventForm, venueName: e.target.value })} placeholder="Caribe Hilton Hotel" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EventCreationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onEventCreated={(eventId, eventData) => {
          setEvents([eventData as EventDoc, ...events]);
          setSelectedEvent(eventData as EventDoc);
        }}
      />
    </div>
  );
}
