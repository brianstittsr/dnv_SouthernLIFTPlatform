"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Save,
  Upload,
  Trash2,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target,
} from "lucide-react";
import { DataModeToggle } from "@/components/svp/data-mode-toggle";

const DOCUMENT_CATEGORIES = [
  "Certifications",
  "Financial",
  "Past Performance",
  "Technical",
  "Quality",
  "Safety",
  "Security",
  "Other",
];

const MOCK_PROOF_PACK: ProofPack = {
  id: "mock-1",
  title: "DoD Manufacturing Capabilities 2024",
  description: "Comprehensive proof pack for DoD precision manufacturing contracts, including ISO 9001:2015, AS9100D, and CMMC Level 2 certifications.",
  status: "approved",
  visibility: "buyer-ready",
  documents: [
    {
      id: "doc-1",
      fileName: "ISO-9001-2015-Certificate.pdf",
      category: "Certifications",
      fileSize: 245000,
      uploadedAt: new Date("2024-01-10"),
      expiresAt: new Date("2025-12-31"),
      status: "valid",
    },
    {
      id: "doc-2",
      fileName: "AS9100D-Certification.pdf",
      category: "Certifications",
      fileSize: 312000,
      uploadedAt: new Date("2024-01-10"),
      expiresAt: new Date("2025-06-30"),
      status: "valid",
    },
    {
      id: "doc-3",
      fileName: "CMMC-Level-2-Assessment.pdf",
      category: "Security",
      fileSize: 890000,
      uploadedAt: new Date("2024-01-12"),
      expiresAt: new Date("2026-01-12"),
      status: "valid",
    },
    {
      id: "doc-4",
      fileName: "Financial-Statements-2023.pdf",
      category: "Financial",
      fileSize: 567000,
      uploadedAt: new Date("2024-01-08"),
      status: "valid",
    },
    {
      id: "doc-5",
      fileName: "Past-Performance-Navy-Contract.pdf",
      category: "Past Performance",
      fileSize: 423000,
      uploadedAt: new Date("2024-01-09"),
      status: "valid",
    },
  ],
  documentCount: 5,
  packHealth: {
    overallScore: 85,
    completenessScore: 88,
    expirationScore: 90,
    qualityScore: 82,
    remediationScore: 75,
    breakdown: {
      certifications: { score: 95, weight: 0.3 },
      financial: { score: 80, weight: 0.2 },
      pastPerformance: { score: 85, weight: 0.25 },
      technical: { score: 75, weight: 0.15 },
      quality: { score: 80, weight: 0.1 },
    },
    isEligibleForIntroductions: true,
  },
  gaps: [
    {
      id: "gap-1",
      category: "Technical",
      description: "Missing technical specifications document",
      priority: "medium",
      impact: "Reduces credibility for technical evaluations",
    },
    {
      id: "gap-2",
      category: "Quality",
      description: "Quality manual not uploaded",
      priority: "low",
      impact: "May be requested during buyer due diligence",
    },
  ],
  tags: ["DoD", "Manufacturing", "ISO-9001", "AS9100D", "CMMC"],
};

interface ProofPack {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: string;
  documents: any[];
  documentCount: number;
  packHealth: {
    overallScore: number;
    completenessScore: number;
    expirationScore: number;
    qualityScore: number;
    remediationScore: number;
    breakdown: any;
    isEligibleForIntroductions: boolean;
  };
  gaps: any[];
  tags: string[];
}

