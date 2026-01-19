import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { calculatePackHealth, identifyGaps } from "@/lib/pack-health";

/**
 * POST /api/proof-packs/[id]/documents
 * Upload a document to a Proof Pack
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { id } = await params;
    const proofPackId = id;
    const body = await req.json();
    const {
      fileName,
      fileData,
      mimeType,
      fileSize,
      category,
      expirationDate,
      documentType,
      notes,
    } = body;

    // Validate required fields
    if (!fileName || !fileData || !mimeType || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB for base64)
    if (fileSize > 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 1MB limit" },
        { status: 400 }
      );
    }

    const proofPackRef = db.collection("proofPacks").doc(proofPackId);
    const proofPackDoc = await proofPackRef.get();

    if (!proofPackDoc.exists) {
      return NextResponse.json(
        { error: "Proof Pack not found" },
        { status: 404 }
      );
    }

    const proofPackData = proofPackDoc.data();

    // Verify ownership
    if (proofPackData?.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Unauthorized to modify this Proof Pack" },
        { status: 403 }
      );
    }

    // Create document object
    const document = {
      id: `doc_${Date.now()}`,
      fileName,
      fileData,
      mimeType,
      fileSize,
      category,
      expirationDate: expirationDate ? Timestamp.fromDate(new Date(expirationDate)) : null,
      metadata: {
        documentType: documentType || null,
        notes: notes || null,
      },
      uploadedAt: Timestamp.now(),
    };

    // Add document to Proof Pack
    const updatedDocuments = [...(proofPackData?.documents || []), document];

    // Recalculate Pack Health
    const gaps = identifyGaps(updatedDocuments);
    const packHealth = calculatePackHealth(updatedDocuments, gaps);

    await proofPackRef.update({
      documents: updatedDocuments,
      documentCount: updatedDocuments.length,
      packHealth,
      gaps,
      updatedAt: Timestamp.now(),
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "document_uploaded",
      resource: "proof_pack",
      resourceId: proofPackId,
      details: { fileName, category },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      document,
      packHealth,
      gaps,
    });
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/proof-packs/[id]/documents
 * Delete a document from a Proof Pack
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { id } = await params;
    const proofPackId = id;
    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    const proofPackRef = db.collection("proofPacks").doc(proofPackId);
    const proofPackDoc = await proofPackRef.get();

    if (!proofPackDoc.exists) {
      return NextResponse.json(
        { error: "Proof Pack not found" },
        { status: 404 }
      );
    }

    const proofPackData = proofPackDoc.data();

    // Verify ownership
    if (proofPackData?.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Unauthorized to modify this Proof Pack" },
        { status: 403 }
      );
    }

    // Remove document
    const updatedDocuments = (proofPackData?.documents || []).filter(
      (doc: any) => doc.id !== documentId
    );

    // Recalculate Pack Health
    const gaps = identifyGaps(updatedDocuments);
    const packHealth = calculatePackHealth(updatedDocuments, gaps);

    await proofPackRef.update({
      documents: updatedDocuments,
      documentCount: updatedDocuments.length,
      packHealth,
      gaps,
      updatedAt: Timestamp.now(),
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "document_deleted",
      resource: "proof_pack",
      resourceId: proofPackId,
      details: { documentId },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      packHealth,
      gaps,
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
