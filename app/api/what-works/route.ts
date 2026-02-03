import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { WHAT_WORKS_COLLECTION, WhatWorksDoc } from "@/lib/what-works-schema";

/**
 * GET /api/what-works
 * Retrieve all What Works articles with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const limitParam = searchParams.get("limit");

    const articlesRef = collection(db, WHAT_WORKS_COLLECTION);
    let q = query(articlesRef, where("isPublished", "==", true), orderBy("publishedAt", "desc"));

    if (category) {
      q = query(
        articlesRef,
        where("isPublished", "==", true),
        where("category", "==", category),
        orderBy("publishedAt", "desc")
      );
    }

    if (featured === "true") {
      q = query(
        articlesRef,
        where("isPublished", "==", true),
        where("isFeatured", "==", true),
        orderBy("publishedAt", "desc")
      );
    }

    if (limitParam) {
      q = query(q, limit(parseInt(limitParam, 10)));
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching What Works articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/what-works
 * Create a new What Works article
 */
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const now = Timestamp.now();

    const articleData: Omit<WhatWorksDoc, "id"> = {
      slug: body.slug || generateSlug(body.title),
      title: body.title,
      description: body.description || "",
      content: body.content || "",
      category: body.category || "article",
      featuredImage: body.featuredImage || "",
      thumbnailImage: body.thumbnailImage,
      videoUrl: body.videoUrl,
      videoId: body.videoId,
      videoPlatform: body.videoPlatform,
      author: body.author || "KDM & Associates",
      authorImage: body.authorImage,
      tags: body.tags || [],
      isPublished: body.isPublished ?? true,
      isFeatured: body.isFeatured ?? false,
      publishedAt: body.publishedAt ? Timestamp.fromDate(new Date(body.publishedAt)) : now,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      sourceUrl: body.sourceUrl,
      relatedArticles: body.relatedArticles,
    };

    const docRef = await addDoc(collection(db, WHAT_WORKS_COLLECTION), articleData);

    return NextResponse.json({
      id: docRef.id,
      ...articleData,
      publishedAt: articleData.publishedAt.toDate(),
      createdAt: articleData.createdAt.toDate(),
      updatedAt: articleData.updatedAt.toDate(),
    });
  } catch (error) {
    console.error("Error creating What Works article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
