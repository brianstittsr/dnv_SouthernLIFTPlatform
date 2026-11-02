import { Timestamp } from "firebase-admin/firestore";
import { requireDb } from "@/lib/form-builder/server/context";
import { COLLECTIONS } from "@/lib/schema";

/** course_certificates record shape (written by lib/lms/progress.ts). */
export interface CourseCertificateDoc {
  userId: string;
  courseId: string;
  courseTitle?: string;
  userName?: string;
  facilitatorName?: string;
  completionDate?: Timestamp;
  certificateNumber?: string;
  issuedAt?: Timestamp;
  status?: string;
  zoomMinutesAttended?: number;
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCertDate(value: unknown): string {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function getCertificateById(id: string): Promise<(CourseCertificateDoc & { id: string }) | null> {
  const snap = await requireDb().collection("course_certificates").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as CourseCertificateDoc) };
}

export async function findCertificateByNumber(
  certificateNumber: string
): Promise<(CourseCertificateDoc & { id: string }) | null> {
  const snap = await requireDb()
    .collection("course_certificates")
    .where("certificateNumber", "==", certificateNumber)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as CourseCertificateDoc) };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** LinkedIn "Add to profile" prefilled certification link. */
export function linkedinAddToProfileUrl(cert: CourseCertificateDoc, verifyUrl: string): string {
  const completion = toDate(cert.completionDate);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: cert.courseTitle || "Course Completion",
    organizationName: "Southern University LIFT Rural Business Center",
    certUrl: verifyUrl,
    certId: cert.certificateNumber || "",
  });
  if (completion) {
    params.set("issueYear", String(completion.getFullYear()));
    params.set("issueMonth", String(completion.getMonth() + 1));
  }
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/** LinkedIn share-post link for the public verification URL. */
export function linkedinShareUrl(verifyUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
}

/** LIFT-branded certificate HTML rendered to PDF by renderHtmlToPdf. */
export function buildCertificateHtml(cert: CourseCertificateDoc, verifyUrl: string): string {
  const name = escapeHtml(cert.userName || "Course Participant");
  const course = escapeHtml(cert.courseTitle || "Course Completion");
  const facilitator = escapeHtml(cert.facilitatorName || "LIFT Instructor");
  const number = escapeHtml(cert.certificateNumber || cert.userId);
  const date = formatCertDate(cert.completionDate);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: letter landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1b2a4a; }
  .page { width: 11in; height: 8.5in; padding: 0.55in; background: #f7f4ec; position: relative; }
  .border { border: 3px solid #1b2a4a; height: 100%; padding: 8px; }
  .inner { border: 1.5px solid #b58b2a; height: 100%; padding: 0.5in 0.65in; display: flex; flex-direction: column; align-items: center; background: #fffdf7; }
  .org { font-size: 15px; letter-spacing: 3px; text-transform: uppercase; color: #b58b2a; font-family: Arial, sans-serif; font-weight: 600; }
  .org-sub { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5b6577; font-family: Arial, sans-serif; margin-top: 4px; }
  h1 { font-size: 44px; font-weight: 400; color: #1b2a4a; margin: 0.35in 0 0.12in; letter-spacing: 1px; }
  .line { width: 220px; height: 2px; background: #b58b2a; margin: 0 0 0.28in; }
  .presented { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #5b6577; font-family: Arial, sans-serif; }
  .name { font-size: 36px; color: #1b2a4a; margin: 0.14in 0 0.22in; border-bottom: 1px solid #c9b98a; padding: 0 0.4in 0.08in; }
  .for { font-size: 13px; color: #5b6577; font-family: Arial, sans-serif; max-width: 7.5in; text-align: center; line-height: 1.5; }
  .course { font-size: 22px; color: #1b2a4a; margin-top: 0.16in; font-style: italic; }
  .footer { display: flex; justify-content: space-between; width: 100%; margin-top: auto; align-items: flex-end; font-family: Arial, sans-serif; }
  .sig { text-align: center; }
  .sig-line { width: 190px; border-bottom: 1px solid #1b2a4a; margin-bottom: 6px; }
  .sig-label { font-size: 10px; color: #5b6577; text-transform: uppercase; letter-spacing: 1px; }
  .sig-name { font-size: 12px; color: #1b2a4a; }
  .meta { font-size: 9px; color: #8a93a5; text-align: center; line-height: 1.6; }
</style>
</head>
<body>
  <div class="page"><div class="border"><div class="inner">
    <div class="org">Southern University</div>
    <div class="org-sub">LIFT Rural Business Center · MBDA</div>
    <h1>Certificate of Completion</h1>
    <div class="line"></div>
    <div class="presented">Proudly presented to</div>
    <div class="name">${name}</div>
    <div class="for">for successfully completing the training program</div>
    <div class="course">${course}</div>
    <div class="footer">
      <div class="sig"><div class="sig-line"></div><div class="sig-name">${facilitator}</div><div class="sig-label">Instructor</div></div>
      <div class="meta">Completed ${date}<br/>Certificate No. ${number}<br/>Verify at ${verifyUrl}</div>
      <div class="sig"><div class="sig-line"></div><div class="sig-name">Program Director</div><div class="sig-label">Southern University LIFT</div></div>
    </div>
  </div></div></div>
</body>
</html>`;
}
