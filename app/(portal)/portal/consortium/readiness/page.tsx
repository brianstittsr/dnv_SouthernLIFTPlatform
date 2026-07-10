"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { auth, db, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  TrendingUp,
  Shield,
  Target,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const DOCUMENT_TYPES = [
  { type: "sam_registration", label: "SAM Registration", required: false },
  { type: "duns_number", label: "DUNS Number", required: false },
  { type: "cage_code", label: "CAGE Code", required: false },
  { type: "capability_statement", label: "Capability Statement", required: false },
  { type: "past_performance", label: "Past Performance References", required: false },
  { type: "certifications", label: "Certifications (CMMC, ISO, etc.)", required: false },
  { type: "financials", label: "Financial Statements", required: false },
  { type: "insurance", label: "Insurance Certificates", required: false },
] as const;

export default function ConsortiumReadinessPage() {
  const { profile } = useUserProfile();
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{
      type: string;
      fileName: string;
      fileUrl: string;
      storagePath?: string;
      uploadedAt: Date;
      status: "pending" | "under_review" | "approved" | "rejected" | "pending_review";
    }>
  >([]);

  const userId = auth?.currentUser?.uid || profile?.id;

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
          const docs = (data.readinessDocuments || []).map((doc: any) => ({
            ...doc,
            uploadedAt: doc.uploadedAt?.toDate?.()
              ? doc.uploadedAt.toDate()
              : new Date(doc.uploadedAt),
          }));
          setUploadedDocuments(docs);
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

    // Document coverage (70 points) — all documents are now optional/recommended
    const totalDocTypes = DOCUMENT_TYPES.length;
    const approvedDocs = uploadedDocuments.filter((doc) => doc.status === "approved").length;
    if (totalDocTypes > 0) {
      score += (approvedDocs / totalDocTypes) * 70;
    }

    // Document quality (30 points) — based on approval status of uploaded docs
    const totalUploaded = uploadedDocuments.length;
    if (totalUploaded > 0) {
      score += (approvedDocs / totalUploaded) * 30;
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

  const handleFileUpload = async (type: string, file: File) => {
    if (!userId || !storage || !db) {
      toast.error("Not authenticated or storage unavailable");
      return;
    }
    setUploading(type);
    try {
      const fileName = file.name;
      const storagePath = `consortium/readiness/${userId}/${type}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      const newDoc = {
        type,
        fileName,
        fileUrl,
        storagePath,
        uploadedAt: FirestoreTimestamp.now(),
        status: "pending" as const,
      };

      const profileRef = doc(db, "consortium_profiles", userId);
      const profileSnap = await getDoc(profileRef);
      const currentDocs = profileSnap.exists()
        ? (profileSnap.data().readinessDocuments || [])
        : [];
      const filteredDocs = currentDocs.filter((doc: any) => doc.type !== type);

      await updateDoc(profileRef, {
        readinessDocuments: [...filteredDocs, newDoc],
        readinessValidationStatus: "in_progress",
        updatedAt: FirestoreTimestamp.now(),
      });

      setUploadedDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.type !== type);
        return [...filtered, { ...newDoc, uploadedAt: new Date() }];
      });
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (type: string) => {
    if (!userId || !db) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const docToDelete = uploadedDocuments.find((doc) => doc.type === type);
      if (!docToDelete) return;

      if (storage && docToDelete.storagePath) {
        try {
          const storageRef = ref(storage, docToDelete.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn("Could not delete storage object:", storageError);
        }
      }

      const profileRef = doc(db, "consortium_profiles", userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const currentDocs = profileSnap.data().readinessDocuments || [];
        const updatedDocs = currentDocs.filter((doc: any) => doc.type !== type);
        const updatePayload: any = {
          readinessDocuments: updatedDocs,
          updatedAt: FirestoreTimestamp.now(),
        };
        if (updatedDocs.length === 0) {
          updatePayload.readinessValidationStatus = "not_started";
        }
        await updateDoc(profileRef, updatePayload);
      }

      setUploadedDocuments((prev) => prev.filter((doc) => doc.type !== type));
      toast.success("Document removed");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove document");
    }
  };

  const handleSubmitForReview = async () => {
    if (!userId || !auth?.currentUser) {
      toast.error("Not authenticated");
      return;
    }
    if (uploadedDocuments.length === 0) {
      toast.error("Upload at least one document before submitting");
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
          documents: uploadedDocuments.map((doc) => ({
            type: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            status: doc.status,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit documents");
      }
      if (data.warning) {
        toast.warning(data.warning);
      } else {
        toast.success("Documents submitted for review");
      }
      setUploadedDocuments((prev) =>
        prev.map((doc) => ({ ...doc, status: "pending_review" as const }))
      );
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit documents");
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
  const uploadedCount = uploadedDocuments.length;
  const requiredProgress = totalDocs > 0 ? (uploadedCount / totalDocs) * 100 : 0;

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
          Upload and manage your government contracting documentation
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
                    uploadedDocuments.some((doc) => doc.type === d.type && doc.status === "approved")
                  ).length / DOCUMENT_TYPES.length) * 70
                )}
              </div>
              <div className="text-sm text-muted-foreground">Document Coverage</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{uploadedDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Documents Uploaded</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold">
                {uploadedDocuments.length > 0
                  ? Math.round((uploadedDocuments.filter((doc) => doc.status === "approved").length / uploadedDocuments.length) * 30)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This score is used for AI matching and partner selection. Improve your score by uploading additional documentation and ensuring all documents are approved.
          </p>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Document Progress</CardTitle>
              <CardDescription>
                {uploadedDocuments.length} of {DOCUMENT_TYPES.length} documents uploaded
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

      {/* Document Upload Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Document Management</h2>
        
        {/* Completed Documents */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completed Documents
          </h3>
          {DOCUMENT_TYPES.filter((doc) => {
            const uploaded = uploadedDocuments.find((d) => d.type === doc.type);
            return uploaded && uploaded.status === "approved";
          }).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No completed documents yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {DOCUMENT_TYPES.filter((doc) => {
                const uploaded = uploadedDocuments.find((d) => d.type === doc.type);
                return uploaded && uploaded.status === "approved";
              }).map((doc) => {
                const uploaded = uploadedDocuments.find((d) => d.type === doc.type);
                return (
                  <Card key={doc.type} className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{doc.label}</p>
                              {doc.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">{uploaded?.fileName}</p>
                              <Badge className="bg-green-100 text-green-800">Approved</Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.type)}
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

        {/* Still Needed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Still Needed
          </h3>
          {DOCUMENT_TYPES.filter((doc) => {
            const uploaded = uploadedDocuments.find((d) => d.type === doc.type);
            return !uploaded || uploaded.status !== "approved";
          }).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-muted-foreground">All documents completed!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {DOCUMENT_TYPES.filter((doc) => {
                const uploaded = uploadedDocuments.find((d) => d.type === doc.type);
                return !uploaded || uploaded.status !== "approved";
              }).map((doc) => {
                const uploaded = uploadedDocuments.find((d) => d.type === doc.type);
                return (
                  <Card key={doc.type} className={uploaded ? "border-amber-200 bg-amber-50" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{doc.label}</p>
                              {doc.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            {uploaded ? (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">{uploaded.fileName}</p>
                                {getStatusBadge(uploaded.status)}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1">Not uploaded</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploaded ? (
                            <>
                              {getStatusIcon(uploaded.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.type)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Input
                                type="file"
                                id={`file-${doc.type}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(doc.type, file);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={uploading === doc.type}
                                onClick={() => document.getElementById(`file-${doc.type}`)?.click()}
                              >
                                {uploading === doc.type ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit Section */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submit for Review</CardTitle>
            <CardDescription>
              Submit your documents for KDM staff review and validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleSubmitForReview} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Documents for Review"}
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Document Requirements</CardTitle>
          <CardDescription>
            Information about required documents for government contracting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Recommended Documents</h4>
            <p className="text-sm text-muted-foreground">
              Upload any documents you have available to strengthen your contracting readiness and improve matching with opportunities. All uploads are optional — you can return and add more documentation at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
