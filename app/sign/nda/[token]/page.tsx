"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building2,
  User,
  PenTool,
  Clock,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock NDA data - in production, this would be fetched from the database
const MOCK_NDA_DATA = {
  id: "2",
  name: "NDA - TechStart Inc",
  disclosingParty: {
    name: "Nelinia Varenas",
    title: "CEO",
    company: "KDM & Associates",
  },
  receivingParty: {
    name: "Sarah Johnson",
    title: "CTO",
    company: "TechStart Inc",
    email: "sjohnson@techstart.com",
  },
  effectiveDate: "2024-12-15",
  sections: [
    {
      id: "1",
      title: "Parties",
      content: `This Non-Disclosure Agreement ("Agreement") is entered into as of December 15, 2024 by and between:

**Disclosing Party:** Nelinia Varenas, KDM & Associates
**Receiving Party:** Sarah Johnson, TechStart Inc`,
    },
    {
      id: "2",
      title: "Definition of Confidential Information",
      content: `"Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged. This includes, but is not limited to:

- Technical data, trade secrets, know-how
- Research, product plans, products, services
- Customer lists and customer information
- Markets, software, developments, inventions
- Processes, designs, drawings, engineering
- Hardware configuration information, marketing
- Finances, or other business information

Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of the Receiving Party
(b) Was rightfully in the Receiving Party's possession prior to disclosure
(c) Is independently developed by the Receiving Party without use of Confidential Information
(d) Is rightfully obtained from a third party without restriction`,
    },
    {
      id: "3",
      title: "Obligations of Receiving Party",
      content: `The Receiving Party agrees to:

1. Hold and maintain the Confidential Information in strict confidence
2. Not disclose the Confidential Information to any third parties without prior written consent
3. Not use the Confidential Information for any purpose except as authorized by this Agreement
4. Protect the Confidential Information using the same degree of care used to protect its own confidential information, but in no event less than reasonable care
5. Limit access to Confidential Information to employees, agents, or representatives who have a need to know
6. Ensure that all persons with access to Confidential Information are bound by confidentiality obligations at least as restrictive as those contained herein`,
    },
    {
      id: "4",
      title: "Term and Termination",
      content: `This Agreement shall remain in effect for a period of 2 years from the Effective Date, unless earlier terminated by either party upon thirty (30) days written notice.

The obligations of confidentiality shall survive termination of this Agreement for a period of 5 years.

Upon termination or expiration of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.`,
    },
    {
      id: "5",
      title: "Remedies",
      content: `The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.`,
    },
    {
      id: "6",
      title: "General Provisions",
      content: `**Governing Law:** This Agreement shall be governed by and construed in accordance with the laws of the State of North Carolina.

**Entire Agreement:** This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof.

**Amendment:** This Agreement may not be amended except by a written instrument signed by both parties.

**Waiver:** No waiver of any provision of this Agreement shall be effective unless in writing and signed by the waiving party.

**Severability:** If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
    },
  ],
};

export default function NDASigningPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ndaData, setNdaData] = useState<typeof MOCK_NDA_DATA | null>(null);
  
  // Signature form state
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Load NDA data
  useEffect(() => {
    const loadNDA = async () => {
      setIsLoading(true);
      try {
        // In production, fetch from API using token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate token
        if (token === "abc123xyz") {
          setNdaData(MOCK_NDA_DATA);
        } else {
          setError("Invalid or expired signing link. Please contact the sender for a new link.");
        }
      } catch (err) {
        setError("Failed to load document. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNDA();
  }, [token]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureData(null);
  };

  const handleSubmit = async () => {
    if (!signerName || !hasSignature || !agreedToTerms) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In production, submit to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsComplete(true);
    } catch (err) {
      setError("Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Document</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion state
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Signature Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for signing the Non-Disclosure Agreement. The document has been submitted for countersignature.
              </p>
              <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-2">
                <p><strong>What happens next:</strong></p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• The disclosing party will review and countersign</li>
                  <li>• You will receive a copy of the fully executed NDA via email</li>
                  <li>• A PDF copy will be sent to {ndaData?.receivingParty.email}</li>
                </ul>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Signed on {new Date().toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-semibold">KDM & Associates</h1>
              <p className="text-sm text-muted-foreground">Document Signing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Non-Disclosure Agreement
                </CardTitle>
                <CardDescription>
                  Please review the agreement carefully before signing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Parties Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Disclosing Party</p>
                    <p className="font-medium">{ndaData?.disclosingParty.name}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.disclosingParty.title}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.disclosingParty.company}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Receiving Party</p>
                    <p className="font-medium">{ndaData?.receivingParty.name}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.receivingParty.title}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.receivingParty.company}</p>
                  </div>
                </div>

                {/* Document Sections */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {ndaData?.sections.map((section, index) => (
                      <div key={section.id}>
                        <h3 className="font-semibold text-lg mb-2">
                          {index + 1}. {section.title}
                        </h3>
                        <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {section.content}
                        </div>
                        {index < (ndaData?.sections.length || 0) - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Signature Panel */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Sign Document
                </CardTitle>
                <CardDescription>
                  Complete the fields below to sign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Signer Name */}
                <div className="space-y-2">
                  <Label htmlFor="signerName">Full Legal Name *</Label>
                  <Input
                    id="signerName"
                    placeholder="Enter your full name"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                  />
                </div>

                {/* Signer Title */}
                <div className="space-y-2">
                  <Label htmlFor="signerTitle">Title (Optional)</Label>
                  <Input
                    id="signerTitle"
                    placeholder="e.g., CEO, Manager"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                  />
                </div>

                {/* Signature Canvas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Signature *</Label>
                    {hasSignature && (
                      <Button variant="ghost" size="sm" onClick={clearSignature}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-1 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={120}
                      className="w-full cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Draw your signature above using mouse or touch
                  </p>
                </div>

                {/* Timestamp */}
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Timestamp: {new Date().toLocaleString()}</span>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
                    I have read and agree to the terms of this Non-Disclosure Agreement. I understand that my electronic signature is legally binding.
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!signerName || !hasSignature || !agreedToTerms || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Sign & Submit
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By signing, you agree that your electronic signature is the legal equivalent of your manual signature.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by KDM & Associates Document Management</p>
          <p className="mt-1">This document is confidential and intended only for the named recipient.</p>
        </div>
      </footer>
    </div>
  );
}
