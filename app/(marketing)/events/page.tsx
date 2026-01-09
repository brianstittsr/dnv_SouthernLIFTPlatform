'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, Filter, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
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
  }[];
}

const EVENT_CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'webinar', label: 'Webinars' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'conference', label: 'Conferences' },
  { value: 'networking', label: 'Networking' },
  { value: 'training', label: 'Training' },
  { value: 'briefing', label: 'Buyer Briefings' },
  { value: 'showcase', label: 'Showcases' },
];

const LOCATION_TYPES = [
  { value: 'all', label: 'All Locations' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, categoryFilter, locationFilter, activeTab]);

  const fetchEvents = async () => {
    if (!db) return;

    try {
      const eventsRef = collection(db, COLLECTIONS.EVENTS);
      const q = query(
        eventsRef,
        where('status', '==', 'published'),
        orderBy('startDate', 'asc')
      );

      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      setEvents(eventsData);
      setFeaturedEvents(eventsData.filter(e => e.isFeatured));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date();

    // Filter by tab (upcoming vs past)
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(e => e.startDate.toDate() >= now);
    } else {
      filtered = filtered.filter(e => e.startDate.toDate() < now);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    // Filter by location type
    if (locationFilter !== 'all') {
      filtered = filtered.filter(e => e.locationType === locationFilter);
    }

    setFilteredEvents(filtered);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return '🌐';
      case 'in-person':
        return '📍';
      case 'hybrid':
        return '🔄';
      default:
        return '📍';
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

  const formatEventDate = (startDate: Timestamp, endDate: Timestamp) => {
    const start = startDate.toDate();
    const end = endDate.toDate();

    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return format(start, 'EEEE, MMMM d, yyyy');
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            KDM Consortium Events
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Connect with government buyers, learn from industry experts, and grow your contracting business through our exclusive events.
          </p>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map(event => (
              <Card key={event.id} className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
                {event.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary">Featured</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getLocationIcon(event.locationType)} {event.locationType}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.shortDescription || event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(event.startDate, event.endDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    {event.maxAttendees && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.currentAttendees} / {event.maxAttendees} registered
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button className="w-full">
                      View Details <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Filters and Event List */}
      <section className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map(loc => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Event Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {activeTab === 'upcoming'
                ? 'Check back soon for upcoming events!'
                : 'No past events match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.imageUrl && (
                  <div className="relative h-40 w-full">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getLocationIcon(event.locationType)} {event.locationType}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(event.startDate.toDate(), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.startTime}
                    </div>
                  </div>
                  {event.isTicketed && event.ticketTypes && event.ticketTypes.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-sm font-medium">
                        From ${(event.ticketTypes[0].price / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {activeTab === 'upcoming' ? 'Register' : 'View Details'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to Host an Event with KDM?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Partner with us to reach qualified government contractors and showcase your capabilities to decision-makers.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Us About Sponsorship
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
