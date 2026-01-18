"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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
  ArrowLeft,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { mockSharedProofPacks, mockSMEProfiles } from "@/lib/mock-data/buyer-mock-data";
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

interface SMEProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  specialization: string;
  certifications: string[];
  location: string;
  yearsInBusiness: number;
  employeeCount: number;
  rating: number;
  verified: boolean;
}

export default function ViewProofPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [proofPack, setProofPack] = useState<SharedProofPack | null>(null);
  const [smeProfile, setSmeProfile] = useState<SMEProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProofPack();
  }, [id]);

  const loadProofPack = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try mock data first
      const mockPack = mockSharedProofPacks.find(p => p.id === id);
      if (mockPack) {
        setProofPack(mockPack as SharedProofPack);
        const mockSme = mockSMEProfiles.find(s => s.id === mockPack.smeId);
        if (mockSme) {
          setSmeProfile(mockSme as SMEProfile);
        }
        setLoading(false);
        return;
      }

      // Load from Firestore
      if (!db) {
        setError("Database not initialized");
        setLoading(false);
        return;
      }

      const packDoc = await getDoc(doc(db, "sharedProofPacks", id));
      if (!packDoc.exists()) {
        setError("Proof pack not found");
        setLoading(false);
        return;
      }

      const packData = { id: packDoc.id, ...packDoc.data() } as SharedProofPack;
      setProofPack(packData);

      // Load SME profile
      if (packData.smeId) {
        const smeDoc = await getDoc(doc(db, "users", packData.smeId));
        if (smeDoc.exists()) {
          setSmeProfile({ id: smeDoc.id, ...smeDoc.data() } as SMEProfile);
        }
      }
    } catch (err: any) {
      console.error("Error loading proof pack:", err);
      setError(err.message || "Failed to load proof pack");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = (doc: ProofPackDocument) => {
    toast.success(`Downloading ${doc.name}...`);
    // In production, this would trigger actual download
    window.open(doc.url, "_blank");
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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

  if (error || !proofPack) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Proof Pack Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || "The requested proof pack could not be found."}</p>
            <Button asChild>
              <Link href="/portal/buyer/shared-packs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shared Packs
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
          <Link href="/portal/buyer/shared-packs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shared Packs
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{proofPack.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{proofPack.smeCompany}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Shared by {proofPack.sharedByName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(proofPack.sharedAt)}</span>
              </div>
            </div>
          </div>
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Shared
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Proof Pack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{proofPack.description}</p>
              
              {proofPack.tags && proofPack.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proofPack.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents ({proofPack.documents.length})
              </CardTitle>
              <CardDescription>
                Compliance documentation and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proofPack.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getDocumentTypeBadge(doc.type)} className="text-xs">
                            {doc.type.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Uploaded {formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{proofPack.viewCount || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Downloads</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{proofPack.downloadCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SME Profile Card */}
          {smeProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  SME Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{smeProfile.companyName}</h3>
                    {smeProfile.verified && (
                      <Badge variant="default" className="gap-1">
                        <Award className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{smeProfile.specialization}</p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{smeProfile.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{smeProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${smeProfile.email}`} className="text-primary hover:underline">
                      {smeProfile.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{smeProfile.phone}</span>
                  </div>
                </div>

                <Separator />

                {smeProfile.certifications && smeProfile.certifications.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Certifications</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {smeProfile.certifications.slice(0, 3).map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {smeProfile.certifications.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{smeProfile.certifications.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{smeProfile.rating}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{smeProfile.yearsInBusiness}</div>
                    <div className="text-xs text-muted-foreground">Years</div>
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href={`/portal/buyer/directory/${smeProfile.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
