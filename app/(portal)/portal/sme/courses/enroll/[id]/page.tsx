"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Loader2, 
  BookOpen, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  startDate: any;
  endDate: any;
  duration: number;
  maxParticipants: number;
  currentEnrollment: number;
  status: string;
  price: number;
  level: string;
}

const MOCK_COURSES: Record<string, Course> = {
  "mock-1": {
    id: "mock-1",
    title: "CMMC Level 1 Certification - Spring 2026",
    description: "Comprehensive 12-week program covering all CMMC Level 1 requirements including access control, incident response, and system protection.",
    instructorId: "instructor-1",
    instructorName: "James Thompson",
    startDate: Timestamp.fromDate(new Date("2026-03-15")),
    endDate: Timestamp.fromDate(new Date("2026-06-07")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 14,
    status: "published",
    price: 3500,
    level: "beginner"
  },
  "mock-2": {
    id: "mock-2",
    title: "CMMC Level 2 Advanced Training",
    description: "Advanced 12-week course for organizations pursuing CMMC Level 2 certification. Covers advanced security controls and compliance requirements.",
    instructorId: "instructor-2",
    instructorName: "Sarah Chen",
    startDate: Timestamp.fromDate(new Date("2026-04-01")),
    endDate: Timestamp.fromDate(new Date("2026-06-24")),
    duration: 12,
    maxParticipants: 15,
    currentEnrollment: 8,
    status: "published",
    price: 4500,
    level: "advanced"
  },
  "mock-3": {
    id: "mock-3",
    title: "CMMC Fundamentals - Fast Track",
    description: "Accelerated 8-week program for small businesses new to CMMC compliance. Perfect for getting started quickly.",
    instructorId: "instructor-1",
    instructorName: "James Thompson",
    startDate: Timestamp.fromDate(new Date("2026-02-15")),
    endDate: Timestamp.fromDate(new Date("2026-04-10")),
    duration: 8,
    maxParticipants: 25,
    currentEnrollment: 22,
    status: "active",
    price: 2500,
    level: "beginner"
  },
  "mock-4": {
    id: "mock-4",
    title: "CMMC Policy Development Workshop",
    description: "Specialized 12-week course focused on developing compliant security policies and procedures for CMMC certification.",
    instructorId: "instructor-3",
    instructorName: "Michael Rodriguez",
    startDate: Timestamp.fromDate(new Date("2026-05-01")),
    endDate: Timestamp.fromDate(new Date("2026-07-24")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 5,
    status: "published",
    price: 3800,
    level: "intermediate"
  }
};

export default function EnrollCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [useMockData, setUseMockData] = useState(id.startsWith("mock-"));

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    
    // Check if this is a mock course
    if (id.startsWith("mock-")) {
      const mockCourse = MOCK_COURSES[id];
      if (mockCourse) {
        setCourse(mockCourse);
      } else {
        toast.error("Course not found");
        router.push("/portal/sme/courses/browse");
      }
      setLoading(false);
      return;
    }

    // Load from Firebase
    if (!db) {
      setLoading(false);
      return;
    }
    
    try {
      const courseDoc = await getDoc(doc(db, "cmmcCourses", id));
      
      if (!courseDoc.exists()) {
        toast.error("Course not found");
        router.push("/portal/sme/courses/browse");
        return;
      }
      
      setCourse({
        id: courseDoc.id,
        ...courseDoc.data()
      } as Course);
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course");
      router.push("/portal/sme/courses/browse");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course || !agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setEnrolling(true);

    try {
      // Handle mock data enrollment
      if (useMockData) {
        // Simulate enrollment delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success("Successfully enrolled in course!");
        router.push("/portal/sme/courses");
        return;
      }

      // Handle live data enrollment
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        toast.error("Please sign in to enroll");
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/courses/${id}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentType,
          stripeSessionId: null, // TODO: Integrate Stripe payment
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to enroll");
      }

      toast.success("Successfully enrolled in course!");
      router.push("/portal/sme/courses");
    } catch (error: any) {
      console.error("Error enrolling:", error);
      toast.error(error.message || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const getAvailableSpots = () => {
    if (!course) return 0;
    return course.maxParticipants - course.currentEnrollment;
  };

  const getInstallmentAmount = () => {
    if (!course) return 0;
    return Math.ceil(course.price / 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/portal/sme/courses/browse">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/portal/sme/courses/browse">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Enroll in Course</h1>
        <p className="text-muted-foreground">Complete your enrollment for this CMMC training program</p>
      </div>

      <div className="grid gap-6">
        {/* Course Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Instructor</div>
                <div className="font-medium">{course.instructorName || "TBD"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {course.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration} weeks
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Available Spots</div>
                <div className="font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {getAvailableSpots()} / {course.maxParticipants}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
            <CardDescription>Choose how you'd like to pay for this course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Pay in Full</div>
                      <div className="text-sm text-muted-foreground">One-time payment</div>
                    </div>
                    <div className="text-lg font-bold flex items-center">
                      <DollarSign className="h-5 w-5" />
                      {course.price.toLocaleString()}
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="installment" id="installment" />
                <Label htmlFor="installment" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">3-Month Installment Plan</div>
                      <div className="text-sm text-muted-foreground">Pay over 3 months</div>
                    </div>
                    <div className="text-lg font-bold flex items-center">
                      <DollarSign className="h-5 w-5" />
                      {getInstallmentAmount().toLocaleString()} × 3
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <Separator />

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the terms and conditions, including the refund policy and attendance requirements.
                I understand that I must complete at least 80% of the curriculum to receive a certificate.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Course Price</span>
              <span className="font-medium">${course.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">
                {paymentType === "full" ? "Pay in Full" : "3-Month Installment"}
              </span>
            </div>
            {paymentType === "installment" && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">First Payment</span>
                <span className="font-medium">${getInstallmentAmount().toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Due Today</span>
              <span className="flex items-center">
                <DollarSign className="h-5 w-5" />
                {paymentType === "full" 
                  ? course.price.toLocaleString() 
                  : getInstallmentAmount().toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/portal/sme/courses/browse" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button 
            className="flex-1" 
            onClick={handleEnroll}
            disabled={!agreedToTerms || enrolling || getAvailableSpots() === 0}
          >
            {enrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Enrollment
              </>
            )}
          </Button>
        </div>

        {getAvailableSpots() === 0 && (
          <div className="text-center text-red-600 font-medium">
            This course is full and no longer accepting enrollments
          </div>
        )}
      </div>
    </div>
  );
}
