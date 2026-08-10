"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  TrendingUp,
  Shield,
  Target,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const DOCUMENT_TYPES = [
  { type: "sam_registration", label: "SAM Registration", placeholder: "Enter your SAM UEI number (e.g., 123456789)", multiline: false },
  { type: "duns_number", label: "DUNS Number", placeholder: "Enter your DUNS number (e.g., 123456789)", multiline: false },
  { type: "cage_code", label: "CAGE Code", placeholder: "Enter your CAGE code (e.g., 1AB23)", multiline: false },
  { type: "capability_statement", label: "Capability Statement", placeholder: "Enter your capability statement summary or a URL to the document", multiline: true },
  { type: "past_performance", label: "Past Performance References", placeholder: "Enter past performance references (agency, contract value, period) or a URL", multiline: true },
  { type: "certifications", label: "Certifications (CMMC, ISO, etc.)", placeholder: "List certifications (e.g., CMMC Level 2, ISO 9001, HUBZone, 8a)", multiline: true },
  { type: "financials", label: "Financial Statements", placeholder: "Enter financial statement details or a URL to the document", multiline: true },
  { type: "insurance", label: "Insurance Certificates", placeholder: "Enter insurance certificate details (type, coverage amount, insurer) or a URL", multiline: true },
] as const;

