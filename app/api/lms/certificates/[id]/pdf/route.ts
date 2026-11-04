import { NextRequest, NextResponse } from "next/server";
import { getRequester } from "@/lib/form-builder/server/context";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { archiveGeneratedDocument } from "@/lib/documents/archive";
import { buildCertificateHtml, getCertificateById } from "@/lib/lms/certificates-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/lms/certificates/{id}/pdf
 * Streams the LIFT-branded completion certificate PDF. Available to the
 * certificate owner, staff, and admins.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const requester = await getRequester();
    if (!requester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const cert = await getCertificateById(id);
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    const isOwner = requester.uid === cert.userId;
    if (!isOwner && !requester.isStaff && !requester.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const origin = new URL(request.url).origin;
    const verifyUrl = `${origin}/verify/certificate/${cert.certificateNumber}`;
    const pdf = await renderHtmlToPdf(buildCertificateHtml(cert, verifyUrl));

    const fileName = `certificate-${cert.certificateNumber || id}.pdf`;

    // Archive a copy in portal Documents on first render — the certificate
    // holder sees it under their own Documents via visibleToUids. Best-effort.
    try {
      await archiveGeneratedDocument({
        buffer: pdf,
        fileName,
        contentType: "application/pdf",
        category: "certificates",
        folder: "Certificates",
        tags: ["LIFT", "Certificate", cert.courseTitle ?? "", cert.certificateNumber ?? ""],
        visibleToUids: [cert.userId],
        uploadedBy: cert.userName ?? "Course participant",
        uploaderUid: cert.userId,
        source: { type: "certificate", id: cert.id, label: cert.courseTitle?.slice(0, 80) },
      });
    } catch (archiveError) {
      console.error("[lms] certificate archive failed:", archiveError);
    }
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[lms] certificate PDF error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
