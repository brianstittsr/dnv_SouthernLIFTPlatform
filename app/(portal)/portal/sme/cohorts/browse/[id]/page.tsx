"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  BookOpen, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Award,
  Video,
  FileText,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Cohort {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  instructorBio?: string;
  instructorAvatar?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number;
  maxParticipants: number;
  currentEnrollment: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  syllabus?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  schedule?: string;
  materials?: string[];
}

const MOCK_COHORTS: Record<string, Cohort> = {
  "mock-1": {
    id: "mock-1",
    title: "CMMC Level 1 Certification - Spring 2026",
    description: "Comprehensive 12-week program covering all CMMC Level 1 requirements including access control, incident response, and system protection. This intensive cohort will prepare your organization for CMMC Level 1 certification with hands-on training, real-world scenarios, and expert guidance.",
    instructorId: "instructor-1",
    instructorName: "James Thompson",
    instructorBio: "Former DoD cybersecurity specialist with 15+ years of experience in CMMC compliance and implementation. Certified CMMC Assessor (CCA) and has helped over 100 organizations achieve certification.",
    instructorAvatar: "/avatars/instructor-1.jpg",
    startDate: Timestamp.fromDate(new Date("2026-03-15")),
    endDate: Timestamp.fromDate(new Date("2026-06-07")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 14,
    status: "published",
    price: 3500,
    level: "beginner",
    syllabus: [
      "Week 1-2: Introduction to CMMC and Access Control",
      "Week 3-4: Identification and Authentication",
      "Week 5-6: Media Protection and Physical Protection",
      "Week 7-8: System and Communications Protection",
      "Week 9-10: System and Information Integrity",
      "Week 11: Incident Response Planning",
      "Week 12: Final Assessment and Certification Prep"
    ],
    learningObjectives: [
      "Understand CMMC Level 1 requirements and framework",
      "Implement basic cybersecurity hygiene practices",
      "Develop compliant access control policies",
      "Create incident response procedures",
      "Prepare documentation for certification audit",
      "Pass CMMC Level 1 assessment"
    ],
    prerequisites: [
      "Basic understanding of cybersecurity concepts",
      "Access to organizational IT systems",
      "Commitment to attend weekly sessions",
      "Willingness to implement changes in your organization"
    ],
    schedule: "Live sessions every Tuesday and Thursday, 2:00 PM - 4:00 PM EST. Recorded sessions available for review.",
    materials: [
      "CMMC Level 1 Compliance Guide (PDF)",
      "Access Control Policy Templates",
      "Incident Response Plan Template",
      "System Security Plan (SSP) Template",
      "Weekly Assessment Quizzes",
      "Final Certification Exam"
    ]
  },
  "mock-2": {
    id: "mock-2",
    title: "CMMC Level 2 Advanced Training",
    description: "Advanced 12-week cohort for organizations pursuing CMMC Level 2 certification. Covers advanced security controls and compliance requirements.",
    instructorId: "instructor-2",
    instructorName: "Sarah Chen",
    instructorBio: "Cybersecurity consultant specializing in CMMC Level 2 and 3 implementations. Former NIST researcher with expertise in advanced security controls.",
    startDate: Timestamp.fromDate(new Date("2026-04-01")),
    endDate: Timestamp.fromDate(new Date("2026-06-24")),
    duration: 12,
    maxParticipants: 15,
    currentEnrollment: 8,
    status: "published",
    price: 4500,
    level: "advanced",
    syllabus: [
      "Week 1-2: CMMC Level 2 Overview and Advanced Access Control",
      "Week 3-4: Audit and Accountability",
      "Week 5-6: Configuration Management",
      "Week 7-8: Risk Assessment and Security Assessment",
      "Week 9-10: System and Information Integrity",
      "Week 11: Continuous Monitoring",
      "Week 12: Final Assessment and Advanced Certification Prep"
    ],
    learningObjectives: [
      "Master CMMC Level 2 requirements",
      "Implement advanced security controls",
      "Develop comprehensive security policies",
      "Conduct risk assessments",
      "Establish continuous monitoring programs"
    ],
    prerequisites: [
      "CMMC Level 1 certification or equivalent knowledge",
      "Experience with cybersecurity frameworks",
      "IT management or security role in organization"
    ],
    schedule: "Live sessions every Monday and Wednesday, 1:00 PM - 3:30 PM EST",
    materials: [
      "CMMC Level 2 Implementation Guide",
      "Advanced Security Control Templates",
      "Risk Assessment Framework",
      "Continuous Monitoring Tools"
    ]
  }
};

export default function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCohort();
  }, [id]);

  const loadCohort = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try mock data first
      if (MOCK_COHORTS[id]) {
        setCohort(MOCK_COHORTS[id]);
        setLoading(false);
        return;
      }

      // Load from Firestore
      if (!db) {
        setError("Database not initialized");
        setLoading(false);
        return;
      }

      const cohortDoc = await getDoc(doc(db, "cmmcCohorts", id));
      if (!cohortDoc.exists()) {
        setError("Cohort not found");
        setLoading(false);
        return;
      }

      setCohort({ id: cohortDoc.id, ...cohortDoc.data() } as Cohort);
    } catch (err: any) {
      console.error("Error loading cohort:", err);
      setError(err.message || "Failed to load cohort");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    router.push(`/portal/sme/cohorts/enroll/${id}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      beginner: "secondary",
      intermediate: "default",
      advanced: "destructive",
    };
    return variants[level] || "secondary";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: "outline",
      published: "default",
      active: "default",
      completed: "secondary",
      archived: "outline",
    };
    return variants[status] || "outline";
  };

  const getSpotsRemaining = () => {
    if (!cohort) return 0;
    return cohort.maxParticipants - cohort.currentEnrollment;
  };

  const getEnrollmentPercentage = () => {
    if (!cohort) return 0;
    return Math.round((cohort.currentEnrollment / cohort.maxParticipants) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Cohort Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || "The requested cohort could not be found."}</p>
            <Button asChild>
              <Link href="/portal/sme/cohorts/browse">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/portal/sme/cohorts/browse">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{cohort.title}</h1>
              <Badge variant={getStatusBadge(cohort.status)}>
                {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
              </Badge>
              <Badge variant={getLevelBadge(cohort.level)}>
                {cohort.level.charAt(0).toUpperCase() + cohort.level.slice(1)}
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground mb-4">{cohort.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                  <CardDescription>What you'll achieve in this cohort</CardDescription>
                </CardHeader>
                <CardContent>
                  {cohort.learningObjectives && cohort.learningObjectives.length > 0 ? (
                    <ul className="space-y-2">
                      {cohort.learningObjectives.map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No learning objectives specified.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                  <CardDescription>What you need before enrolling</CardDescription>
                </CardHeader>
                <CardContent>
                  {cohort.prerequisites && cohort.prerequisites.length > 0 ? (
                    <ul className="space-y-2">
                      {cohort.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No prerequisites required.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>Class timing and format</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{cohort.schedule || "Schedule details will be provided upon enrollment."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="syllabus" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Syllabus</CardTitle>
                  <CardDescription>{cohort.duration} weeks of comprehensive training</CardDescription>
                </CardHeader>
                <CardContent>
                  {cohort.syllabus && cohort.syllabus.length > 0 ? (
                    <div className="space-y-4">
                      {cohort.syllabus.map((week, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{week}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Syllabus details will be provided upon enrollment.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{cohort.instructorName}</h3>
                      <p className="text-muted-foreground">
                        {cohort.instructorBio || "Experienced CMMC instructor and cybersecurity professional."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                  <CardDescription>Resources included with enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  {cohort.materials && cohort.materials.length > 0 ? (
                    <div className="space-y-2">
                      {cohort.materials.map((material, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span>{material}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Course materials will be provided upon enrollment.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold">{formatCurrency(cohort.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Enrollment</span>
                  <span className="text-sm font-semibold">
                    {cohort.currentEnrollment}/{cohort.maxParticipants}
                  </span>
                </div>
                <Progress value={getEnrollmentPercentage()} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {getSpotsRemaining()} spots remaining
                </p>
              </div>

              <Separator />

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleEnroll}
                disabled={enrolling || getSpotsRemaining() === 0}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : getSpotsRemaining() === 0 ? (
                  "Cohort Full"
                ) : (
                  "Enroll Now"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Cohort Details */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(cohort.startDate)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(cohort.endDate)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{cohort.duration} weeks</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Class Size</p>
                  <p className="text-sm text-muted-foreground">Max {cohort.maxParticipants} participants</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-sm text-muted-foreground capitalize">{cohort.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Have questions about this cohort? Contact our support team.
              </p>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
