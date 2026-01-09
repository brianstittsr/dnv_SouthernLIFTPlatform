'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  ArrowLeft,
  ExternalLink,
  Ticket,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  startDate: Timestamp;
  startTime: string;
  endDate: Timestamp;
  endTime: string;
  locationType: 'virtual' | 'in-person' | 'hybrid';
  location: string;
  virtualLink?: string;
  registrationUrl?: string;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
  category: string;
  tags: string[];
  status: string;
  isFeatured: boolean;
  isTicketed: boolean;
  ticketTypes?: {
    name: string;
    price: number;
    description?: string;
    maxQuantity?: number;
    soldCount: number;
  }[];
  sponsorIds: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    if (!db || !id) return;

    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, id);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        setEvent({
          id: eventSnap.id,
          ...eventSnap.data()
        } as Event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (ticketType?: string) => {
    if (!event) return;

    if (event.isTicketed && ticketType) {
      // Redirect to ticket purchase flow
      router.push(`/events/${id}/register?ticket=${encodeURIComponent(ticketType)}`);
    } else if (event.registrationUrl) {
      // External registration
      window.open(event.registrationUrl, '_blank');
    } else {
      // Internal registration
      router.push(`/events/${id}/register`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.shortDescription || event?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'virtual': return '🌐';
      case 'in-person': return '📍';
      case 'hybrid': return '🔄';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      webinar: 'bg-blue-100 text-blue-800',
      workshop: 'bg-green-100 text-green-800',
      conference: 'bg-purple-100 text-purple-800',
      networking: 'bg-orange-100 text-orange-800',
      training: 'bg-yellow-100 text-yellow-800',
      briefing: 'bg-red-100 text-red-800',
      showcase: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const isEventPast = () => {
    if (!event) return false;
    return event.startDate.toDate() < new Date();
  };

  const isSoldOut = () => {
    if (!event || !event.maxAttendees) return false;
    return event.currentAttendees >= event.maxAttendees;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/events">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {event.imageUrl && (
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getLocationIcon(event.locationType)} {event.locationType}
                </span>
                {event.isFeatured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {isEventPast() && (
                  <Badge variant="secondary">Past Event</Badge>
                )}
                {isSoldOut() && (
                  <Badge variant="destructive">Sold Out</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              {event.shortDescription && (
                <p className="text-xl text-muted-foreground">{event.shortDescription}</p>
              )}
            </div>

            {/* Event Details */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(event.startDate.toDate(), 'EEEE, MMMM d, yyyy')}
                    </p>
                    {format(event.startDate.toDate(), 'yyyy-MM-dd') !== format(event.endDate.toDate(), 'yyyy-MM-dd') && (
                      <p className="text-sm text-muted-foreground">
                        to {format(event.endDate.toDate(), 'EEEE, MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{event.startTime} - {event.endTime}</p>
                    <p className="text-sm text-muted-foreground">Eastern Time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.locationType === 'virtual' && event.virtualLink && !isEventPast() && (
                      <a 
                        href={event.virtualLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Join Virtual Event <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {event.currentAttendees} / {event.maxAttendees} registered
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.maxAttendees - event.currentAttendees} spots remaining
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Registration Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {isEventPast() ? 'Event Has Ended' : 'Register Now'}
                </CardTitle>
                {!isEventPast() && event.isTicketed && (
                  <CardDescription>Select a ticket type to continue</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isEventPast() ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      This event has already taken place.
                    </p>
                    <Link href="/events">
                      <Button variant="outline" className="w-full">
                        Browse Upcoming Events
                      </Button>
                    </Link>
                  </div>
                ) : isSoldOut() ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      This event is sold out.
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      Join Waitlist
                    </Button>
                  </div>
                ) : event.isTicketed && event.ticketTypes ? (
                  <div className="space-y-4">
                    {event.ticketTypes.map((ticket, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTicket === ticket.name
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedTicket(ticket.name)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{ticket.name}</p>
                            {ticket.description && (
                              <p className="text-sm text-muted-foreground">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-lg">
                            ${(ticket.price / 100).toFixed(2)}
                          </p>
                        </div>
                        {ticket.maxQuantity && (
                          <p className="text-xs text-muted-foreground">
                            {ticket.maxQuantity - ticket.soldCount} remaining
                          </p>
                        )}
                        {selectedTicket === ticket.name && (
                          <CheckCircle className="h-5 w-5 text-primary mt-2" />
                        )}
                      </div>
                    ))}
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedTicket}
                      onClick={() => handleRegister(selectedTicket || undefined)}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Continue to Checkout
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleRegister()}
                  >
                    Register for Free
                  </Button>
                )}

                <Separator className="my-4" />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
