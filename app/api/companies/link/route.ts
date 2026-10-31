import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, db } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";

const bodySchema = z.object({
  legalCompanyName: z.string().trim().min(1).max(300),
  dba: z.string().trim().max(300).optional(),
  website: z.string().trim().max(500).optional(),
  uei: z.string().trim().max(50).optional(),
  cageCode: z.string().trim().max(50).optional(),
  address: z
    .object({
      street: z.string().trim().max(300).optional(),
      city: z.string().trim().max(120).optional(),
      state: z.string().trim().max(60).optional(),
      zip: z.string().trim().max(20).optional(),
    })
    .optional(),
  yearEstablished: z.string().trim().max(10).optional(),
  employeeCountRange: z.string().trim().max(60).optional(),
  annualRevenueCents: z.number().int().nonnegative().optional(),
  naicsCodes: z.array(z.string().trim().max(200)).max(10).optional(),
  certifications: z.array(z.string().trim().max(120)).max(20).optional(),
  productsServices: z.array(z.string().trim().max(500)).max(50).optional(),
  coreCapabilities: z.string().trim().max(10_000).optional(),
  keyDifferentiators: z.string().trim().max(10_000).optional(),
  digitalTools: z.array(z.string().trim().max(120)).max(20).optional(),
  /** LIFT client record to stamp with the shared companyId. */
  liftClientId: z.string().trim().max(200).optional(),
});

const normalizeCompanyName = (name: string): string =>
  name.trim().toLowerCase().replace(/[.,&]/g, "").replace(/\s+/g, " ").trim();

/**
 * POST /api/companies/link
 *
 * Links the signed-in user (and their LIFT client record) to a shared
 * `companies` document. Matches an existing company by UEI first, then by
 * normalized legal name, so multiple people registering under the same
 * company attach to one record instead of duplicating company data. Only
 * creates a new company when no match exists; existing company fields are
 * never overwritten by later members.
 */
export async function POST(req: NextRequest) {
  try {
    if (!db || !auth) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const input = parsed.data;
    const normalizedName = normalizeCompanyName(input.legalCompanyName);
    const uei = input.uei?.trim().toUpperCase() || "";
    const companies = db.collection(COLLECTIONS.COMPANIES);

    // Match by UEI (strongest identity), then by normalized legal name.
    let companyRef: FirebaseFirestore.DocumentReference | null = null;
    let created = false;
    if (uei) {
      const byUei = await companies.where("uei", "==", uei).limit(1).get();
      companyRef = byUei.docs[0]?.ref ?? null;
    }
    if (!companyRef) {
      const byName = await companies.where("normalizedName", "==", normalizedName).limit(1).get();
      companyRef = byName.docs[0]?.ref ?? null;
    }

    if (companyRef) {
      // Existing company: just add the user as a member; never overwrite company data.
      await companyRef.update({ memberUserIds: FieldValue.arrayUnion(uid), updatedAt: Timestamp.now() });
    } else {
      const years = input.yearEstablished ? new Date().getFullYear() - Number.parseInt(input.yearEstablished, 10) : 0;
      companyRef = companies.doc();
      await companyRef.set({
        id: companyRef.id,
        legalCompanyName: input.legalCompanyName,
        displayName: input.dba || input.legalCompanyName,
        dba: input.dba || "",
        companyDescription: input.coreCapabilities || "",
        companyLogo: "",
        website: input.website || "",
        industry: "",
        address: {
          street: input.address?.street || "",
          city: input.address?.city || "",
          state: input.address?.state || "",
          zip: input.address?.zip || "",
        },
        dunsNumber: "",
        cageCode: input.cageCode || "",
        uei,
        yearsInBusiness: Number.isFinite(years) && years > 0 ? years : 0,
        annualRevenueRange: "",
        annualRevenueCents: input.annualRevenueCents ?? null,
        employeeCountRange: input.employeeCountRange || "",
        naicsCodes: input.naicsCodes ?? [],
        certifications: input.certifications ?? [],
        productsServices: input.productsServices ?? [],
        keyDifferentiators: input.keyDifferentiators || "",
        digitalTools: input.digitalTools ?? [],
        capabilities: [],
        memberUserIds: [uid],
        ownerUserId: uid,
        tenantId: "lift-southern",
        normalizedName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      created = true;
    }

    // Link the user profile to the shared company record.
    await db.collection(COLLECTIONS.USERS).doc(uid).set(
      { companyId: companyRef.id, companyName: input.legalCompanyName, updatedAt: Timestamp.now() },
      { merge: true }
    );

    // Stamp the LIFT client record with the shared companyId when one is known.
    if (input.liftClientId) {
      await db
        .collection(COLLECTIONS.LIFT_CLIENTS)
        .doc(input.liftClientId)
        .set({ companyId: companyRef.id, updatedAt: Timestamp.now() }, { merge: true });
    }

    return NextResponse.json({ data: { companyId: companyRef.id, created } });
  } catch (error) {
    console.error("Error linking company:", error);
    return NextResponse.json({ error: "Failed to link company" }, { status: 500 });
  }
}
