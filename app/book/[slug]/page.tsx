"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Building,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { collection, getDocs, addDoc, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberAvailabilityDoc, type BookingDoc, type CalendarEventDoc } from "@/lib/schema";

// Generate time slots for a given day
const generateTimeSlots = (startTime: string, endTime: string, duration: number): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin + duration <= endMin)) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    slots.push(timeStr);
    
    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
};

// Format time for display
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Get next N days
const getNextDays = (count: number): Date[] => {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 1; i <= count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  
  return days;
};

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<TeamMemberAvailabilityDoc | null>(null);
  const [step, setStep] = useState<'select-type' | 'select-time' | 'enter-details' | 'confirmed'>('select-type');
  const [selectedMeetingType, setSelectedMeetingType] = useState<{ id: string; name: string; duration: number; description?: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [confirmedBooking, setConfirmedBooking] = useState<{
    date: string;
    time: string;
    meetingType: string;
  } | null>(null);

  // Fetch availability by slug
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!db || !slug) return;
      
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEAM_MEMBER_AVAILABILITY));
        let found: TeamMemberAvailabilityDoc | null = null;
        
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as TeamMemberAvailabilityDoc;
          if (data.bookingSlug === slug && data.isActive) {
            found = { ...data, id: docSnap.id };
          }
        });
        
        setAvailability(found);
        
        if (found) {
          // Calculate available days based on weekly availability
          const foundAvailability = found as TeamMemberAvailabilityDoc;
          const days = getNextDays(foundAvailability.maxAdvanceBookingDays || 60);
          const availableDays = days.filter(date => {
            const dayOfWeek = date.getDay();
            const dayAvailability = foundAvailability.weeklyAvailability.find(d => d.dayOfWeek === dayOfWeek);
            if (!dayAvailability?.isEnabled) return false;
            
            // Check blocked dates
            const dateStr = date.toISOString().split('T')[0];
            const isBlocked = foundAvailability.blockedDates?.some(b => b.date === dateStr);
            return !isBlocked;
          });
          
          setAvailableDays(availableDays);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [slug]);

  // Update available slots when date changes
  useEffect(() => {
    if (!selectedDate || !availability || !selectedMeetingType) {
      setAvailableSlots([]);
      return;
    }
    
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.weeklyAvailability.find(d => d.dayOfWeek === dayOfWeek);
    
    if (dayAvailability?.isEnabled) {
      const slots = generateTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        selectedMeetingType.duration
      );
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, availability, selectedMeetingType]);

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!db || !availability || !selectedMeetingType || !selectedDate || !selectedTime) return;
    if (!bookingDetails.name || !bookingDetails.email) {
      alert("Please fill in your name and email");
      return;
    }
    
    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endHours = hours + Math.floor((minutes + selectedMeetingType.duration) / 60);
      const endMinutes = (minutes + selectedMeetingType.duration) % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      // Create booking document
      const bookingData: Omit<BookingDoc, 'id'> = {
        teamMemberId: availability.teamMemberId,
        teamMemberName: availability.teamMemberName,
        teamMemberEmail: availability.teamMemberEmail,
        clientName: bookingDetails.name,
        clientEmail: bookingDetails.email,
        clientPhone: bookingDetails.phone || undefined,
        clientCompany: bookingDetails.company || undefined,
        clientNotes: bookingDetails.notes || undefined,
        meetingTypeId: selectedMeetingType.id,
        meetingTypeName: selectedMeetingType.name,
        date: dateStr,
        startTime: selectedTime,
        endTime: endTime,
        duration: selectedMeetingType.duration,
        timezone: availability.timezone,
        isVirtual: true,
        status: 'confirmed',
        confirmationEmailSent: false,
        reminderEmailSent: false,
        bookedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const bookingRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), bookingData);
      
      // Create calendar event
      const startDateTime = new Date(`${dateStr}T${selectedTime}`);
      const endDateTime = new Date(`${dateStr}T${endTime}`);
      
      const calendarEvent: Omit<CalendarEventDoc, 'id'> = {
        title: `Meeting with ${bookingDetails.name}`,
        description: `${selectedMeetingType.name}\n\nClient: ${bookingDetails.name}\nEmail: ${bookingDetails.email}${bookingDetails.phone ? `\nPhone: ${bookingDetails.phone}` : ''}${bookingDetails.company ? `\nCompany: ${bookingDetails.company}` : ''}${bookingDetails.notes ? `\n\nNotes: ${bookingDetails.notes}` : ''}`,
        startDate: Timestamp.fromDate(startDateTime),
        endDate: Timestamp.fromDate(endDateTime),
        type: 'meeting',
        color: '#C8A951',
        attendees: [bookingDetails.name, availability.teamMemberName],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, COLLECTIONS.CALENDAR_EVENTS), calendarEvent);
      
      // Send email notifications
      try {
        await fetch('/api/bookings/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingRef.id,
            teamMemberName: availability.teamMemberName,
            teamMemberEmail: availability.teamMemberEmail,
            clientName: bookingDetails.name,
            clientEmail: bookingDetails.email,
            meetingType: selectedMeetingType.name,
            date: selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            time: formatTime(selectedTime),
            duration: selectedMeetingType.duration,
            notes: bookingDetails.notes,
          }),
        });
      } catch (emailError) {
        console.error("Error sending notification:", emailError);
        // Don't fail the booking if email fails
      }
      
      // Set confirmed state
      setConfirmedBooking({
        date: selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        time: formatTime(selectedTime),
        meetingType: selectedMeetingType.name,
      });
      setStep('confirmed');
      
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error creating booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Booking Page Not Found</h2>
            <p className="text-muted-foreground">
              This booking page doesn't exist or is no longer active.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {availability.teamMemberName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-2">{availability.bookingTitle || `Book a meeting with ${availability.teamMemberName}`}</h1>
          {availability.bookingDescription && (
            <p className="text-muted-foreground max-w-lg mx-auto">{availability.bookingDescription}</p>
          )}
        </div>

        {/* Progress Steps */}
        {step !== 'confirmed' && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select-type' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step !== 'select-type' ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select-time' ? 'bg-primary text-primary-foreground' : step === 'enter-details' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step === 'enter-details' ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'enter-details' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Select Meeting Type */}
        {step === 'select-type' && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Meeting Type</CardTitle>
              <CardDescription>Choose the type of meeting you'd like to schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availability.meetingTypes.map((mt) => (
                <div
                  key={mt.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${selectedMeetingType?.id === mt.id ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setSelectedMeetingType(mt)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{mt.name}</h3>
                      {mt.description && <p className="text-sm text-muted-foreground mt-1">{mt.description}</p>}
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {mt.duration} min
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-4">
                <Button
                  className="w-full"
                  disabled={!selectedMeetingType}
                  onClick={() => setStep('select-time')}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 'select-time' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep('select-type')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>{selectedMeetingType?.name} - {selectedMeetingType?.duration} minutes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <Label className="mb-3 block">Select a Date</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                    {availableDays.slice(0, 21).map((date) => (
                      <Button
                        key={date.toISOString()}
                        variant={selectedDate?.toDateString() === date.toDateString() ? 'default' : 'outline'}
                        className="flex flex-col h-auto py-2"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                      >
                        <span className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-bold">{date.getDate()}</span>
                        <span className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="mb-3 block">Select a Time</Label>
                  {selectedDate ? (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(time)}
                          >
                            {formatTime(time)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No available times for this date</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Select a date to see available times</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  className="w-full"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep('enter-details')}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter Details */}
        {step === 'enter-details' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep('select-time')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>Enter Your Details</CardTitle>
                  <CardDescription>
                    {selectedMeetingType?.name} on {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime && formatTime(selectedTime)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-1" />
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={bookingDetails.name}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={bookingDetails.email}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={bookingDetails.phone}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">
                    <Building className="h-4 w-4 inline mr-1" />
                    Company
                  </Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    value={bookingDetails.company}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Anything you'd like us to know before the meeting..."
                  value={bookingDetails.notes}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  disabled={!bookingDetails.name || !bookingDetails.email || submitting}
                  onClick={handleSubmitBooking}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation */}
        {step === 'confirmed' && confirmedBooking && (
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Your meeting has been scheduled. A confirmation email will be sent to {bookingDetails.email}.
              </p>
              
              <div className="bg-muted rounded-lg p-4 max-w-sm mx-auto text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{confirmedBooking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{confirmedBooking.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>{confirmedBooking.meetingType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>with {availability.teamMemberName}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('select-type');
                    setSelectedMeetingType(null);
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setBookingDetails({ name: '', email: '', phone: '', company: '', notes: '' });
                    setConfirmedBooking(null);
                  }}
                >
                  Book Another Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by KDM & Associates</p>
        </div>
      </div>
    </div>
  );
}
