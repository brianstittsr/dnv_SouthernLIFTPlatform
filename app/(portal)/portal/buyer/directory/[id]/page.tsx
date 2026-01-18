"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Award,
  Briefcase,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  FileText,
  ArrowLeft,
  MessageSquare,
  Heart,
  ExternalLink,
  Calendar,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { mockSMEProfiles } from "@/lib/mock-data/buyer-mock-data";
import Link from "next/link";

interface SMEProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  specialization: string;
  certifications: string[];
  yearsInBusiness: number;
  employeeCount: number;
  annualRevenue: number;
  location: string;
  serviceOfferings: string[];
  pastClients: string[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  completionRate: number;
  verified: boolean;
  proofPacksCount: number;
  introductionsCount: number;
  createdAt: any;
}

export default function SMEProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [smeProfile, setSmeProfile] = useState<SMEProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSMEProfile();
    checkIfSaved();
  }, [id]);

  const loadSMEProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try mock data first
      const mockSme = mockSMEProfiles.find(s => s.id === id);
      if (mockSme) {
        setSmeProfile(mockSme as SMEProfile);
        setLoading(false);
        return;
      }

      // Load from Firestore
      if (!db) {
        setError("Database not initialized");
        setLoading(false);
        return;
      }

      const smeDoc = await getDoc(doc(db, "users", id));
      if (!smeDoc.exists()) {
        setError("SME profile not found");
        setLoading(false);
        return;
      }

      setSmeProfile({ id: smeDoc.id, ...smeDoc.data() } as SMEProfile);
    } catch (err: any) {
      console.error("Error loading SME profile:", err);
      setError(err.message || "Failed to load SME profile");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "buyerFavorites"),
        where("buyerId", "==", profile.id),
        where("smeId", "==", id)
      );
      const snapshot = await getDocs(q);
      setIsSaved(!snapshot.empty);
    } catch (err) {
      console.error("Error checking saved status:", err);
    }
  };

  const handleToggleSave = async () => {
    if (!smeProfile) return;

    try {
      setSaving(true);
      
      if (isSaved) {
        // Remove from favorites (mock implementation)
        setIsSaved(false);
        toast.success("Removed from saved SMEs");
      } else {
        // Add to favorites (mock implementation)
        setIsSaved(true);
        toast.success("Added to saved SMEs");
      }
    } catch (err: any) {
      console.error("Error toggling save:", err);
      toast.error("Failed to update saved status");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !smeProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">SME Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || "The requested SME profile could not be found."}</p>
            <Button asChild>
              <Link href="/portal/buyer/directory">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/portal/buyer/directory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{smeProfile.companyName}</h1>
              {smeProfile.verified && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground mb-4">{smeProfile.specialization}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{smeProfile.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{smeProfile.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{smeProfile.rating}</span>
                <span className="text-muted-foreground">({smeProfile.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isSaved ? "default" : "outline"}
              onClick={handleToggleSave}
              disabled={saving}
            >
              <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save SME"}
            </Button>
            <Button asChild>
              <a href={`mailto:${smeProfile.email}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Years in Business</p>
                <p className="text-2xl font-bold">{smeProfile.yearsInBusiness}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{smeProfile.employeeCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(smeProfile.annualRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{smeProfile.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="clients">Past Clients</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Specialization</h3>
                    <p className="text-muted-foreground">{smeProfile.specialization}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Industry</h3>
                    <Badge variant="secondary">{smeProfile.industry}</Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Response Time</h3>
                      <p className="text-muted-foreground">{smeProfile.responseTime}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Proof Packs</h3>
                      <p className="text-muted-foreground">{smeProfile.proofPacksCount} available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Offerings</CardTitle>
                  <CardDescription>
                    Capabilities and services provided by this SME
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {smeProfile.serviceOfferings.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Compliance</CardTitle>
                  <CardDescription>
                    Industry certifications and compliance standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {smeProfile.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
                        <Award className="h-6 w-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-semibold">{cert}</p>
                          <p className="text-xs text-muted-foreground">Certified</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Past Clients</CardTitle>
                  <CardDescription>
                    Notable companies this SME has worked with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {smeProfile.pastClients.map((client, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
                        <Building2 className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{client}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                <p className="font-medium">{smeProfile.contactName}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${smeProfile.email}`} className="text-primary hover:underline">
                    {smeProfile.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${smeProfile.phone}`} className="hover:underline">
                    {smeProfile.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{smeProfile.location}</span>
                </div>
              </div>
              <Separator />
              <Button className="w-full" asChild>
                <a href={`mailto:${smeProfile.email}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="font-bold text-primary">{smeProfile.rating}/5.0</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(smeProfile.rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({smeProfile.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="font-bold text-green-600">{smeProfile.responseTime}</span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-bold text-blue-600">{smeProfile.completionRate}%</span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Introductions</span>
                  <span className="font-bold">{smeProfile.introductionsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/portal/buyer/introductions/request?smeId=${smeProfile.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Request Introduction
                </Link>
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Proof Packs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
