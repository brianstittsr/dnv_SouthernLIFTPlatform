"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Building2, 
  FileText, 
  Download,
  Calendar,
  Eye,
  ExternalLink,
  Share2,
  Tag,
  FolderOpen,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSharedProofPacks } from "@/lib/mock-data/buyer-mock-data";
import Link from "next/link";

interface ProofPackDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: any;
}

interface SharedProofPack {
  id: string;
  title: string;
  smeId: string;
  smeCompany: string;
  sharedBy: string;
  sharedByName: string;
  sharedAt: any;
  description: string;
  documents: ProofPackDocument[];
  tags: string[];
  viewCount: number;
  downloadCount: number;
}

export default function SharedProofPacksPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [proofPacks, setProofPacks] = useState<SharedProofPack[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setProofPacks(mockSharedProofPacks as SharedProofPack[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, "sharedProofPacks"),
        where("sharedWith", "array-contains", profile.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as SharedProofPack[];
      setProofPacks(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load shared proof packs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDocumentTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      certification: "default",
      case_study: "secondary",
      technical: "outline",
    };
    return variants[type] || "outline";
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
            <h1 className="text-3xl font-bold">Shared Proof Packs</h1>
            <p className="text-muted-foreground">SME portfolios shared with you</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {proofPacks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Shared Proof Packs Yet</h3>
            <p className="text-muted-foreground mb-4">
              Partners will share SME proof packs with you to help you evaluate potential vendors.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proofPacks.map((pack) => (
            <Card key={pack.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{pack.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {pack.smeCompany}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Shared
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{pack.description}</p>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span>Shared by <span className="font-medium">{pack.sharedByName}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Shared {formatDate(pack.sharedAt)}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Documents</span>
                    </div>
                    <Badge variant="secondary">{pack.documents.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {pack.documents.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <Badge variant={getDocumentTypeBadge(doc.type)} className="text-xs ml-2 flex-shrink-0">
                          {doc.type.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                    {pack.documents.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        +{pack.documents.length - 3} more documents
                      </p>
                    )}
                  </div>
                </div>

                {pack.tags && pack.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pack.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{pack.viewCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{pack.downloadCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/portal/buyer/shared-packs/${pack.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Pack
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/portal/buyer/directory/${pack.smeId}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      SME Profile
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
