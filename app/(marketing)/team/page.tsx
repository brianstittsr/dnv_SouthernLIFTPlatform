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
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";

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
  teamTag?: "leadership" | "staff" | "affiliate";
  avatar?: string;
  displayOrder?: number;
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

function TeamMemberCard({ member }: { member: DisplayMember }) {
  const [imageUrl, setImageUrl] = useState<string | null>(member.avatar || member.staticImageUrl || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemberImage();
  }, [member.imageName]);

  function findMatch(images: { id: string; name: string }[]) {
    const memberImageNameLower = member.imageName.toLowerCase();
    const memberNameLower = member.name.toLowerCase();
    const nameParts = member.name.split(" ");
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts[nameParts.length - 1].toLowerCase();

    return images.find((img) => {
      const n = img.name.toLowerCase();
      if (n === memberImageNameLower) return true;
      if (n.includes(memberImageNameLower)) return true;
      if (n.includes(`${lastName}_${firstName}`)) return true;
      if (n.replace(/_/g, " ").includes(memberNameLower)) return true;
      if (n.includes(firstName) && n.includes(lastName)) return true;
      return false;
    });
  }

  async function loadMemberImage() {
    try {
      setIsLoading(true);
      
      // Priority 1: Use avatar from Firestore if available
      if (member.avatar || member.staticImageUrl) {
        setImageUrl(member.avatar || member.staticImageUrl || null);
        setIsLoading(false);
        return;
      }
      
      // Priority 2: Fall back to searching Firebase Storage
      let images = await listImages("team");
      let matchingImage = findMatch(images);
      if (!matchingImage) {
        images = await listImages();
        matchingImage = findMatch(images);
      }
      if (matchingImage) {
        const fullImage = await getImage(matchingImage.id);
        if (fullImage?.base64Data) {
          setImageUrl(base64ToDataUrl(fullImage.base64Data, fullImage.mimeType));
          return;
        }
      }
    } catch (error) {
      console.error("Error loading member image:", error);
      // Keep initials fallback
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Link href={`/team/${member.id}`} className="block">
      <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-8 pb-6">
          <div className="w-full max-w-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted flex items-center justify-center aspect-[3/4]">
            {imageUrl ? (
              <img src={imageUrl} alt={member.name} className="w-full h-full object-cover object-top" />
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
  const [affiliates, setAffiliates] = useState<DisplayMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTeamMembers(); }, []);

  async function fetchTeamMembers() {
    if (!db) { setLoading(false); return; }
    try {
      const q = query(collection(db, COLLECTIONS.TEAM_MEMBERS), where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      const leadershipMembers: DisplayMember[] = [];
      const staffMembers: DisplayMember[] = [];
      const affiliateMembers: DisplayMember[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as TeamMemberDoc;
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
          teamTag: data.teamTag || "affiliate",
          avatar: data.avatar,
          displayOrder: data.displayOrder || 0,
        };
        switch (data.teamTag) {
          case "leadership": leadershipMembers.push(member); break;
          case "staff": staffMembers.push(member); break;
          case "affiliate":
          default: affiliateMembers.push(member); break;
        }
      });
      const sortByDisplayOrder = (a: DisplayMember, b: DisplayMember) => {
        const orderA = a.displayOrder ?? 999;
        const orderB = b.displayOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      };
      setLeadership(leadershipMembers.sort(sortByDisplayOrder));
      setStaff(staffMembers.sort(sortByDisplayOrder));
      setAffiliates(affiliateMembers.sort(sortByDisplayOrder));
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
              <MemberSection title="KDM Affiliates" members={affiliates} />
              {leadership.length === 0 && staff.length === 0 && affiliates.length === 0 && (
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
