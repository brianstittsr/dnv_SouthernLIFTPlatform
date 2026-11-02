"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  Users,
  Award,
  Clock,
  TrendingUp,
  Loader2,
  Search,
  Download,
  ShieldCheck,
  Video,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CourseRow {
  id: string;
  title: string;
  status: string;
  startDate?: { toDate?: () => Date } | string;
}

interface MembershipRow {
  courseId?: string;
  status?: string;
  completedAt?: { toDate?: () => Date };
  createdAt?: { toDate?: () => Date };
}

interface SessionRow {
  zoomTotalMinutes?: number;
  zoomAttendeeCount?: number;
  zoomMeetingId?: string;
  scheduledDate?: { toDate?: () => Date };
}

interface CertificateRow {
  id: string;
  userName?: string;
  courseTitle?: string;
  certificateNumber?: string;
  completionDate?: { toDate?: () => Date };
  status?: string;
}

const STATUS_COLORS: Record<string, string> = {
  published: "#16a34a",
  "in-progress": "#2563eb",
  draft: "#9ca3af",
  completed: "#7c3aed",
  archived: "#d1d5db",
};

export default function LmsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [certSearch, setCertSearch] = useState("");

  useEffect(() => {
    const firestore = db;
    if (!firestore) return;
    const load = async () => {
      try {
        const [coursesSnap, membershipsSnap, sessionsSnap, certsSnap] = await Promise.all([
          getDocs(collection(firestore, "courses")),
          getDocs(collection(firestore, "course_memberships")),
          getDocs(collection(firestore, "course_sessions")),
          getDocs(collection(firestore, "course_certificates")),
        ]);
        setCourses(
          coursesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CourseRow, "id">) }))
        );
        setMemberships(membershipsSnap.docs.map((d) => d.data() as MembershipRow));
        setSessions(sessionsSnap.docs.map((d) => d.data() as SessionRow));
        setCertificates(
          certsSnap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<CertificateRow, "id">) }))
            .sort(
              (a, b) =>
                (b.completionDate?.toDate?.().getTime() ?? 0) -
                (a.completionDate?.toDate?.().getTime() ?? 0)
            )
        );
      } catch (error) {
        console.error("Error loading LMS dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const completions = memberships.filter(
      (m) => m.status === "completed" || m.completedAt
    ).length;
    const zoomMinutes = sessions.reduce((sum, s) => sum + (s.zoomTotalMinutes ?? 0), 0);
    const zoomSessions = sessions.filter((s) => s.zoomMeetingId).length;
    return {
      courses: courses.length,
      published: courses.filter((c) => c.status === "published").length,
      enrollments: memberships.length,
      completions,
      completionRate: memberships.length ? Math.round((completions / memberships.length) * 100) : 0,
      zoomMinutes,
      zoomSessions,
      certificates: certificates.length,
    };
  }, [courses, memberships, sessions, certificates]);

  const enrollmentsByCourse = useMemo(() => {
    const counts = new Map<string, number>();
    memberships.forEach((m) => {
      if (m.courseId) counts.set(m.courseId, (counts.get(m.courseId) ?? 0) + 1);
    });
    const titles = new Map(courses.map((c) => [c.id, c.title]));
    return [...counts.entries()]
      .map(([id, count]) => ({
        name: (titles.get(id) || id.slice(0, 8)).slice(0, 24),
        enrollments: count,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 10);
  }, [courses, memberships]);

  const statusChart = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach((c) => counts.set(c.status || "draft", (counts.get(c.status || "draft") ?? 0) + 1));
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [courses]);

  const filteredCerts = useMemo(() => {
    const term = certSearch.toLowerCase();
    if (!term) return certificates;
    return certificates.filter(
      (c) =>
        c.userName?.toLowerCase().includes(term) ||
        c.courseTitle?.toLowerCase().includes(term) ||
        c.certificateNumber?.toLowerCase().includes(term)
    );
  }, [certificates, certSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LMS Dashboard</h1>
        <p className="text-muted-foreground">
          Training analytics, enrollments, attendance, and certificate registry
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certificates">
            Certificates ({certificates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.courses}</div>
                <p className="text-xs text-muted-foreground">{stats.published} published</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enrollments}</div>
                <p className="text-xs text-muted-foreground">across all courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">{stats.completions} completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  Zoom Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.zoomMinutes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  minutes · {stats.zoomSessions} meetings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.certificates}</div>
                <p className="text-xs text-muted-foreground">issued</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enrollments by course</CardTitle>
                <CardDescription>Top courses by enrollment count</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {enrollmentsByCourse.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-16">
                    No enrollments yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentsByCourse} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="enrollments" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course status</CardTitle>
                <CardDescription>Courses by lifecycle stage</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {statusChart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-16">
                    No courses yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChart}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusChart.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Certificate registry</CardTitle>
                  <CardDescription>
                    Every issued certificate — verify or download the PDF
                  </CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search name, course, or number"
                    value={certSearch}
                    onChange={(e) => setCertSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[140px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No certificates issued yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCerts.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.userName || "—"}
                        </TableCell>
                        <TableCell>{cert.courseTitle || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {cert.certificateNumber || "—"}
                        </TableCell>
                        <TableCell>
                          {cert.completionDate?.toDate?.().toLocaleDateString() || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cert.status === "revoked" ? "destructive" : "secondary"}>
                            {cert.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" title="Download PDF" asChild>
                              <a
                                href={`/api/lms/certificates/${cert.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" title="Verify" asChild>
                              <a
                                href={`/verify/certificate/${cert.certificateNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
