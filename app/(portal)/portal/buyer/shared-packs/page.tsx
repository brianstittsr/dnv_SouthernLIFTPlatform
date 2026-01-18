"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSharedProofPacks } from "@/lib/mock-data/buyer-mock-data";

export default function SharedProofPacksPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setItems(mockSharedProofPacks as any[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(collection(db, "proofPacks"));
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
            <h1 className="text-3xl font-bold">Shared Proof Packs</h1>
            <p className="text-muted-foreground">SME portfolios shared with you</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shared Proof Packs</CardTitle>
          <CardDescription>View and manage your shared proof packs</CardDescription>
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
