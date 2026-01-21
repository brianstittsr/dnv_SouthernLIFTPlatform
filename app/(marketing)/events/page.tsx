'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, Filter, Search, ChevronRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { events, getUpcomingEvents, getPastEvents, getAllEventCategories, type Event } from '@/lib/events-data';


const EVENT_CATEGORIES = [
  { value: 'all', label: 'All Events' },
  ...getAllEventCategories().map(cat => ({ value: cat, label: cat }))
];


export default function EventsPage() {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    filterEvents();
  }, [searchQuery, categoryFilter, activeTab]);


  const filterEvents = () => {
    let filtered = activeTab === 'upcoming' ? getUpcomingEvents() : getPastEvents();

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

    setFilteredEvents(filtered);
  };


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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
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
                {event.featuredImage && (
                  <div className="relative h-48 w-full bg-muted">
                    <img
                      src={event.featuredImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(event.eventDate, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location.city}, {event.location.state}
                    </div>
                    {!event.isFree && event.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        ${event.price}
                      </div>
                    )}
                    {event.capacity && event.registered && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.registered} / {event.capacity} registered
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/events/${event.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {activeTab === 'upcoming' ? 'View Details & Register' : 'View Details'}
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
