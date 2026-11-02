import { findCertificateByNumber, formatCertDate } from "@/lib/lms/certificates-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Award } from "lucide-react";

interface PageProps {
  params: Promise<{ number: string }>;
}

export const metadata = {
  title: "Certificate Verification | Southern University LIFT",
};

/**
 * Public certificate verification page — confirms a certificate number
 * resolves to a real issued certificate.
 */
export default async function VerifyCertificatePage({ params }: PageProps) {
  const { number } = await params;
  const cert = await findCertificateByNumber(number);
  const valid = Boolean(cert) && cert?.status !== "revoked";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto">
            {valid ? (
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            ) : (
              <XCircle className="h-14 w-14 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {valid ? "Certificate Verified" : "Certificate Not Found"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Southern University LIFT Rural Business Center
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {valid && cert ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Awarded to</dt>
                <dd className="font-medium">{cert.userName || "Course Participant"}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Program</dt>
                <dd className="font-medium text-right">{cert.courseTitle || "Course Completion"}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="font-medium">{formatCertDate(cert.completionDate)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Certificate No.</dt>
                <dd>
                  <Badge variant="outline" className="font-mono">
                    <Award className="h-3 w-3 mr-1" />
                    {cert.certificateNumber}
                  </Badge>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No certificate was found for number{" "}
              <span className="font-mono">{number}</span>. Check the number and
              try again, or contact the LIFT program office.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
