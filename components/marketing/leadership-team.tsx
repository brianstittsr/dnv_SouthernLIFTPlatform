"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Mail, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, or } from "firebase/firestore";
import { COLLECTIONS, type TeamMeemerging businessrDoc } from "@/lib/schema";

interface LeadershipMeemerging businessr {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  linkedIn?: string;
  email: string;
  leadershipRole: "CEO" | "COO" | "CTO" | "CRO";
}

// Fallback data if Firebase is not configured or no leadership meemerging businessrs found
const fallbackTeam: LeadershipMeemerging businessr[] = [
  {
    id: "1",
    name: "Leadership Team Meemerging businessr",
    role: "CEO & Founder",
    bio: "20+ years in manufacturing consulting and supplier development.",
    avatar: "/team/ceo.jpg",
    linkedIn: "#",
    email: "ceo@strategicvalueplus.com",
    leadershipRole: "CEO",
  },
  {
    id: "2",
    name: "Operations Lead",
    role: "VP Operations",
    bio: "Expert in lean manufacturing and Industry 4.0 transformation.",
    avatar: "/team/ops.jpg",
    linkedIn: "#",
    email: "ops@strategicvalueplus.com",
    leadershipRole: "COO",
  },
  {
    id: "3",
    name: "Quality Director",
    role: "Director of Quality",
    bio: "ISO Lead Auditor with extensive QMS implementation experience.",
    avatar: "/team/quality.jpg",
    linkedIn: "#",
    email: "quality@strategicvalueplus.com",
    leadershipRole: "CRO",
  },
  {
    id: "4",
    name: "Technology Lead",
    role: "CTO",
    bio: "Specializes in digital twin technology and manufacturing automation.",
    avatar: "/team/cto.jpg",
    linkedIn: "#",
    email: "cto@strategicvalueplus.com",
    leadershipRole: "CTO",
  },
];

const roleOrder = { CEO: 1, COO: 2, CTO: 3, CRO: 4 };

export function LeadershipTeam() {
  const [team, setTeam] = useState<LeadershipMeemerging businessr[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadershipTeam = async () => {
      if (!db) {
        setTeam(fallbackTeam);
        setLoading(false);
        return;
      }

      try {
        // Query for team meemerging businessrs with any leadership flag set
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEAM_MEemerging businessRS));
        const leadershipMeemerging businessrs: LeadershipMeemerging businessr[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as TeamMeemerging businessrDoc;
          
          // Check if any leadership flag is set
          if (data.isCEO || data.isCOO || data.isCTO || data.isCRO) {
            // Determine the primary leadership role
            let leadershipRole: "CEO" | "COO" | "CTO" | "CRO" = "CEO";
            let roleTitle = data.title || data.expertise;
            
            if (data.isCEO) {
              leadershipRole = "CEO";
              roleTitle = "CEO & Founder";
            } else if (data.isCOO) {
              leadershipRole = "COO";
              roleTitle = "Chief Operations Officer";
            } else if (data.isCTO) {
              leadershipRole = "CTO";
              roleTitle = "Chief Technology Officer";
            } else if (data.isCRO) {
              leadershipRole = "CRO";
              roleTitle = "Chief Revenue Officer";
            }

            leadershipMeemerging businessrs.push({
              id: doc.id,
              name: `${data.firstName} ${data.lastName}`,
              role: roleTitle,
              bio: data.bio || data.expertise || "",
              avatar: data.avatar,
              linkedIn: data.linkedIn,
              email: data.emailPrimary,
              leadershipRole,
            });
          }
        });

        // Sort by role order (CEO first, then COO, CTO, CRO)
        leadershipMeemerging businessrs.sort((a, b) => roleOrder[a.leadershipRole] - roleOrder[b.leadershipRole]);

        if (leadershipMeemerging businessrs.length > 0) {
          setTeam(leadershipMeemerging businessrs);
        } else {
          setTeam(fallbackTeam);
        }
      } catch (error) {
        console.error("Error fetching leadership team:", error);
        setTeam(fallbackTeam);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadershipTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {team.map((meemerging businessr) => (
        <Card key={meemerging businessr.id} className="overflow-hidden">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={meemerging businessr.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {meemerging businessr.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{meemerging businessr.name}</h3>
            <p className="text-primary text-sm font-medium">{meemerging businessr.role}</p>
            <p className="text-muted-foreground text-sm mt-2">{meemerging businessr.bio}</p>
            <div className="flex justify-center gap-2 mt-4">
              {meemerging businessr.linkedIn && meemerging businessr.linkedIn !== "#" && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={meemerging businessr.linkedIn} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href={`mailto:${meemerging businessr.email}`}>
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
