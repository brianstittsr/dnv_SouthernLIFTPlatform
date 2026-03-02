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
import { Loader2, Building2, Calendar, DollarSign, CheckCircle2, Clock, XCircle, ArrowRight, Phone, Mail, Video, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockBuyerIntroductions } from "@/lib/mock-data/buyer-mock-data";

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
  priority?: string;
}

export default function MyIntroductionsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Introduction[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedIntro, setSelectedIntro] = useState<Introduction | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setItems(mockBuyerIntroductions as Introduction[]);
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
        where("buyerId", "==", profile.id)
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

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const variants: Record<string, any> = {
      high: "destructive",
      medium: "default",
      low: "outline",
    };
    return (
      <Badge variant={variants[priority] || "outline"}>
        {priority.toUpperCase()}
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
            <h1 className="text-3xl font-bold">My Introductions</h1>
            <p className="text-muted-foreground">Track your SME introduction requests and communications</p>
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
              Browse the SME Directory to request introductions to qualified vendors.
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
                      <CardTitle className="text-xl">{intro.smeCompany}</CardTitle>
                      {getStatusBadge(intro.status)}
                      {getStageBadge(intro.stage)}
                      {getPriorityBadge(intro.priority)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      {intro.estimatedValue && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(intro.estimatedValue)}
                        </span>
                      )}
                      {intro.timeline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {intro.timeline}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedIntro(intro);
                      setShowDetailsDialog(true);
                    }}
                  >
                    View Details
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Introduction Details</DialogTitle>
            <DialogDescription>
              Full details of your introduction request
            </DialogDescription>
          </DialogHeader>
          {selectedIntro && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold">SME Company</Label>
                  <p className="text-sm mt-1">{selectedIntro.smeCompany}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedIntro.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Current Stage</Label>
                  <div className="mt-1">{getStageBadge(selectedIntro.stage)}</div>
                </div>
                {selectedIntro.estimatedValue && (
                  <div>
                    <Label className="text-sm font-semibold">Estimated Value</Label>
                    <p className="text-sm mt-1">{formatCurrency(selectedIntro.estimatedValue)}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-semibold">Project Description</Label>
                <p className="text-sm mt-1">{selectedIntro.projectDescription}</p>
              </div>
              {selectedIntro.timeline && (
                <div>
                  <Label className="text-sm font-semibold">Timeline</Label>
                  <p className="text-sm mt-1">{selectedIntro.timeline}</p>
                </div>
              )}
              {selectedIntro.budgetRange && (
                <div>
                  <Label className="text-sm font-semibold">Budget Range</Label>
                  <p className="text-sm mt-1">{selectedIntro.budgetRange}</p>
                </div>
              )}
              {selectedIntro.declineReason && (
                <div>
                  <Label className="text-sm font-semibold">Decline Reason</Label>
                  <p className="text-sm mt-1 text-destructive">{selectedIntro.declineReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
