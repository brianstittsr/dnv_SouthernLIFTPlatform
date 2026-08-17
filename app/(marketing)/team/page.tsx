"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { listImages } from "@/lib/firebase-images";
import { findMatchingImage, buildImageUrl } from "@/lib/team-image-utils";

interface DisplayMember {
  id: string;
  name: string;
  title: string;
  company?: string;
  initials: string;
  imageName: string;
  staticImageUrl?: string;
  bio: string;
  shortBio?: string;
  avatar?: string;
  resolvedImageUrl?: string;
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

function TeamMemberCard({ member }: { member: DisplayMember }) {
  const imageUrl = member.resolvedImageUrl || null;

  return (
    <Link href={`/team/${member.id}`} className="block">
      <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-8 pb-6">
          <div className="w-full max-w-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted flex items-center justify-center aspect-[3/4]">
            {imageUrl ? (
              <img src={imageUrl} alt={member.name} className="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
            ) : (
              <span className="text-primary text-4xl font-semibold">{member.initials}</span>
            )}
          </div>
          <h3 className="text-lg font-semibold">{member.name}</h3>
          {member.company && (
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">{member.company}</p>
          )}
          <p className="text-sm text-primary font-medium">{member.title}</p>
          <p className="mt-3 text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors font-medium">
            Click to read bio →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function MemberSection({ title, members }: { title: string; members: DisplayMember[] }) {
  if (members.length === 0) return null;
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">{title}</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {members.map((member) => (
          <div key={member.id} className="w-full sm:w-80">
            <TeamMemberCard member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [leadership, setLeadership] = useState<DisplayMember[]>([]);
  const [staff, setStaff] = useState<DisplayMember[]>([]);
  const [team, setTeam] = useState<DisplayMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTeamMembers(); }, []);

  async function fetchTeamMembers() {
    if (!db) { setLoading(false); return; }
    try {
      const q = query(collection(db, COLLECTIONS.TEAM_MEMBERS), where("status", "==", "active"));
      const querySnapshot = await getDocs(q);

      // Batch-fetch image metadata once for all members
      let teamImages: { id: string; name: string }[] = [];
      let allImages: { id: string; name: string }[] = [];
      try {
        teamImages = await listImages("team");
      } catch {
        // will try allImages below
      }

      // Check if any member lacks an avatar and needs image matching
      const needsAllImages = querySnapshot.docs.some((docSnap) => {
        const data = docSnap.data() as TeamMemberDoc;
        if (data.showOnTeamPage === false) return false;
        if (data.avatar) return false;
        const memberInfo = { imageName: `${data.firstName}_${data.lastName}`, name: `${data.firstName} ${data.lastName}` };
        return !findMatchingImage(memberInfo, teamImages);
      });
      if (needsAllImages) {
        try { allImages = await listImages(); } catch { /* ignore */ }
      }

      const leadershipMembers: DisplayMember[] = [];
      const staffMembers: DisplayMember[] = [];
      const teamMembers: DisplayMember[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as TeamMemberDoc;
        // Skip profiles explicitly hidden from the public team page
        if (data.showOnTeamPage === false) return;

        // Resolve image URL: avatar > staticImageUrl > matched Firestore image
        let resolvedImageUrl: string | undefined;
        if (data.avatar) {
          resolvedImageUrl = data.avatar;
        } else {
          const memberInfo = { imageName: `${data.firstName}_${data.lastName}`, name: `${data.firstName} ${data.lastName}` };
          let match = findMatchingImage(memberInfo, teamImages);
          if (!match) {
            match = findMatchingImage(memberInfo, allImages);
          }
          if (match) {
            resolvedImageUrl = buildImageUrl(match.id);
          }
        }

        const member: DisplayMember = {
          id: docSnap.id,
          name: `${data.firstName} ${data.lastName}`,
          title: data.title || data.expertise || "Team Member",
          company: data.company,
          initials: getInitials(data.firstName, data.lastName),
          imageName: `${data.firstName}_${data.lastName}`,
          staticImageUrl: data.avatar,
          bio: data.bio || `${data.expertise || "KDM Team Member"}`,
          shortBio: data.title || data.expertise || "KDM Team Member",
          avatar: data.avatar,
          resolvedImageUrl,
        };
        const tags = data.tags || [];
        if (tags.includes("kdm-leadership")) {
          leadershipMembers.push(member);
        } else if (tags.includes("kdm-staff")) {
          staffMembers.push(member);
        } else {
          teamMembers.push(member);
        }
      });
      const sortByName = (a: DisplayMember, b: DisplayMember) => a.name.localeCompare(b.name);
      setLeadership(leadershipMembers.sort(sortByName));
      setStaff(staffMembers.sort(sortByName));
      setTeam(teamMembers.sort(sortByName));
    } catch (error) { console.error("Error fetching team members:", error); }
    finally { setLoading(false); }
  }

  return (
    <>
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">Our Team</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">KDM & Associates <span className="text-primary">Team</span></h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">Meet the experienced professionals dedicated to helping small businesses succeed in government contracting.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : (
            <>
              <MemberSection title="KDM Leadership" members={leadership} />
              <MemberSection title="KDM Staff" members={staff} />
              {leadership.length === 0 && staff.length === 0 && team.length === 0 && (
                <div className="text-center py-20"><p className="text-muted-foreground">No team members found.</p></div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container text-center">
          <Users className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A Team Approach to Your Success</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Our experienced team brings together expertise in government contracting, business development, technology, and community engagement to support your journey to success.</p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/contact">Work With Our Team<ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
