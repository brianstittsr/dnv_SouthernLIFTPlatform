"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";

interface Teammember {
  id: string;
  name: string;
  title: string;
  initials: string;
  imageName: string;
  staticImageUrl?: string;
  bio: string;
  fullBio: string;
  linkedIn?: string;
  companyLogo?: string;
}

interface TeammemberBioProps {
  member: Teammember;
}

export function TeammemberBio({ member }: TeammemberBioProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadmemberImage();
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

  async function loadmemberImage() {
    try {
      setIsLoading(true);
      
      // Priority 1: Use staticImageUrl from Firestore (avatar field) if available
      if (member.staticImageUrl) {
        setImageUrl(member.staticImageUrl);
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
      console.error("Error loading team member image:", error);
      // Keep any existing imageUrl or leave as null to show initials
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12">
        {/* Photo Column */}
        <div className="flex flex-col items-center md:items-start">
          <div className="w-full max-w-[280px] rounded-2xl overflow-hidden bg-muted flex items-center justify-center aspect-[3/4] mb-4">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={member.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="text-primary text-6xl font-semibold">
                {member.initials}
              </span>
            )}
          </div>
          {member.companyLogo && (
            <div className="w-full max-w-[280px] mb-6 h-32 flex items-center justify-center bg-white rounded-lg border border-slate-100 px-4 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.companyLogo}
                alt="Company logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
            <p className="text-lg text-primary font-medium mb-3">{member.title}</p>
            {member.linkedIn && (
              <Button variant="outline" size="sm" asChild>
                <a href={member.linkedIn} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn Profile
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Biography Column */}
        <div className="prose prose-lg max-w-none">
          <div className="text-muted-foreground space-y-4">
            {member.fullBio ? (
              member.fullBio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <div className="space-y-4">
                <p className="leading-relaxed">
                  {member.name} is a dedicated professional serving as {member.title} at KDM & Associates. 
                  With extensive experience in government contracting and business development, 
                  {member.name.split(' ')[0]} plays a crucial role in helping small and diverse businesses 
                  succeed in the federal marketplace.
                </p>
                <p className="leading-relaxed">
                  As part of the KDM team, {member.name.split(' ')[0]} is committed to our mission of 
                  empowering businesses through strategic teaming, capacity building, and mentorship. 
                  Their expertise in {member.title.toLowerCase()} helps clients navigate the complexities 
                  of government procurement and achieve their contracting goals.
                </p>
                <p className="leading-relaxed">
                  {member.name.split(' ')[0]} brings valuable insights and innovative approaches to 
                  every client engagement, ensuring that KDM & Associates delivers exceptional value 
                  and measurable results for our partners.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
