"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Plus, FileText, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { DataModeToggle } from "@/components/svp/data-mode-toggle";

interface ProofPack {
  id: string;
  title: string;
  description: string;
  status: string;
  documentCount: number;
  packHealth: {
    overallScore: number;
    isEligibleForIntroductions: boolean;
  };
  updatedAt: any;
}

const MOCK_PROOF_PACKS: ProofPack[] = [
  {
    id: "mock-1",
    title: "DoD Manufacturing Capabilities 2024",
    description: "Comprehensive proof pack for DoD precision manufacturing contracts, including ISO 9001:2015, AS9100D, and CMMC Level 2 certifications.",
    status: "approved",
    documentCount: 12,
    packHealth: {
      overallScore: 85,
      isEligibleForIntroductions: true,
    },
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "mock-2",
    title: "Battery Manufacturing - Commercial OEM",
    description: "Commercial lane proof pack targeting Battery/EV OEMs with UL certifications, customer references, and technical specifications.",
    status: "submitted",
    documentCount: 8,
    packHealth: {
      overallScore: 72,
      isEligibleForIntroductions: true,
    },
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "mock-3",
    title: "Critical Minerals Supply Chain",
    description: "Government lane pack for critical minerals procurement with past performance, financial documentation, and compliance certifications.",
    status: "draft",
    documentCount: 5,
    packHealth: {
      overallScore: 58,
      isEligibleForIntroductions: false,
    },
    updatedAt: new Date("2024-01-08"),
  },
  {
    id: "mock-4",
    title: "Biopharma Quality Assurance Services",
    description: "Commercial lane pack for biopharma industry with ISO 13485, FDA compliance, and extensive case studies.",
    status: "approved",
    documentCount: 15,
    packHealth: {
      overallScore: 92,
      isEligibleForIntroductions: true,
    },
    updatedAt: new Date("2024-01-12"),
  },
];

export default function ProofPacksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofPacks, setProofPacks] = useState<ProofPack[]>([]);
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      fetchProofPacks();
    }
  }, [useMockData]);

  const loadMockData = () => {
    setLoading(true);
    setTimeout(() => {
      setProofPacks(MOCK_PROOF_PACKS);
      setSubscriptionTier("diy");
      setLoading(false);
      setError(null);
    }, 500);
  };

  const fetchProofPacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const [packsRes, profileRes] = await Promise.all([
        fetch("/api/proof-packs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (packsRes.ok) {
        const data = await packsRes.json();
        setProofPacks(data.proofPacks || []);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setSubscriptionTier(data.subscriptionTier || "free");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Proof Packs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProofPack = () => {
    router.push("/portal/proof-packs/create");
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      submitted: "default",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading Proof Packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Proof Packs</h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage your compliance documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DataModeToggle
            useMockData={useMockData}
            onToggle={() => setUseMockData(!useMockData)}
          />
          <Button onClick={handleCreateProofPack}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Proof Pack
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {subscriptionTier === "free" && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Free tier: {proofPacks.length}/3 Proof Packs used.{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/portal/subscription")}
            >
              Upgrade for unlimited
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {proofPacks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Proof Packs Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first Proof Pack to start organizing your compliance documents
            </p>
            <Button onClick={handleCreateProofPack}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Proof Pack
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proofPacks.map((pack) => (
            <Card
              key={pack.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/portal/proof-packs/${pack.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{pack.title}</CardTitle>
                  {getStatusBadge(pack.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {pack.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pack Health</span>
                      <span className={`text-lg font-bold ${getHealthColor(pack.packHealth.overallScore)}`}>
                        {pack.packHealth.overallScore}
                      </span>
                    </div>
                    <Progress value={pack.packHealth.overallScore} />
                    {pack.packHealth.isEligibleForIntroductions && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Eligible for introductions</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{pack.documentCount} documents</span>
                    <span>
                      Updated {new Date(pack.updatedAt?.toDate ? pack.updatedAt.toDate() : pack.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
