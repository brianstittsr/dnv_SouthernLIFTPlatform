"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { TeammemberBio } from "@/components/marketing/team-member-bio";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";

interface DisplayMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  imageName: string;
  staticImageUrl?: string;
  bio: string;
  fullBio: string;
  linkedIn?: string;
  tags?: string[];
  avatar?: string;
  companyLogo?: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

export default function ConsortiumMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<DisplayMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMember() {
      if (!db || !id) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const docRef = doc(db, COLLECTIONS.TEAM_MEMBERS, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && (docSnap.data() as TeamMemberDoc).tags?.includes("kdm-consortium")) {
          const data = docSnap.data() as TeamMemberDoc;
          setMember({
            id: docSnap.id,
            name: `${data.firstName} ${data.lastName}`,
            title: data.title || data.expertise || "Consortium Member",
            initials: getInitials(data.firstName, data.lastName),
            imageName: `${data.firstName}_${data.lastName}`,
            staticImageUrl: data.avatar,
            bio: data.bio || `${data.expertise || "KDM Consortium Member"}`,
            fullBio: data.bio || "",
            linkedIn: data.linkedIn,
            tags: data.tags || [],
            avatar: data.avatar,
            companyLogo: data.companyLogo,
          } as DisplayMember);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching consortium member:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Consortium Member Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The consortium member you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/kdm-consortium">Back to Consortium Members</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/kdm-consortium"
              className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Consortium Members
            </Link>
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              {member.title}
            </Badge>
            {member.tags && member.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {member.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {member.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <TeammemberBio member={member} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Join the KDM Consortium</h2>
              <p className="text-muted-foreground mb-6">
                Ready to take your business to the next level? Learn how to join our selective
                network of expert companies.
              </p>
              <Button size="lg" asChild>
                <Link href="/consortium">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
