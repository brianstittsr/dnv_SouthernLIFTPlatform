"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, BookOpen, Calendar, Clock, Users, DollarSign } from "lucide-react";
import Link from "next/link";

interface CatalogCourse {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  facilitatorName: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  estimatedDurationWeeks: number | null;
  status: string;
  difficultyLevel: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  isFree: boolean;
  thumbnailUrl: string | null;
  tags: string[];
}

export default function BrowseCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/lms/catalog");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load courses");
      setCourses(payload.data ?? []);
    } catch (err: any) {
      console.error("Error loading courses:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((course) => {
    const matchesSearch =
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.facilitatorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.difficultyLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const spotsRemaining = (course: CatalogCourse) =>
    course.maxParticipants ? course.maxParticipants - course.currentParticipants : null;

  const formatPrice = (course: CatalogCourse) =>
    course.isFree ? "Free" : `$${(course.priceInCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground">Find and enroll in LIFT training programs</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={loadCourses}>Try again</Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground">
                {courses.length === 0 ? "No courses are open for enrollment yet — check back soon." : "Try adjusting your filters or search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((course) => {
            const spots = spotsRemaining(course);
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        {course.difficultyLevel && (
                          <Badge variant={course.difficultyLevel === "advanced" ? "destructive" : course.difficultyLevel === "intermediate" ? "default" : "secondary"}>
                            {course.difficultyLevel}
                          </Badge>
                        )}
                        {course.isFree && <Badge variant="outline">Free</Badge>}
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Instructor</div>
                          <div className="font-medium">{course.facilitatorName || "TBD"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Start Date</div>
                          <div className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(course.courseStartDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="font-medium flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.estimatedDurationWeeks ? `${course.estimatedDurationWeeks} weeks` : "Self-paced"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Available Spots</div>
                          <div className="font-medium flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {spots !== null ? `${spots} / ${course.maxParticipants}` : "Open"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Price</div>
                          <div className="font-medium flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatPrice(course)}
                          </div>
                        </div>
                      </div>

                      {spots !== null && spots <= 3 && spots > 0 && (
                        <div className="text-sm text-orange-600 font-medium">Only {spots} spots remaining</div>
                      )}
                      {spots === 0 && <div className="text-sm text-red-600 font-medium">This course is full</div>}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/portal/sme/courses/browse/${course.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <BookOpen className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      {(spots === null || spots > 0) && (
                        <Link href={`/portal/sme/courses/enroll/${course.id}`}>
                          <Button variant="default" size="sm" className="w-full">Enroll Now</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