export default function ProofPackEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [proofPack, setProofPack] = useState<ProofPack | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      fetchProofPack();
    }
  }, [params.id, useMockData]);

  const loadMockData = () => {
    setLoading(true);
    setTimeout(() => {
      setProofPack(MOCK_PROOF_PACK);
      setLoading(false);
      setError(null);
    }, 500);
  };

  const fetchProofPack = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/proof-packs/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch Proof Pack");

      const data = await response.json();
      setProofPack(data);
    } catch (err: any) {
      setError(err.message || "Failed to load Proof Pack");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!proofPack) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/proof-packs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proofPackId: params.id,
          title: proofPack.title,
          description: proofPack.description,
          tags: proofPack.tags,
          visibility: proofPack.visibility,
        }),
      });

      if (!response.ok) throw new Error("Failed to save Proof Pack");

      setSuccess("Proof Pack saved successfully");
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || "Failed to save Proof Pack");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError("File size must be less than 1MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("File type not supported. Please upload PDF, DOC, DOCX, JPG, or PNG");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        const currentUser = auth?.currentUser;
        if (!currentUser) return;

        const token = await currentUser.getIdToken();

        const response = await fetch(`/api/proof-packs/${params.id}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            mimeType: file.type,
            fileSize: file.size,
            category: "Other", // Default category
          }),
        });

        if (!response.ok) throw new Error("Failed to upload document");

        const data = await response.json();
        
        // Update local state
        if (proofPack) {
          setProofPack({
            ...proofPack,
            documents: [...proofPack.documents, data.document],
            documentCount: proofPack.documentCount + 1,
            packHealth: data.packHealth,
            gaps: data.gaps,
          });
        }

        setSuccess("Document uploaded successfully");
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        setError("Failed to read file");
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(
        `/api/proof-packs/${params.id}/documents?documentId=${documentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete document");

      const data = await response.json();

      // Update local state
      if (proofPack) {
        setProofPack({
          ...proofPack,
          documents: proofPack.documents.filter((d) => d.id !== documentId),
          documentCount: proofPack.documentCount - 1,
          packHealth: data.packHealth,
          gaps: data.gaps,
        });
      }

      setSuccess("Document deleted successfully");
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-600";
    if (priority === "medium") return "text-yellow-600";
    return "text-blue-600";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading Proof Pack...</p>
        </div>
      </div>
    );
  }

  if (!proofPack) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>Proof Pack not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Data Mode Toggle */}
      <div className="flex justify-end mb-4">
        <DataModeToggle useMockData={useMockData} onToggle={() => setUseMockData(!useMockData)} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{proofPack.title}</h1>
          <p className="text-muted-foreground mt-1">
            {proofPack.documentCount} documents • Pack Health: {proofPack.packHealth.overallScore}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/portal/proof-packs")}>
            Back
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Pack Health Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pack Health Score</CardTitle>
          <CardDescription>
            {proofPack.packHealth.isEligibleForIntroductions
              ? "✓ Eligible for buyer introductions"
              : "Not yet eligible for introductions (need ≥70)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Overall</p>
              <p className={`text-3xl font-bold ${getHealthColor(proofPack.packHealth.overallScore)}`}>
                {proofPack.packHealth.overallScore}
              </p>
              <Progress value={proofPack.packHealth.overallScore} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Completeness (40%)</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.completenessScore}</p>
              <Progress value={proofPack.packHealth.completenessScore} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Expiration (30%)</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.expirationScore}</p>
              <Progress value={proofPack.packHealth.expirationScore} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Quality (20%)</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.qualityScore}</p>
              <Progress value={proofPack.packHealth.qualityScore} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Remediation (10%)</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.remediationScore}</p>
              <Progress value={proofPack.packHealth.remediationScore} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({proofPack.documentCount})
          </TabsTrigger>
          <TabsTrigger value="gaps">
            Gap Analysis ({proofPack.gaps.length})
          </TabsTrigger>
          <TabsTrigger value="remediation">Remediation</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Proof Pack Details</CardTitle>
              <CardDescription>Edit title, description, and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={proofPack.title}
                  onChange={(e) => {
                    setProofPack({ ...proofPack, title: e.target.value });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={proofPack.description}
                  onChange={(e) => {
                    setProofPack({ ...proofPack, description: e.target.value });
                    setHasChanges(true);
                  }}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Visibility</label>
                <Select
                  value={proofPack.visibility}
                  onValueChange={(value) => {
                    setProofPack({ ...proofPack, visibility: value });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="partner-only">Partner Only</SelectItem>
                    <SelectItem value="buyer-ready">Buyer Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <Input
                  value={proofPack.tags.join(", ")}
                  onChange={(e) => {
                    setProofPack({
                      ...proofPack,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter((t) => t),
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Upload and manage compliance documents</CardDescription>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {proofPack.documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proofPack.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.category}</Badge>
                        </TableCell>
                        <TableCell>{(doc.fileSize / 1024).toFixed(1)} KB</TableCell>
                        <TableCell>
                          {new Date(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
              <CardDescription>
                Missing or expired documents that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proofPack.gaps.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <p className="text-muted-foreground">No gaps identified!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proofPack.gaps.map((gap) => (
                    <div key={gap.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`h-4 w-4 ${getPriorityColor(gap.priority)}`} />
                          <span className="font-semibold">{gap.category}</span>
                          <Badge variant="outline" className={getPriorityColor(gap.priority)}>
                            {gap.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {gap.documentType}
                      </p>
                      <p className="text-sm">{gap.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remediation Tab */}
        <TabsContent value="remediation">
          <Card>
            <CardHeader>
              <CardTitle>Remediation Progress</CardTitle>
              <CardDescription>
                Track your progress toward Pack Health ≥70
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress to Target</span>
                    <span className="text-sm font-bold">
                      {proofPack.packHealth.overallScore}/70
                    </span>
                  </div>
                  <Progress
                    value={(proofPack.packHealth.overallScore / 70) * 100}
                  />
                  {proofPack.packHealth.overallScore >= 70 ? (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Target achieved! Your Proof Pack is eligible for introductions.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      {70 - proofPack.packHealth.overallScore} points needed to reach target
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Recommended Actions</h3>
                  <div className="space-y-2">
                    {proofPack.gaps.slice(0, 5).map((gap, index) => (
                      <div key={gap.id} className="flex items-start gap-3 p-3 border rounded">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{gap.recommendation}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Priority: {gap.priority} • Category: {gap.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
