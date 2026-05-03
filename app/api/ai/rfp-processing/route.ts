import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/ai/rfp-processing
 * Process RFP document and extract key information using AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      solicitationNumber,
      title,
      agency,
      rfpDocumentUrl,
      processedBy,
      documentText, // Extracted text from PDF/Word
    } = body;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!solicitationNumber || !title || !processedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Integrate with AI service for document parsing
    // For now, generate mock processing results
    const processingResults = generateMockRfpProcessing(title, agency);

    // Store in Firestore
    const processingData = {
      solicitationNumber,
      title,
      agency: agency || "Unknown Agency",
      rfpDocumentUrl: rfpDocumentUrl || "",
      processedBy,
      processedAt: Timestamp.now(),
      processingStatus: "completed",
      ...processingResults,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection(COLLECTIONS.AI_RFP_PROCESSING).add(processingData);

    return NextResponse.json({
      success: true,
      processingId: docRef.id,
      processing: processingData,
    });
  } catch (error) {
    console.error("Error processing RFP:", error);
    return NextResponse.json(
      { error: "Failed to process RFP" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/rfp-processing
 * Get RFP processing results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const processingId = searchParams.get("id");
    const solicitationNumber = searchParams.get("solicitationNumber");
    const processedBy = searchParams.get("processedBy");

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (processingId) {
      const doc = await db.collection(COLLECTIONS.AI_RFP_PROCESSING).doc(processingId).get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Processing record not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        processing: { id: doc.id, ...doc.data() },
      });
    }

    if (solicitationNumber) {
      const snapshot = await db
        .collection(COLLECTIONS.AI_RFP_PROCESSING)
        .where("solicitationNumber", "==", solicitationNumber)
        .orderBy("processedAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "No processing found for this solicitation" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        processing: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() },
      });
    }

    if (processedBy) {
      const snapshot = await db
        .collection(COLLECTIONS.AI_RFP_PROCESSING)
        .where("processedBy", "==", processedBy)
        .orderBy("processedAt", "desc")
        .limit(20)
        .get();

      const processings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ processings });
    }

    return NextResponse.json(
      { error: "Query parameter required (id, solicitationNumber, or processedBy)" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching RFP processing:", error);
    return NextResponse.json(
      { error: "Failed to fetch processing results" },
      { status: 500 }
    );
  }
}

// Mock RFP processing results
function generateMockRfpProcessing(title: string, agency: string) {
  const now = new Date();
  const publishDate = new Date(now);
  publishDate.setDate(publishDate.getDate() - 30);
  
  const proposalDeadline = new Date(now);
  proposalDeadline.setDate(proposalDeadline.getDate() + 45);

  return {
    extractedData: {
      keyDates: {
        publishDate: publishDate.toISOString().split('T')[0],
        questionDeadline: new Date(proposalDeadline.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        proposalDeadline: proposalDeadline.toISOString().split('T')[0],
        awardDate: new Date(proposalDeadline.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      naicsCodes: ["332710", "332999", "541330"],
      contractValue: {
        estimatedMin: 500000,
        estimatedMax: 2500000,
        type: "fixed",
      },
      contractDuration: "Base year plus 4 option years",
      placeOfPerformance: ["Huntsville, AL", "Nationwide (up to 10%)"],
      setAside: Math.random() > 0.5 ? "Total Small Business" : "Competitive 8(a)",
      smallBusinessGoals: {
        sdvosb: Math.floor(Math.random() * 10),
        wosb: Math.floor(Math.random() * 10),
        hubzone: Math.floor(Math.random() * 10),
        _8a: Math.floor(Math.random() * 10),
      },
    },
    requirements: {
      mandatory: [
        "Valid SAM.gov registration",
        "ISO 9001:2015 certification",
        "DFARS compliance for cybersecurity",
      ],
      technical: [
        "CNC machining capability",
        "Quality management system",
        "ITAR registration",
        "Traceability documentation",
      ],
      pastPerformance: [
        "3 relevant contracts of similar size/complexity",
        "Past performance questionnaires required",
      ],
      certifications: [
        "ISO 9001:2015",
        "AS9100 (preferred)",
        "CMMC Level 2 (by award date)",
      ],
      securityClearance: "None required",
      cmmcLevel: "Level 2",
    },
    evaluationCriteria: [
      { factor: "Technical Approach", weight: 0.40, description: "Technical solution, innovation, and risk mitigation" },
      { factor: "Past Performance", weight: 0.25, description: "Relevant experience and customer satisfaction" },
      { factor: "Price/Cost", weight: 0.25, description: "Total evaluated price and cost reasonableness" },
      { factor: "Small Business Participation", weight: 0.10, description: "Subcontracting plan and goals" },
    ],
    aiInsights: {
      complexity: "high" as const,
      riskFactors: [
        "Short proposal timeline",
        "CMMC Level 2 requirement",
        "Multiple technical disciplines required",
      ],
      opportunities: [
        "Strong set-aside provision",
        "Multi-year contract vehicle",
        "Recurring need in this market",
      ],
      suggestedApproach: "Consider teaming arrangement to address technical complexity. Focus on past performance from similar DoD contracts. Early engagement with contracting officer recommended.",
    },
  };
}
