"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  imageName: string;
  imageUrl?: string;
  bio: string;
  fullBio: string;
}

interface TeamMemberBioProps {
  member: TeamMember;
}

export function TeamMemberBio({ member }: TeamMemberBioProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemberImage();
  }, [member.imageName, member.imageUrl]);

  async function loadMemberImage() {
    try {
      setIsLoading(true);
      
      // If direct imageUrl is provided, use it
      if (member.imageUrl) {
        setImageUrl(member.imageUrl);
        setIsLoading(false);
        return;
      }
      
      // Try to load from Firebase Image Manager
      const images = await listImages("team");
      
      if (!images || images.length === 0) {
        // No images in Firebase yet, use fallback
        setIsLoading(false);
        return;
      }
      
      // Try multiple matching strategies
      const matchingImage = images.find(img => {
        const imgNameLower = img.name.toLowerCase();
        const memberImageNameLower = member.imageName.toLowerCase();
        const memberNameLower = member.name.toLowerCase();
        
        // Direct match
        if (imgNameLower === memberImageNameLower) return true;
        
        // Contains match
        if (imgNameLower.includes(memberImageNameLower)) return true;
        
        // Reverse name match (LastName_FirstName vs FirstName_LastName)
        const nameParts = member.name.split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0].toLowerCase();
          const lastName = nameParts[nameParts.length - 1].toLowerCase();
          const reversedName = `${lastName}_${firstName}`;
          if (imgNameLower.includes(reversedName)) return true;
        }
        
        // Full name match with spaces replaced by underscores
        if (imgNameLower.replace(/_/g, ' ').includes(memberNameLower)) return true;
        
        return false;
      });

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
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12">
        {/* Photo Column */}
        <div className="flex flex-col items-center md:items-start">
          <Avatar className="h-64 w-64 mb-6">
            {imageUrl && <AvatarImage src={imageUrl} alt={member.name} className="object-contain" />}
            <AvatarFallback className="bg-primary/10 text-primary text-6xl font-semibold">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
            <p className="text-lg text-primary font-medium">{member.title}</p>
          </div>
        </div>

        {/* Biography Column */}
        <div className="prose prose-lg max-w-none">
          <div className="text-muted-foreground space-y-4">
            {member.fullBio.split('\n\n').map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
