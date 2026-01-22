"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Award, BookOpen, Users } from "lucide-react";

interface FacilitatorCardProps {
  name: string;
  bio?: string;
  image?: string;
  email?: string;
  title?: string;
  stats?: {
    totalCohorts?: number;
    totalStudents?: number;
    averageRating?: number;
  };
  variant?: "default" | "compact" | "detailed";
}

export function FacilitatorCard({
  name,
  bio,
  image,
  email,
  title,
  stats,
  variant = "default",
}: FacilitatorCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          {title && (
            <p className="text-xs text-muted-foreground truncate">{title}</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{name}</CardTitle>
              {title && (
                <CardDescription className="text-base mt-1">{title}</CardDescription>
              )}
              {email && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bio && (
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
            </div>
          )}

          {stats && (
            <div>
              <h4 className="font-semibold mb-3">Teaching Stats</h4>
              <div className="grid grid-cols-3 gap-4">
                {stats.totalCohorts !== undefined && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold">{stats.totalCohorts}</div>
                    <div className="text-xs text-muted-foreground">Cohorts</div>
                  </div>
                )}
                {stats.totalStudents !== undefined && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                )}
                {stats.averageRating !== undefined && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Award className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="text-xl">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{name}</CardTitle>
            {title && <CardDescription>{title}</CardDescription>}
          </div>
          {stats?.averageRating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {stats.averageRating.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      {bio && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{bio}</p>
          {stats && (stats.totalCohorts || stats.totalStudents) && (
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {stats.totalCohorts !== undefined && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {stats.totalCohorts} cohorts
                </span>
              )}
              {stats.totalStudents !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats.totalStudents} students
                </span>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
