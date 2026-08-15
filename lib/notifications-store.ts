import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Server-side helpers for the persistent in-app notification inbox
 * (userNotifications collection). Used by cron/API routes running with
 * the Firebase Admin SDK. For client-side reads/mark-as-read, query
 * COLLECTIONS.USER_NOTIFICATIONS directly with the client Firestore SDK.
 */

export interface CreateUserNotificationInput {
  userId: string;
  type: "samgov_opportunity" | "samgov_teaming" | "system" | "other";
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createUserNotification(input: CreateUserNotificationInput): Promise<string | null> {
  if (!db) {
    console.error("createUserNotification: Firebase Admin not initialized");
    return null;
  }

  const docRef = db.collection(COLLECTIONS.USER_NOTIFICATIONS).doc();
  await docRef.set({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link || null,
    metadata: input.metadata || {},
    read: false,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

export async function createUserNotifications(inputs: CreateUserNotificationInput[]): Promise<void> {
  if (!db || inputs.length === 0) return;

  const batchSize = 400; // stay under Firestore's 500 write batch limit
  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = inputs.slice(i, i + batchSize);
    for (const input of chunk) {
      const docRef = db.collection(COLLECTIONS.USER_NOTIFICATIONS).doc();
      batch.set(docRef, {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        metadata: input.metadata || {},
        read: false,
        createdAt: Timestamp.now(),
      });
    }
    await batch.commit();
  }
}
