"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { mockQAQueue } from "@/lib/mock-data/qa-mock-data";
import { Timestamp } from "firebase/firestore";

interface ProofPack {
  id: string;
  title: string;
  description: string;
  smeId: string;
  userId: string;
  documents: any[];
  packHealth: {
    overallScore: number;
    completenessScore: number;
    expirationScore: number;
    qualityScore: number;
    remediationScore: number;
    breakdown: any;
  };
  gaps: any[];
  submittedAt: any;
}

export default function QAReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const useMockData = searchParams.get('mock') === 'true';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [proofPack, setProofPack] = useState<ProofPack | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (useMockData) {
      loadMockProofPack();
    } else {
      fetchProofPack();
    }
  }, [params.id, useMockData]);

  const loadMockProofPack = () => {
    setLoading(true);
    // Find mock proof pack by ID
    const mockPack = mockQAQueue.find(p => p.id === params.id);
    if (mockPack) {
      // Transform mock queue item to full proof pack structure
      const fullProofPack: ProofPack = {
        id: mockPack.id,
        title: mockPack.title,
        description: `Comprehensive ${mockPack.title} for compliance review`,
        smeId: mockPack.smeId,
        userId: mockPack.userId,
        documents: [
          {
            id: 'doc-1',
            name: 'Quality Manual.pdf',
            category: 'Quality Manual',
            uploadedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            size: 2500000,
            status: 'verified'
          },
          {
            id: 'doc-2',
            name: 'Procedures.pdf',
            category: 'Procedures',
            uploadedAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
            size: 1800000,
            status: 'verified'
          },
          {
            id: 'doc-3',
            name: 'Work Instructions.pdf',
            category: 'Work Instructions',
            uploadedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
            size: 1200000,
            status: 'verified'
          }
        ],
        packHealth: {
          overallScore: mockPack.packHealth.overallScore,
          completenessScore: mockPack.packHealth.completeness || 85,
          expirationScore: 90,
          qualityScore: mockPack.packHealth.quality || 80,
          remediationScore: 88,
          breakdown: {
            certifications: mockPack.packHealth.compliance || 85,
            documentation: mockPack.packHealth.quality || 80,
            expiration: 90
          }
        },
        gaps: mockPack.packHealth.overallScore < 80 ? [
          {
            id: 'gap-1',
            category: 'Documentation',
            description: 'Missing calibration records for some equipment',
            severity: 'medium',
            recommendation: 'Upload complete calibration records'
          }
        ] : [],
        submittedAt: mockPack.submittedAt
      };
      setProofPack(fullProofPack);
    } else {
      setError('Proof Pack not found');
    }
    setLoading(false);
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

  const handleReview = async (action: "approve" | "reject") => {
    if (action === "reject" && !comments.trim()) {
      setError("Comments are required when rejecting a Proof Pack");
      return;
    }

    if (useMockData) {
      // Simulate review in mock mode
      setSubmitting(true);
      setTimeout(() => {
        setSuccess(`Proof Pack ${action === 'approve' ? 'approved' : 'rejected'} successfully (Mock Mode)`);
        setSubmitting(false);
        setTimeout(() => {
          router.push('/portal/qa/queue');
        }, 1500);
      }, 1000);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/qa/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proofPackId: params.id,
          action,
          comments: comments.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(`Proof Pack ${action}d successfully`);
      
      // Redirect back to queue after 2 seconds
      setTimeout(() => {
        router.push("/portal/qa/queue");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">QA Review: {proofPack.title}</h1>
          <p className="text-muted-foreground mt-1">
            SME ID: {proofPack.smeId} • Submitted: {new Date(proofPack.submittedAt?.toDate ? proofPack.submittedAt.toDate() : proofPack.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/portal/qa/queue")}>
          Back to Queue
        </Button>
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

      {/* Pack Health Score Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pack Health Score Breakdown</CardTitle>
          <CardDescription>
            Detailed scoring calculation for review decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="border-r pr-4">
              <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
              <p className={`text-4xl font-bold ${getHealthColor(proofPack.packHealth.overallScore)}`}>
                {proofPack.packHealth.overallScore}
              </p>
              <Progress value={proofPack.packHealth.overallScore} className="mt-2" />
              {proofPack.packHealth.overallScore >= 70 ? (
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Eligible</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                  <XCircle className="h-3 w-3" />
                  <span>Not eligible</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Completeness</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.completenessScore}</p>
              <Progress value={proofPack.packHealth.completenessScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Weight: 40%</p>
              <p className="text-xs font-semibold mt-1">
                Weighted: {(proofPack.packHealth.completenessScore * 0.4).toFixed(1)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Expiration</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.expirationScore}</p>
              <Progress value={proofPack.packHealth.expirationScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Weight: 30%</p>
              <p className="text-xs font-semibold mt-1">
                Weighted: {(proofPack.packHealth.expirationScore * 0.3).toFixed(1)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Quality</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.qualityScore}</p>
              <Progress value={proofPack.packHealth.qualityScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Weight: 20%</p>
              <p className="text-xs font-semibold mt-1">
                Weighted: {(proofPack.packHealth.qualityScore * 0.2).toFixed(1)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Remediation</p>
              <p className="text-2xl font-bold">{proofPack.packHealth.remediationScore}</p>
              <Progress value={proofPack.packHealth.remediationScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Weight: 10%</p>
              <p className="text-xs font-semibold mt-1">
                Weighted: {(proofPack.packHealth.remediationScore * 0.1).toFixed(1)}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Score Calculation</h4>
            <p className="text-sm">
              Overall = (Completeness × 0.4) + (Expiration × 0.3) + (Quality × 0.2) + (Remediation × 0.1)
            </p>
            <p className="text-sm mt-1">
              = ({proofPack.packHealth.completenessScore} × 0.4) + ({proofPack.packHealth.expirationScore} × 0.3) + ({proofPack.packHealth.qualityScore} × 0.2) + ({proofPack.packHealth.remediationScore} × 0.1)
            </p>
            <p className="text-sm mt-1 font-bold">
              = {proofPack.packHealth.overallScore}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">
            Documents ({proofPack.documents.length})
          </TabsTrigger>
          <TabsTrigger value="gaps">
            Gaps ({proofPack.gaps.length})
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>Review all documents in this Proof Pack</CardDescription>
            </CardHeader>
            <CardContent>
              {proofPack.documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents uploaded</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proofPack.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{doc.metadata?.documentType || "—"}</TableCell>
                        <TableCell>{(doc.fileSize / 1024).toFixed(1)} KB</TableCell>
                        <TableCell>
                          {doc.expirationDate ? (
                            <span className="text-sm">
                              {new Date(doc.expirationDate.toDate ? doc.expirationDate.toDate() : doc.expirationDate).toLocaleDateString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
              <CardDescription>Identified gaps and issues</CardDescription>
            </CardHeader>
            <CardContent>
              {proofPack.gaps.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <p className="text-muted-foreground">No gaps identified</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proofPack.gaps.map((gap) => (
                    <div key={gap.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold">{gap.category}</span>
                          <Badge variant="outline">{gap.priority}</Badge>
                        </div>
                      </div>
                      <p className="text-sm">{gap.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Proof Pack Details</CardTitle>
              <CardDescription>Additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <p className="text-lg">{proofPack.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p>{proofPack.description || "No description provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">SME ID</label>
                <p className="font-mono">{proofPack.smeId}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
          <CardDescription>
            Approve or reject this Proof Pack with comments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Comments {proofPack.packHealth.overallScore < 70 && "(Required for rejection)"}
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your review comments here..."
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleReview("approve")}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Approve Proof Pack"}
            </Button>
            <Button
              onClick={() => handleReview("reject")}
              disabled={submitting}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Reject Proof Pack"}
            </Button>
          </div>

          {proofPack.packHealth.overallScore < 70 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This Proof Pack has a Pack Health score below 70 and should likely be rejected
                with feedback for improvement.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
