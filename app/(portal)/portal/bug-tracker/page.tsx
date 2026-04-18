"use client";

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Bug,
  Lightbulb,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";

const COLLECTION = "bugTracker";

type ItemType = "bug" | "idea" | "improvement";
type ItemStatus = "open" | "in_progress" | "resolved" | "closed" | "wont_fix";
type ItemPriority = "low" | "medium" | "high" | "critical";

interface TrackerComment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

interface TrackerItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  status: ItemStatus;
  priority: ItemPriority;
  page: string;
  reporter: string;
  assignee: string;
  tags: string[];
  comments: TrackerComment[];
  createdAt: Date;
  updatedAt: Date;
}

interface FormData {
  type: ItemType;
  title: string;
  description: string;
  priority: ItemPriority;
  page: string;
  assignee: string;
  tags: string;
}

const DEFAULT_FORM: FormData = {
  type: "bug",
  title: "",
  description: "",
  priority: "medium",
  page: "none",
  assignee: "",
  tags: "",
};

const pageOptions = [
  { value: "none", label: "No specific page" },
  { value: "/", label: "Home Page" },
  { value: "/sign-in", label: "Sign In" },
  { value: "/portal", label: "Portal Home" },
  { value: "/portal/command-center", label: "Command Center" },
  { value: "/portal/opportunities", label: "Opportunities" },
  { value: "/portal/projects", label: "Projects" },
  { value: "/portal/affiliates", label: "Affiliates" },
  { value: "/portal/customers", label: "Customers" },
  { value: "/portal/documents", label: "Documents" },
  { value: "/portal/calendar", label: "Calendar" },
  { value: "/portal/meetings", label: "Meetings" },
  { value: "/portal/rocks", label: "Rocks" },
  { value: "/portal/deals", label: "Deals" },
  { value: "/portal/bug-tracker", label: "Bug Tracker" },
  { value: "/portal/settings", label: "Settings" },
  { value: "/portal/admin", label: "Admin Pages" },
  { value: "other", label: "Other (specify in description)" },
];

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "object" && "toDate" in (val as object)) return (val as Timestamp).toDate();
  if (typeof val === "number") return new Date(val);
  return new Date(val as string);
}

