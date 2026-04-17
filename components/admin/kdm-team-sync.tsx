"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// KDM Team members from the marketing page
const kdmTeammembers = [
  {
    id: "keith-moore",
    firstName: "Keith",
    lastName: "Moore",
    title: "CEO",
    expertise: "Government Contracting Strategy",
    bio: "Leading KDM & Associates with a vision to empower diverse businesses in government contracting.",
    emailPrimary: "kmoore@kdmassociates.com",
    imageName: "Keith_Moore",
    role: "team" as const,
    isCEO: true,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "miranda-bouldin",
    firstName: "Miranda",
    lastName: "Bouldin",
    title: "President",
    expertise: "Contracts & Space Defense",
    bio: "Creator of Space Defense Brief & TechGeekette Brief | CEO, LogiCore | Strategic Insights on Space Command, Space Force & National Defense | GovCon | Defense Logistics | Cybersecurity",
    emailPrimary: "mbouldin@logicore.com",
    imageName: "Miranda_Bouldin",
    role: "team" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "kirk-jimenez",
    firstName: "Kirk",
    lastName: "Jimenez",
    title: "Media & Marketing Partner",
    expertise: "Media, Marketing & Communications",
    bio: "Elevating Latinos & minorities. Triple M: Media, Marketing & Money man. Xizzle TV Founder! 2-time Emmy Winner, Ex-ESPN anchor, Elite Closer University partner, SVP Brickell Capital Finance",
    emailPrimary: "kirk@xizzletv.com",
    imageName: "Kirk_Jimenez",
    role: "affiliate" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "charles-sills",
    firstName: "Charles",
    lastName: "Sills",
    title: "COO",
    expertise: "Operations Management",
    bio: "Overseeing operations and ensuring excellence in service delivery to our clients.",
    emailPrimary: "csills@kdmassociates.com",
    imageName: "Charles_Sills",
    role: "team" as const,
    isCEO: false,
    isCOO: true,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "oscar-frazier",
    firstName: "Oscar",
    lastName: "Frazier",
    title: "Consultant",
    expertise: "Government Contracting Strategy",
    bio: "Providing expert guidance on government contracting strategies and business development.",
    emailPrimary: "ofrazier@kdmassociates.com",
    imageName: "Oscar_Frazier",
    role: "consultant" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "pamela-ramos-brown",
    firstName: "Pamela",
    lastName: "Ramos-Brown",
    title: "KDM Consultant",
    expertise: "Strategic Consulting",
    bio: "Supporting clients with strategic consulting and capacity building initiatives.",
    emailPrimary: "pramos@kdmassociates.com",
    imageName: "Pamela_Ramos_Brown",
    role: "consultant" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "calvin-minor",
    firstName: "Calvin",
    lastName: "Minor",
    title: "Operations Support Manager",
    expertise: "Operations Support",
    bio: "Managing day-to-day operations and ensuring seamless client support.",
    emailPrimary: "cminor@kdmassociates.com",
    imageName: "Calvin_Minor",
    role: "team" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "manpreet-hundal",
    firstName: "Manpreet",
    lastName: "Hundal",
    title: "Compliance and Data Specialist",
    expertise: "Compliance & Data",
    bio: "Ensuring compliance excellence and data-driven insights for our clients.",
    emailPrimary: "mhundal@kdmassociates.com",
    imageName: "Manpreet_Hundal",
    role: "team" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "timothy-webster",
    firstName: "Timothy Maurice",
    lastName: "Webster",
    title: "Director of International Communications",
    expertise: "International Communications",
    bio: "Leading international outreach and communication strategies for global opportunities.",
    emailPrimary: "twebster@kdmassociates.com",
    imageName: "Timothy_Webster",
    role: "team" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
  {
    id: "jose-nino",
    firstName: "Jose F.",
    lastName: "Niño",
    title: "Director of Hispanic Affairs",
    expertise: "Hispanic Affairs & Outreach",
    bio: "Championing Hispanic business interests and expanding outreach to the Hispanic community.",
    emailPrimary: "jnino@kdmassociates.com",
    imageName: "Jose_Nino",
    role: "team" as const,
    isCEO: false,
    isCOO: false,
    isCTO: false,
    isCRO: false,
  },
];

interface SyncStatus {
  member: string;
  status: "pending" | "syncing" | "synced" | "error";
  message?: string;
}

export function KdmTeamSync() {
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
      
      // Check if any KDM members are missing
      const missing = kdmTeammembers.filter(
        member => !existing.includes(`${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}`)
      );
      
      if (missing.length > 0) {
        setShowSyncPanel(true);
      }
    } catch (error) {
      console.error("Error checking existing members:", error);
    }
  }

  async function syncKdmTeam() {
    if (!db) {
      toast.error("Firebase not initialized");
      return;
    }

    setIsSyncing(true);
    setSyncStatus(kdmTeammembers.map(m => ({ member: `${m.firstName} ${m.lastName}`, status: "pending" })));

    for (let i = 0; i < kdmTeammembers.length; i++) {
      const member = kdmTeammembers[i];
      
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
          // Member exists - update bio if changed
          const existingDoc = snapshot.docs[0];
          const existingData = existingDoc.data();
          
          if (existingData.bio !== member.bio || !existingData.teamTag) {
            const teamTag = member.isCEO ? "leadership" : 
                           member.isCOO ? "leadership" :
                           member.role === "affiliate" ? "affiliate" : "staff";
            await updateDoc(doc(db, COLLECTIONS.TEAM_MEMBERS, existingDoc.id), {
              bio: member.bio,
              title: member.title,
              expertise: member.expertise,
              teamTag,
              updatedAt: Timestamp.now(),
            });
            setSyncStatus(prev => prev.map((s, idx) => 
              idx === i ? { ...s, status: "synced", message: "Bio updated" } : s
            ));
          } else {
            setSyncStatus(prev => prev.map((s, idx) => 
              idx === i ? { ...s, status: "synced", message: "Already exists" } : s
            ));
          }
          continue;
        }

        // Create new team member
        const teamTag = member.isCEO ? "leadership" : 
                       member.isCOO ? "leadership" :
                       member.role === "affiliate" ? "affiliate" : "staff";
        const teammemberData = {
          firstName: member.firstName,
          lastName: member.lastName,
          emailPrimary: member.emailPrimary,
          expertise: member.expertise,
          title: member.title,
          bio: member.bio,
          role: member.role,
          teamTag,
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
    toast.success("KDM Team sync completed!");
    
    // Refresh existing members list
    checkExistingmembers();
  }

  const missingCount = kdmTeammembers.filter(
    member => !existingmembers.includes(`${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}`)
  ).length;

  if (!showSyncPanel && existingmembers.length > 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">All KDM team members are synced!</p>
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
          KDM Team Sync
        </CardTitle>
        <CardDescription>
          {missingCount > 0 
            ? `Found ${missingCount} team member${missingCount !== 1 ? "s" : ""} from the KDM website that ${missingCount !== 1 ? "are" : "is"} not in the admin system.`
            : "Check and sync KDM team members to the admin system."
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
          onClick={syncKdmTeam} 
          disabled={isSyncing}
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
