"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  imageName: string;
  staticImageUrl?: string;
  bio: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

      // First try "team" category in Image Manager
      let images = await listImages("team");
      let matchingImage = findMatch(images);

      // If no match, search all categories
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

      // Fall back to static public image if provided
      if (member.staticImageUrl) {
        setImageUrl(member.staticImageUrl);
      }
    } catch (error) {
      // On any error, fall back to static image
      if (member.staticImageUrl) {
        setImageUrl(member.staticImageUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Link href={`/team/${member.id}`} className="block">
      <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-8 pb-6">
          {/* Image container - proportional aspect ratio, no background showing */}
          <div className="w-full max-w-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted flex items-center justify-center aspect-[3/4]">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={member.name} 
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="text-primary text-4xl font-semibold">
                {member.initials}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="text-sm text-primary font-medium mb-3">{member.title}</p>
          <p className="text-sm text-muted-foreground">{member.bio}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
