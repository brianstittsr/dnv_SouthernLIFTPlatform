"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCartStore } from "@/lib/cart-store";
import {
  Loader2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ShoppingCart,
  Check,
  Play,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  facilitatorName: string;
  facilitatorBio?: string;
  facilitatorImage?: string;
  courseStartDate: string | null;
  courseEndDate: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  estimatedDurationWeeks: number | null;
  status: string;
  difficultyLevel: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  isFree: boolean;
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  thumbnailUrl?: string;
  outline: { id: string; title: string; description?: string; sessions: { id: string; title: string; type?: string }[] }[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const { addItem, isInCart } = useCartStore();

  useEffect(() => {
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lms/courses/${slug}`);
      const payload = await response.json();
      if (!response.ok) {
        toast.error("Course not found");
        router.push("/courses");
        return;
      }
      setCourse(payload.data);
    } catch (error: unknown) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const handleAddToCart = () => {
    if (!course) return;
    if (course.isFree) {
      toast.info("This is a free course. You can enroll directly.");
      return;
    }
    addItem({
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      priceInCents: course.priceInCents,
      compareAtPriceInCents: course.compareAtPriceInCents,
      thumbnailUrl: course.thumbnailUrl,
      estimatedDurationWeeks: course.estimatedDurationWeeks ?? 0,
      difficultyLevel: course.difficultyLevel,
    });
    toast.success("Added to cart!");
  };

  const getSpotsRemaining = () => {
    if (!course || !course.maxParticipants) return null;
    return course.maxParticipants - course.currentParticipants;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Course not found</p>
            <Button onClick={() => router.push("/courses")} className="mt-4">
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spotsRemaining = getSpotsRemaining();
  const inCart = isInCart(course.id);
  const modules = course.outline ?? [];
  const totalSessions = modules.reduce((acc, m) => acc + m.sessions.length, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back to Courses
      </Button>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8 mb-8">
        <div>
          {course.thumbnailUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize">{course.difficultyLevel}</Badge>
            {course.compareAtPriceInCents && (
              <Badge variant="destructive">
                Save {Math.round(((course.compareAtPriceInCents - course.priceInCents) / course.compareAtPriceInCents) * 100)}%
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(course.courseStartDate)} - {formatDate(course.courseEndDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{course.estimatedDurationWeeks ? `${course.estimatedDurationWeeks} weeks` : "Self-paced"}</span>
            </div>
            {spotsRemaining !== null && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{spotsRemaining > 0 ? `${spotsRemaining} spots remaining` : "Fully booked"}</span>
              </div>
            )}
          </div>

          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment Card */}
        <Card className="h-fit sticky top-4">
          <CardHeader>
            <div className="text-center">
              {course.isFree ? (
                <div className="text-3xl font-bold text-green-600 mb-2">Free</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary mb-2">{formatPrice(course.priceInCents)}</div>
                  {course.compareAtPriceInCents && (
                    <div className="text-lg text-muted-foreground line-through">
                      {formatPrice(course.compareAtPriceInCents)}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!course.isFree && (
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={inCart || (spotsRemaining !== null && spotsRemaining <= 0)}
              >
                {inCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" className="w-full" size="lg" asChild>
              <Link href="/sign-in">
                <Play className="mr-2 h-5 w-5" />
                Enroll to Access
              </Link>
            </Button>

            <div className="pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{course.estimatedDurationWeeks ? `${course.estimatedDurationWeeks} weeks` : "Self-paced"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules:</span>
                <span className="font-medium">{modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions:</span>
                <span className="font-medium">{totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span className="font-medium capitalize">{course.difficultyLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What You&apos;ll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                {modules.length} modules • {totalSessions} sessions — enroll to access content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  Curriculum details will be provided upon enrollment.
                </p>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, idx) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Module {idx + 1}</Badge>
                            <h3 className="font-semibold">{module.title}</h3>
                          </div>
                          {module.description && (
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{module.sessions.length} sessions</Badge>
                      </div>

                      {module.sessions.length > 0 && (
                        <div className="mt-3 space-y-1 pl-4">
                          {module.sessions.map((session) => (
                            <div key={session.id} className="flex items-center gap-2 text-sm py-1">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1">{session.title}</span>
                              {session.type && (
                                <span className="text-muted-foreground capitalize text-xs">{session.type}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructor">
          <Card>
            <CardHeader>
              <CardTitle>Your Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={course.facilitatorImage} />
                  <AvatarFallback className="text-2xl">
                    {(course.facilitatorName || "L I").split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{course.facilitatorName || "LIFT Instructor"}</h3>
                  {course.facilitatorBio && (
                    <p className="text-muted-foreground whitespace-pre-wrap">{course.facilitatorBio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
