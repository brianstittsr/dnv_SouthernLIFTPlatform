/**
 * Firebase Admin SDK initialization for server-side operations
 * Used for user management, custom claims, and server-side Firestore access
 */

import * as admin from "firebase-admin";

let _initialized = false;

// Initialize Firebase Admin SDK — never throw; callers must guard against null exports
if (!admin.apps.length) {
  try {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      console.error(
        "❌ Firebase Admin: missing required env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). " +
        "Server-side Firebase operations will be unavailable."
      );
    } else {
      console.log("Initializing Firebase Admin with project:", process.env.FIREBASE_PROJECT_ID);

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });

      _initialized = true;
      console.log("✅ Firebase Admin SDK initialized successfully");
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
    // Do NOT re-throw — routes must remain functional and return proper HTTP responses
    // even when Firebase Admin is misconfigured.
  }
}

export const auth = _initialized ? admin.auth() : null as unknown as admin.auth.Auth;
export const db = _initialized ? admin.firestore() : null as unknown as admin.firestore.Firestore;
export const storage = _initialized ? admin.storage() : null as unknown as admin.storage.Storage;

export default admin;
