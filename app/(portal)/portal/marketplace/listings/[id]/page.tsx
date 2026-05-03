"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Award,
  MessageSquare,
  Share2,
  Eye,
  ExternalLink,
  Package,
  Wrench,
  Clock,
  FileText,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, Timestamp, updateDoc, collection } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { COLLECTIONS, type MarketPlaceListingDoc, type TeamMemberDoc } from "@/lib/schema";
import { toast } from "sonner";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<MarketPlaceListingDoc | null>(null);
  const [seller, setSeller] = useState<TeamMemberDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId, currentUserId]);

  const fetchListing = async () => {
    if (!db) return;

    setLoading(true);
    try {
      const docRef = doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, listingId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as MarketPlaceListingDoc;
        setListing(data);

        // Check if current user is the owner
        const currentUserDoc = await getCurrentUserTeamMember();
        if (currentUserDoc && data.sellerId === currentUserDoc.id) {
          setIsOwner(true);
        }

        // Fetch seller info
        const sellerRef = doc(db, COLLECTIONS.TEAM_MEMBERS, data.sellerId);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSeller({ id: sellerSnap.id, ...sellerSnap.data() } as TeamMemberDoc);
        }

        // Increment view count (only if not owner)
        if (!isOwner && data.status === "published") {
          await updateDoc(docRef, {
            viewCount: (data.viewCount || 0) + 1,
          });
        }
      } else {
        toast.error("Listing not found");
        router.push("/portal/marketplace");
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserTeamMember = async () => {
    if (!db || !auth?.currentUser) return null;
    
    const { query, where, getDocs } = await import("firebase/firestore");
    const q = query(
      collection(db, COLLECTIONS.TEAM_MEMBERS),
      where("firebaseUid", "==", auth.currentUser.uid)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as TeamMemberDoc;
    }
    return null;
  };

  const handleSubmitInquiry = async () => {
    if (!db || !listing || !currentUserId) {
      toast.error("Unable to submit inquiry");
      return;
    }

    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = await getCurrentUserTeamMember();
      if (!currentUser) {
        toast.error("User profile not found");
        return;
      }

      const inquiryData = {
        listingId: listing.id,
        sellerId: listing.sellerId,
        buyerId: currentUser.id,
        buyerType: "consortium-member",
        subject: inquirySubject,
        message: inquiryMessage,
        attachments: [],
        status: "new",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, COLLECTIONS.MARKETPLACE_INQUIRIES), inquiryData);

      // Update inquiry count
      await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, listing.id), {
        inquiryCount: (listing.inquiryCount || 0) + 1,
      });

      toast.success("Inquiry sent successfully!");
      setInquiryOpen(false);
      setInquirySubject("");
      setInquiryMessage("");
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to send inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-5 w-5" />;
      case "service":
        return <Wrench className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Badge variant="secondary">Public</Badge>;
      case "consortium-only":
        return <Badge className="bg-blue-100 text-blue-800">Consortium</Badge>;
      case "oem-only":
        return <Badge className="bg-amber-100 text-amber-800">OEM Only</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading listing...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Listing not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/portal/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              {getListingTypeIcon(listing.listingType)}
              <span className="text-sm font-medium uppercase text-muted-foreground">
                {listing.listingType}
              </span>
              {getVisibilityBadge(listing.visibility)}
              {isOwner && <Badge variant="outline">Your Listing</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{listing.shortDescription}</p>
          </div>

          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {listing.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${listing.title} - ${idx + 1}`}
                  className="h-64 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              {listing.documents && listing.documents.length > 0 && (
                <TabsTrigger value="documents">Documents</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">Description</h3>
                  <p className="whitespace-pre-wrap">{listing.description}</p>
                </CardContent>
              </Card>

              {listing.deliveryTimeline && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Delivery Timeline</div>
                      <div className="text-sm text-muted-foreground">
                        {listing.deliveryTimeline}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {listing.geographicServiceArea && listing.geographicServiceArea.length > 0 && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Service Area</div>
                      <div className="text-sm text-muted-foreground">
                        {listing.geographicServiceArea.join(", ")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="capabilities">
              <Card>
                <CardContent className="p-6">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.categories.map((cat) => (
                        <Badge key={cat} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* NAICS Codes */}
                  {listing.naicsCodes && listing.naicsCodes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 font-semibold">NAICS Codes</h3>
                      <ul className="space-y-1 text-sm">
                        {listing.naicsCodes.map((code) => (
                          <li key={code}>{code}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Certifications */}
                  {listing.certifications && listing.certifications.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.certifications.map((cert) => (
                          <Badge key={cert} className="bg-green-100 text-green-800">
                            <Award className="mr-1 h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {listing.documents && listing.documents.length > 0 && (
              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold">Documents & Resources</h3>
                    <div className="space-y-2">
                      {listing.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="flex-1">{doc.name}</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {seller?.companyLogo ? (
                  <img
                    src={seller.companyLogo}
                    alt={listing.sellerCompanyName}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{listing.sellerCompanyName}</div>
                  {seller && (
                    <div className="text-sm text-muted-foreground">
                      {seller.yearsInBusiness && `${seller.yearsInBusiness} years in business`}
                    </div>
                  )}
                </div>
              </div>

              {seller?.companyDescription && (
                <p className="text-sm text-muted-foreground">{seller.companyDescription}</p>
              )}

              {seller?.website && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={seller.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{listing.viewCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{listing.inquiryCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Inquiries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isOwner && (
            <Button className="w-full" onClick={() => setInquiryOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Express Interest
            </Button>
          )}

          {isOwner && (
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/portal/marketplace/my-listings/${listing.id}/edit`}>
                Edit Listing
              </Link>
            </Button>
          )}

          <Button variant="ghost" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share Listing
          </Button>
        </div>
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription>
              Send an inquiry to {listing.sellerCompanyName} about "{listing.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., RFQ for CNC Machining Services"
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your requirements, timeline, and any questions..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInquiryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitInquiry} disabled={submitting}>
              {submitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
