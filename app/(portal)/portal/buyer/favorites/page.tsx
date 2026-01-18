"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where, getDoc } from "firebase/firestore";
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
  MapPin,
  Calendar,
  Star,
  Trash2,
  ExternalLink,
  MessageSquare,
  Award,
  Briefcase,
  TrendingUp,
  FolderOpen,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSavedSMEs, mockSMEProfiles } from "@/lib/mock-data/buyer-mock-data";
import Link from "next/link";

interface SavedSME {
  id: string;
  buyerId: string;
  smeId: string;
  smeCompany: string;
  savedAt: any;
  notes: string;
  tags: string[];
  folder: string;
  smeProfile?: any;
}

export default function SavedSMEsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [savedSMEs, setSavedSMEs] = useState<SavedSME[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadMockData = async () => {
    setLoading(true);
    try {
      const enrichedData = mockSavedSMEs.map(saved => {
        const smeProfile = mockSMEProfiles.find(sme => sme.id === saved.smeId);
        return { ...saved, smeProfile };
      });
      setSavedSMEs(enrichedData as SavedSME[]);
    } catch (error) {
      console.error("Error loading mock data:", error);
      toast.error("Failed to load mock data");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, "buyerFavorites"),
        where("buyerId", "==", profile.id)
      );
      const snapshot = await getDocs(q);
      
      const enrichedData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const savedData = { id: docSnap.id, ...docSnap.data() } as SavedSME;
          
          try {
            if (db) {
              const smeDoc = await getDoc(doc(db, "users", savedData.smeId));
              if (smeDoc.exists()) {
                savedData.smeProfile = { id: smeDoc.id, ...smeDoc.data() };
              }
            }
          } catch (err) {
            console.error("Error fetching SME profile:", err);
          }
          
          return savedData;
        })
      );
      
      setSavedSMEs(enrichedData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load saved SMEs");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSME = async (savedId: string) => {
    try {
      if (useMockData) {
        setSavedSMEs(prev => prev.filter(s => s.id !== savedId));
        toast.success("SME removed from favorites");
        return;
      }

      if (!db) return;
      await deleteDoc(doc(db, "buyerFavorites", savedId));
      setSavedSMEs(prev => prev.filter(s => s.id !== savedId));
      toast.success("SME removed from favorites");
    } catch (error) {
      console.error("Error removing SME:", error);
      toast.error("Failed to remove SME");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const folders = Array.from(new Set(savedSMEs.map(s => s.folder).filter(Boolean)));
  const filteredSMEs = selectedFolder 
    ? savedSMEs.filter(s => s.folder === selectedFolder)
    : savedSMEs;

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
            <h1 className="text-3xl font-bold">Saved SMEs</h1>
            <p className="text-muted-foreground">Your favorite SME vendors</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {folders.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedFolder === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFolder(null)}
            >
              All ({savedSMEs.length})
            </Button>
            {folders.map(folder => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder(folder)}
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                {folder} ({savedSMEs.filter(s => s.folder === folder).length})
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredSMEs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved SMEs Yet</h3>
            <p className="text-muted-foreground mb-4">
              Save your favorite SME vendors from the directory to quickly access them later.
            </p>
            <Button asChild>
              <Link href="/portal/buyer/directory">
                Browse SME Directory
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSMEs.map((saved) => {
            const sme = saved.smeProfile;
            if (!sme) return null;

            return (
              <Card key={saved.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{sme.companyName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        {sme.industry}
                      </CardDescription>
                    </div>
                    {sme.verified && (
                      <Badge variant="default" className="gap-1">
                        <Award className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {saved.folder && (
                    <div className="flex items-center gap-2 text-sm">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{saved.folder}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${sme.email}`} className="text-primary hover:underline">
                        {sme.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{sme.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{sme.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Saved {formatDate(saved.savedAt)}</span>
                    </div>
                  </div>

                  <Separator />

                  {sme.certifications && sme.certifications.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Certifications</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sme.certifications.slice(0, 3).map((cert: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {sme.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{sme.certifications.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {saved.tags && saved.tags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {saved.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {saved.notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground italic">"{saved.notes}"</p>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{sme.rating || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{sme.proofPacksCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Proof Packs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{sme.introductionsCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Intros</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`mailto:${sme.email}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/portal/buyer/directory/${sme.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveSME(saved.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
