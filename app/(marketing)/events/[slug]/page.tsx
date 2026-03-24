'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  CheckCircle,
  Phone,
  Mail,
  MapIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getEventBySlug } from '@/lib/events-data';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPastEvent = event.eventDate < new Date();
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Conference: 'bg-purple-100 text-purple-800',
      Workshop: 'bg-green-100 text-green-800',
      Webinar: 'bg-blue-100 text-blue-800',
      Networking: 'bg-orange-100 text-orange-800',
      Training: 'bg-yellow-100 text-yellow-800',
      Summit: 'bg-red-100 text-red-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatEventDate = (startDate: Date, endDate?: Date) => {
    if (!endDate || format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return format(startDate, 'EEEE, MMMM d, yyyy');
    }
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Featured Image */}
      {event.featuredImage && (
        <div className="relative h-96 w-full bg-muted">
          <Image
            src={event.featuredImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          {isPastEvent && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge className="text-lg px-4 py-2 bg-gray-700">Past Event</Badge>
            </div>
          )}
        </div>
      )}

      {/* Event Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
              {isPastEvent && (
                <Badge variant="secondary">Past Event</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{event.description}</p>

            {/* Key Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatEventDate(event.eventDate, event.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{event.location.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-semibold">
                    {event.registered} / {event.capacity} registered
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Full Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none">
                  {event.fullDescription.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-2xl font-bold mt-6 mb-3">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    } else if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-2 mb-4">
                          {paragraph.split('\n').map((item, i) => (
                            <li key={i} className="text-muted-foreground">
                              {item.replace('- ', '')}
                            </li>
                          ))}
                        </ul>
                      );
                    } else if (paragraph.startsWith('"')) {
                      return (
                        <blockquote key={idx} className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                          {paragraph}
                        </blockquote>
                      );
                    } else {
                      return (
                        <p key={idx} className="text-muted-foreground mb-4">
                          {paragraph}
                        </p>
                      );
                    }
                  })}
                </CardContent>
              </Card>

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Speakers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {event.speakers.map((speaker, idx) => (
                      <div key={idx} className="flex gap-4">
                        {speaker.photo && (
                          <div className="relative h-24 w-24 flex-shrink-0">
                            <Image
                              src={speaker.photo}
                              alt={speaker.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{speaker.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{speaker.title}</p>
                          {speaker.bio && (
                            <p className="text-muted-foreground">{speaker.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Agenda */}
              {event.agenda && event.agenda.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Event Agenda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.agenda.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary">{item.time}</p>
                          <h4 className="font-semibold text-lg mt-1">{item.title}</h4>
                          {item.speaker && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Speaker:</strong> {item.speaker}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-muted-foreground mt-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Event Info Card */}
              <Card className="sticky top-4 mb-6">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Location</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{event.location.venue}</p>
                      <p className="text-muted-foreground">{event.location.address}</p>
                      <p className="text-muted-foreground">
                        {event.location.city}, {event.location.state} {event.location.zipCode}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Organizer */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Organizer</p>
                    <p className="font-semibold">{event.organizer}</p>
                  </div>

                  <Separator />

                  {/* Contact */}
                  <div className="space-y-2">
                    {event.contactEmail && (
                      <a
                        href={`mailto:${event.contactEmail}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {event.contactEmail}
                      </a>
                    )}
                    {event.contactPhone && (
                      <a
                        href={`tel:${event.contactPhone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {event.contactPhone}
                      </a>
                    )}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Price</p>
                    <p className="text-2xl font-bold">
                      {event.isFree ? 'Free' : `$${event.price}`}
                    </p>
                  </div>

                  <Separator />

                  {/* Registration */}
                  {!isPastEvent && event.registrationUrl && (
                    <Button asChild className="w-full" size="lg">
                      <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                        <Ticket className="h-4 w-4 mr-2" />
                        Register Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  {isPastEvent && (
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        This event has already taken place.
                      </p>
                    </div>
                  )}

                  {/* Share */}
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
      <section className="bg-white py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">More Events</h2>
            <Button asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
