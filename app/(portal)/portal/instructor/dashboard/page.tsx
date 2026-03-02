"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { 
  mockInstructorCohorts,
  mockInstructorStats,
  mockInstructorReviews,
  mockUpcomingSessions
} from "@/lib/mock-data/instructor-mock-data";
import Link from "next/link";

interface Cohort {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  startDate: any;
  endDate: any;
  duration: number;
  maxParticipants: number;
  currentEnrollment: number;
  status: "scheduled" | "active" | "completed" | "cancelled";
  level: string;
  completedSessions: number;
  totalSessions: number;
  averageAttendance?: number;
  averageScore?: number;
  upcomingSession?: {
    date: any;
    topic: string;
    duration: number;
  };
  createdAt: any;
  updatedAt: any;
}

export default function InstructorDashboardPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setCohorts(mockInstructorCohorts as Cohort[]);
      setStats(mockInstructorStats);
      setReviews(mockInstructorReviews);
      setUpcomingSessions(mockUpcomingSessions);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Load cohorts
      const cohortsQuery = query(
        collection(db, "cmmcCohorts"),
        where("instructorId", "==", profile.id)
      );
      const cohortsSnapshot = await getDocs(cohortsQuery);
      const cohortsData = cohortsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cohort[];
      setCohorts(cohortsData);

      // Calculate stats
      const totalCohorts = cohortsData.length;
      const activeCohorts = cohortsData.filter(c => c.status === "active").length;
      const totalStudents = cohortsData.reduce((sum, c) => sum + c.currentEnrollment, 0);
      
      setStats({
        totalCohorts,
        activeCohorts,
        totalStudents,
        completionRate: 0,
        averageRating: 0,
        totalRevenue: 0,
        upcomingSessions: 0,
        pendingReviews: 0,
      });

      setReviews([]);
      setUpcomingSessions([]);
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load instructor data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: { variant: "outline", color: "text-blue-600" },
      active: { variant: "default", color: "text-green-600" },
      completed: { variant: "secondary", color: "text-gray-600" },
      cancelled: { variant: "destructive", color: "text-red-600" },
    };
    const config = variants[status] || variants.scheduled;
    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage your cohorts and track student progress</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cohorts</p>
                  <p className="text-2xl font-bold">{stats.totalCohorts}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Cohorts */}
          <Card>
            <CardHeader>
              <CardTitle>My Cohorts</CardTitle>
              <CardDescription>Manage your teaching cohorts</CardDescription>
            </CardHeader>
            <CardContent>
              {cohorts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No cohorts found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cohorts.map((cohort) => (
                    <div key={cohort.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{cohort.title}</h4>
                            {getStatusBadge(cohort.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{cohort.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Enrollment</p>
                          <p className="text-sm font-medium">{cohort.currentEnrollment}/{cohort.maxParticipants} students</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium">{cohort.duration} weeks</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Start Date</p>
                          <p className="text-sm font-medium">{formatDate(cohort.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">End Date</p>
                          <p className="text-sm font-medium">{formatDate(cohort.endDate)}</p>
                        </div>
                      </div>

                      {cohort.status === "active" && (
                        <>
                          <Separator className="my-3" />
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Session Progress</span>
                              <span className="text-sm text-muted-foreground">
                                {cohort.completedSessions}/{cohort.totalSessions} sessions
                              </span>
                            </div>
                            <Progress value={getProgressPercentage(cohort.completedSessions, cohort.totalSessions)} className="h-2" />
                          </div>

                          {cohort.averageAttendance !== undefined && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Avg Attendance</p>
                                <p className="text-sm font-semibold text-blue-600">{cohort.averageAttendance}%</p>
                              </div>
                              {cohort.averageScore !== undefined && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Avg Score</p>
                                  <p className="text-sm font-semibold text-green-600">{cohort.averageScore}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {cohort.upcomingSession && (
                            <>
                              <Separator className="my-3" />
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Next Session:</span>
                                <span className="text-muted-foreground">
                                  {cohort.upcomingSession.topic} - {formatDate(cohort.upcomingSession.date)}
                                </span>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {cohort.status === "completed" && cohort.averageScore !== undefined && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900">Cohort Completed</p>
                              <p className="text-xs text-green-700">Final Average Score: {cohort.averageScore}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Student feedback on your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{review.studentName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{review.cohortTitle}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      {review.helpful > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">{review.helpful} found this helpful</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your next classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">{session.topic}</p>
                          <p className="text-xs text-muted-foreground mb-2">{session.cohortTitle}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.date)} at {session.startTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Users className="h-3 w-3" />
                            <span>{session.enrolledCount} students</span>
                          </div>
                          {session.materialsReady ? (
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Materials ready</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-yellow-600 mt-2">
                              <AlertCircle className="h-3 w-3" />
                              <span>Prepare materials</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Summary */}
          {stats && stats.completionRate > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Your teaching metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="text-sm font-semibold">{stats.completionRate}%</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Active Cohorts</span>
                    <span className="text-sm font-semibold">{stats.activeCohorts}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Upcoming Sessions</span>
                    <span className="text-sm font-semibold">{stats.upcomingSessions}</span>
                  </div>
                </div>
                {stats.pendingReviews > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Pending Reviews</span>
                        <span className="text-sm font-semibold">{stats.pendingReviews}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
