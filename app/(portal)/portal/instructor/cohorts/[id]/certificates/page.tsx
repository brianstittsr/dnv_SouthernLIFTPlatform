"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  getCohortMemberships,
  getCohortCertificates,
  issueCertificate,
  generateCertificateNumber,
  getCohort
} from "@/lib/firebase-cohorts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Award, 
  Download,
  CheckCircle2,
  User,
  Calendar,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

interface Membership {
  id: string;
  userId: string;
  cohortId: string;
  cohortRole: string;
  progressPercentage: number;
  completedSessions: number;
  totalSessions: number;
  enrolledAt: any;
  status: string;
  completedAt?: any;
}

interface Certificate {
  id: string;
  userId: string;
  cohortId: string;
  cohortTitle: string;
  userName: string;
  facilitatorName: string;
  completionDate: any;
  certificateNumber: string;
  issuedAt: any;
  status: string;
}

interface ParticipantWithCert extends Membership {
  userName?: string;
  userEmail?: string;
  certificate?: Certificate;
}

export default function CertificatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cohortId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ParticipantWithCert[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [cohortTitle, setCohortTitle] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");
  const [generating, setGenerating] = useState(false);
  
  // Certificate preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadData();
  }, [cohortId]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Load cohort info
      const cohort = await getCohort(cohortId);
      if (cohort && (cohort as any).title) {
        setCohortTitle((cohort as any).title);
        setFacilitatorName((cohort as any).facilitatorName || "Instructor");
      }
      
      // Load memberships
      const membershipsData = await getCohortMemberships(cohortId);
      
      // Load certificates
      const certificatesData = await getCohortCertificates(cohortId);
      setCertificates(certificatesData as Certificate[]);
      
      // Combine data
      const participantsWithCerts = (membershipsData as Membership[]).map(membership => {
        const cert = (certificatesData as Certificate[]).find(c => c.userId === membership.userId);
        return {
          ...membership,
          certificate: cert,
        };
      });
      
      setParticipants(participantsWithCerts);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (participant: ParticipantWithCert) => {
    if (participant.certificate) {
      toast.info("Certificate already issued for this participant");
      return;
    }
    
    if (participant.progressPercentage < 100) {
      toast.error("Participant must complete 100% of the cohort to receive a certificate");
      return;
    }
    
    try {
      setGenerating(true);
      
      const certificateNumber = generateCertificateNumber();
      
      await issueCertificate({
        userId: participant.userId,
        cohortId: cohortId,
        cohortTitle: cohortTitle,
        userName: participant.userName || "Participant",
        facilitatorName: facilitatorName,
        completionDate: participant.completedAt || Timestamp.now(),
        certificateNumber: certificateNumber,
      });
      
      toast.success("Certificate issued successfully!");
      loadData();
    } catch (error: any) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAllCertificates = async () => {
    const eligibleParticipants = participants.filter(
      p => !p.certificate && p.progressPercentage >= 100
    );
    
    if (eligibleParticipants.length === 0) {
      toast.info("No eligible participants for certificate generation");
      return;
    }
    
    if (!confirm(`Generate certificates for ${eligibleParticipants.length} participants?`)) {
      return;
    }
    
    try {
      setGenerating(true);
      
      for (const participant of eligibleParticipants) {
        const certificateNumber = generateCertificateNumber();
        
        await issueCertificate({
          userId: participant.userId,
          cohortId: cohortId,
          cohortTitle: cohortTitle,
          userName: participant.userName || "Participant",
          facilitatorName: facilitatorName,
          completionDate: participant.completedAt || Timestamp.now(),
          certificateNumber: certificateNumber,
        });
      }
      
      toast.success(`${eligibleParticipants.length} certificates issued successfully!`);
      loadData();
    } catch (error: any) {
      console.error("Error generating certificates:", error);
      toast.error("Failed to generate certificates");
    } finally {
      setGenerating(false);
    }
  };

  const openCertificatePreview = (certificate: Certificate) => {
    setPreviewCertificate(certificate);
    setPreviewDialogOpen(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const eligibleCount = participants.filter(p => !p.certificate && p.progressPercentage >= 100).length;
  const issuedCount = certificates.length;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Back to Cohorts
          </Button>
          <h1 className="text-3xl font-bold">{cohortTitle} - Certificates</h1>
          <p className="text-muted-foreground">Issue and manage completion certificates</p>
        </div>
        {eligibleCount > 0 && (
          <Button onClick={handleGenerateAllCertificates} disabled={generating}>
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Award className="mr-2 h-4 w-4" />
            )}
            Generate All ({eligibleCount})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issuedCount}</div>
            <p className="text-xs text-muted-foreground">
              {participants.length > 0 ? Math.round((issuedCount / participants.length) * 100) : 0}% of participants
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible for Certificate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibleCount}</div>
            <p className="text-xs text-muted-foreground">
              100% completion required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participant Certificates</CardTitle>
          <CardDescription>
            Manage certificate issuance for cohort participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No participants enrolled yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(participant.userName || "P")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.userName || "Participant"}</p>
                          <p className="text-xs text-muted-foreground">{participant.userEmail || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${participant.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{participant.progressPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {participant.completedAt ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {formatDate(participant.completedAt)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.certificate ? (
                        <Badge variant="default" className="bg-blue-500">
                          <Award className="mr-1 h-3 w-3" />
                          Issued
                        </Badge>
                      ) : participant.progressPercentage >= 100 ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Eligible</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {participant.certificate ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCertificatePreview(participant.certificate!)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleGenerateCertificate(participant)}
                          disabled={participant.progressPercentage < 100 || generating}
                        >
                          {generating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Award className="mr-2 h-4 w-4" />
                          )}
                          Generate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Certificate Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificate of Completion</DialogTitle>
            <DialogDescription>
              Certificate #{previewCertificate?.certificateNumber}
            </DialogDescription>
          </DialogHeader>
          
          {previewCertificate && (
            <div className="border-4 border-primary rounded-lg p-8 bg-gradient-to-br from-white to-blue-50">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <Award className="h-16 w-16 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-2">Certificate of Completion</h2>
                  <p className="text-muted-foreground">This certifies that</p>
                </div>
                
                <div className="py-4 border-y-2 border-primary/20">
                  <h3 className="text-4xl font-bold text-primary">{previewCertificate.userName}</h3>
                </div>
                
                <div className="space-y-2">
                  <p className="text-muted-foreground">has successfully completed</p>
                  <h4 className="text-2xl font-semibold">{previewCertificate.cohortTitle}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Completion Date
                    </div>
                    <p className="font-medium">{formatDate(previewCertificate.completionDate)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                      <Hash className="h-4 w-4" />
                      Certificate Number
                    </div>
                    <p className="font-medium font-mono text-sm">{previewCertificate.certificateNumber}</p>
                  </div>
                </div>
                
                <div className="pt-8 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Facilitator</p>
                  <p className="font-semibold">{previewCertificate.facilitatorName}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
