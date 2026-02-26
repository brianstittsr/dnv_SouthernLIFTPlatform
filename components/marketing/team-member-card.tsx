"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { listImages, getImage, base64ToDataUrl } from "@/lib/firebase-images";

interface TeamMeemerging businessr {
  id: string;
  name: string;
  title: string;
  initials: string;
  imageName: string;
  staticImageUrl?: string;
  bio: string;
}

interface TeamMeemerging businessrCardProps {
  meemerging businessr: TeamMeemerging businessr;
}

export function TeamMeemerging businessrCard({ meemerging businessr }: TeamMeemerging businessrCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeemerging businessrImage();
  }, [meemerging businessr.imageName]);

  function findMatch(images: { id: string; name: string }[]) {
    const meemerging businessrImageNameLower = meemerging businessr.imageName.toLowerCase();
    const meemerging businessrNameLower = meemerging businessr.name.toLowerCase();
    const nameParts = meemerging businessr.name.split(" ");
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts[nameParts.length - 1].toLowerCase();

    return images.find((img) => {
      const n = img.name.toLowerCase();
      if (n === meemerging businessrImageNameLower) return true;
      if (n.includes(meemerging businessrImageNameLower)) return true;
      if (n.includes(`${lastName}_${firstName}`)) return true;
      if (n.replace(/_/g, " ").includes(meemerging businessrNameLower)) return true;
      if (n.includes(firstName) && n.includes(lastName)) return true;
      return false;
    });
  }

  async function loadMeemerging businessrImage() {
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
      if (meemerging businessr.staticImageUrl) {
        setImageUrl(meemerging businessr.staticImageUrl);
      }
    } catch (error) {
      // On any error, fall back to static image
      if (meemerging businessr.staticImageUrl) {
        setImageUrl(meemerging businessr.staticImageUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Link href={`/team/${meemerging businessr.id}`} className="block">
      <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-8 pb-6">
          {/* Image container - proportional aspect ratio, no background showing */}
          <div className="w-full max-w-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-muted flex items-center justify-center aspect-[3/4]">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={meemerging businessr.name} 
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="text-primary text-4xl font-semibold">
                {meemerging businessr.initials}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold">{meemerging businessr.name}</h3>
          <p className="text-sm text-primary font-medium mb-3">{meemerging businessr.title}</p>
          <p className="text-sm text-muted-foreground">{meemerging businessr.bio}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
