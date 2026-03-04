/**
 * Firebase Videos Library
 * Handles YouTube video metadata tracking in Firestore
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export const VIDEOS_COLLECTION = "videos";

export type VideoCategory =
  | "training"
  | "testimonials"
  | "explainer"
  | "webinar"
  | "demo"
  | "case-study"
  | "event"
  | "tutorial"
  | "other";

export interface VideoDoc {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category: VideoCategory;
  duration?: string; // e.g., "15:30"
  publishedAt?: string; // ISO date string
  featured: boolean;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  isActive: boolean;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category: VideoCategory;
  duration?: string;
  publishedAt?: string;
  featured: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface VideoUploadOptions {
  title: string;
  description?: string;
  youtubeUrl: string;
  category: VideoCategory;
  duration?: string;
  publishedAt?: string;
  featured?: boolean;
  tags?: string[];
  createdBy?: string;
}

const CATEGORY_OPTIONS: { value: VideoCategory; label: string }[] = [
  { value: "training", label: "Training" },
  { value: "testimonials", label: "Testimonials" },
  { value: "explainer", label: "Explainer" },
  { value: "webinar", label: "Webinar" },
  { value: "demo", label: "Demo" },
  { value: "case-study", label: "Case Study" },
  { value: "event", label: "Event" },
  { value: "tutorial", label: "Tutorial" },
  { value: "other", label: "Other" },
];

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Get YouTube thumbnail URL for a video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: "default" | "medium" | "high" | "max" = "medium"): string {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    max: "maxresdefault",
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Add a new YouTube video to the library
 */
export async function addVideo(options: VideoUploadOptions): Promise<string | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const youtubeId = extractYouTubeId(options.youtubeUrl);
    if (!youtubeId) {
      throw new Error("Invalid YouTube URL. Please provide a valid YouTube link.");
    }

    const thumbnailUrl = getYouTubeThumbnail(youtubeId, "medium");

    const videoDoc: Omit<VideoDoc, "id"> = {
      title: options.title,
      description: options.description || "",
      youtubeId,
      youtubeUrl: `https://youtube.com/watch?v=${youtubeId}`,
      thumbnailUrl,
      category: options.category,
      duration: options.duration || "",
      publishedAt: options.publishedAt || "",
      featured: options.featured || false,
      tags: options.tags || [],
      createdAt: Timestamp.now(),
      createdBy: options.createdBy,
      isActive: true,
    };

    const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), videoDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error adding video:", error);
    throw error;
  }
}

/**
 * Get a single video by ID
 */
export async function getVideo(videoId: string): Promise<VideoDoc | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const docRef = doc(db, VIDEOS_COLLECTION, videoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as VideoDoc;
    }
    return null;
  } catch (error) {
    console.error("Error getting video:", error);
    return null;
  }
}

/**
 * List all videos (metadata only)
 */
export async function listVideos(category?: VideoCategory): Promise<VideoMetadata[]> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const videosRef = collection(db, VIDEOS_COLLECTION);
    let q = query(
      videosRef,
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    if (category) {
      q = query(
        videosRef,
        where("isActive", "==", true),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const videos: VideoMetadata[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        youtubeId: data.youtubeId,
        youtubeUrl: data.youtubeUrl,
        thumbnailUrl: data.thumbnailUrl,
        category: data.category,
        duration: data.duration,
        publishedAt: data.publishedAt,
        featured: data.featured,
        tags: data.tags,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        isActive: data.isActive,
      });
    });

    return videos;
  } catch (error) {
    console.error("Error listing videos:", error);
    return [];
  }
}

/**
 * Update video metadata
 */
export async function updateVideoMetadata(
  videoId: string,
  updates: Partial<Pick<VideoDoc, "title" | "description" | "category" | "duration" | "publishedAt" | "featured" | "tags" | "isActive">>
): Promise<boolean> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.category !== undefined) cleanUpdates.category = updates.category;
    if (updates.duration !== undefined) cleanUpdates.duration = updates.duration;
    if (updates.publishedAt !== undefined) cleanUpdates.publishedAt = updates.publishedAt;
    if (updates.featured !== undefined) cleanUpdates.featured = updates.featured;
    if (updates.tags !== undefined) cleanUpdates.tags = updates.tags;
    if (updates.isActive !== undefined) cleanUpdates.isActive = updates.isActive;

    if (Object.keys(cleanUpdates).length === 0) {
      return true;
    }

    const docRef = doc(db, VIDEOS_COLLECTION, videoId);
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating video metadata:", error);
    return false;
  }
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const docRef = doc(db, VIDEOS_COLLECTION, videoId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting video:", error);
    return false;
  }
}

/**
 * Get videos by category
 */
export async function getVideosByCategory(category: VideoCategory): Promise<VideoMetadata[]> {
  return listVideos(category);
}

/**
 * Get featured videos
 */
export async function getFeaturedVideos(limit: number = 10): Promise<VideoMetadata[]> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const videosRef = collection(db, VIDEOS_COLLECTION);
    const q = query(
      videosRef,
      where("isActive", "==", true),
      where("featured", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const videos: VideoMetadata[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        youtubeId: data.youtubeId,
        youtubeUrl: data.youtubeUrl,
        thumbnailUrl: data.thumbnailUrl,
        category: data.category,
        duration: data.duration,
        publishedAt: data.publishedAt,
        featured: data.featured,
        tags: data.tags,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        isActive: data.isActive,
      });
    });

    return videos.slice(0, limit);
  } catch (error) {
    console.error("Error getting featured videos:", error);
    return [];
  }
}

/**
 * Get video by YouTube ID
 */
export async function getVideoByYouTubeId(youtubeId: string): Promise<VideoDoc | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const videosRef = collection(db, VIDEOS_COLLECTION);
    const q = query(
      videosRef,
      where("youtubeId", "==", youtubeId),
      where("isActive", "==", true)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as VideoDoc;
    }
    return null;
  } catch (error) {
    console.error("Error getting video by YouTube ID:", error);
    return null;
  }
}

export { CATEGORY_OPTIONS };
