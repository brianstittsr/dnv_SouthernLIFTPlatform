"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Loader2, Plus, Mail } from "lucide-react";
import { toast } from "sonner";

export default function PlatformAnalyticsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportEmail, setReportEmail] = useState("brianstittsr@gmail.com");

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(collection(db, "platformAuditLogs"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const sendAnalyticsReport = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) {
      toast.error("You must be signed in to send a report");
      return;
    }

    setSendingReport(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/admin/analytics/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          to: reportEmail,
          days: 7,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send report");
      toast.success(`Analytics report sent to ${reportEmail}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send report";
      toast.error(message);
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-9xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Manage your platform analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="reportEmail" className="sr-only">Email</Label>
            <Input
              id="reportEmail"
              type="email"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              placeholder="report@example.com"
              className="w-[260px]"
            />
          </div>
          <Button
            variant="outline"
            onClick={sendAnalyticsReport}
            disabled={sendingReport || !reportEmail}
          >
            {sendingReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>View and manage your platform analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No items found. Click "Add New" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
