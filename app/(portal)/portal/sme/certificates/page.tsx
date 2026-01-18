"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Award, Download, Trash2, ExternalLink, GraduationCap, FileText } from "lucide-react";
import { toast } from "sonner";

interface CohortCertificate {
  id: string;
  cohortId: string;
  cohortTitle: string;
  certificateUrl: string | null;
  completedAt: any;
  overallCompletion: number;
}

interface ProfessionalCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: any;
  expiryDate: any | null;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  category: string;
  userId: string;
  createdAt: any;
}

export default function CertificatesPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [cohortCertificates, setCohortCertificates] = useState<CohortCertificate[]>([]);
  const [professionalCerts, setProfessionalCerts] = useState<ProfessionalCertification[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    description: "",
    category: "iso",
  });

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!db || !profile?.id) return;
    
    try {
      // Load cohort certificates
      const enrollmentsQuery = query(
        collection(db, "cohortEnrollments"),
        where("userId", "==", profile.id),
        where("status", "==", "completed")
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      const cohortCerts: CohortCertificate[] = [];
      for (const enrollDoc of enrollmentsSnapshot.docs) {
        const enrollment = enrollDoc.data();
        if (enrollment.certificateGenerated) {
          // Get cohort details
          const cohortDoc = await getDocs(query(collection(db, "cohorts"), where("__name__", "==", enrollment.cohortId)));
          const cohortData = cohortDoc.docs[0]?.data();
          
          cohortCerts.push({
            id: enrollDoc.id,
            cohortId: enrollment.cohortId,
            cohortTitle: cohortData?.title || "CMMC Training Cohort",
            certificateUrl: enrollment.certificateUrl,
            completedAt: enrollment.updatedAt,
            overallCompletion: enrollment.progress?.overallCompletion || 100,
          });
        }
      }
      setCohortCertificates(cohortCerts);

      // Load professional certifications
      const certsQuery = query(
        collection(db, "professionalCertifications"),
        where("userId", "==", profile.id)
      );
      const certsSnapshot = await getDocs(certsQuery);
      const certs = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfessionalCertification));
      setProfessionalCerts(certs);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertification = async () => {
    if (!db || !profile?.id) return;
    if (!formData.name || !formData.issuingOrganization || !formData.issueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "professionalCertifications"), {
        ...formData,
        userId: profile.id,
        issueDate: Timestamp.fromDate(new Date(formData.issueDate)),
        expiryDate: formData.expiryDate ? Timestamp.fromDate(new Date(formData.expiryDate)) : null,
        createdAt: Timestamp.now(),
      });

      toast.success("Certification added successfully");
      setDialogOpen(false);
      setFormData({
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
        description: "",
        category: "iso",
      });
      loadData();
    } catch (error) {
      console.error("Error adding certification:", error);
      toast.error("Failed to add certification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCertification = async (certId: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      await deleteDoc(doc(db, "professionalCertifications", certId));
      toast.success("Certification deleted");
      loadData();
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast.error("Failed to delete certification");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Manage your certificates and professional certifications</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Tabs defaultValue="cohort" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cohort">
            <GraduationCap className="h-4 w-4 mr-2" />
            Training Certificates ({cohortCertificates.length})
          </TabsTrigger>
          <TabsTrigger value="professional">
            <FileText className="h-4 w-4 mr-2" />
            Professional Certifications ({professionalCerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CMMC Training Certificates</CardTitle>
              <CardDescription>Certificates earned from completed training cohorts</CardDescription>
            </CardHeader>
            <CardContent>
              {cohortCertificates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No training certificates yet.</p>
                  <p className="text-sm mt-2">Complete a CMMC training cohort to earn your certificate.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {cohortCertificates.map((cert) => (
                    <Card key={cert.id} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Award className="h-5 w-5 text-blue-600" />
                              {cert.cohortTitle}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Completed {cert.completedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {cert.overallCompletion}% Complete
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {cert.certificateUrl ? (
                          <Button variant="outline" className="w-full" asChild>
                            <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download Certificate
                            </a>
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Certificate will be available soon
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Certifications</CardTitle>
              <CardDescription>ISO certifications, industry credentials, and professional qualifications</CardDescription>
            </CardHeader>
            <CardContent>
              {professionalCerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No professional certifications added yet.</p>
                  <p className="text-sm mt-2">Click "Add New" to add your certifications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {professionalCerts.map((cert) => {
                    const isExpired = cert.expiryDate && cert.expiryDate.toDate() < new Date();
                    return (
                      <Card key={cert.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{cert.name}</CardTitle>
                              <CardDescription>{cert.issuingOrganization}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={isExpired ? "destructive" : "secondary"}>
                                {cert.category.toUpperCase()}
                              </Badge>
                              {isExpired && <Badge variant="destructive">Expired</Badge>}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {cert.description && (
                            <p className="text-sm text-muted-foreground">{cert.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Issue Date:</span>
                              <p className="font-medium">{cert.issueDate?.toDate?.()?.toLocaleDateString()}</p>
                            </div>
                            {cert.expiryDate && (
                              <div>
                                <span className="text-muted-foreground">Expiry Date:</span>
                                <p className={`font-medium ${isExpired ? "text-red-600" : ""}`}>
                                  {cert.expiryDate?.toDate?.()?.toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {cert.credentialId && (
                              <div>
                                <span className="text-muted-foreground">Credential ID:</span>
                                <p className="font-medium font-mono text-xs">{cert.credentialId}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2">
                            {cert.credentialUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Verify
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCertification(cert.id)}
                              className="ml-auto text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Professional Certification</DialogTitle>
            <DialogDescription>
              Add ISO certifications, industry credentials, or other professional qualifications
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Certification Name *</Label>
              <Input
                id="name"
                placeholder="e.g., ISO 9001:2015"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">Issuing Organization *</Label>
              <Input
                id="organization"
                placeholder="e.g., International Organization for Standardization"
                value={formData.issuingOrganization}
                onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso">ISO Certification</SelectItem>
                    <SelectItem value="cmmc">CMMC</SelectItem>
                    <SelectItem value="industry">Industry Specific</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="quality">Quality Management</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input
                  id="credentialId"
                  placeholder="Certificate number"
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credentialUrl">Verification URL</Label>
              <Input
                id="credentialUrl"
                type="url"
                placeholder="https://..."
                value={formData.credentialUrl}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional details about this certification..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddCertification} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Certification"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
