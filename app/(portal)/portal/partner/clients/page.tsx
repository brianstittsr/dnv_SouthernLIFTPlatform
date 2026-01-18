"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Award,
  Briefcase,
  DollarSign,
  Activity,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSmeClients } from "@/lib/mock-data/partner-mock-data";
import Link from "next/link";

interface SmeClient {
  id: string;
  companyName: string;
  industry: string;
  certifications: string[];
  capabilities: string[];
  subscriptionTier: "free" | "basic" | "professional" | "enterprise";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  partnerId: string;
  partnerSince: any;
  activeIntroductions: number;
  totalRevenue: number;
  lastActivity: any;
  createdAt: any;
}

export default function MySMEClientsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<SmeClient[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setClients(mockSmeClients as SmeClient[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "users"),
        where("svpRole", "==", "sme_user"),
        where("partnerId", "==", profile.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        companyName: doc.data().companyName || "Unknown Company",
        industry: doc.data().industry || "Not specified",
        certifications: doc.data().certifications || [],
        capabilities: doc.data().capabilities || [],
        subscriptionTier: doc.data().subscriptionTier || "free",
        contactName: `${doc.data().firstName || ""} ${doc.data().lastName || ""}`.trim() || "N/A",
        contactEmail: doc.data().email || "",
        contactPhone: doc.data().phone || "N/A",
        partnerId: doc.data().partnerId || "",
        partnerSince: doc.data().createdAt || Timestamp.now(),
        activeIntroductions: 0,
        totalRevenue: 0,
        lastActivity: doc.data().updatedAt || Timestamp.now(),
        createdAt: doc.data().createdAt || Timestamp.now(),
      })) as SmeClient[];
      setClients(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load SME clients");
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, any> = {
      free: "outline",
      basic: "secondary",
      professional: "default",
      enterprise: "destructive",
    };
    return (
      <Badge variant={variants[tier] || "outline"}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTimeSince = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
            <h1 className="text-3xl font-bold">My SME Clients</h1>
            <p className="text-muted-foreground">Manage and track your SME client relationships</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {clients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">Active SME partnerships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Introductions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, c) => sum + c.activeIntroductions, 0)}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(clients.reduce((sum, c) => sum + c.totalRevenue, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Client</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  clients.length > 0
                    ? clients.reduce((sum, c) => sum + c.totalRevenue, 0) / clients.length
                    : 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">Per client</p>
            </CardContent>
          </Card>
        </div>
      )}

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No SME Clients Yet</h3>
            <p className="text-muted-foreground mb-4">
              Your SME client relationships will appear here once they're onboarded to the platform.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{client.companyName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      {client.industry}
                    </CardDescription>
                  </div>
                  {getTierBadge(client.subscriptionTier)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.contactEmail}`} className="text-primary hover:underline">
                      {client.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Partner since {formatDate(client.partnerSince)}</span>
                  </div>
                </div>

                <Separator />

                {client.certifications.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Certifications</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {client.certifications.slice(0, 3).map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {client.certifications.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.certifications.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {client.capabilities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Capabilities</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {client.capabilities.slice(0, 2).map((cap, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {client.capabilities.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{client.capabilities.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {client.activeIntroductions}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Intros</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(client.totalRevenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  <Activity className="h-3 w-3 inline mr-1" />
                  Last activity {getTimeSince(client.lastActivity)}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`mailto:${client.contactEmail}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/portal/partner/clients/${client.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
