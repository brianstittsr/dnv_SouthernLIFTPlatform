import { NextRequest, NextResponse } from "next/server";
import { findCertificateByNumber, toDate } from "@/lib/lms/certificates-server";

interface RouteContext {
  params: Promise<{ number: string }>;
}

/**
 * GET /api/lms/certificates/verify/{number}
 * Public certificate verification — returns only the fields needed to
 * confirm authenticity (name, course, completion date, status).
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { number } = await context.params;
    const cert = await findCertificateByNumber(number);
    if (!cert) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }
    return NextResponse.json({
      valid: cert.status !== "revoked",
      certificateNumber: cert.certificateNumber,
      userName: cert.userName || "Course Participant",
      courseTitle: cert.courseTitle || "Course Completion",
      completionDate: toDate(cert.completionDate)?.toISOString() ?? null,
      issuedAt: toDate(cert.issuedAt)?.toISOString() ?? null,
      issuer: "Southern University LIFT Rural Business Center",
    });
  } catch (error) {
    console.error("[lms] certificate verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
