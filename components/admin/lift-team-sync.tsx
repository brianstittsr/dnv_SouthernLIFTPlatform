"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// LIFT Center staff roster to sync into the admin team directory.
// Populate this with the Southern University LIFT Rural Business Center
// team once the official roster is published. Until then the list is
// intentionally empty, which keeps the missing-member sync count at 0.
const liftTeamMembers: {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  expertise: string;
  bio: string;
  emailPrimary: string;
  imageName: string;
  role: "team" | "affiliate" | "consultant";
  isCEO: boolean;
  isCOO: boolean;
  isCTO: boolean;
  isCRO: boolean;
}[] = [];

interface SyncStatus {
  member: string;
  status: "pending" | "syncing" | "synced" | "error";
  message?: string;
}

export function LiftTeamSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [existingmembers, setExistingmembers] = useState<string[]>([]);
  const [showSyncPanel, setShowSyncPanel] = useState(false);

  useEffect(() => {
    checkExistingmembers();
  }, []);

  async function checkExistingmembers() {
    if (!db) return;

    try {
      const q = query(
        collection(db, COLLECTIONS.TEAM_MEMBERS),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.map(doc => {
        const data = doc.data();
        return `${data.firstName?.toLowerCase()}-${data.lastName?.toLowerCase()}`;
      });
      setExistingmembers(existing);

      // Check if any LIFT members are missing
      const missing = liftTeamMembers.filter(
        member => !existing.includes(`${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}`)
      );

      if (missing.length > 0) {
        setShowSyncPanel(true);
      }
    } catch (error) {
      console.error("Error checking existing members:", error);
    }
  }

  async function syncLiftTeam() {
    if (!db) {
      toast.error("Firebase not initialized");
      return;
    }

    setIsSyncing(true);
    setSyncStatus(liftTeamMembers.map(m => ({ member: `${m.firstName} ${m.lastName}`, status: "pending" })));

    for (let i = 0; i < liftTeamMembers.length; i++) {
      const member = liftTeamMembers[i];

      setSyncStatus(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "syncing" } : s
      ));

      try {
        // Check if member already exists by name
        const q = query(
          collection(db, COLLECTIONS.TEAM_MEMBERS),
          where("firstName", "==", member.firstName),
          where("lastName", "==", member.lastName)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Member exists — update structural fields only; NEVER overwrite an existing bio
          const existingDoc = snapshot.docs[0];
          const existingData = existingDoc.data();

          const tags = member.isCEO || member.isCOO || member.isCTO || member.isCRO
            ? ["kdm-leadership"]
            : member.role === "affiliate"
            ? ["kdm-consortium"]
            : ["kdm-staff"];

          const existingTags = existingData.tags || [];
          const needsUpdate =
            existingData.title !== member.title ||
            existingData.expertise !== member.expertise ||
            JSON.stringify(existingTags.sort()) !== JSON.stringify(tags.sort());

          if (needsUpdate) {
            // Only update metadata — preserve the existing bio in Firestore
            const updatePayload: Record<string, unknown> = {
              title: member.title,
              expertise: member.expertise,
              tags,
              updatedAt: Timestamp.now(),
            };
            // Only write bio if the record has none at all
            if (!existingData.bio) {
              updatePayload.bio = member.bio;
            }
            await updateDoc(doc(db, COLLECTIONS.TEAM_MEMBERS, existingDoc.id), updatePayload);
            setSyncStatus(prev => prev.map((s, idx) =>
              idx === i ? { ...s, status: "synced", message: "Metadata updated" } : s
            ));
          } else {
            setSyncStatus(prev => prev.map((s, idx) =>
              idx === i ? { ...s, status: "synced", message: "Already up to date" } : s
            ));
          }
          continue;
        }

        // Create new team member
        const tags = member.isCEO || member.isCOO || member.isCTO || member.isCRO
          ? ["kdm-leadership"]
          : member.role === "affiliate"
          ? ["kdm-consortium"]
          : ["kdm-staff"];
        const teammemberData = {
          firstName: member.firstName,
          lastName: member.lastName,
          emailPrimary: member.emailPrimary,
          expertise: member.expertise,
          title: member.title,
          bio: member.bio,
          role: member.role,
          tags,
          status: "active",
          isCEO: member.isCEO || false,
          isCOO: member.isCOO || false,
          isCTO: member.isCTO || false,
          isCRO: member.isCRO || false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        await addDoc(collection(db, COLLECTIONS.TEAM_MEMBERS), teammemberData);

        setSyncStatus(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: "synced", message: "Created" } : s
        ));
      } catch (error) {
        console.error(`Error syncing ${member.firstName} ${member.lastName}:`, error);
        setSyncStatus(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: "error", message: "Failed to create" } : s
        ));
      }
    }

    setIsSyncing(false);
    toast.success("LIFT team sync completed!");

    // Refresh existing members list
    checkExistingmembers();
  }

  const missingCount = liftTeamMembers.filter(
    member => !existingmembers.includes(`${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}`)
  ).length;

  if (!showSyncPanel && existingmembers.length > 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">All LIFT team members are synced!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-amber-600" />
          LIFT Team Sync
        </CardTitle>
        <CardDescription>
          {missingCount > 0
            ? `Found ${missingCount} team member${missingCount !== 1 ? "s" : ""} from the LIFT Center roster that ${missingCount !== 1 ? "are" : "is"} not in the admin system.`
            : "Check and sync LIFT Center team members to the admin system."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus.length > 0 && (
          <div className="space-y-2">
            {syncStatus.map((status, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <span className="text-sm">{status.member}</span>
                <div className="flex items-center gap-2">
                  {status.status === "pending" && <span className="text-xs text-muted-foreground">Pending</span>}
                  {status.status === "syncing" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {status.status === "synced" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {status.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {status.message && <span className="text-xs text-muted-foreground">{status.message}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={syncLiftTeam}
          disabled={isSyncing || liftTeamMembers.length === 0}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync {missingCount} Missing member{missingCount !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
