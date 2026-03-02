"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, CheckCircle, FolderKanban } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

interface ProjectDisplay {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  teamIds: string[];
  milestonesCompleted: number;
  milestonesTotal: number;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "at-risk":
      return <Badge className="bg-orange-100 text-orange-800">At Risk</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    case "on-hold":
      return <Badge className="bg-gray-100 text-gray-800">On Hold</Badge>;
    case "planning":
      return <Badge className="bg-purple-100 text-purple-800">Planning</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatDate(date: Date | Timestamp | undefined): string {
  if (!date) return "Not set";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!db) return;
      
      try {
        const projectsRef = collection(db, COLLECTIONS.PROJECTS);
        const projectsQuery = query(projectsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(projectsQuery);
        
        const projectList: ProjectDisplay[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Untitled Project",
            client: data.organizationName || data.client || "No client",
            status: data.status || "active",
            progress: data.progress || 0,
            startDate: data.startDate instanceof Timestamp 
              ? data.startDate.toDate().toISOString() 
              : data.startDate || "",
            endDate: data.endDate instanceof Timestamp 
              ? data.endDate.toDate().toISOString() 
              : data.endDate || "",
            teamIds: data.teamIds || [],
            milestonesCompleted: data.milestonesCompleted || 0,
            milestonesTotal: data.milestonesTotal || 0,
          };
        });
        
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjects();
  }, []);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const atRiskCount = projects.filter((p) => p.status === "at-risk").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Track and manage active client engagements
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{atRiskCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button asChild>
              <Link href="/portal/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      <Link href={`/portal/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{project.client}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{project.endDate ? formatDate(new Date(project.endDate)) : "No end date"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {project.milestonesCompleted}/{project.milestonesTotal} milestones
                    </span>
                  </div>
                </div>

                {/* Team & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.teamIds.length > 0 ? (
                      project.teamIds.slice(0, 3).map((_, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            T{i + 1}
                          </AvatarFallback>
                        </Avatar>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No team assigned</span>
                    )}
                    {project.teamIds.length > 3 && (
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          +{project.teamIds.length - 3}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/portal/projects/${project.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
