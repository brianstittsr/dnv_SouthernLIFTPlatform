/**
 * Update Nelinia Varenas bio in Firestore.
 * Run: node scripts/update-nelinia-bio.mjs
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }) });
}

const db = getFirestore();

const BIO = `Nelinia "Nel" Varenas, MBA, is the Co-founder and CEO of Strategic Value Plus Solutions, LLC — a technology-enabled business development firm committed to Enriching Lives Through Manufacturing. She brings a powerful blend of executive leadership, marketing strategy, and systems thinking to the KDM Consortium.

Nel is a driving force behind the Consortium's go-to-market strategy, communications infrastructure, and member coordination. She architected the organization's CRM and marketing automation framework using GoHighLevel, enabling seamless collaboration and client engagement across Consortium partners.

With deep expertise in CMMC compliance strategy, government contracting outreach, and public-private partnership development, Nel serves as a connector of people, programs, and purpose. She coordinates closely with KDM's leadership team on webinar programming, press strategy, cohort launches, and federal outreach campaigns.

A sought-after voice on manufacturing and minority business empowerment, Nel holds an MBA and brings years of experience in business development, digital marketing, and strategic operations. She is passionate about creating tangible economic opportunities for underserved communities through manufacturing, technology, and government contracting.`;

async function update() {
  let found = false;
  for (const coll of ["teamMembers", "team_members"]) {
    const snap = await db.collection(coll)
      .where("firstName", "==", "Nelinia")
      .get();
    if (!snap.empty) {
      for (const docSnap of snap.docs) {
        await docSnap.ref.update({ bio: BIO, updatedAt: Timestamp.now() });
        console.log(`✅ Updated Nelinia Varenas bio in '${coll}' (${docSnap.id})`);
        found = true;
      }
    }
    // Also try "Nel" as firstName
    const snap2 = await db.collection(coll)
      .where("lastName", "==", "Varenas")
      .get();
    if (!snap2.empty) {
      for (const docSnap of snap2.docs) {
        await docSnap.ref.update({ bio: BIO, updatedAt: Timestamp.now() });
        console.log(`✅ Updated Nelinia Varenas bio in '${coll}' (${docSnap.id})`);
        found = true;
      }
    }
  }
  if (!found) {
    console.warn("⚠️  Nelinia Varenas not found in Firestore — creating record...");
    await db.collection("teamMembers").add({
      firstName: "Nelinia",
      lastName: "Varenas",
      title: "Co-founder & CEO",
      expertise: "Business Development & Strategic Operations",
      emailPrimary: "nelinia@strategicvalueplus.com",
      role: "affiliate",
      teamTag: "affiliate",
      bio: BIO,
      status: "active",
      isCEO: false, isCOO: false, isCTO: false, isCRO: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("✅ Created new record for Nelinia Varenas");
  }
  process.exit(0);
}
update().catch(e => { console.error("💥", e); process.exit(1); });
