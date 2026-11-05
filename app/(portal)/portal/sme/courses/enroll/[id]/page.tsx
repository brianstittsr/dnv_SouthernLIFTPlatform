"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Calendar, Clock, Users, ArrowLeft, CreditCard, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  facilitatorName: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  estimatedDurationWeeks: number | null;
  status: string;
  priceInCents: number;
  isFree: boolean;
}

export default function EnrollCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lms/courses/${id}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Course not found");
      setCourse(payload.data);
    } catch (err: any) {
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      toast.error("Please sign in to enroll");
      router.push("/sign-in");
      return;
    }

    setEnrolling(true);
    try {
      const token = await currentUser.getIdToken();

      if (course.isFree || course.priceInCents === 0) {
        const response = await fetch(`/api/lms/courses/${id}/enroll`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        if (!response.ok) {
          if (payload.checkoutRequired) {
            await startCheckout(token);
            return;
          }
          throw new Error(payload.error || "Failed to enroll");
        }
        toast.success("You're enrolled!");
        router.push(`/portal/sme/courses/${id}`);
        return;
      }

      await startCheckout(token);
    } catch (err: any) {
      console.error("Error enrolling:", err);
      toast.error(err.message || "Failed to enroll");
      setEnrolling(false);
    }
  };

  const startCheckout = async (token: string) => {
    const response = await fetch("/api/stripe/course-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseIds: [id] }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Failed to start checkout");
    }
    window.location.href = payload.url;
  };

  const spotsRemaining = () => (course?.maxParticipants ? course.maxParticipants - course.currentParticipants : null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || "This course doesn't exist or has been removed."}</p>
            <Link href="/portal/sme/courses/browse">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spots = spotsRemaining();
  const priceLabel = course.isFree ? "Free" : `$${(course.priceInCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href={`/portal/sme/courses/browse/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Enroll in Course</h1>
        <p className="text-muted-foreground">Complete your enrollment for this training program</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Instructor</div>
                <div className="font-medium">{course.facilitatorName || "TBD"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {course.courseStartDate
                    ? new Date(course.courseStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "TBD"}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Course Price</span>
              <span className="font-medium">{priceLabel}</span>
            </div>
            <Separator />
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the terms and conditions, including the refund policy and completion requirements.
                I understand that I must complete the full curriculum to receive a certificate.
              </Label>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Due Today</span>
              <span>{priceLabel}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href={`/portal/sme/courses/browse/${id}`} className="flex-1">
            <Button variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button className="flex-1" onClick={handleEnroll} disabled={!agreedToTerms || enrolling || spots === 0}>
            {enrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : course.isFree ? (
              <>
                <GraduationCap className="mr-2 h-4 w-4" />
                Enroll Free
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </>
            )}
          </Button>
        </div>

        {spots === 0 && (
          <div className="text-center text-red-600 font-medium">This course is full and no longer accepting enrollments</div>
        )}
      </div>
    </div>
  );
}
