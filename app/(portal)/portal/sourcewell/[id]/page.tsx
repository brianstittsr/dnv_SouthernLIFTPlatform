"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Mail, 
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Building2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { SourcewellSolicitationDoc, SolicitationStatus } from "@/lib/types/sourcewell";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<SolicitationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Open", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  pending: { label: "Pending", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
  awarded: { label: "Awarded", color: "bg-blue-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: <XCircle className="h-4 w-4" /> },
};

export default function SolicitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [solicitation, setSolicitation] = useState<SourcewellSolicitationDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSolicitation(params.id as string);
    }
  }, [params.id]);

  async function fetchSolicitation(id: string) {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const docRef = doc(db, COLLECTIONS.SOURCEWELL_SOLICITATIONS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSolicitation({ id: docSnap.id, ...docSnap.data() } as SourcewellSolicitationDoc);
      }
    } catch (error) {
      console.error("Error fetching solicitation:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!solicitation) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Solicitation not found</h3>
            <p className="text-muted-foreground mb-4">The solicitation you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/portal/sourcewell">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Solicitations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[solicitation.status];
  const isOpen = solicitation.status === "open";
  const daysUntilDue = solicitation.dueDate 
    ? Math.ceil((solicitation.dueDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {solicitation.solicitationNumber}
          </Badge>
          <Badge className={cn("text-white", status.color)}>
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{solicitation.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {solicitation.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {solicitation.requirements && solicitation.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {solicitation.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {solicitation.eligibility && (
            <Card>
              <CardHeader>
                <CardTitle>Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{solicitation.eligibility}</p>
              </CardContent>
            </Card>
          )}

          {solicitation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{solicitation.notes}</p>
              </CardContent>
            </Card>
          )}

          {solicitation.awardedVendors && solicitation.awardedVendors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Awarded Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {solicitation.awardedVendors.map((vendor, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg">
                      <Building2 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">{vendor.name}</p>
                        {vendor.contractNumber && (
                          <p className="text-sm text-muted-foreground">Contract: {vendor.contractNumber}</p>
                        )}
                        {vendor.awardAmount && (
                          <p className="text-sm text-muted-foreground">Amount: {vendor.awardAmount}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {solicitation.documentUrls && solicitation.documentUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {solicitation.documentUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Download className="h-4 w-4 text-primary" />
                      <span className="text-sm flex-1">Document {idx + 1}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Posted Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(solicitation.postedDate.toDate(), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              {solicitation.dueDate && (
                <div className="flex items-start gap-3">
                  <Calendar className={cn(
                    "h-5 w-5 mt-0.5",
                    daysUntilDue !== null && daysUntilDue < 7 && daysUntilDue > 0 
                      ? "text-orange-500" 
                      : "text-muted-foreground"
                  )} />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className={cn(
                      "text-sm",
                      daysUntilDue !== null && daysUntilDue < 7 && daysUntilDue > 0 
                        ? "text-orange-600 font-semibold" 
                        : "text-muted-foreground"
                    )}>
                      {format(solicitation.dueDate.toDate(), "MMMM d, yyyy")}
                      {daysUntilDue !== null && daysUntilDue > 0 && (
                        <span className="ml-1">({daysUntilDue} days remaining)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {solicitation.awardedDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Awarded Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(solicitation.awardedDate.toDate(), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {solicitation.closedDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Closed Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(solicitation.closedDate.toDate(), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(solicitation.estimatedValue || solicitation.contractTerm) && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {solicitation.estimatedValue && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Estimated Value</p>
                      <p className="text-sm text-muted-foreground">{solicitation.estimatedValue}</p>
                    </div>
                  </div>
                )}

                {solicitation.contractTerm && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Contract Term</p>
                      <p className="text-sm text-muted-foreground">{solicitation.contractTerm}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(solicitation.contactName || solicitation.contactEmail || solicitation.contactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {solicitation.contactName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Contact Person</p>
                      <p className="text-sm text-muted-foreground">{solicitation.contactName}</p>
                    </div>
                  </div>
                )}

                {solicitation.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a 
                        href={`mailto:${solicitation.contactEmail}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {solicitation.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {solicitation.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a 
                        href={`tel:${solicitation.contactPhone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {solicitation.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {solicitation.portalUrl && (
                <Button asChild className="w-full">
                  <a href={solicitation.portalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on SourceWell Portal
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <a href="https://proportal.sourcewell-mn.gov/Module/Tenders/en" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Browse All Solicitations
                </a>
              </Button>
            </CardContent>
          </Card>

          {solicitation.tags && solicitation.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {solicitation.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
