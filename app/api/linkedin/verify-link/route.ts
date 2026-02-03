import { NextRequest, NextResponse } from "next/server";

interface VerifyLinkRequest {
  url: string;
}

interface VerifyLinkResponse {
  valid: boolean;
  title?: string;
  description?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyLinkRequest = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { valid: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url)) {
      return NextResponse.json({
        valid: false,
        error: "Invalid URL format",
      });
    }

    // Ensure URL has protocol
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    try {
      // Make a HEAD request to check if the URL is accessible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(fullUrl, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LinkVerifier/1.0)",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Try to get the page title
        let title = "";
        let description = "";

        try {
          const getResponse = await fetch(fullUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; LinkVerifier/1.0)",
            },
          });

          if (getResponse.ok) {
            const html = await getResponse.text();
            
            // Extract title
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
              title = titleMatch[1].trim();
            }

            // Extract meta description
            const descMatch = html.match(
              /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
            );
            if (descMatch) {
              description = descMatch[1].trim();
            }
          }
        } catch {
          // If we can't get the page content, just use the domain as title
          const urlObj = new URL(fullUrl);
          title = `Page from ${urlObj.hostname}`;
        }

        return NextResponse.json({
          valid: true,
          title: title || `Page from ${new URL(fullUrl).hostname}`,
          description: description || "Link verified and accessible",
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch (fetchError) {
      // If fetch fails, the URL might still be valid but inaccessible
      // Return as valid if URL format is correct
      return NextResponse.json({
        valid: true,
        title: `Link to ${new URL(fullUrl).hostname}`,
        description: "URL format is valid (accessibility could not be verified)",
      });
    }
  } catch (error) {
    console.error("Error verifying link:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify link" },
      { status: 500 }
    );
  }
}