function fromFirestore(id: string, data: Record<string, unknown>): TrackerItem {
  return {
    id,
    type: (data.type as ItemType) || "bug",
    title: (data.title as string) || "",
    description: (data.description as string) || "",
    status: (data.status as ItemStatus) || "open",
    priority: (data.priority as ItemPriority) || "medium",
    page: (data.page as string) || "",
    reporter: (data.reporter as string) || "Unknown",
    assignee: (data.assignee as string) || "",
    tags: (data.tags as string[]) || [],
    comments: ((data.comments as unknown[]) || []).map((c: unknown) => {
      const comment = c as Record<string, unknown>;
      return {
        id: (comment.id as string) || Date.now().toString(),
        author: (comment.author as string) || "Unknown",
        content: (comment.content as string) || "",
        createdAt: toDate(comment.createdAt),
      };
    }),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export default function BugTrackerPage() {
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrackerItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [editData, setEditData] = useState<FormData>(DEFAULT_FORM);

  const currentUser = auth?.currentUser;
  const reporterName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Current User";

  // Load items from Firestore
  const loadItems = useCallback(async () => {
    if (!db) {
      toast.error("Database not available");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>)));
    } catch (err) {
      console.error("Error loading tracker items:", err);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (activeTab === "bugs" && item.type !== "bug") return false;
    if (activeTab === "ideas" && item.type !== "idea") return false;
    if (activeTab === "improvements" && item.type !== "improvement") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
    }
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterPriority !== "all" && item.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: items.length,
    open: items.filter((i) => i.status === "open").length,
    inProgress: items.filter((i) => i.status === "in_progress").length,
    resolved: items.filter((i) => i.status === "resolved").length,
    bugs: items.filter((i) => i.type === "bug").length,
    ideas: items.filter((i) => i.type === "idea").length,
  };

  // CREATE
  const handleCreate = async () => {
    if (!db || !formData.title.trim() || !formData.description.trim()) return;
    setSaving(true);
    try {
      const data = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: "open",
        priority: formData.priority,
        page: formData.page === "none" ? "" : formData.page,
        reporter: reporterName,
        assignee: formData.assignee.trim(),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        comments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, COLLECTION), data);
      const newItem = fromFirestore(ref.id, { ...data, createdAt: new Date(), updatedAt: new Date() });
      setItems((prev) => [newItem, ...prev]);
      setShowAddDialog(false);
      setFormData(DEFAULT_FORM);
      toast.success("Entry created successfully");
    } catch (err) {
      console.error("Error creating item:", err);
      toast.error("Failed to create entry");
    } finally {
      setSaving(false);
    }
  };

  // UPDATE (full edit)
  const handleUpdate = async () => {
    if (!db || !selectedItem || !editData.title.trim() || !editData.description.trim()) return;
    setSaving(true);
    try {
      const updates = {
        type: editData.type,
        title: editData.title.trim(),
        description: editData.description.trim(),
        priority: editData.priority,
        page: editData.page === "none" ? "" : editData.page,
        assignee: editData.assignee.trim(),
        tags: editData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, COLLECTION, selectedItem.id), updates);
      const updated: TrackerItem = {
        ...selectedItem,
        ...updates,
        page: updates.page,
        updatedAt: new Date(),
      };
      setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? updated : i)));
      setSelectedItem(updated);
      setShowEditDialog(false);
      toast.success("Entry updated");
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error("Failed to update entry");
    } finally {
      setSaving(false);
    }
  };

  // UPDATE STATUS ONLY
  const updateStatus = async (id: string, status: ItemStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: Timestamp.now() });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date() } : i))
      );
      if (selectedItem?.id === id) setSelectedItem((prev) => prev && { ...prev, status, updatedAt: new Date() });
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedItem?.id === id) {
        setShowViewDialog(false);
        setSelectedItem(null);
      }
      toast.success("Entry deleted");
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error("Failed to delete entry");
    }
  };

  // ADD COMMENT
  const addComment = async () => {
    if (!db || !selectedItem || !newComment.trim()) return;
    setAddingComment(true);
    try {
      const comment: TrackerComment = {
        id: Date.now().toString(),
        author: reporterName,
        content: newComment.trim(),
        createdAt: new Date(),
      };
      const updatedComments = [...selectedItem.comments, comment];
      await updateDoc(doc(db, COLLECTION, selectedItem.id), {
        comments: updatedComments.map((c) => ({
          ...c,
          createdAt: Timestamp.fromDate(c.createdAt),
        })),
        updatedAt: Timestamp.now(),
      });
      const updated = { ...selectedItem, comments: updatedComments, updatedAt: new Date() };
      setSelectedItem(updated);
      setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? updated : i)));
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  // Open edit dialog pre-filled
  const openEdit = (item: TrackerItem) => {
    setSelectedItem(item);
    setEditData({
      type: item.type,
      title: item.title,
      description: item.description,
      priority: item.priority,
      page: item.page || "none",
      assignee: item.assignee || "",
      tags: item.tags.join(", "),
    });
    setShowEditDialog(true);
  };

  // Helpers
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return <Bug className="h-4 w-4 text-red-500" />;
      case "idea": return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "improvement": return <Sparkles className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><AlertCircle className="h-3 w-3 mr-1" />Open</Badge>;
      case "in_progress": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "resolved": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "closed": return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      case "wont_fix": return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Won&apos;t Fix</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge className="bg-red-500 text-white"><ArrowUpCircle className="h-3 w-3 mr-1" />Critical</Badge>;
      case "high": return <Badge className="bg-orange-500 text-white"><ArrowUpCircle className="h-3 w-3 mr-1" />High</Badge>;
      case "medium": return <Badge className="bg-yellow-500 text-yellow-900"><ArrowRightCircle className="h-3 w-3 mr-1" />Medium</Badge>;
      case "low": return <Badge variant="secondary"><ArrowDownCircle className="h-3 w-3 mr-1" />Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Shared form fields (used in both Add and Edit dialogs)
  const renderFormFields = (data: FormData, setData: (d: FormData) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={data.type} onValueChange={(v) => setData({ ...data, type: v as ItemType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bug"><span className="flex items-center gap-2"><Bug className="h-4 w-4 text-red-500" />Bug Report</span></SelectItem>
              <SelectItem value="idea"><span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" />New Idea</span></SelectItem>
              <SelectItem value="improvement"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" />Improvement</span></SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={data.priority} onValueChange={(v) => setData({ ...data, priority: v as ItemPriority })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-title">Title *</Label>
        <Input
          id="form-title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Brief summary of the issue or idea"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-desc">Description *</Label>
        <Textarea
          id="form-desc"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Provide details, steps to reproduce (for bugs), or explain the idea..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Related Page</Label>
          <Select value={data.page || "none"} onValueChange={(v) => setData({ ...data, page: v })}>
            <SelectTrigger><SelectValue placeholder="Select page" /></SelectTrigger>
            <SelectContent>
              {pageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-assignee">Assignee</Label>
          <Input
            id="form-assignee"
            value={data.assignee}
            onChange={(e) => setData({ ...data, assignee: e.target.value })}
            placeholder="e.g., Dev Team"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-tags">Tags (comma separated)</Label>
        <Input
          id="form-tags"
          value={data.tags}
          onChange={(e) => setData({ ...data, tags: e.target.value })}
          placeholder="e.g., ui, performance, feature"
        />
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Bug className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                Bug & Idea Tracker
                <Badge variant="secondary" className="text-xs">{stats.open} Open</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">Track bugs, capture ideas, and manage improvements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadItems} disabled={loading} title="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => { setFormData(DEFAULT_FORM); setShowAddDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Total Items", value: stats.total, color: "" },
            { label: "Open", value: stats.open, color: "text-blue-600" },
            { label: "In Progress", value: stats.inProgress, color: "text-yellow-600" },
            { label: "Resolved", value: stats.resolved, color: "text-green-600" },
            { label: "Bugs", value: stats.bugs, color: "text-red-600" },
            { label: "Ideas", value: stats.ideas, color: "text-yellow-500" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-3">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-6 flex items-center justify-between flex-wrap gap-2 py-1">
            <TabsList className="h-12">
              <TabsTrigger value="all" className="gap-2"><FileText className="h-4 w-4" />All</TabsTrigger>
              <TabsTrigger value="bugs" className="gap-2"><Bug className="h-4 w-4" />Bugs</TabsTrigger>
              <TabsTrigger value="ideas" className="gap-2"><Lightbulb className="h-4 w-4" />Ideas</TabsTrigger>
              <TabsTrigger value="improvements" className="gap-2"><Sparkles className="h-4 w-4" />Improvements</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No items found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || filterStatus !== "all" || filterPriority !== "all"
                          ? "Try adjusting your filters"
                          : "Create your first entry to get started"}
                      </p>
                      <Button onClick={() => { setFormData(DEFAULT_FORM); setShowAddDialog(true); }}>
                        <Plus className="h-4 w-4 mr-2" />New Entry
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          <TableCell>{getTypeIcon(item.type)}</TableCell>
                          <TableCell>
                            <div
                              className="font-medium hover:text-primary cursor-pointer"
                              onClick={() => { setSelectedItem(item); setShowViewDialog(true); }}
                            >
                              {item.title}
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {item.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                                {item.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{item.tags.length - 3}</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                          <TableCell>
                            {item.page ? (
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.page}</code>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{item.reporter}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {item.createdAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedItem(item); setShowViewDialog(true); }}>
                                  <Eye className="h-4 w-4 mr-2" />View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(item)}>
                                  <Edit className="h-4 w-4 mr-2" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateStatus(item.id, "in_progress")}>
                                  <Clock className="h-4 w-4 mr-2" />Mark In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(item.id, "resolved")}>
                                  <CheckCircle className="h-4 w-4 mr-2" />Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(item.id, "closed")}>
                                  <XCircle className="h-4 w-4 mr-2" />Close
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── ADD Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) setFormData(DEFAULT_FORM); setShowAddDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
            <DialogDescription>Report a bug, capture an idea, or suggest an improvement</DialogDescription>
          </DialogHeader>
          {renderFormFields(formData, setFormData)}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setFormData(DEFAULT_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !formData.title.trim() || !formData.description.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT Dialog ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>Update the details of this entry</DialogDescription>
          </DialogHeader>
          {renderFormFields(editData, setEditData)}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving || !editData.title.trim() || !editData.description.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIEW Dialog ── */}
      <Dialog open={showViewDialog} onOpenChange={(open) => { if (!open) setNewComment(""); setShowViewDialog(open); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedItem.type)}
                  <DialogTitle className="text-left">{selectedItem.title}</DialogTitle>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {getStatusBadge(selectedItem.status)}
                  {getPriorityBadge(selectedItem.priority)}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Description</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedItem.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Reporter</Label>
                    <p className="mt-1">{selectedItem.reporter}</p>
                  </div>
                  {selectedItem.assignee && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Assignee</Label>
                      <p className="mt-1">{selectedItem.assignee}</p>
                    </div>
                  )}
                  {selectedItem.page && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Related Page</Label>
                      <p className="mt-1"><code className="bg-muted px-1 py-0.5 rounded text-xs">{selectedItem.page}</code></p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Created</Label>
                    <p className="mt-1">{selectedItem.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Last Updated</Label>
                    <p className="mt-1">{selectedItem.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedItem.tags.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Tags</Label>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {selectedItem.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Status inline */}
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Update Status</Label>
                  <Select value={selectedItem.status} onValueChange={(v) => updateStatus(selectedItem.id, v as ItemStatus)}>
                    <SelectTrigger className="mt-1 w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Comments */}
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />Comments ({selectedItem.comments.length})
                  </Label>
                  <div className="space-y-3 mt-3">
                    {selectedItem.comments.length === 0 && (
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                    )}
                    {selectedItem.comments.map((c) => (
                      <div key={c.id} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{c.author}</span>
                          <span className="text-muted-foreground">{c.createdAt.toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 text-sm">{c.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
                    />
                    <Button onClick={addComment} disabled={!newComment.trim() || addingComment}>
                      {addingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                <Button variant="outline" onClick={() => { openEdit(selectedItem); setShowViewDialog(false); }}>
                  <Edit className="h-4 w-4 mr-2" />Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedItem.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </Button>
                <Button variant="outline" onClick={() => { setShowViewDialog(false); setNewComment(""); }}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
