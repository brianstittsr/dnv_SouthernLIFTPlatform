import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

interface SpecialOfferResponse {
  id: string;
  name: string;
  price: number;
  priceType: 'monthly' | 'annual' | 'one-time' | 'training';
  description?: string;
  specialTag?: string;
  features?: string[];
  productType?: 'founders' | 'consortium' | 'cmmc-cohort';
  cta?: string;
  validUntil?: string;
}

export interface CoreTierOverride {
  price?: number;
  monthlyPrice?: number;
  annualPrice?: number;
  description?: string;
  features?: string[];
  cta?: string;
  active: boolean;
}

const CORE_TIER_IDS = ["kdm-consortium", "founders", "cmmc-cohort"] as const;

/**
 * GET /api/pricing/special-offers
 * Returns active special pricing offers (e.g., HubZone Conference Special)
 * plus admin-managed overrides for the three core pricing tiers.
 * Publicly accessible so unauthenticated visitors can view current offers.
 */
export async function GET(): Promise<NextResponse> {
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const snapshot = await db
      .collection("consortiumPricing")
      .where("active", "==", true)
      .where("specialTag", ">", "")
      .orderBy("specialTag")
      .orderBy("createdAt", "desc")
      .get();

    const offers: SpecialOfferResponse[] = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        name: data.name || "",
        price: data.price || 0,
        priceType: data.priceType || 'one-time',
        description: data.description,
        specialTag: data.specialTag,
        features: data.features,
        productType: data.productType || 'founders',
        cta: data.cta,
        validUntil: data.validUntil ? data.validUntil.toDate().toISOString() : undefined,
      };
    });

    const tierOverrides: Record<string, CoreTierOverride> = {};
    try {
      const tierSnapshot = await db
        .collection("consortiumPricing")
        .where("coreTierId", "in", CORE_TIER_IDS as unknown as string[])
        .get();

      tierSnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.coreTierId) return;
        tierOverrides[data.coreTierId] = {
          price: data.price,
          monthlyPrice: data.monthlyPrice,
          annualPrice: data.annualPrice,
          description: data.description,
          features: data.features,
          cta: data.cta,
          active: data.active !== false,
        };
      });
    } catch (tierError) {
      console.error("Error fetching core tier overrides:", tierError);
    }

    return NextResponse.json({ data: offers, tierOverrides });
  } catch (error) {
    console.error("Error fetching special offers:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch special offers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
