import { NextRequest, NextResponse } from "next/server";
import { getRequester } from "@/lib/form-builder/server/context";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
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
