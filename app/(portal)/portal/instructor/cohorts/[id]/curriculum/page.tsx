"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  getModules, 
  getSessions, 
  createModule, 
  createSession,
  updateModule,
  updateSession,
  deleteModule,
  deleteSession,
  getCohort
} from "@/lib/firebase-cohorts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  FileText,
  Download,
  Calendar,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { ScormImportDialog } from "@/components/cohorts/scorm-import-dialog";

interface Module {
  id: string;
  cohortId: string;
  title: string;
  description?: string;
  weekNumber: number;
  sortOrder: number;
  sessions?: Session[];
}

interface Session {
  id: string;
  moduleId: string;
  cohortId: string;
  title: string;
  description?: string;
  contentType: string;
  contentUrl?: string;
  videoUrl?: string;
  durationMinutes?: number;
  scheduledDate?: any;
  sortOrder: number;
  isPreview: boolean;
}

export default function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cohortId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [cohortTitle, setCohortTitle] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  // SCORM import dialog state
  const [scormDialogOpen, setScormDialogOpen] = useState(false);
  
  // Module dialog state
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    weekNumber: 1,
  });
  
  // Session dialog state
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
    contentType: "video",
    contentUrl: "",
    videoUrl: "",
    durationMinutes: 30,
    scheduledDate: "",
    isPreview: false,
  });

  useEffect(() => {
    loadCurriculum();
  }, [cohortId]);

  const loadCurriculum = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Load cohort info
      const cohort = await getCohort(cohortId);
      if (cohort) {
        setCohortTitle(cohort.title);
      }
      
      // Load modules
      const modulesData = await getModules(cohortId);
      
      // Load sessions for each module
      const modulesWithSessions = await Promise.all(
        modulesData.map(async (module: any) => {
          const sessions = await getSessions(module.id);
          return { ...module, sessions };
        })
      );
      
      setModules(modulesWithSessions);
    } catch (error: any) {
      console.error("Error loading curriculum:", error);
      toast.error("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const openModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        description: module.description || "",
        weekNumber: module.weekNumber,
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: "",
        description: "",
        weekNumber: modules.length + 1,
      });
    }
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    try {
      if (editingModule) {
        await updateModule(editingModule.id, moduleForm);
        toast.success("Module updated successfully");
      } else {
        await createModule({
          cohortId,
          ...moduleForm,
          sortOrder: modules.length,
        });
        toast.success("Module created successfully");
      }
      
      setModuleDialogOpen(false);
      loadCurriculum();
    } catch (error: any) {
      console.error("Error saving module:", error);
      toast.error("Failed to save module");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure? This will delete the module and all its sessions.")) return;
    
    try {
      await deleteModule(moduleId);
      toast.success("Module deleted successfully");
      loadCurriculum();
    } catch (error: any) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module");
    }
  };

  const openSessionDialog = (moduleId: string, session?: Session) => {
    setCurrentModuleId(moduleId);
    
    if (session) {
      setEditingSession(session);
      setSessionForm({
        title: session.title,
        description: session.description || "",
        contentType: session.contentType,
        contentUrl: session.contentUrl || "",
        videoUrl: session.videoUrl || "",
        durationMinutes: session.durationMinutes || 30,
        scheduledDate: session.scheduledDate ? new Date(session.scheduledDate.toDate()).toISOString().split('T')[0] : "",
        isPreview: session.isPreview,
      });
    } else {
      setEditingSession(null);
      const module = modules.find(m => m.id === moduleId);
      setSessionForm({
        title: "",
        description: "",
        contentType: "video",
        contentUrl: "",
        videoUrl: "",
        durationMinutes: 30,
        scheduledDate: "",
        isPreview: false,
      });
    }
    setSessionDialogOpen(true);
  };

  const handleSaveSession = async () => {
    try {
      const sessionData = {
        ...sessionForm,
        scheduledDate: sessionForm.scheduledDate ? Timestamp.fromDate(new Date(sessionForm.scheduledDate)) : null,
      };
      
      if (editingSession) {
        await updateSession(editingSession.id, sessionData);
        toast.success("Session updated successfully");
      } else {
        const module = modules.find(m => m.id === currentModuleId);
        const sessionCount = module?.sessions?.length || 0;
        
        await createSession({
          moduleId: currentModuleId,
          cohortId,
          ...sessionData,
          sortOrder: sessionCount,
        });
        toast.success("Session created successfully");
      }
      
      setSessionDialogOpen(false);
      loadCurriculum();
    } catch (error: any) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await deleteSession(sessionId);
      toast.success("Session deleted successfully");
      loadCurriculum();
    } catch (error: any) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Back to Cohorts
          </Button>
          <h1 className="text-3xl font-bold">{cohortTitle} - Curriculum</h1>
          <p className="text-muted-foreground">Manage modules and training sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScormDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import SCORM
          </Button>
          <Button onClick={() => openModuleDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No modules yet</p>
              <Button onClick={() => openModuleDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModule(module.id)}
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Week {module.weekNumber}</Badge>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </div>
                      {module.description && (
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.sessions?.length || 0} sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSessionDialog(module.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Session
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModuleDialog(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedModules.has(module.id) && module.sessions && module.sessions.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {module.sessions.map((session, idx) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-6">{idx + 1}.</span>
                          {getContentIcon(session.contentType)}
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {session.contentType}
                              </Badge>
                              {session.durationMinutes && (
                                <span>{session.durationMinutes} min</span>
                              )}
                              {session.scheduledDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(session.scheduledDate.toDate()).toLocaleDateString()}
                                </span>
                              )}
                              {session.isPreview && (
                                <Badge variant="outline" className="text-xs">Preview</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSessionDialog(module.id, session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create Module"}</DialogTitle>
            <DialogDescription>
              {editingModule ? "Update module details" : "Add a new module to your cohort"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Title</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Introduction to CMMC"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description (optional)</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Brief description of this module"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="module-week">Week Number</Label>
              <Input
                id="module-week"
                type="number"
                min="1"
                value={moduleForm.weekNumber}
                onChange={(e) => setModuleForm({ ...moduleForm, weekNumber: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveModule}>
                {editingModule ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Create Session"}</DialogTitle>
            <DialogDescription>
              {editingSession ? "Update session details" : "Add a new training session"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="session-title">Title</Label>
              <Input
                id="session-title"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="e.g., Understanding CMMC Levels"
              />
            </div>
            <div>
              <Label htmlFor="session-description">Description (optional)</Label>
              <Textarea
                id="session-description"
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                placeholder="Brief description of this session"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="session-type">Content Type</Label>
              <Select
                value={sessionForm.contentType}
                onValueChange={(value) => setSessionForm({ ...sessionForm, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="live">Live Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sessionForm.contentType === 'video' && (
              <div>
                <Label htmlFor="session-video">Video URL</Label>
                <Input
                  id="session-video"
                  value={sessionForm.videoUrl}
                  onChange={(e) => setSessionForm({ ...sessionForm, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            <div>
              <Label htmlFor="session-content">Content URL (optional)</Label>
              <Input
                id="session-content"
                value={sessionForm.contentUrl}
                onChange={(e) => setSessionForm({ ...sessionForm, contentUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-duration">Duration (minutes)</Label>
                <Input
                  id="session-duration"
                  type="number"
                  min="1"
                  value={sessionForm.durationMinutes}
                  onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="session-date">Scheduled Date (optional)</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={sessionForm.scheduledDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="session-preview"
                checked={sessionForm.isPreview}
                onChange={(e) => setSessionForm({ ...sessionForm, isPreview: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="session-preview" className="cursor-pointer">
                Allow preview (visible before enrollment)
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSession}>
                {editingSession ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SCORM Import Dialog */}
      <ScormImportDialog
        cohortId={cohortId}
        open={scormDialogOpen}
        onOpenChange={setScormDialogOpen}
        onSuccess={loadCurriculum}
      />
    </div>
  );
}
