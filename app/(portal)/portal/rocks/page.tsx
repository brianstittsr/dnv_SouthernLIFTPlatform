"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Plus,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Trash2,
  Edit,
  Link as LinkIcon,
  XCircle,
} from "lucide-react";
import { useTractionData, Rock, Milestone } from "@/lib/hooks/use-eos2-data";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { COLLECTIONS, type TeamMeemerging businessrDoc } from "@/lib/schema";
import { toast } from "sonner";

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "on-track":
      return (
        <Badge className="bg-green-100 text-green-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          On Track
        </Badge>
      );
    case "at-risk":
      return (
        <Badge className="bg-orange-100 text-orange-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          At Risk
        </Badge>
      );
    case "off-track":
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Off Track
        </Badge>
      );
    case "complete":
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// Get current quarter
function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter} ${now.getFullYear()}`;
}

// Get days remaining in quarter
function getDaysRemainingInQuarter(): nuemerging businessr {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
  const diff = quarterEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Empty rock form
interface RockForm {
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: Rock["status"];
  progress: nuemerging businessr;
  quarter: string;
  milestones: Milestone[];
}

const emptyRockForm: RockForm = {
  title: "",
  description: "",
  owner: "",
  dueDate: "",
  status: "on-track",
  progress: 0,
  quarter: getCurrentQuarter(),
  milestones: [],
};

export default function RocksPage() {
  const {
    rocks,
    issues,
    todos,
    metrics,
    loading,
    addRock,
    updateRock,
    deleteRock,
  } = useTractionData();

  const [showRockForm, setShowRockForm] = useState(false);
  const [editingRock, setEditingRock] = useState<Rock | null>(null);
  const [rockForm, setRockForm] = useState<RockForm>(emptyRockForm);
  const [saving, setSaving] = useState(false);
  const [teamMeemerging businessrs, setTeamMeemerging businessrs] = useState<{ id: string; name: string }[]>([]);
  const [newMilestone, setNewMilestone] = useState("");

  const currentQuarter = getCurrentQuarter();
  const daysRemaining = getDaysRemainingInQuarter();

  // Load team meemerging businessrs
  useEffect(() => {
    const loadTeamMeemerging businessrs = async () => {
      if (!db) return;
      try {
        const teamRef = collection(db, COLLECTIONS.TEAM_MEemerging businessRS);
        const teamQuery = query(teamRef, orderBy("firstName"));
        const snapshot = await getDocs(teamQuery);
        
        const meemerging businessrs: { id: string; name: string }[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as TeamMeemerging businessrDoc;
          if (data.role === "team") {
            meemerging businessrs.push({
              id: doc.id,
              name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown",
            });
          }
        });
        setTeamMeemerging businessrs(meemerging businessrs);
      } catch (error) {
        console.error("Error loading team meemerging businessrs:", error);
      }
    };
    loadTeamMeemerging businessrs();
  }, []);

  // Stats
  const totalRocks = rocks.length;
  const completedRocks = rocks.filter((r) => r.status === "complete").length;
  const atRiskRocks = rocks.filter((r) => r.status === "at-risk" || r.status === "off-track").length;
  const avgProgress = totalRocks > 0 ? Math.round(rocks.reduce((sum, r) => sum + r.progress, 0) / totalRocks) : 0;

  // Open add rock dialog
  const openAddRock = () => {
    setEditingRock(null);
    setRockForm({ ...emptyRockForm, quarter: currentQuarter });
    setShowRockForm(true);
  };

  // Open edit rock dialog
  const openEditRock = (rock: Rock) => {
    setEditingRock(rock);
    setRockForm({
      title: rock.title,
      description: rock.description,
      owner: rock.owner,
      dueDate: rock.dueDate,
      status: rock.status,
      progress: rock.progress,
      quarter: rock.quarter,
      milestones: rock.milestones || [],
    });
    setShowRockForm(true);
  };

  // Add milestone
  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setRockForm({
      ...rockForm,
      milestones: [
        ...rockForm.milestones,
        { id: `m-${Date.now()}`, title: newMilestone.trim(), completed: false },
      ],
    });
    setNewMilestone("");
  };

  // Remove milestone
  const removeMilestone = (id: string) => {
    setRockForm({
      ...rockForm,
      milestones: rockForm.milestones.filter((m) => m.id !== id),
    });
  };

  // Toggle milestone completion
  const toggleMilestone = (id: string) => {
    setRockForm({
      ...rockForm,
      milestones: rockForm.milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      ),
    });
  };

  // Calculate progress from milestones
  const calculateProgress = () => {
    if (rockForm.milestones.length === 0) return 0;
    const completed = rockForm.milestones.filter((m) => m.completed).length;
    return Math.round((completed / rockForm.milestones.length) * 100);
  };

  // Save rock
  const handleSaveRock = async () => {
    if (!rockForm.title.trim() || !rockForm.owner) {
      toast.error("Please fill in title and owner");
      return;
    }

    setSaving(true);
    try {
      const progress = calculateProgress();
      const rockData = {
        title: rockForm.title,
        description: rockForm.description,
        owner: rockForm.owner,
        ownerId: teamMeemerging businessrs.find((m) => m.name === rockForm.owner)?.id || "",
        dueDate: rockForm.dueDate,
        status: progress === 100 ? "complete" as const : rockForm.status,
        progress,
        quarter: rockForm.quarter,
        milestones: rockForm.milestones,
      };

      if (editingRock) {
        await updateRock(editingRock.id, rockData);
        toast.success("Rock updated successfully");
      } else {
        await addRock(rockData);
        toast.success("Rock created successfully");
      }

      setShowRockForm(false);
      setRockForm(emptyRockForm);
      setEditingRock(null);
    } catch (error) {
      toast.error("Failed to save rock");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Delete rock
  const handleDeleteRock = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rock?")) return;
    try {
      await deleteRock(id);
      toast.success("Rock deleted");
    } catch (error) {
      toast.error("Failed to delete rock");
    }
  };

  // Get linked items for a rock
  const getLinkedIssues = (rock: Rock) => {
    return issues.filter((i) => rock.linkedIssueIds?.includes(i.id));
  };

  const getLinkedTodos = (rock: Rock) => {
    return todos.filter((t) => rock.linkedTodoIds?.includes(t.id));
  };

  const getLinkedMetrics = (rock: Rock) => {
    return metrics.filter((m) => rock.linkedMetricIds?.includes(m.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rocks</h1>
          <p className="text-muted-foreground">
            {currentQuarter} quarterly goals • {daysRemaining} days remaining
          </p>
        </div>
        <Dialog open={showRockForm} onOpenChange={setShowRockForm}>
          <DialogTrigger asChild>
            <Button onClick={openAddRock}>
              <Plus className="mr-2 h-4 w-4" />
              New Rock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRock ? "Edit Rock" : "Create New Rock"}</DialogTitle>
              <DialogDescription>
                Rocks are 90-day priorities that move your business forward
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rock-title">Title *</Label>
                <Input
                  id="rock-title"
                  placeholder="e.g., Launch new product line"
                  value={rockForm.title}
                  onChange={(e) => setRockForm({ ...rockForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rock-description">Description</Label>
                <Textarea
                  id="rock-description"
                  placeholder="Detailed description of what needs to be accomplished"
                  value={rockForm.description}
                  onChange={(e) => setRockForm({ ...rockForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rock-owner">Owner *</Label>
                  <Select
                    value={rockForm.owner}
                    onValueChange={(v) => setRockForm({ ...rockForm, owner: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMeemerging businessrs.map((meemerging businessr) => (
                        <SelectItem key={meemerging businessr.id} value={meemerging businessr.name}>
                          {meemerging businessr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rock-quarter">Quarter</Label>
                  <Select
                    value={rockForm.quarter}
                    onValueChange={(v) => setRockForm({ ...rockForm, quarter: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                      <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                      <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                      <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rock-due">Due Date</Label>
                  <Input
                    id="rock-due"
                    type="date"
                    value={rockForm.dueDate}
                    onChange={(e) => setRockForm({ ...rockForm, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rock-status">Status</Label>
                  <Select
                    value={rockForm.status}
                    onValueChange={(v: Rock["status"]) => setRockForm({ ...rockForm, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">On Track</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="off-track">Off Track</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <Label>Milestones</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a milestone..."
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMilestone())}
                  />
                  <Button type="button" variant="outline" onClick={addMilestone}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {rockForm.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <Checkbox
                        checked={milestone.completed}
                        onCheckedChange={() => toggleMilestone(milestone.id)}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          milestone.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {milestone.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                {rockForm.milestones.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Progress: {calculateProgress()}% ({rockForm.milestones.filter((m) => m.completed).length}/{rockForm.milestones.length} completed)
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRockForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRock} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : editingRock ? (
                  <Edit className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingRock ? "Update Rock" : "Create Rock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRocks}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRocks}</div>
            <p className="text-xs text-muted-foreground">
              {totalRocks > 0 ? Math.round((completedRocks / totalRocks) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{atRiskRocks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Rocks List */}
      {rocks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rocks Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Rocks are your 90-day priorities. Create your first rock to start tracking quarterly goals.
            </p>
            <Button onClick={openAddRock}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Rock
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rocks.map((rock) => {
            const linkedIssues = getLinkedIssues(rock);
            const linkedTodos = getLinkedTodos(rock);
            const linkedMetrics = getLinkedMetrics(rock);
            const milestones = rock.milestones || [];

            return (
              <Card key={rock.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{rock.title}</CardTitle>
                        <CardDescription className="mt-1">{rock.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(rock.status)}
                      <Button variant="ghost" size="sm" onClick={() => openEditRock(rock)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRock(rock.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{rock.progress}%</span>
                      </div>
                      <Progress value={rock.progress} />
                    </div>

                    {/* Owner */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(rock.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{rock.owner}</p>
                        <p className="text-xs text-muted-foreground">Owner</p>
                      </div>
                    </div>

                    {/* Milestones Summary */}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {milestones.filter((m) => m.completed).length} of {milestones.length} milestones
                      </span>
                    </div>
                  </div>

                  {/* Milestones */}
                  {milestones.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Milestones</p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className={`flex items-center gap-2 p-2 rounded-md ${
                              milestone.completed ? "bg-green-50" : "bg-muted/50"
                            }`}
                          >
                            <Checkbox checked={milestone.completed} disabled />
                            <span
                              className={`text-sm ${
                                milestone.completed ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Items */}
                  {(linkedIssues.length > 0 || linkedTodos.length > 0 || linkedMetrics.length > 0) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Linked Items
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {linkedIssues.map((issue) => (
                          <Badge key={issue.id} variant="outline" className="text-xs">
                            Issue: {issue.title}
                          </Badge>
                        ))}
                        {linkedTodos.map((todo) => (
                          <Badge key={todo.id} variant="outline" className="text-xs">
                            Todo: {todo.title}
                          </Badge>
                        ))}
                        {linkedMetrics.map((metric) => (
                          <Badge key={metric.id} variant="outline" className="text-xs">
                            Metric: {metric.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
