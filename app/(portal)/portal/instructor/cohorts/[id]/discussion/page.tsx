"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useUserProfile } from "@/contexts/user-profile-context";
import { 
  getDiscussions, 
  createDiscussion,
  getDiscussionReplies,
  createDiscussionReply,
  updateDiscussion,
  deleteDiscussion,
  getCohort
} from "@/lib/firebase-cohorts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Plus, 
  MessageSquare, 
  Pin,
  Trash2,
  Send,
  User
} from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

interface Discussion {
  id: string;
  cohortId: string;
  userId: string;
  userName: string;
  userImage?: string;
  title: string;
  content: string;
  isPinned: boolean;
  replyCount: number;
  lastActivityAt: any;
  createdAt: any;
}

interface Reply {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: any;
}

export default function DiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cohortId } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [cohortTitle, setCohortTitle] = useState("");
  
  // New discussion dialog
  const [discussionDialogOpen, setDiscussionDialogOpen] = useState(false);
  const [newDiscussionForm, setNewDiscussionForm] = useState({
    title: "",
    content: "",
  });
  
  // View discussion dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    loadDiscussions();
  }, [cohortId]);

  const loadDiscussions = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Load cohort info
      const cohort = await getCohort(cohortId);
      if (cohort && (cohort as any).title) {
        setCohortTitle((cohort as any).title);
      }
      
      // Load discussions
      const discussionsData = await getDiscussions(cohortId);
      setDiscussions(discussionsData as Discussion[]);
    } catch (error: any) {
      console.error("Error loading discussions:", error);
      toast.error("Failed to load discussions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussionForm.title.trim() || !newDiscussionForm.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await createDiscussion({
        cohortId,
        userId: profile.id,
        userName: (profile as any).name || (profile as any).displayName || "Instructor",
        title: newDiscussionForm.title,
        content: newDiscussionForm.content,
        isPinned: false,
      });
      
      toast.success("Discussion created successfully");
      setDiscussionDialogOpen(false);
      setNewDiscussionForm({ title: "", content: "" });
      loadDiscussions();
    } catch (error: any) {
      console.error("Error creating discussion:", error);
      toast.error("Failed to create discussion");
    }
  };

  const handleTogglePin = async (discussion: Discussion) => {
    try {
      await updateDiscussion(discussion.id, {
        isPinned: !discussion.isPinned,
      });
      
      toast.success(discussion.isPinned ? "Discussion unpinned" : "Discussion pinned");
      loadDiscussions();
    } catch (error: any) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update discussion");
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!confirm("Are you sure you want to delete this discussion and all its replies?")) return;
    
    try {
      await deleteDiscussion(discussionId);
      toast.success("Discussion deleted successfully");
      loadDiscussions();
      if (viewDialogOpen) {
        setViewDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error deleting discussion:", error);
      toast.error("Failed to delete discussion");
    }
  };

  const openDiscussionView = async (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setViewDialogOpen(true);
    setLoadingReplies(true);
    
    try {
      const repliesData = await getDiscussionReplies(discussion.id);
      setReplies(repliesData as Reply[]);
    } catch (error: any) {
      console.error("Error loading replies:", error);
      toast.error("Failed to load replies");
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyContent.trim() || !selectedDiscussion) return;
    
    try {
      await createDiscussionReply({
        discussionId: selectedDiscussion.id,
        userId: profile.id,
        userName: (profile as any).name || (profile as any).displayName || "Instructor",
        content: replyContent,
      });
      
      setReplyContent("");
      
      // Reload replies
      const repliesData = await getDiscussionReplies(selectedDiscussion.id);
      setReplies(repliesData as Reply[]);
      
      // Update reply count in the list
      loadDiscussions();
      
      toast.success("Reply added successfully");
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
          <h1 className="text-3xl font-bold">{cohortTitle} - Discussion</h1>
          <p className="text-muted-foreground">Engage with participants and answer questions</p>
        </div>
        <Button onClick={() => setDiscussionDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No discussions yet</p>
              <Button onClick={() => setDiscussionDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Start First Discussion
              </Button>
            </CardContent>
          </Card>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar>
                      <AvatarImage src={discussion.userImage} />
                      <AvatarFallback>
                        {getInitials(discussion.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{discussion.title}</CardTitle>
                        {discussion.isPinned && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {discussion.userName} • {formatDate(discussion.createdAt)}
                      </p>
                      <p className="text-sm line-clamp-2">{discussion.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDiscussionView(discussion)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {discussion.replyCount} {discussion.replyCount === 1 ? "reply" : "replies"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(discussion)}
                    >
                      <Pin className={`h-4 w-4 ${discussion.isPinned ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDiscussion(discussion.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* New Discussion Dialog */}
      <Dialog open={discussionDialogOpen} onOpenChange={setDiscussionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Discussion</DialogTitle>
            <DialogDescription>
              Start a new discussion topic for your cohort
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="discussion-title">Title</Label>
              <Input
                id="discussion-title"
                value={newDiscussionForm.title}
                onChange={(e) => setNewDiscussionForm({ ...newDiscussionForm, title: e.target.value })}
                placeholder="e.g., Week 1 Q&A"
              />
            </div>
            <div>
              <Label htmlFor="discussion-content">Content</Label>
              <Textarea
                id="discussion-content"
                value={newDiscussionForm.content}
                onChange={(e) => setNewDiscussionForm({ ...newDiscussionForm, content: e.target.value })}
                placeholder="Share your thoughts or ask a question..."
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDiscussionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDiscussion}>
                Create Discussion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Discussion Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl">{selectedDiscussion?.title}</DialogTitle>
                <DialogDescription>
                  by {selectedDiscussion?.userName} • {formatDate(selectedDiscussion?.createdAt)}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedDiscussion && handleDeleteDiscussion(selectedDiscussion.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto max-h-[50vh]">
            {/* Original Post */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{selectedDiscussion?.content}</p>
            </div>

            {/* Replies */}
            <div className="space-y-3">
              <h3 className="font-semibold">
                {selectedDiscussion?.replyCount || 0} {selectedDiscussion?.replyCount === 1 ? "Reply" : "Replies"}
              </h3>
              
              {loadingReplies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : replies.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No replies yet</p>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 p-3 border rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.userImage} />
                      <AvatarFallback className="text-xs">
                        {getInitials(reply.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="reply-content">Add Reply</Label>
              <Textarea
                id="reply-content"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddReply} disabled={!replyContent.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
