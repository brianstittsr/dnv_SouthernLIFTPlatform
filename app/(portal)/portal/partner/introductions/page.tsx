"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Building2, User, Calendar, DollarSign, MessageSquare, CheckCircle2, Clock, XCircle, ArrowRight, Phone, Mail, Video } from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockIntroductions } from "@/lib/mock-data/partner-mock-data";

interface StageTransition {
  stage: string;
  timestamp: any;
  notes?: string;
  updatedBy?: string;
}

interface Introduction {
  id: string;
  buyerCompany: string;
  buyerEmail?: string;
  smeCompany: string;
  smeEmail?: string;
  projectDescription: string;
  timeline?: string;
  budgetRange?: string;
  estimatedValue?: number;
  preferredContactMethod?: string;
  status: string;
  stage: string;
  stageHistory?: StageTransition[];
  requestedAt: any;
  respondedAt?: any;
  meetingDate?: any;
  declineReason?: string;
}

export default function IntroductionsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Introduction[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedIntro, setSelectedIntro] = useState<Introduction | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateStage, setUpdateStage] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setItems(mockIntroductions as Introduction[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "introductions"),
        where("partnerId", "==", profile.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Introduction[];
      setItems(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async () => {
    if (!selectedIntro || !updateStage) return;

    try {
      setUpdating(true);
      if (!db) return;

      const introRef = doc(db, "introductions", selectedIntro.id);
      const stageTransition: StageTransition = {
        stage: updateStage,
        timestamp: Timestamp.now(),
        notes: updateNotes || undefined,
        updatedBy: profile.email,
      };

      await updateDoc(introRef, {
        stage: updateStage,
        stageHistory: [...(selectedIntro.stageHistory || []), stageTransition],
        updatedAt: Timestamp.now(),
      });

      toast.success("Introduction updated successfully");
      setShowUpdateDialog(false);
      setUpdateStage("");
      setUpdateNotes("");
      loadData();
    } catch (error) {
      console.error("Error updating introduction:", error);
      toast.error("Failed to update introduction");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      accepted: { variant: "default", icon: CheckCircle2 },
      declined: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStageBadge = (stage: string) => {
    const stageLabels: Record<string, string> = {
      introduction_sent: "Introduction Sent",
      meeting_scheduled: "Meeting Scheduled",
      meeting_held: "Meeting Held",
      proposal_submitted: "Proposal Submitted",
      closed_won: "Closed Won",
      closed_lost: "Closed Lost",
    };
    return (
      <Badge variant="secondary">
        {stageLabels[stage] || stage}
      </Badge>
    );
  };

  const getContactMethodIcon = (method?: string) => {
    switch (method) {
      case "phone": return <Phone className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Introductions</h1>
            <p className="text-muted-foreground">Track buyer-SME communications and progress</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Introductions Yet</h3>
            <p className="text-muted-foreground">
              Introduction requests will appear here when buyers connect with your SME clients.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((intro) => (
            <Card key={intro.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-xl">{intro.buyerCompany}</CardTitle>
                      {getStatusBadge(intro.status)}
                      {getStageBadge(intro.stage)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {intro.smeCompany}
                      </span>
                      {intro.estimatedValue && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(intro.estimatedValue)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedIntro(intro);
                      setUpdateStage(intro.stage);
                      setShowUpdateDialog(true);
                    }}
                  >
                    Update Progress
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Project Description</Label>
                    <p className="text-sm mt-1">{intro.projectDescription}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Requested:</span>
                      <span>{formatDate(intro.requestedAt)}</span>
                    </div>
                    {intro.respondedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Responded:</span>
                        <span>{formatDate(intro.respondedAt)}</span>
                      </div>
                    )}
                    {intro.meetingDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Meeting:</span>
                        <span>{formatDate(intro.meetingDate)}</span>
                      </div>
                    )}
                    {intro.preferredContactMethod && (
                      <div className="flex items-center gap-2 text-sm">
                        {getContactMethodIcon(intro.preferredContactMethod)}
                        <span className="text-muted-foreground">Preferred:</span>
                        <span className="capitalize">{intro.preferredContactMethod}</span>
                      </div>
                    )}
                  </div>
                </div>

                {intro.stageHistory && intro.stageHistory.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Communication Timeline</Label>
                      <div className="space-y-3">
                        {intro.stageHistory.map((transition, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              {idx < intro.stageHistory!.length - 1 && (
                                <div className="w-px h-full bg-border mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {transition.stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(transition.timestamp)}
                                </span>
                              </div>
                              {transition.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{transition.notes}</p>
                              )}
                              {transition.updatedBy && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Updated by {transition.updatedBy}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Stage Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Introduction Progress</DialogTitle>
            <DialogDescription>
              Track the progress of this introduction through the sales funnel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stage</Label>
              <Select value={updateStage} onValueChange={setUpdateStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introduction_sent">Introduction Sent</SelectItem>
                  <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                  <SelectItem value="meeting_held">Meeting Held</SelectItem>
                  <SelectItem value="proposal_submitted">Proposal Submitted</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add notes about this stage update..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStage} disabled={updating}>
              {updating ? "Updating..." : "Update Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
