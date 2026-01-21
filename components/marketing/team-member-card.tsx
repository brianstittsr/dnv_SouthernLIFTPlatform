"use client";

import { useState, useEffect } from "react";
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
      
      // List all images and find the one matching the member's name
      const images = await listImages("team");
      const matchingImage = images.find(img => 
        img.name === member.imageName || 
        img.name.toLowerCase().includes(member.imageName.toLowerCase())
      );

      if (matchingImage) {
        // Load the full image data
        const fullImage = await getImage(matchingImage.id);
        if (fullImage) {
          const url = base64ToDataUrl(fullImage.base64Data, fullImage.mimeType);
          setImageUrl(url);
        }
      }
    } catch (error) {
      console.error(`Error loading image for ${member.name}:`, error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
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
  );
}
