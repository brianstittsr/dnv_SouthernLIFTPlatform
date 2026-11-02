"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Award,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import type { Course } from "@/types/courses";

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progress?: number;
  enrolled?: boolean;
  variant?: "default" | "compact" | "detailed";
  onEnroll?: () => void;
  onView?: () => void;
}

export function CourseCard({
  course,
  showProgress = false,
  progress = 0,
  enrolled = false,
  variant = "default",
  onEnroll,
  onView,
}: CourseCardProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "TBD";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSpotsRemaining = () => {
    if (!course.maxParticipants) return null;
    return course.maxParticipants - course.currentParticipants;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "enrolling":
      case "published":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      case "draft":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="line-clamp-1 mt-1">
                {course.facilitatorName}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(course.status)}>
              {course.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(course.courseStartDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.currentParticipants}/{course.maxParticipants}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={enrolled ? "outline" : "default"}
            onClick={enrolled ? onView : onEnroll}
          >
            {enrolled ? "View Course" : course.isFree ? "Enroll Free" : formatPrice(course.priceInCents)}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {course.thumbnailUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
          {enrolled && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Enrolled
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(course.difficultyLevel)}>
                {course.difficultyLevel}
              </Badge>
              <Badge className={getStatusColor(course.status)}>
                {course.status}
              </Badge>
            </div>
            <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {course.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Facilitated by {course.facilitatorName}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(course.courseStartDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{course.estimatedDurationWeeks} weeks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Enrollment</p>
              <p className="font-medium">
                {course.currentParticipants}/{course.maxParticipants}
              </p>
            </div>
          </div>

          {!course.isFree && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-medium">{formatPrice(course.priceInCents)}</p>
              </div>
            </div>
          )}
        </div>

        {getSpotsRemaining() !== null && getSpotsRemaining()! <= 5 && getSpotsRemaining()! > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <TrendingUp className="h-4 w-4" />
            <span>Only {getSpotsRemaining()} spots remaining!</span>
          </div>
        )}

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {enrolled ? (
          <>
            <Button className="flex-1" onClick={onView}>
              Continue Learning
            </Button>
            <Link href={`/courses/${course.slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={`/courses/${course.slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
            <Button className="flex-1" onClick={onEnroll}>
              {course.isFree ? "Enroll Free" : `Enroll - ${formatPrice(course.priceInCents)}`}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
