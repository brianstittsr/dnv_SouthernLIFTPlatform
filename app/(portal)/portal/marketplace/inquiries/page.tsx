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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<MarketPlaceInquiryDoc[]>([]);
  const [listings, setListings] = useState<Record<string, MarketPlaceListingDoc>>({});
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<MarketPlaceInquiryDoc | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

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
    </div>
  );
}
