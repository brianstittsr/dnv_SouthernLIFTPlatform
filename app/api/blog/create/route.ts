import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BLOG_IMPORTS_COLLECTION = "blogImports";

interface CreateBlogRequest {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  readTime: number;
  imageUrl?: string;
}

/**
 * POST - Create a new blog post
 * Body: { slug, title, excerpt, content, author, date, category, tags, readTime, imageUrl? }
 */
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      excerpt,
      content,
      author,
      date,
      category,
      tags,
      readTime,
      imageUrl,
    } = body as CreateBlogRequest;

    // Validation
    if (!slug || !title || !excerpt || !content || !author || !date || !category || !tags) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingDoc = await db.collection(BLOG_IMPORTS_COLLECTION).doc(slug).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 409 }
      );
    }

    // Create the blog post document
    const blogPost = {
      slug,
      title,
      excerpt,
      content,
      author,
      date,
      category,
      tags,
      readTime,
      imageUrl: imageUrl || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection(BLOG_IMPORTS_COLLECTION).doc(slug).set(blogPost);

    return NextResponse.json({
      success: true,
      slug,
      message: "Blog post created successfully",
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
