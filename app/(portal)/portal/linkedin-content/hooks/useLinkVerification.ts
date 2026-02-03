"use client";

import { useState, useCallback } from "react";
import { ReferenceLink } from "../types";

export function useLinkVerification() {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyLink = useCallback(
    async (link: ReferenceLink): Promise<ReferenceLink> => {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      
      if (!urlPattern.test(link.url)) {
        return { ...link, status: "invalid" };
      }

      try {
        const response = await fetch("/api/linkedin/verify-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: link.url }),
        });

        if (!response.ok) {
          return { ...link, status: "invalid" };
        }

        const data = await response.json();
        return {
          ...link,
          status: data.valid ? "valid" : "invalid",
          title: data.title || link.title,
          description: data.description,
        };
      } catch {
        // If API fails, just validate URL format
        return { ...link, status: urlPattern.test(link.url) ? "valid" : "invalid" };
      }
    },
    []
  );

  const verifyAllLinks = useCallback(
    async (
      links: ReferenceLink[],
      onUpdate: (links: ReferenceLink[]) => void
    ): Promise<ReferenceLink[]> => {
      setIsVerifying(true);

      // Set all to checking
      const checkingLinks = links.map((link) => ({
        ...link,
        status: "checking" as const,
      }));
      onUpdate(checkingLinks);

      // Verify each link
      const verifiedLinks = await Promise.all(
        checkingLinks.map((link) => verifyLink(link))
      );

      onUpdate(verifiedLinks);
      setIsVerifying(false);

      return verifiedLinks;
    },
    [verifyLink]
  );

  const validateUrlFormat = useCallback((url: string): boolean => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(url);
  }, []);

  return {
    verifyLink,
    verifyAllLinks,
    validateUrlFormat,
    isVerifying,
  };
}
