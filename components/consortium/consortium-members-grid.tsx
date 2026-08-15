"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Building2, Globe, ExternalLink } from "lucide-react";
import { normalizeUrl } from "@/lib/utils";

interface ConsortiumMember {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  avatar?: string;
  companyName?: string;
  companyDescription?: string;
  website?: string;
  linkedIn?: string;
  consortiumPillarFocus?: string[];
  certifications?: string[];
}

const PILLAR_COLORS: Record<string, string> = {
  "us-manufacturing": "bg-blue-100 text-blue-800",
  "critical-minerals": "bg-purple-100 text-purple-800",
  "defense-contracting": "bg-green-100 text-green-800",
  "access-to-capital": "bg-amber-100 text-amber-800",
  "opportunity-zones": "bg-rose-100 text-rose-800",
};

const PILLAR_LABELS: Record<string, string> = {
  "us-manufacturing": "U.S. Manufacturing",
  "critical-minerals": "Critical Minerals",
  "defense-contracting": "Defense Contracting",
  "access-to-capital": "Access to Capital",
  "opportunity-zones": "Opportunity Zones",
};

interface ConsortiumMembersGridProps {
  limit?: number;
  showFilters?: boolean;
}

export function ConsortiumMembersGrid({ limit, showFilters = false }: ConsortiumMembersGridProps) {
  const [members, setMembers] = useState<ConsortiumMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!db) return;

      try {
        const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
        // Query for active consortium members with completed onboarding
        const q = query(
          teamMembersRef,
          where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const membersData: ConsortiumMember[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter in memory for consortium members with completed onboarding
          if (
            data.tags?.includes("kdm-consortium") &&
            data.consortiumOnboardingComplete === true &&
            data.companyName // Must have company info
          ) {
            membersData.push({
              id: doc.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              title: data.title,
              avatar: data.avatar,
              companyName: data.companyName,
              companyDescription: data.companyDescription,
              website: data.website,
              linkedIn: data.linkedIn,
              consortiumPillarFocus: data.consortiumPillarFocus || [],
              certifications: data.certifications || [],
            });
          }
        });

        // Sort by company name
        membersData.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || ""));

        setMembers(limit ? membersData.slice(0, limit) : membersData);
      } catch (error) {
        console.error("Error fetching consortium members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [limit]);

  const filteredMembers = filter
    ? members.filter((m) => m.consortiumPillarFocus?.includes(filter))
    : members;

  const uniquePillars = Array.from(
    new Set(members.flatMap((m) => m.consortiumPillarFocus || []))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Consortium member profiles will appear here once members complete their onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && uniquePillars.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === null
                ? "bg-amber-500 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All Members
          </button>
          {uniquePillars.map((pillar) => (
            <button
              key={pillar}
              onClick={() => setFilter(filter === pillar ? null : pillar)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === pillar
                  ? "bg-amber-500 text-white"
                  : PILLAR_COLORS[pillar] || "bg-muted hover:bg-muted/80"
              }`}
            >
              {PILLAR_LABELS[pillar] || pillar}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Header with Avatar and Company */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-14 h-14 border-2 border-amber-100">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight truncate">
                    {member.companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.firstName} {member.lastName}
                    {member.title && ` • ${member.title}`}
                  </p>
                </div>
              </div>

              {/* Description */}
              {member.companyDescription && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {member.companyDescription}
                </p>
              )}

              {/* Pillar Focus */}
              {member.consortiumPillarFocus && member.consortiumPillarFocus.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.consortiumPillarFocus.slice(0, 3).map((pillar) => (
                    <Badge
                      key={pillar}
                      variant="secondary"
                      className={`text-xs ${PILLAR_COLORS[pillar] || ""}`}
                    >
                      {PILLAR_LABELS[pillar] || pillar}
                    </Badge>
                  ))}
                  {member.consortiumPillarFocus.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.consortiumPillarFocus.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Certifications */}
              {member.certifications && member.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {member.certifications.slice(0, 4).map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs font-normal">
                      {cert.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3 pt-3 border-t">
                {normalizeUrl(member.website) && (
                  <a
                    href={normalizeUrl(member.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {normalizeUrl(member.linkedIn) && (
                  <a
                    href={normalizeUrl(member.linkedIn)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ConsortiumMembersSection() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Our Consortium Members</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the expert companies collaborating to win and deliver large government contracts
            across manufacturing, critical minerals, defense, and energy sectors.
          </p>
        </div>
        <ConsortiumMembersGrid limit={6} />
        <div className="text-center mt-8">
          <a
            href="/consortium/members"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            View All Members & Benefits
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
