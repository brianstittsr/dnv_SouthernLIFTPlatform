import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/content-migration/fetch-page
 * Fetch a page's HTML content (proxy to avoid CORS)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Verify admin role
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== "admin" && userData?.svpRole !== "platform_admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP/HTTPS URLs are allowed" },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "KDM-Content-Migration-Bot/1.0 (+https://kdm-assoc.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json(
        { error: "URL does not return HTML content" },
        { status: 400 }
      );
    }

    const html = await response.text();

    return NextResponse.json({
      html,
      finalUrl: response.url,
      contentType,
    });
  } catch (error: any) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}
