/**
 * Firebase IAEOZ Summit Videos Library
 * Manages IAEOZ Summit video metadata in Firestore
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

export const IAEOZ_VIDEOS_COLLECTION = "iaeoz_videos";

export type IAEOZVideoType =
  | "presentation"
  | "keynote"
  | "panel"
  | "workshop"
  | "interview"
  | "promo"
  | "other";

export interface IAEOZVideoDoc {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  url: string;
  year: number;
  type: IAEOZVideoType;
  speaker: string | null;
  organization: string | null;
  durationSeconds: number;
  viewCount: number;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

export interface IAEOZVideoMetadata {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  url: string;
  year: number;
  type: IAEOZVideoType;
  speaker: string | null;
  organization: string | null;
  durationSeconds: number;
  viewCount: number;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAEOZVideoUploadOptions {
  title: string;
  description?: string;
  youtubeUrl: string;
  year: number;
  type: IAEOZVideoType;
  speaker?: string | null;
  organization?: string | null;
  durationSeconds?: number;
  viewCount?: number;
  createdBy?: string;
}

export const IAEOZ_VIDEO_TYPE_OPTIONS: { value: IAEOZVideoType; label: string }[] = [
  { value: "presentation", label: "Presentation" },
  { value: "keynote", label: "Keynote" },
  { value: "panel", label: "Panel" },
  { value: "workshop", label: "Workshop" },
  { value: "interview", label: "Interview" },
  { value: "promo", label: "Promo" },
  { value: "other", label: "Other" },
];

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
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
export function getYouTubeThumbnail(videoId: string, quality: "default" | "medium" | "high" | "max" = "max"): string {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    max: "maxresdefault",
  };
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Add a new IAEOZ video to Firestore
 */
export async function addIAEOZVideo(options: IAEOZVideoUploadOptions): Promise<string | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const youtubeId = extractYouTubeId(options.youtubeUrl);
    if (!youtubeId) {
      throw new Error("Invalid YouTube URL. Please provide a valid YouTube link.");
    }

    const thumbnailUrl = getYouTubeThumbnail(youtubeId, "max");

    const videoDoc: Omit<IAEOZVideoDoc, "id"> = {
      youtubeId,
      title: options.title,
      description: options.description || "",
      url: `https://www.youtube.com/watch?v=${youtubeId}`,
      year: options.year,
      type: options.type,
      speaker: options.speaker || null,
      organization: options.organization || null,
      durationSeconds: options.durationSeconds || 0,
      viewCount: options.viewCount || 0,
      thumbnailUrl,
      isActive: true,
      createdAt: Timestamp.now(),
      createdBy: options.createdBy,
    };

    const docRef = await addDoc(collection(db, IAEOZ_VIDEOS_COLLECTION), videoDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error adding IAEOZ video:", error);
    throw error;
  }
}

/**
 * Get a single IAEOZ video by Firestore doc ID
 */
export async function getIAEOZVideo(videoId: string): Promise<IAEOZVideoDoc | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const docRef = doc(db, IAEOZ_VIDEOS_COLLECTION, videoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as IAEOZVideoDoc;
    }
    return null;
  } catch (error) {
    console.error("Error getting IAEOZ video:", error);
    return null;
  }
}

/**
 * List all IAEOZ videos, optionally filtered by year
 */
export async function listIAEOZVideos(year?: number): Promise<IAEOZVideoMetadata[]> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const videosRef = collection(db, IAEOZ_VIDEOS_COLLECTION);
    let q = query(
      videosRef,
      where("isActive", "==", true),
      orderBy("year", "desc"),
      orderBy("createdAt", "desc")
    );

    if (year) {
      q = query(
        videosRef,
        where("isActive", "==", true),
        where("year", "==", year),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const videos: IAEOZVideoMetadata[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        youtubeId: data.youtubeId,
        title: data.title,
        description: data.description,
        url: data.url,
        year: data.year,
        type: data.type,
        speaker: data.speaker,
        organization: data.organization,
        durationSeconds: data.durationSeconds,
        viewCount: data.viewCount,
        thumbnailUrl: data.thumbnailUrl,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });

    return videos;
  } catch (error) {
    console.error("Error listing IAEOZ videos:", error);
    return [];
  }
}

/**
 * List ALL IAEOZ videos including inactive ones (for admin)
 */
export async function listAllIAEOZVideos(): Promise<IAEOZVideoMetadata[]> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const videosRef = collection(db, IAEOZ_VIDEOS_COLLECTION);
    const q = query(videosRef, orderBy("year", "desc"), orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const videos: IAEOZVideoMetadata[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        youtubeId: data.youtubeId,
        title: data.title,
        description: data.description,
        url: data.url,
        year: data.year,
        type: data.type,
        speaker: data.speaker,
        organization: data.organization,
        durationSeconds: data.durationSeconds,
        viewCount: data.viewCount,
        thumbnailUrl: data.thumbnailUrl,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });

    return videos;
  } catch (error) {
    console.error("Error listing all IAEOZ videos:", error);
    return [];
  }
}

/**
 * Update IAEOZ video metadata
 */
export async function updateIAEOZVideo(
  videoId: string,
  updates: Partial<Pick<IAEOZVideoDoc, "title" | "description" | "year" | "type" | "speaker" | "organization" | "durationSeconds" | "viewCount" | "isActive">>
): Promise<boolean> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const cleanUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.year !== undefined) cleanUpdates.year = updates.year;
    if (updates.type !== undefined) cleanUpdates.type = updates.type;
    if (updates.speaker !== undefined) cleanUpdates.speaker = updates.speaker;
    if (updates.organization !== undefined) cleanUpdates.organization = updates.organization;
    if (updates.durationSeconds !== undefined) cleanUpdates.durationSeconds = updates.durationSeconds;
    if (updates.viewCount !== undefined) cleanUpdates.viewCount = updates.viewCount;
    if (updates.isActive !== undefined) cleanUpdates.isActive = updates.isActive;

    if (Object.keys(cleanUpdates).length === 0) {
      return true;
    }

    const docRef = doc(db, IAEOZ_VIDEOS_COLLECTION, videoId);
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating IAEOZ video:", error);
    return false;
  }
}

/**
 * Delete an IAEOZ video
 */
export async function deleteIAEOZVideo(videoId: string): Promise<boolean> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    const docRef = doc(db, IAEOZ_VIDEOS_COLLECTION, videoId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting IAEOZ video:", error);
    return false;
  }
}

/**
 * Format duration from seconds to MM:SS or H:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
