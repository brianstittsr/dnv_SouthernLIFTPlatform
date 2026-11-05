"use client";

import { useState, useEffect, use } from "react";
import { auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmbeddedTrainingViewer } from "@/components/courses/embedded-training-viewer";
import { Loader2, ArrowLeft, Award, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface PlayerSession {
  id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes?: number;
  contentUrl?: string;
  textContent?: string;
  videoUrl?: string;
  zoomJoinUrl?: string;
  zoomStartAt?: string | null;
  isCompleted: boolean;
}

interface PlayerModule {
  id: string;
  title: string;
  description: string;
  sessions: PlayerSession[];
}

interface CurriculumResponse {
  membership: {
    id: string;
    status: string;
    progressPercentage: number;
    completedSessions: number;
    totalSessions: number;
  };
  modules: PlayerModule[];
}

const TYPE_MAP: Record<string, string> = {
  lesson: "text",
  video: "video",
  live: "live",
  zoom: "live",
  quiz: "quiz",
  assignment: "assignment",
  download: "download",
  text: "text",
};

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [certificateId, setCertificateId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) loadCurriculum();
      else {
        setError("Sign in to continue");
        setLoading(false);
      }
    });
    return () => unsubscribe?.();
  }, [id]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await auth?.currentUser?.getIdToken();
      const [curriculumRes, myRes, courseRes] = await Promise.all([
        fetch(`/api/lms/courses/${id}/curriculum`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch("/api/lms/my-courses", { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`/api/lms/courses/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      ]);

      const curriculumPayload = await curriculumRes.json();
      if (!curriculumRes.ok) throw new Error(curriculumPayload.error || "You are not enrolled in this course");
      setCurriculum(curriculumPayload.data);

      if (courseRes.ok) {
        const coursePayload = await courseRes.json();
        setCourseTitle(coursePayload.data?.title ?? "");
      }
      if (myRes.ok) {
        const myPayload = await myRes.json();
        const entry = (myPayload.data ?? []).find((m: { courseId: string }) => m.courseId === id);
        setCertificateId(entry?.certificateId ?? null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load course";
      console.error("Error loading curriculum:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = async (sessionId: string) => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      const parentModule = curriculum?.modules.find((m) => m.sessions.some((s) => s.id === sessionId));
      const response = await fetch(`/api/lms/sessions/${sessionId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ courseId: id, moduleId: parentModule?.id, action: "complete" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to save progress");

      if (payload.data?.completed) {
        toast.success("Course completed! Your certificate is being prepared.");
      } else {
        toast.success(`Progress saved — ${payload.data?.progressPercentage ?? 0}% complete`);
      }
      await loadCurriculum();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save progress";
      toast.error(message);
    }
  };

  const viewerModules = (curriculum?.modules ?? []).map((m, idx) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    weeknumber: idx + 1,
    sessions: m.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      contentType: TYPE_MAP[s.type] ?? "text",
      videoUrl: s.videoUrl,
      contentUrl: s.contentUrl ?? s.zoomJoinUrl,
      textContent: s.textContent,
      durationMinutes: s.durationMinutes,
      isPreview: false,
      isCompleted: s.isCompleted,
    })),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !curriculum) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cannot open course</h3>
            <p className="text-muted-foreground mb-4">{error || "You need to enroll before accessing this course."}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/portal/sme/courses">My Courses</Link>
              </Button>
              <Button asChild>
                <Link href={`/portal/sme/courses/browse/${id}`}>View Course</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = curriculum.membership.progressPercentage ?? 0;
  const isCompleted = curriculum.membership.status === "completed";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-4">
            <Link href="/portal/sme/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              My Courses
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{courseTitle || "Course"}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && <Badge variant="default" className="bg-green-600">Completed</Badge>}
          {certificateId && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/lms/certificates/${certificateId}/pdf`} target="_blank" rel="noopener noreferrer">
                <Award className="h-4 w-4 mr-2" />
                Certificate
              </a>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {curriculum.membership.completedSessions} / {curriculum.membership.totalSessions || curriculum.modules.reduce((acc, m) => acc + m.sessions.length, 0)} sessions completed
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <EmbeddedTrainingViewer
        modules={viewerModules}
        onSessionComplete={handleSessionComplete}
        isEnrolled={true}
      />
    </div>
  );
}
