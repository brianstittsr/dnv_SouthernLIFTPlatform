'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { JobPosting } from '@/lib/jobs-schema';
import { EMPLOYMENT_TYPES, LOCATION_TYPES, EXPERIENCE_LEVELS } from '@/lib/jobs-schema';

const FILTERS = {
  employmentType: [
    { value: 'all', label: 'All Types' },
    ...EMPLOYMENT_TYPES.map(type => ({ value: type, label: type }))
  ],
  locationType: [
    { value: 'all', label: 'All Locations' },
    ...LOCATION_TYPES.map(type => ({ value: type, label: type }))
  ],
  experienceLevel: [
    { value: 'all', label: 'All Levels' },
    ...EXPERIENCE_LEVELS.map(level => ({ value: level, label: level }))
  ]
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, employmentTypeFilter, locationTypeFilter, experienceLevelFilter]);

  const fetchJobs = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef,
        where('status', '==', 'published'),
        orderBy('postedDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobPosting[];

      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }

    // Employment type filter
    if (employmentTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.employmentType === employmentTypeFilter);
    }

    // Location type filter
    if (locationTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.locationType === locationTypeFilter);
    }

    // Experience level filter
    if (experienceLevelFilter !== 'all') {
      filtered = filtered.filter(job => job.experienceLevel === experienceLevelFilter);
    }

    setFilteredJobs(filtered);
  };

  const getLocationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Remote: 'bg-green-100 text-green-800',
      Hybrid: 'bg-blue-100 text-blue-800',
      'On-site': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEmploymentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Full-time': 'bg-blue-100 text-blue-800',
      'Part-time': 'bg-yellow-100 text-yellow-800',
      Contract: 'bg-orange-100 text-orange-800',
      Internship: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl">
            Build your career with KDM & Associates. Explore opportunities to make an impact in government contracting and minority business development.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Employment Type" />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.employmentType.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location Type" />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.locationType.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={experienceLevelFilter} onValueChange={setExperienceLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                {FILTERS.experienceLevel.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} available
          </p>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No positions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters, or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getEmploymentTypeColor(job.employmentType)}>
                          {job.employmentType}
                        </Badge>
                        <Badge className={getLocationTypeColor(job.locationType)}>
                          {job.locationType}
                        </Badge>
                        <Badge variant="outline">{job.experienceLevel}</Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-4 text-base">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {job.description.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Posted {format(job.postedDate.toDate(), 'MMM d, yyyy')}
                    {job.applicationDeadline && (
                      <span>• Apply by {format(job.applicationDeadline.toDate(), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/jobs/${job.slug}`} className="w-full">
                    <Button className="w-full">
                      View Details & Apply
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-purple-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't See the Right Fit?
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our team. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Send Us Your Resume
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
