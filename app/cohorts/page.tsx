"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCartButton } from "@/components/cohorts/shopping-cart";
import { useCartStore } from "@/lib/cart-store";
import { Loader2, ShoppingCart, Check, Calendar, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Cohort {
  id: string;
  title: string;
  slug: string;
  description: string;
  facilitatorName: string;
  cohortStartDate: any;
  cohortEndDate: any;
  maxParticipants: number;
  currentParticipants: number;
  estimatedDurationWeeks: number;
  status: string;
  difficultyLevel: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  isFree: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  isPublished: boolean;
}

export default function CohortCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const { addItem, isInCart } = useCartStore();

  useEffect(() => {
    loadCohorts();
  }, []);

  const loadCohorts = async () => {
    if (!db) return;

    try {
      setLoading(true);
      // Simplified query to avoid composite index requirement
      const q = query(
        collection(db, "cohorts"),
        where("isPublished", "==", true)
      );

      const snapshot = await getDocs(q);
      let cohortsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cohort[];

      // Filter by status in code
      cohortsData = cohortsData.filter(c => c.status === "published");
      
      // Sort by start date in code
      cohortsData.sort((a, b) => {
        const dateA = a.cohortStartDate?.toDate?.() || new Date(a.cohortStartDate);
        const dateB = b.cohortStartDate?.toDate?.() || new Date(b.cohortStartDate);
        return dateA.getTime() - dateB.getTime();
      });

      setCohorts(cohortsData);
    } catch (error: any) {
      console.error("Error loading cohorts:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddToCart = (cohort: Cohort) => {
    if (cohort.isFree) {
      toast.info("This is a free course. You can enroll directly.");
      return;
    }

    addItem({
      cohortId: cohort.id,
      title: cohort.title,
      slug: cohort.slug,
      priceInCents: cohort.priceInCents,
      compareAtPriceInCents: cohort.compareAtPriceInCents,
      thumbnailUrl: cohort.thumbnailUrl,
      estimatedDurationWeeks: cohort.estimatedDurationWeeks,
      difficultyLevel: cohort.difficultyLevel,
    });

    toast.success("Added to cart!");
  };

  const getSpotsRemaining = (cohort: Cohort) => {
    if (!cohort.maxParticipants) return null;
    return cohort.maxParticipants - cohort.currentParticipants;
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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">CMMC Training Courses</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive CMMC certification training for defense contractors
          </p>
        </div>
        <ShoppingCartButton />
      </div>

      {/* Featured Banner */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Complete CMMC Certification Path</h2>
              <p className="text-muted-foreground mb-4">
                Master all three CMMC levels with our comprehensive training program
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">Level 1</Badge>
                <Badge variant="secondary">Level 2</Badge>
                <Badge variant="secondary">Level 3</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Bundle Price</p>
              <p className="text-3xl font-bold text-primary">Save 25%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {cohorts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No courses available at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => {
            const spotsRemaining = getSpotsRemaining(cohort);
            const inCart = isInCart(cohort.id);

            return (
              <Card key={cohort.id} className="flex flex-col hover:shadow-lg transition-shadow">
                {cohort.thumbnailUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={cohort.thumbnailUrl}
                      alt={cohort.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                      {cohort.difficultyLevel}
                    </Badge>
                    {cohort.compareAtPriceInCents && (
                      <Badge variant="destructive">
                        Save {Math.round(((cohort.compareAtPriceInCents - cohort.priceInCents) / cohort.compareAtPriceInCents) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{cohort.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {cohort.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(cohort.cohortStartDate)} - {formatDate(cohort.cohortEndDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{cohort.estimatedDurationWeeks} weeks</span>
                    </div>
                    {spotsRemaining !== null && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {spotsRemaining > 0 
                            ? `${spotsRemaining} spots remaining` 
                            : "Fully booked"}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Instructor: {cohort.facilitatorName}
                    </div>
                  </div>

                  {cohort.tags && cohort.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {cohort.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {cohort.isFree ? (
                          <span className="text-2xl font-bold text-green-600">Free</span>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-primary">
                              {formatPrice(cohort.priceInCents)}
                            </span>
                            {cohort.compareAtPriceInCents && (
                              <span className="ml-2 text-sm text-muted-foreground line-through">
                                {formatPrice(cohort.compareAtPriceInCents)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/cohorts/${cohort.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {!cohort.isFree && (
                        <Button
                          className="flex-1"
                          onClick={() => handleAddToCart(cohort)}
                          disabled={inCart || (spotsRemaining !== null && spotsRemaining <= 0)}
                        >
                          {inCart ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Why Choose Our CMMC Training?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Expert Instructors</h3>
              <p className="text-sm text-muted-foreground">
                Learn from certified CMMC professionals with real-world experience
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comprehensive Curriculum</h3>
              <p className="text-sm text-muted-foreground">
                Complete coverage of all CMMC requirements and best practices
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Certification Ready</h3>
              <p className="text-sm text-muted-foreground">
                Prepare for official CMMC assessment with confidence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