export default function ConsortiumReadinessPage() {
  const { profile } = useUserProfile();
  const [saving, setSaving] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [textInputs, setTextInputs] = useState<Record<string, string>>({});

  const [savedDocuments, setSavedDocuments] = useState<
    Array<{
      type: string;
      value: string;
      uploadedAt: Date;
      status: "pending" | "under_review" | "approved" | "rejected" | "pending_review";
    }>
  >([]);

  const userId = profile?.id;

  // Fetch documents from Firestore on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!db || !userId) {
        setLoading(false);
        return;
      }
      try {
        const profileRef = doc(db, "consortium_profiles", userId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          const docs = (data.readinessDocuments || []).map((d: any) => ({
            type: d.type,
            value: d.value || d.fileName || "",
            uploadedAt: d.uploadedAt?.toDate?.()
              ? d.uploadedAt.toDate()
              : new Date(d.uploadedAt),
            status: d.status || "pending",
          }));
          setSavedDocuments(docs);
          const inputs: Record<string, string> = {};
          docs.forEach((d: any) => { inputs[d.type] = d.value; });
          setTextInputs(inputs);
        }
      } catch (error) {
        console.error("Error fetching readiness documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [userId]);
  
  // Calculate automated readiness score
  const calculateReadinessScore = () => {
    let score = 0;

    // Document coverage (70 points)
    const totalDocTypes = DOCUMENT_TYPES.length;
    const approvedDocs = savedDocuments.filter((doc) => doc.status === "approved").length;
    if (totalDocTypes > 0) {
      score += (approvedDocs / totalDocTypes) * 70;
    }

    // Document quality (30 points)
    const totalSaved = savedDocuments.length;
    if (totalSaved > 0) {
      score += (approvedDocs / totalSaved) * 30;
    }

    return Math.round(score);
  };
  
  const readinessScore = calculateReadinessScore();
  const getReadinessLevel = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 75) return { label: "Strong", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 60) return { label: "Good", color: "text-amber-600", bg: "bg-amber-100" };
    return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-100" };
  };
  
  const readinessLevel = getReadinessLevel(readinessScore);

  const handleSaveText = async (type: string) => {
    if (!userId || !db) {
      toast.error("Not authenticated");
      return;
    }
    const value = (textInputs[type] || "").trim();
    if (!value) {
      toast.error("Please enter a value before saving");
      return;
    }
    if (value.length > 900000) {
      toast.error("Text too long — please keep under 900,000 characters");
      return;
    }
    setSaving(type);
    try {
      const newDoc = {
        type,
        value,
        uploadedAt: FirestoreTimestamp.now(),
        status: "pending" as const,
      };

      const profileRef = doc(db, "consortium_profiles", userId);
      const profileSnap = await getDoc(profileRef);
      const currentDocs = profileSnap.exists()
        ? (profileSnap.data().readinessDocuments || [])
        : [];
      const filteredDocs = currentDocs.filter((d: any) => d.type !== type);

      await setDoc(profileRef, {
        readinessDocuments: [...filteredDocs, newDoc],
        readinessValidationStatus: "in_progress",
        updatedAt: FirestoreTimestamp.now(),
      }, { merge: true });

      setSavedDocuments((prev) => {
        const filtered = prev.filter((d) => d.type !== type);
        return [...filtered, { ...newDoc, uploadedAt: new Date() }];
      });
      toast.success("Saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteDocument = async (type: string) => {
    if (!userId || !db) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const profileRef = doc(db, "consortium_profiles", userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const currentDocs = profileSnap.data().readinessDocuments || [];
        const updatedDocs = currentDocs.filter((d: any) => d.type !== type);
        const updatePayload: any = {
          readinessDocuments: updatedDocs,
          updatedAt: FirestoreTimestamp.now(),
        };
        if (updatedDocs.length === 0) {
          updatePayload.readinessValidationStatus = "not_started";
        }
        await setDoc(profileRef, updatePayload, { merge: true });
      }

      setSavedDocuments((prev) => prev.filter((d) => d.type !== type));
      setTextInputs((prev) => { const next = { ...prev }; delete next[type]; return next; });
      toast.success("Entry removed");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove entry");
    }
  };

  const handleSubmitForReview = async () => {
    if (!userId || !auth?.currentUser) {
      toast.error("Not authenticated");
      return;
    }
    if (savedDocuments.length === 0) {
      toast.error("Save at least one entry before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/consortium/readiness/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          displayName:
            profile?.firstName && profile?.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : profile?.email || "",
          email: profile?.email || "",
          documents: savedDocuments.map((d) => ({
            type: d.type,
            value: d.value,
            status: d.status,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }
      if (data.warning) {
        toast.warning(data.warning);
      } else {
        toast.success("Submitted for review");
      }
      setSavedDocuments((prev) =>
        prev.map((d) => ({ ...d, status: "pending_review" as const }))
      );
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "pending_review":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "under_review":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-800">Pending Review</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const totalDocs = DOCUMENT_TYPES.length;
  const savedCount = savedDocuments.length;
  const requiredProgress = totalDocs > 0 ? (savedCount / totalDocs) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Government Contracting Readiness</h1>
        <p className="text-muted-foreground mt-1">
          Enter and manage your government contracting information
        </p>
      </div>

      {/* Automated Readiness Score */}
      <Card className={`border-2 ${readinessLevel.bg}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-full ${readinessLevel.bg} flex items-center justify-center`}>
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">Automated Readiness Score</CardTitle>
                <CardDescription>
                  System-calculated score based on document validation and qualification verification
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${readinessLevel.color}`}>{readinessScore}</div>
              <Badge className={`${readinessLevel.bg} ${readinessLevel.color} mt-2`}>
                {readinessLevel.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {Math.round(
                  (DOCUMENT_TYPES.filter((d) =>
                    savedDocuments.some((doc) => doc.type === d.type && doc.status === "approved")
                  ).length / DOCUMENT_TYPES.length) * 70
                )}
              </div>
              <div className="text-sm text-muted-foreground">Document Coverage</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{savedDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Entries Saved</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold">
                {savedDocuments.length > 0
                  ? Math.round((savedDocuments.filter((doc) => doc.status === "approved").length / savedDocuments.length) * 30)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This score is used for AI matching and partner selection. Improve your score by adding more information and ensuring all entries are approved.
          </p>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progress</CardTitle>
              <CardDescription>
                {savedDocuments.length} of {DOCUMENT_TYPES.length} entries completed
              </CardDescription>
            </div>
            <Badge variant={requiredProgress === 100 ? "default" : "secondary"}>
              {Math.round(requiredProgress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={requiredProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Data Entry Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Readiness Information</h2>

        {/* Completed Entries */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completed Entries
          </h3>
          {DOCUMENT_TYPES.filter((d) => {
            const saved = savedDocuments.find((s) => s.type === d.type);
            return saved && saved.status === "approved";
          }).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No approved entries yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {DOCUMENT_TYPES.filter((d) => {
                const saved = savedDocuments.find((s) => s.type === d.type);
                return saved && saved.status === "approved";
              }).map((d) => {
                const saved = savedDocuments.find((s) => s.type === d.type)!;
                return (
                  <Card key={d.type} className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium">{d.label}</p>
                            <p className="text-sm text-muted-foreground truncate mt-1">{saved.value}</p>
                            <Badge className="bg-green-100 text-green-800 mt-1">Approved</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(d.type)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* All Entry Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Information Entry
          </h3>
          <div className="grid gap-4">
            {DOCUMENT_TYPES.map((d) => {
              const saved = savedDocuments.find((s) => s.type === d.type);
              const isApproved = saved?.status === "approved";
              return (
                <Card key={d.type} className={saved && !isApproved ? "border-amber-200" : ""}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <Label className="font-medium">{d.label}</Label>
                          {saved && getStatusBadge(saved.status)}
                        </div>
                        {saved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(d.type)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                      {d.multiline ? (
                        <Textarea
                          value={textInputs[d.type] || ""}
                          onChange={(e) =>
                            setTextInputs((prev) => ({ ...prev, [d.type]: e.target.value }))
                          }
                          placeholder={d.placeholder}
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={textInputs[d.type] || ""}
                          onChange={(e) =>
                            setTextInputs((prev) => ({ ...prev, [d.type]: e.target.value }))
                          }
                          placeholder={d.placeholder}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {(textInputs[d.type] || "").length} characters
                        </p>
                        <Button
                          size="sm"
                          disabled={saving === d.type || !(textInputs[d.type] || "").trim()}
                          onClick={() => handleSaveText(d.type)}
                        >
                          {saving === d.type ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Section */}
      {savedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submit for Review</CardTitle>
            <CardDescription>
              Submit your entries for KDM staff review and validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSubmitForReview} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Information Requirements</CardTitle>
          <CardDescription>
            Information about recommended entries for government contracting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Recommended Information</h4>
            <p className="text-sm text-muted-foreground">
              Enter any information you have available to strengthen your contracting readiness and improve matching with opportunities. All entries are optional — you can return and update at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
