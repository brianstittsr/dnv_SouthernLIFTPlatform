"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock,
  Video,
  BookOpen,
  FileQuestion
} from "lucide-react";

interface Session {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  videoUrl?: string;
  contentUrl?: string;
  textContent?: string;
  durationMinutes?: number;
  isPreview: boolean;
  isCompleted?: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  weekNumber: number;
  sessions: Session[];
}

interface EmbeddedTrainingViewerProps {
  modules: Module[];
  currentSessionId?: string;
  onSessionComplete?: (sessionId: string) => void;
  isEnrolled?: boolean;
}

export function EmbeddedTrainingViewer({ 
  modules, 
  currentSessionId,
  onSessionComplete,
  isEnrolled = false 
}: EmbeddedTrainingViewerProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(
    currentSessionId 
      ? modules.flatMap(m => m.sessions).find(s => s.id === currentSessionId) || null
      : null
  );

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'quiz': return <FileQuestion className="h-4 w-4" />;
      case 'assignment': return <BookOpen className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'live': return <Play className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const canAccessSession = (session: Session) => {
    return isEnrolled || session.isPreview;
  };

  const renderVideoPlayer = (session: Session) => {
    if (!session.videoUrl) return null;

    // Support for YouTube, Vimeo, and direct video URLs
    const isYouTube = session.videoUrl.includes('youtube.com') || session.videoUrl.includes('youtu.be');
    const isVimeo = session.videoUrl.includes('vimeo.com');

    if (isYouTube) {
      const videoId = session.videoUrl.includes('youtu.be') 
        ? session.videoUrl.split('youtu.be/')[1]?.split('?')[0]
        : session.videoUrl.split('v=')[1]?.split('&')[0];
      
      return (
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={session.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (isVimeo) {
      const videoId = session.videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      
      return (
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full rounded-lg"
            src={`https://player.vimeo.com/video/${videoId}`}
            title={session.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Direct video URL
    return (
      <div className="aspect-video w-full">
        <video
          className="w-full h-full rounded-lg"
          controls
          src={session.videoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const renderTextContent = (session: Session) => {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="bg-muted p-6 rounded-lg">
          <p className="whitespace-pre-wrap">
            {session.textContent || session.description || "Content coming soon..."}
          </p>
        </div>
      </div>
    );
  };

  const renderSessionContent = (session: Session) => {
    if (!canAccessSession(session)) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enrollment Required</h3>
            <p className="text-muted-foreground mb-4">
              Enroll in this cohort to access this training session
            </p>
            <Button>Enroll Now</Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Session Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize">
              {session.contentType}
            </Badge>
            {session.durationMinutes && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.durationMinutes} min
              </Badge>
            )}
            {session.isCompleted && (
              <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{session.title}</h2>
          {session.description && (
            <p className="text-muted-foreground">{session.description}</p>
          )}
        </div>

        {/* Content Display */}
        {session.contentType === 'video' && renderVideoPlayer(session)}
        {session.contentType === 'text' && renderTextContent(session)}
        
        {session.contentType === 'quiz' && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quiz Assessment</h3>
              <p className="text-muted-foreground mb-4">
                Complete the quiz to test your knowledge
              </p>
              <Button>Start Quiz</Button>
            </CardContent>
          </Card>
        )}

        {session.contentType === 'assignment' && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Assignment</h3>
              <p className="text-muted-foreground mb-4">
                Complete the assignment and submit your work
              </p>
              <Button>View Assignment</Button>
            </CardContent>
          </Card>
        )}

        {session.contentType === 'download' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Download className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Downloadable Resources</h3>
              <p className="text-muted-foreground mb-4">
                Download course materials and resources
              </p>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Resources
              </Button>
            </CardContent>
          </Card>
        )}

        {session.contentType === 'live' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Training Session</h3>
              <p className="text-muted-foreground mb-4">
                Join the live training session at the scheduled time
              </p>
              <Button>View Schedule</Button>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {isEnrolled && !session.isCompleted && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={() => onSessionComplete?.(session.id)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Sidebar - Module/Session List */}
      <Card className="h-fit lg:sticky lg:top-4">
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {modules.length} modules • {modules.reduce((acc, m) => acc + m.sessions.length, 0)} sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
          {modules.map((module) => (
            <div key={module.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Week {module.weekNumber}</Badge>
                <h4 className="font-semibold text-sm">{module.title}</h4>
              </div>
              <div className="space-y-1 pl-4">
                {module.sessions.map((session) => {
                  const isActive = selectedSession?.id === session.id;
                  const canAccess = canAccessSession(session);
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => canAccess && setSelectedSession(session)}
                      disabled={!canAccess}
                      className={`
                        w-full text-left p-2 rounded-md text-sm transition-colors
                        ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                        ${!canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {getContentIcon(session.contentType)}
                        <span className="flex-1 truncate">{session.title}</span>
                        {session.isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {!canAccess && !session.isPreview && (
                          <span className="text-xs">🔒</span>
                        )}
                      </div>
                      {session.durationMinutes && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.durationMinutes} min
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div>
        {selectedSession ? (
          renderSessionContent(selectedSession)
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Session</h3>
              <p className="text-muted-foreground">
                Choose a training session from the sidebar to begin
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
