import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/buyer/directory
 * Get SME directory for buyers (intro-eligible SMEs with Pack Health ≥70)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    await auth.verifyIdToken(token);

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;
    const industry = searchParams.get("industry");
    const certification = searchParams.get("certification");
    const minScore = parseInt(searchParams.get("minScore") || "70");

    // Get approved Proof Packs with Pack Health ≥70
    let query = db
      .collection("proofPacks")
      .where("status", "==", "approved")
      .where("packHealth.overallScore", ">=", minScore)
      .orderBy("packHealth.overallScore", "desc");

    const proofPacksSnapshot = await query.get();

    // Get unique SME IDs
    const smeIds = [...new Set(proofPacksSnapshot.docs.map((doc) => doc.data().smeId))];

    if (smeIds.length === 0) {
      return NextResponse.json({ smes: [], total: 0, page, totalPages: 0 });
    }

    // Get SME user profiles
    const usersSnapshot = await db
      .collection("users")
      .where("smeId", "in", smeIds.slice(0, 10)) // Firestore 'in' limit
      .get();

    let smes = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      const proofPack = proofPacksSnapshot.docs.find((p) => p.data().smeId === data.smeId);
      
      return {
        id: doc.id,
        smeId: data.smeId,
        companyName: data.companyName,
        industry: data.industry,
        description: data.description,
        certifications: data.certifications || [],
        capabilities: data.capabilities || [],
        packHealth: proofPack?.data().packHealth || { overallScore: 0 },
        proofPackId: proofPack?.id,
      };
    });

    // Client-side filters
    if (industry) {
      smes = smes.filter((sme: any) => sme.industry === industry);
    }

    if (certification) {
      smes = smes.filter((sme: any) => 
        sme.certifications && sme.certifications.includes(certification)
      );
    }

    // Pagination
    const total = smes.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSmes = smes.slice(offset, offset + limit);

    return NextResponse.json({
      smes: paginatedSmes,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("Error fetching SME directory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch SME directory" },
      { status: 500 }
    );
  }
}
