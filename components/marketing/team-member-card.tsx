"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  imageName: string;
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

  async function loadMemberImage() {
    try {
      setIsLoading(true);
      
      // Try to load from Firebase Image Manager
      const images = await listImages("team");
      
      if (!images || images.length === 0) {
        // No images in Firebase yet, use fallback
        setIsLoading(false);
        return;
      }
      
      const matchingImage = images.find(img => 
        img.name === member.imageName || 
        img.name.toLowerCase().includes(member.imageName.toLowerCase()) ||
        img.name.replace(/_/g, ' ').toLowerCase().includes(member.name.toLowerCase())
      );

      if (matchingImage) {
        const fullImage = await getImage(matchingImage.id);
        if (fullImage && fullImage.base64Data) {
          const url = base64ToDataUrl(fullImage.base64Data, fullImage.mimeType);
          setImageUrl(url);
        }
      }
    } catch (error) {
      // Silently fail and show initials fallback
      console.log(`Image not available for ${member.name}, showing initials`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Link href={`/team/${member.id}`} className="block">
      <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="pt-8 pb-6">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            {imageUrl && <AvatarImage src={imageUrl} alt={member.name} className="object-cover" />}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="text-sm text-primary font-medium mb-3">{member.title}</p>
          <p className="text-sm text-muted-foreground">{member.bio}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
