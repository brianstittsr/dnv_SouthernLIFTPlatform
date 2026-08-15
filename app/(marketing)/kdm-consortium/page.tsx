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
  avatar?: string;
  companyLogo?: string;
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

function ConsortiumMemberCard({ member }: { member: DisplayMember }) {
  const [imageUrl, setImageUrl] = useState<string | null>(member.avatar || member.staticImageUrl || null);

  useEffect(() => {
    loadMemberImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (member.avatar || member.staticImageUrl) {
        setImageUrl(member.avatar || member.staticImageUrl || null);
        return;
      }
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
        }
      }
    } catch (error) {
      console.error("Error loading member image:", error);
    }
  }

  return (
    <Link href={`/kdm-consortium/${member.id}`} className="block">
      <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-8 pb-6">
          <div className="w-full max-w-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted flex items-center justify-center aspect-[3/4]">
            {imageUrl ? (
              <img src={imageUrl} alt={member.name} className="w-full h-full object-cover object-top" />
            ) : (
              <span className="text-primary text-4xl font-semibold">{member.initials}</span>
            )}
          </div>
          {member.companyLogo ? (
            <div className="w-full max-w-48 mx-auto mb-4 h-16 flex items-center justify-center bg-white rounded-lg border border-slate-100 px-3 py-2">
              <img
                src={member.companyLogo}
                alt={member.company ? `${member.company} logo` : "Company logo"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-4" />
          )}
          <h3 className="text-lg font-semibold">{member.name}</h3>
          {member.company && (
            <p className="text-sm font-bold uppercase tracking-wide text-amber-600 mb-1">{member.company}</p>
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

export default function KdmConsortiumPage() {
  const [members, setMembers] = useState<DisplayMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsortiumMembers();
  }, []);

  async function fetchConsortiumMembers() {
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      const q = query(collection(db, COLLECTIONS.TEAM_MEMBERS), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      const result: DisplayMember[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TeamMemberDoc;
        // Note: intentionally not gated by showOnTeamPage — that flag only
        // controls the /team page. Members can be hidden there (e.g. KDM
        // Founders) while still appearing here as consortium members.
        if (!data.tags?.includes("kdm-consortium")) return;

        result.push({
          id: docSnap.id,
          name: `${data.firstName} ${data.lastName}`,
          title: data.title || data.expertise || "Consortium Member",
          company: data.company,
          initials: getInitials(data.firstName, data.lastName),
          imageName: `${data.firstName}_${data.lastName}`,
          staticImageUrl: data.avatar,
          bio: data.bio || data.expertise || "KDM Consortium Member",
          shortBio: data.title || data.expertise || "KDM Consortium Member",
          avatar: data.avatar,
          companyLogo: data.companyLogo,
        });
      });
      result.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(result);
    } catch (error) {
      console.error("Error fetching consortium members:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              KDM Consortium
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              KDM <span className="text-primary">Consortium</span> Members
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Meet the expert companies and affiliates collaborating with KDM & Associates to win
              and deliver government contracting opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No consortium members found.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {members.map((member) => (
                <div key={member.id} className="w-full sm:w-80">
                  <ConsortiumMemberCard member={member} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container text-center">
          <Users className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join the KDM Consortium</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Become part of a selective network of expert companies collaborating to compete more
            effectively for government contracts.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/consortium">
              Learn More About the Consortium
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
