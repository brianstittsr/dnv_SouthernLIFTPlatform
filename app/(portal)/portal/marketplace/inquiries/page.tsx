"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Inbox,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, orderBy, updateDoc, doc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { COLLECTIONS, type MarketPlaceInquiryDoc, type MarketPlaceListingDoc } from "@/lib/schema";
import { toast } from "sonner";

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: Inbox },
  reviewing: { label: "Reviewing", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  responded: { label: "Responded", color: "bg-green-100 text-green-800", icon: Send },
  negotiating: { label: "Negotiating", color: "bg-purple-100 text-purple-800", icon: MessageSquare },
  declined: { label: "Declined", color: "bg-gray-100 text-gray-800", icon: XCircle },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
};

// Mock inquiry data
const MOCK_INQUIRIES: MarketPlaceInquiryDoc[] = [
  {
    id: "1",
    listingId: "listing-1",
    sellerId: "seller-1",
    buyerId: "buyer-1",
    buyerType: "consortium-member" as const,
    buyerCompanyName: "Acme Manufacturing",
    subject: "CMMC Level 2 Assessment Services",
    message: "We are interested in your CMMC Level 2 assessment services for an upcoming DoD contract. Can you provide more details about your availability and pricing?",
    quantity: 1,
    desiredTimeline: "Q3 2024",
    budgetRange: "$50K-100K",
    attachments: [],
    status: "new" as const,
    engagementType: "inquiry" as const,
    createdAt: { seconds: Date.now() / 1000 - 3600, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 3600, nanoseconds: 0 } as any,
  },
  {
    id: "2",
    listingId: "listing-2",
    sellerId: "seller-1",
    buyerId: "buyer-2",
    buyerType: "consortium-member" as const,
    buyerCompanyName: "Federal Logistics Partners",
    subject: "Teaming Arrangement Discussion",
    message: "We would like to discuss a potential teaming arrangement for a large logistics contract. Please let us know if you're available for a meeting next week.",
    quantity: 1,
    desiredTimeline: "Q4 2024",
    budgetRange: "$500K-1M",
    attachments: [],
    status: "reviewing" as const,
    engagementType: "meeting_request" as const,
    selectionRationale: "Strong geographic coverage and GSA Schedule holder",
    meetingScheduled: true,
    meetingDate: { seconds: Date.parse("2024-06-15T14:00:00") / 1000, nanoseconds: 0 } as any,
    meetingNotes: "Initial teaming discussion",
    createdAt: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 43200, nanoseconds: 0 } as any,
  },
  {
    id: "3",
    listingId: "listing-3",
    sellerId: "seller-1",
    buyerId: "buyer-3",
    buyerType: "consortium-member" as const,
    buyerCompanyName: "CyberShield Technologies",
    subject: "Compliance Management System Demo",
    message: "Your compliance management system looks interesting. We'd like to schedule a demo to understand how it integrates with our existing systems.",
    quantity: 1,
    desiredTimeline: "Q3 2024",
    budgetRange: "$25K-50K",
    attachments: [],
    status: "responded" as const,
    engagementType: "inquiry" as const,
    sellerResponse: "Thank you for your interest. We'd be happy to schedule a demo next week.",
    responseAt: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 } as any,
    createdAt: { seconds: Date.now() / 1000 - 172800, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 } as any,
  },
  {
    id: "4",
    listingId: "listing-4",
    sellerId: "seller-1",
    buyerId: "buyer-4",
    buyerType: "consortium-member" as const,
    buyerCompanyName: "Precision Components Inc",
    subject: "Joint Proposal - Aerospace Components",
    message: "We are negotiating terms for a joint proposal on the aerospace components contract. Our team has reviewed your capabilities and we're impressed.",
    quantity: 1,
    desiredTimeline: "Q4 2024",
    budgetRange: "$1M-5M",
    attachments: [],
    status: "negotiating" as const,
    engagementType: "teaming_discussion" as const,
    selectionRationale: "Complementary capabilities and strong past performance",
    createdAt: { seconds: Date.now() / 1000 - 259200, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 172800, nanoseconds: 0 } as any,
  },
  {
    id: "5",
    listingId: "listing-5",
    sellerId: "seller-1",
    buyerId: "buyer-5",
    buyerType: "consortium-member" as const,
    buyerCompanyName: "Integrated Defense Systems",
    subject: "Partnership Decision",
    message: "After reviewing multiple options, we've decided to move forward with a different partner for this opportunity. Thank you for your time.",
    quantity: 1,
    desiredTimeline: "Q3 2024",
    budgetRange: "$100K-250K",
    attachments: [],
    status: "declined" as const,
    engagementType: "inquiry" as const,
    createdAt: { seconds: Date.now() / 1000 - 345600, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 259200, nanoseconds: 0 } as any,
  },
  {
    id: "6",
    listingId: "listing-6",
    sellerId: "seller-1",
    buyerId: "buyer-6",
    buyerType: "consortium-member" as const,
    buyerCompanyName: "Regional Manufacturing Co",
    subject: "Partnership Confirmation - E2G Project",
    message: "We're excited to announce that we've successfully partnered on the E2G manufacturing project. Looking forward to a successful collaboration!",
    quantity: 1,
    desiredTimeline: "Q2 2024",
    budgetRange: "$250K-500K",
    attachments: [],
    status: "converted" as const,
    engagementType: "teaming_discussion" as const,
    selectionRationale: "Best fit for regional manufacturing capabilities and cost structure",
    createdAt: { seconds: Date.now() / 1000 - 432000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000 - 345600, nanoseconds: 0 } as any,
  },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<MarketPlaceInquiryDoc[]>([]);
  const [listings, setListings] = useState<Record<string, MarketPlaceListingDoc>>({});
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<MarketPlaceInquiryDoc | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  const [showEngagementDetails, setShowEngagementDetails] = useState<string | null>(null);
  const [engagementForm, setEngagementForm] = useState({
    engagementType: "inquiry" as "inquiry" | "meeting_request" | "teaming_discussion" | "proposal_request",
    selectionRationale: "",
    meetingScheduled: false,
    meetingDate: "",
    meetingNotes: "",
  });

  useEffect(() => {
    if (useMockData) {
      setInquiries(MOCK_INQUIRIES);
      setLoading(false);
    } else {
      fetchInquiries();
    }
  }, [useMockData]);

  const fetchInquiries = async () => {
    if (!db || !auth?.currentUser) return;

    setLoading(true);
    try {
      // Get current user's team member ID
      const { query: queryFn, where: whereFn, getDocs: getDocsFn, orderBy: orderByFn } = await import("firebase/firestore");
      const teamMemberQuery = queryFn(
        collection(db, COLLECTIONS.TEAM_MEMBERS),
        whereFn("firebaseUid", "==", auth.currentUser.uid)
      );
      const teamMemberSnap = await getDocsFn(teamMemberQuery);
      
      if (teamMemberSnap.empty) {
        setInquiries([]);
        return;
      }

      const teamMemberId = teamMemberSnap.docs[0].id;

      // Fetch inquiries where user is the seller
      const inquiriesQuery = queryFn(
        collection(db, COLLECTIONS.MARKETPLACE_INQUIRIES),
        whereFn("sellerId", "==", teamMemberId),
        orderByFn("createdAt", "desc")
      );

      const inquiriesSnap = await getDocsFn(inquiriesQuery);
      const inquiriesData = inquiriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MarketPlaceInquiryDoc[];

      setInquiries(inquiriesData);

      // Fetch related listings
      const listingIds = [...new Set(inquiriesData.map((i) => i.listingId))];
      const listingsData: Record<string, MarketPlaceListingDoc> = {};

      for (const listingId of listingIds) {
        const listingDoc = await getDoc(doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, listingId));
        if (listingDoc.exists()) {
          listingsData[listingId] = { id: listingDoc.id, ...listingDoc.data() } as MarketPlaceListingDoc;
        }
      }

      setListings(listingsData);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!db || !selectedInquiry || !responseText.trim()) return;

    setResponding(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_INQUIRIES, selectedInquiry.id), {
        status: "responded",
        sellerResponse: responseText,
        responseAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success("Response sent successfully");
      setSelectedInquiry(null);
      setResponseText("");
      fetchInquiries();
    } catch (error) {
      console.error("Error responding:", error);
      toast.error("Failed to send response");
    } finally {
      setResponding(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_INQUIRIES, inquiryId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      toast.success(`Status updated to ${newStatus}`);
      fetchInquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSaveEngagementDetails = async (inquiryId: string) => {
    if (!db) return;

    try {
      const updateData: any = {
        engagementType: engagementForm.engagementType,
        selectionRationale: engagementForm.selectionRationale,
        meetingScheduled: engagementForm.meetingScheduled,
        meetingNotes: engagementForm.meetingNotes,
        updatedAt: new Date(),
      };

      if (engagementForm.meetingScheduled && engagementForm.meetingDate) {
        updateData.meetingDate = new Date(engagementForm.meetingDate);
      }

      await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_INQUIRIES, inquiryId), updateData);

      toast.success("Engagement details saved");
      setShowEngagementDetails(null);
      fetchInquiries();
    } catch (error) {
      console.error("Error saving engagement details:", error);
      toast.error("Failed to save engagement details");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
    return (
      <Badge className={config.color}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const respondedCount = inquiries.filter((i) => i.status === "responded").length;
  const negotiatingCount = inquiries.filter((i) => i.status === "negotiating").length;
  const convertedCount = inquiries.filter((i) => i.status === "converted").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track inquiries from interested buyers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="mock-data-toggle" className="text-sm">Use Mock Data</Label>
          <Switch
            id="mock-data-toggle"
            checked={useMockData}
            onCheckedChange={setUseMockData}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Inbox className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{newCount}</div>
              <div className="text-sm text-muted-foreground">New Inquiries</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{respondedCount}</div>
              <div className="text-sm text-muted-foreground">Responded</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-100 p-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{negotiatingCount}</div>
              <div className="text-sm text-muted-foreground">Negotiating</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{convertedCount}</div>
              <div className="text-sm text-muted-foreground">Converted</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inquiries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage inquiries from potential buyers
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInquiries}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-muted-foreground">Loading inquiries...</div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No inquiries yet</h3>
              <p className="text-center text-sm text-muted-foreground">
                When buyers express interest in your listings, you'll see them here.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/portal/marketplace/my-listings">
                  View My Listings
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => {
                const listing = listings[inquiry.listingId];
                return (
                  <Card key={inquiry.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            {getStatusBadge(inquiry.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(inquiry.createdAt?.toDate?.() || inquiry.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="font-semibold">{inquiry.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            Re: {listing?.title || "Unknown Listing"}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm">{inquiry.message}</p>

                          {/* Engagement Type Badge */}
                          {inquiry.engagementType && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                <FileText className="mr-1 h-3 w-3" />
                                {inquiry.engagementType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            </div>
                          )}

                          {/* Selection Rationale */}
                          {inquiry.selectionRationale && (
                            <div className="mt-2 rounded-lg bg-blue-50 p-2 border border-blue-200">
                              <div className="text-xs font-medium text-blue-900">Selection Rationale:</div>
                              <p className="mt-1 text-xs text-blue-800">{inquiry.selectionRationale}</p>
                            </div>
                          )}

                          {/* Meeting Info */}
                          {inquiry.meetingScheduled && (
                            <div className="mt-2 rounded-lg bg-amber-50 p-2 border border-amber-200">
                              <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
                                <Calendar className="h-3 w-3" />
                                Meeting Scheduled
                              </div>
                              {inquiry.meetingDate && (
                                <p className="mt-1 text-xs text-amber-800">
                                  {new Date(inquiry.meetingDate?.toDate?.() || inquiry.meetingDate).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          {inquiry.sellerResponse && (
                            <div className="mt-3 rounded-lg bg-muted p-3">
                              <div className="text-xs font-medium text-muted-foreground">
                                Your Response:
                              </div>
                              <p className="mt-1 text-sm">{inquiry.sellerResponse}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                            disabled={inquiry.status === "responded" || inquiry.status === "converted"}
                          >
                            Respond
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEngagementDetails(inquiry.id)}
                          >
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Track Engagement
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/portal/marketplace/listings/${inquiry.listingId}`}>
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View Listing
                            </Link>
                          </Button>
                          {inquiry.status === "new" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(inquiry.id, "declined")}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Decline
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Inquiry</DialogTitle>
            <DialogDescription>
              {selectedInquiry?.subject}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs font-medium text-muted-foreground">Buyer Message:</div>
              <p className="mt-1 text-sm">{selectedInquiry?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Write your response to the buyer..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={responding || !responseText.trim()}>
              {responding ? "Sending..." : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Engagement Tracking Dialog */}
      <Dialog open={!!showEngagementDetails} onOpenChange={() => setShowEngagementDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Track Engagement</DialogTitle>
            <DialogDescription>
              Log engagement details for federal compliance and audit trail
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="engagementType">Engagement Type</Label>
              <select
                id="engagementType"
                className="w-full px-3 py-2 border rounded-md"
                value={engagementForm.engagementType}
                onChange={(e) => setEngagementForm({ ...engagementForm, engagementType: e.target.value as any })}
              >
                <option value="inquiry">Initial Inquiry</option>
                <option value="meeting_request">Meeting Request</option>
                <option value="teaming_discussion">Teaming Discussion</option>
                <option value="proposal_request">Proposal Request</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectionRationale">Selection Rationale</Label>
              <p className="text-xs text-muted-foreground">
                Why this partner was selected for E2G roles (required for federal compliance)
              </p>
              <Textarea
                id="selectionRationale"
                placeholder="Explain why this partner was selected..."
                value={engagementForm.selectionRationale}
                onChange={(e) => setEngagementForm({ ...engagementForm, selectionRationale: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="meetingScheduled"
                  checked={engagementForm.meetingScheduled}
                  onCheckedChange={(checked) => setEngagementForm({ ...engagementForm, meetingScheduled: checked as boolean })}
                />
                <Label htmlFor="meetingScheduled" className="text-sm font-normal cursor-pointer">
                  Meeting Scheduled
                </Label>
              </div>
              {engagementForm.meetingScheduled && (
                <div className="mt-2">
                  <Label htmlFor="meetingDate">Meeting Date</Label>
                  <Input
                    id="meetingDate"
                    type="datetime-local"
                    value={engagementForm.meetingDate}
                    onChange={(e) => setEngagementForm({ ...engagementForm, meetingDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingNotes">Meeting Notes</Label>
              <Textarea
                id="meetingNotes"
                placeholder="Notes from the meeting or discussion..."
                value={engagementForm.meetingNotes}
                onChange={(e) => setEngagementForm({ ...engagementForm, meetingNotes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEngagementDetails(null)}>
              Cancel
            </Button>
            <Button onClick={() => showEngagementDetails && handleSaveEngagementDetails(showEngagementDetails)}>
              Save Engagement Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
