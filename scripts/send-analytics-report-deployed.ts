import * as dotenv from "dotenv";
import * as path from "path";

// Load production environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

import admin from "firebase-admin";

const RECIPIENT = process.argv[2] || "brianstittsr@gmail.com";
const DAYS = parseInt(process.argv[3] || "7", 10);
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://www.kdm-assoc.com";

async function getIdTokenForAdmin(email: string): Promise<string> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials not configured");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  let uid: string;
  try {
    const user = await admin.auth().getUserByEmail(email);
    uid = user.uid;
  } catch (error) {
    throw new Error(`Could not find Firebase user for ${email}: ${error instanceof Error ? error.message : error}`);
  }

  const customToken = await admin.auth().createCustomToken(uid, { admin: true });

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY not configured");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firebase sign-in failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { idToken: string };
  return data.idToken;
}

async function main() {
  console.log(`Sending analytics report to ${RECIPIENT} (${DAYS} days) via ${PLATFORM_URL}...`);

  const idToken = await getIdTokenForAdmin("bstitt@strategicvalueplus.com");

  const response = await fetch(`${PLATFORM_URL}/api/admin/analytics/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      to: RECIPIENT,
      days: DAYS,
      includePdf: false,
      saveSnapshot: true,
    }),
  });

  const data = await response.json().catch(() => ({ error: "Invalid JSON response" }));

  if (!response.ok) {
    console.error("Report request failed:", response.status, data);
    process.exit(1);
  }

  console.log("Report sent successfully.");
  console.log("Message ID:", (data as { messageId?: string }).messageId || "N/A");
  console.log("Snapshot ID:", (data as { snapshotId?: string }).snapshotId || "N/A");
  console.log("Visitors:", (data as { report?: { totalVisitors?: number } }).report?.totalVisitors ?? "N/A");
  console.log("Pageviews:", (data as { report?: { totalPageviews?: number } }).report?.totalPageviews ?? "N/A");
}

main().catch((error) => {
  console.error("Failed to send report:", error instanceof Error ? error.message : error);
  process.exit(1);
});
