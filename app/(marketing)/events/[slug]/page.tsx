import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  ExternalLink,
  Mail,
  Phone
} from "lucide-react";
import { getEventBySlug, type Event } from "@/lib/events-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  
  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} - KDM & Associates Events`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isUpcoming = event.eventDate >= new Date();
  const isPastDeadline = event.registrationDeadline && event.registrationDeadline < new Date();
  const isFull = event.capacity && event.registered && event.registered >= event.capacity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/events" 
            className="inline-flex items-center text-sm text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {event.category}
            </Badge>
            {isUpcoming && (
              <Badge variant="outline" className="border-white text-white">
                Upcoming
              </Badge>
            )}
            {!event.isFree && (
              <Badge variant="outline" className="border-white text-white">
                ${event.price}
              </Badge>
            )}
            {event.isFree && (
              <Badge variant="outline" className="border-green-300 text-green-300">
                Free Event
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {event.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            {event.description}
          </p>
        </div>
      </section>

      {/* Event Details */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Image */}
            {event.featuredImage && (
              <div className="relative h-96 w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={event.featuredImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Full Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <div className="prose prose-lg max-w-none">
                  {event.fullDescription.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                          {paragraph.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n');
                      return (
                        <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Event Agenda</h2>
                  <div className="space-y-4">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-32 text-sm font-medium text-primary">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          {item.speaker && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Speaker: {item.speaker}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Featured Speakers</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex gap-4">
                        {speaker.photo && (
                          <div className="flex-shrink-0">
                            <img
                              src={speaker.photo}
                              alt={speaker.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold">{speaker.name}</h4>
                          <p className="text-sm text-primary mb-2">{speaker.title}</p>
                          {speaker.bio && (
                            <p className="text-sm text-muted-foreground">{speaker.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Event Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {event.endDate 
                          ? `${format(event.eventDate, 'MMM d')} - ${format(event.endDate, 'MMM d, yyyy')}`
                          : format(event.eventDate, 'EEEE, MMMM d, yyyy')
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{event.location.venue}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.location.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.location.city}, {event.location.state} {event.location.zipCode}
                      </p>
                    </div>
                  </div>

                  {!event.isFree && event.price && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">${event.price}</p>
                        <p className="text-sm text-muted-foreground">Registration Fee</p>
                      </div>
                    </div>
                  )}

                  {event.capacity && event.registered !== undefined && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {event.registered} / {event.capacity} Registered
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {isUpcoming && !isPastDeadline && !isFull && event.registrationUrl && (
                  <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full" size="lg">
                      Register Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}

                {isUpcoming && isPastDeadline && (
                  <Button className="w-full" size="lg" disabled>
                    Registration Closed
                  </Button>
                )}

                {isUpcoming && isFull && (
                  <Button className="w-full" size="lg" disabled>
                    Event Full
                  </Button>
                )}

                {!isUpcoming && (
                  <Button className="w-full" size="lg" variant="outline" disabled>
                    Event Has Passed
                  </Button>
                )}

                {event.registrationDeadline && isUpcoming && !isPastDeadline && (
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    Register by {format(event.registrationDeadline, 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            {(event.contactEmail || event.contactPhone) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Contact</h3>
                  <div className="space-y-3">
                    {event.contactEmail && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${event.contactEmail}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {event.contactEmail}
                        </a>
                      </div>
                    )}
                    {event.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${event.contactPhone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {event.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Organized By</h3>
                <p className="text-muted-foreground">{event.organizer}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
