"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface CollectionStatus {
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
}

export default function InitCollectionsPage() {
  const [collections, setCollections] = useState<CollectionStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<"idle" | "running" | "complete" | "error">("idle");

  const collectionsToCreate = [
    { name: "platformSettings", docId: "global", data: { navigationSettings: { hiddenItems: [], roleVisibility: {} } } },
    { name: "teamMembers", docId: "_placeholder", data: { _placeholder: true, note: "Delete after adding real team members" } },
    { name: "memberships", docId: "_placeholder", data: { _placeholder: true, note: "Delete after adding real memberships" } },
    { name: "proofPacks", docId: "_placeholder", data: { _placeholder: true, note: "Proof Packs collection" } },
    { name: "smeSubscriptions", docId: "_placeholder", data: { _placeholder: true, note: "SME Subscriptions collection" } },
    { name: "partnerLeads", docId: "_placeholder", data: { _placeholder: true, note: "Partner Leads collection" } },
    { name: "partnerIntroductions", docId: "_placeholder", data: { _placeholder: true, note: "Partner Introductions collection" } },
    { name: "partnerRevenue", docId: "_placeholder", data: { _placeholder: true, note: "Partner Revenue collection" } },
    { name: "buyerRequests", docId: "_placeholder", data: { _placeholder: true, note: "Buyer Requests collection" } },
    { name: "qaReviews", docId: "_placeholder", data: { _placeholder: true, note: "QA Reviews collection" } },
    { name: "cmmcCohorts", docId: "_placeholder", data: { _placeholder: true, note: "CMMC Cohorts collection" } },
    { name: "cohortEnrollments", docId: "_placeholder", data: { _placeholder: true, note: "Cohort Enrollments collection" } },
    { name: "curriculumMaterials", docId: "_placeholder", data: { _placeholder: true, note: "Curriculum Materials collection" } },
    { name: "page_designs", docId: "_placeholder", data: { _placeholder: true, note: "Page Designs collection" } },
    { name: "page_design_history", docId: "_placeholder", data: { _placeholder: true, note: "Page Design History collection" } },
    { name: "page_layout_templates", docId: "_placeholder", data: { _placeholder: true, note: "Page Layout Templates collection" } },
    { name: "page_ai_conversations", docId: "_placeholder", data: { _placeholder: true, note: "Page AI Conversations collection" } },
    { name: "page_ux_reviews", docId: "_placeholder", data: { _placeholder: true, note: "Page UX Reviews collection" } },
    { name: "platformAuditLogs", docId: "_placeholder", data: { _placeholder: true, note: "Platform Audit Logs collection" } },
  ];

  const initializeCollections = async () => {
    if (!db) {
      setOverallStatus("error");
      return;
    }

    setIsRunning(true);
    setOverallStatus("running");
    const statuses: CollectionStatus[] = [];

    for (const col of collectionsToCreate) {
      const status: CollectionStatus = { name: col.name, status: "pending" };
      statuses.push(status);
      setCollections([...statuses]);

      try {
        const docRef = doc(db, col.name, col.docId);
        await setDoc(docRef, {
          ...col.data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        status.status = "success";
        status.message = `Created ${col.docId}`;
        setCollections([...statuses]);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        status.status = "error";
        status.message = error.message || "Unknown error";
        setCollections([...statuses]);
      }
    }

    setIsRunning(false);
    const hasErrors = statuses.some(s => s.status === "error");
    setOverallStatus(hasErrors ? "error" : "complete");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Initialize SVP Platform Collections</CardTitle>
          <CardDescription>
            This will create all required Firestore collections with placeholder documents.
            Run this once to set up the database structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {overallStatus === "idle" && (
            <Alert>
              <AlertDescription>
                <strong>Ready to initialize {collectionsToCreate.length} collections.</strong>
                <br />
                This will create placeholder documents in each collection. You can delete them later.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === "complete" && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>All collections initialized successfully!</strong>
                <br />
                Refresh your browser to see the changes. Permission errors should now be resolved.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === "error" && (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Some collections failed to initialize.</strong>
                <br />
                Check the list below for details. You may need to create them manually in Firebase Console.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {collections.map((col, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {col.status === "pending" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {col.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {col.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-mono text-sm">{col.name}</span>
                </div>
                {col.message && (
                  <span className="text-xs text-muted-foreground">{col.message}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={initializeCollections}
              disabled={isRunning || overallStatus === "complete"}
              className="w-full"
            >
              {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {overallStatus === "idle" && "Initialize Collections"}
              {overallStatus === "running" && "Initializing..."}
              {overallStatus === "complete" && "Completed"}
              {overallStatus === "error" && "Retry Failed Collections"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Creates {collectionsToCreate.length} Firestore collections</li>
              <li>Adds placeholder documents to make collections visible</li>
              <li>Sets up required platform settings</li>
              <li>Resolves "Missing or insufficient permissions" errors</li>
            </ul>
            <p className="mt-4"><strong>After initialization:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Hard refresh your browser (Ctrl+Shift+R)</li>
              <li>Permission errors should disappear</li>
              <li>SVP navigation sections will be visible</li>
              <li>You can delete placeholder documents from Firebase Console</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
