/**
 * Script to remove specific hero slides from Firestore.
 *
 * Targets:
 *  - "Win OEM Contracts. & Transform" (badge: Introducing EDGE-X™)
 *  - "Strategic Value+ Partnership"  (badge: Government Contracting Excellence)
 *
 * Usage:
 *   npx tsx scripts/remove-hero-slides.ts            # dry-run: list all slides + matches
 *   npx tsx scripts/remove-hero-slides.ts --delete   # actually delete matched docs
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const HERO_SLIDES_COLLECTION = "hero_slides";

interface SlideDoc {
  id: string;
  badge?: string;
  headline?: string;
  highlightedText?: string;
  subheadline?: string;
  isPublished?: boolean;
  order?: number;
}

function isTargetSlide(slide: SlideDoc): boolean {
  const headline = slide.headline ?? "";
  const highlighted = slide.highlightedText ?? "";
  const badge = slide.badge ?? "";
  const sub = slide.subheadline ?? "";

  // "Win OEM Contracts. & Transform" — EDGE-X slide (id "1" in code defaults)
  if (headline.includes("OEM Contracts") || badge.includes("EDGE-X")) return true;

  // "Strategic Value+ Partnership" — Government Contracting Excellence badge
  if (
    headline.includes("Strategic Value") ||
    highlighted.includes("Strategic Value") ||
    sub.includes("Strategic Value")
  ) {
    return true;
  }
  if (badge.includes("Government Contracting Excellence") && highlighted.includes("Partnership")) {
    return true;
  }

  return false;
}

async function listSlides(
  firestore: FirebaseFirestore.Firestore
): Promise<SlideDoc[]> {
  const snapshot = await firestore.collection(HERO_SLIDES_COLLECTION).get();
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SlideDoc, "id">) }));
}

function printSlide(slide: SlideDoc) {
  console.log(`  - ID: ${slide.id}`);
  console.log(`    Badge:      ${slide.badge ?? "N/A"}`);
  console.log(`    Headline:   ${slide.headline ?? "N/A"} ${slide.highlightedText ?? ""}`.trimEnd());
  console.log(`    Published:  ${slide.isPublished ? "Yes" : "No"}   Order: ${slide.order ?? "N/A"}`);
}

async function main() {
  const { db } = await import("../lib/firebase-admin");
  if (!db) {
    console.error("Firebase Admin not initialized. Check .env.local credentials.");
    process.exit(1);
  }

  const doDelete = process.argv.includes("--delete");

  const slides = await listSlides(db);

  if (slides.length === 0) {
    console.log("No slides found in hero_slides collection.");
    return;
  }

  console.log(`=== ${slides.length} slides in hero_slides ===\n`);
  slides.forEach(printSlide);

  const targets = slides.filter(isTargetSlide);

  console.log(`\n=== ${targets.length} slide(s) matched for removal ===\n`);
  if (targets.length === 0) {
    console.log("Nothing to delete.");
    return;
  }
  targets.forEach(printSlide);

  if (!doDelete) {
    console.log("\nDry run — re-run with --delete to remove these slides.");
    return;
  }

  const batch = db.batch();
  targets.forEach((s) => batch.delete(db.collection(HERO_SLIDES_COLLECTION).doc(s.id)));
  await batch.commit();

  console.log(`\nDeleted ${targets.length} slide(s). Remaining slides:`);
  const remaining = await listSlides(db);
  remaining.forEach(printSlide);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
