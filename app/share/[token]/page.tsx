"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Building2, CheckCircle, Shield } from "lucide-react";

export default function SharedProofPackPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"info" | "nda" | "view">("info");
  
  const [proofPackInfo, setProofPackInfo] = useState<any>(null);
  const [fullProofPack, setFullProofPack] = useState<any>(null);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [acceptingNDA, setAcceptingNDA] = useState(false);

  useEffect(() => {
    fetchProofPackInfo();
  }, [params.token]);

  useEffect(() => {
    if (auth?.currentUser) {
      checkNDAStatus();
    }
  }, [auth?.currentUser]);

  const fetchProofPackInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/share/${params.token}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load Proof Pack");
      }

      const data = await response.json();
      setProofPackInfo(data);
    } catch (err: any) {
      setError(err.message || "Failed to load Proof Pack");
    } finally {
      setLoading(false);
    }
  };

  const checkNDAStatus = async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/share/${params.token}/nda`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accepted) {
          setNdaAccepted(true);
          setStep("view");
          fetchFullProofPack();
        } else {
          setStep("nda");
        }
      }
    } catch (err) {
      console.error("Error checking NDA status:", err);
    }
  };

  const handleAcceptNDA = async () => {
    try {
      setAcceptingNDA(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push(`/sign-in?redirect=/share/${params.token}`);
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/share/${params.token}/nda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accepted: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept NDA");
      }

      setNdaAccepted(true);
      setStep("view");
      fetchFullProofPack();
    } catch (err: any) {
      setError(err.message || "Failed to accept NDA");
    } finally {
      setAcceptingNDA(false);
    }
  };

  const fetchFullProofPack = async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/share/${params.token}/view`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load Proof Pack");
      }

      const data = await response.json();
      setFullProofPack(data);
    } catch (err: any) {
      setError(err.message || "Failed to load Proof Pack");
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      // Log download
      await fetch(`/api/share/${params.token}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: doc.id,
          documentName: doc.fileName,
        }),
      });

      // Download file
      const link = document.createElement("a");
      link.href = doc.fileData;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message || "Failed to download document");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error && !proofPackInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Info Step
  if (step === "info" && proofPackInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Proof Pack Shared With You</CardTitle>
            <CardDescription>
              {proofPackInfo.sme.companyName} has shared their compliance documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{proofPackInfo.proofPack.title}</h3>
              <p className="text-muted-foreground">{proofPackInfo.proofPack.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-semibold">{proofPackInfo.sme.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-semibold">{proofPackInfo.sme.industry}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pack Health Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {proofPackInfo.proofPack.packHealth.overallScore}
                  </span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="font-semibold">{proofPackInfo.proofPack.documentCount} files</p>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                To view this Proof Pack, you must sign in and accept a Non-Disclosure Agreement (NDA).
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              onClick={() => {
                if (!auth?.currentUser) {
                  router.push(`/sign-in?redirect=/share/${params.token}`);
                } else {
                  setStep("nda");
                }
              }}
            >
              Continue to View Proof Pack
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // NDA Step
  if (step === "nda") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Non-Disclosure Agreement</CardTitle>
            <CardDescription>
              Please review and accept the NDA to view {proofPackInfo?.sme.companyName}'s Proof Pack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 bg-muted max-h-96 overflow-y-auto">
              <h3 className="font-bold mb-4">MUTUAL NON-DISCLOSURE AGREEMENT</h3>
              
              <p className="mb-4">
                This Non-Disclosure Agreement ("Agreement") is entered into by and between
                {" "}{proofPackInfo?.sme.companyName} ("Disclosing Party") and you ("Receiving Party").
              </p>

              <h4 className="font-semibold mb-2">1. Confidential Information</h4>
              <p className="mb-4 text-sm">
                "Confidential Information" means all information disclosed by the Disclosing Party,
                including but not limited to business plans, technical data, customer lists,
                financial information, and compliance documentation.
              </p>

              <h4 className="font-semibold mb-2">2. Obligations</h4>
              <p className="mb-4 text-sm">
                The Receiving Party agrees to: (a) maintain the confidentiality of all Confidential
                Information; (b) not disclose Confidential Information to third parties without
                written consent; (c) use Confidential Information solely for evaluation purposes.
              </p>

              <h4 className="font-semibold mb-2">3. Term</h4>
              <p className="mb-4 text-sm">
                This Agreement shall remain in effect for a period of two (2) years from the date
                of acceptance.
              </p>

              <h4 className="font-semibold mb-2">4. Governing Law</h4>
              <p className="text-sm">
                This Agreement shall be governed by the laws of the United States.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accept"
                checked={ndaAccepted}
                onCheckedChange={(checked) => setNdaAccepted(checked as boolean)}
              />
              <label
                htmlFor="accept"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and accept the terms of this Non-Disclosure Agreement
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                Decline
              </Button>
              <Button
                className="flex-1"
                onClick={handleAcceptNDA}
                disabled={!ndaAccepted || acceptingNDA}
              >
                {acceptingNDA ? "Accepting..." : "Accept NDA & View Proof Pack"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // View Step
  if (step === "view" && fullProofPack) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{fullProofPack.proofPack.title}</h1>
          <p className="text-muted-foreground mt-1">
            Shared by {fullProofPack.sme.companyName}
          </p>
        </div>

        {/* Company Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-semibold">{fullProofPack.sme.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-semibold">{fullProofPack.sme.industry}</p>
              </div>
              {fullProofPack.sme.website && (
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={fullProofPack.sme.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {fullProofPack.sme.website}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Pack Health Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {fullProofPack.proofPack.packHealth.overallScore}
                  </span>
                  <Progress value={fullProofPack.proofPack.packHealth.overallScore} className="flex-1" />
                </div>
              </div>
            </div>
            {fullProofPack.sme.description && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{fullProofPack.sme.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents</CardTitle>
            <CardDescription>
              {fullProofPack.proofPack.documentCount} documents organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fullProofPack.proofPack.documents.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{doc.metadata?.documentType || "—"}</TableCell>
                    <TableCell>{(doc.fileSize / 1024).toFixed(1)} KB</TableCell>
                    <TableCell className="text-sm">
                      {new Date(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
