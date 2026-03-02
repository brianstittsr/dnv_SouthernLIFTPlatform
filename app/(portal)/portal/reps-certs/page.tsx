"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Shield,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Award,
  Gavel,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Timestamp, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

// SAM.gov Required Representations and Certifications Categories
const REPS_CERTS_CATEGORIES = [
  {
    id: "business_registration",
    title: "Business Registration",
    description: "Core SAM.gov registration documents",
    required: true,
    documents: [
      { id: "sam_registration", name: "Active SAM.gov Registration", description: "Screenshot or PDF of active SAM.gov status", required: true },
      { id: "uei_verification", name: "UEI Verification", description: "Unique Entity Identifier assignment document", required: true },
      { id: "cage_code", name: "CAGE Code Assignment", description: "Commercial and Government Entity code documentation", required: true },
      { id: "naics_codes", name: "NAICS Codes List", description: "All registered North American Industry Classification codes", required: true },
    ],
  },
  {
    id: "size_representation",
    title: "Size Representation",
    description: "Small business size status documentation",
    required: true,
    documents: [
      { id: "small_business_cert", name: "Small Business Self-Certification", description: "FAR 52.219-1 small business representation", required: true },
      { id: "size_standard_affidavit", name: "Size Standard Affidavit", description: "Documentation of employee count or revenue for applicable NAICS", required: true },
      { id: "affiliates_disclosure", name: "Affiliates Disclosure", description: "List of all business affiliates per FAR 19.101", required: true },
    ],
  },
  {
    id: "socioeconomic",
    title: "Socioeconomic Certifications",
    description: "Small disadvantaged and special status certifications",
    required: false,
    documents: [
      { id: "sdb_cert", name: "SDB Certification (8a/Hubzone)", description: "SBA 8(a) or HUBZone certification if applicable", required: false },
      { id: "wosb_cert", name: "WOSB/EDWOSB Certification", description: "Women-Owned Small Business certification", required: false },
      { id: "sdvosb_cert", name: "SDVOSB Certification", description: "Service-Disabled Veteran-Owned Small Business", required: false },
      { id: "hubzone_cert", name: "HUBZone Certification", description: "Historically Underutilized Business Zone", required: false },
    ],
  },
  {
    id: "compliance_legal",
    title: "Compliance & Legal Representations",
    description: "Legal compliance and eligibility certifications",
    required: true,
    documents: [
      { id: "debarment_cert", name: "Debarment Certification", description: "FAR 52.209-5 - Not debarred, suspended, or ineligible", required: true },
      { id: "tax_compliance", name: "Tax Compliance Certification", description: "FAR 52.209-5 - No delinquent federal taxes", required: true },
      { id: "lobbying_cert", name: "Lobbying Certification", description: "Byrd Anti-Lobbying Amendment compliance", required: true },
      { id: "drug_free_cert", name: "Drug-Free Workplace Certification", description: "FAR 52.223-6 Drug-Free Workplace", required: true },
    ],
  },
  {
    id: "procurement_integrity",
    title: "Procurement Integrity",
    description: "Bid/proposal related certifications",
    required: true,
    documents: [
      { id: "bidding_cert", name: "Bidding Certification", description: "Independent pricing and arm's length negotiations", required: true },
      { id: "contingent_fee", name: "Contingent Fee Disclosure", description: "FAR 52.203-5 - No contingent fee arrangements", required: true },
      { id: "gratuities_cert", name: "Gratuities Certification", description: "FAR 52.203-3 - No improper gratuities", required: true },
      { id: "organizational_conflict", name: "Organizational Conflict of Interest", description: "FAR 52.203-16 - No conflicts disclosed", required: true },
    ],
  },
  {
    id: "trade_agreements",
    title: "Trade Agreements Act",
    description: "Domestic sourcing and country of origin",
    required: true,
    documents: [
      { id: "buy_american_cert", name: "Buy American Act Certification", description: "Domestic end products and construction materials", required: true },
      { id: "trade_agreements", name: "Trade Agreements Act Certificate", description: "FAR 52.225-6 compliance for designated countries", required: true },
      { id: "berry_amendment", name: "Berry Amendment Certification", description: "Domestic specialty metals, food, textiles (if applicable)", required: false },
      { id: "country_origin", name: "Country of Origin Documentation", description: "List of all end products with country of origin", required: true },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Data Protection",
    description: "CMMC and information security compliance",
    required: true,
    documents: [
      { id: "cmmc_cert", name: "CMMC Certification (Level 1 or 2)", description: "Cybersecurity Maturity Model Certification", required: true },
      { id: "nist_800_171", name: "NIST SP 800-171 Self-Assessment", description: "Controlled Unclassified Information protection", required: false },
      { id: "sprs_score", name: "SPRS Score Documentation", description: "Supplier Performance Risk System submission", required: false },
      { id: "incident_response", name: "Incident Response Plan", description: "DFARS 252.204-7012 incident reporting procedures", required: true },
    ],
  },
  {
    id: "financial_qualifications",
    title: "Financial & Qualifications",
    description: "Financial capacity and performance history",
    required: true,
    documents: [
      { id: "financial_statements", name: "Financial Statements", description: "Balance sheet and income statement (last 2 years)", required: true },
      { id: "banking_letter", name: "Banking Letter", description: "Letter of credit or banking relationship confirmation", required: false },
      { id: "bonding_capacity", name: "Bonding Capacity Letter", description: "Surety bond capacity (for construction contracts)", required: false },
      { id: "insurance_cert", name: "Insurance Certificate", description: "General liability, professional liability coverage", required: true },
    ],
  },
  {
    id: "past_performance",
    title: "Past Performance References",
    description: "Relevant contract performance history",
    required: false,
    documents: [
      { id: "cpars_records", name: "CPARS Records", description: "Contractor Performance Assessment Reporting System", required: false },
      { id: "past_perf_references", name: "Past Performance References", description: "3-5 references with contact information", required: false },
      { id: "relevant_experience", name: "Relevant Experience Summary", description: "Similar projects completed in last 3 years", required: false },
    ],
  },
];

interface RepsCertDocument {
  id: string;
  categoryId: string;
  documentTypeId: string;
  name: string;
  fileName?: string;
  fileData?: string; // base64
  fileSize?: number;
  mimeType?: string;
  status: "pending" | "uploaded" | "verified" | "rejected";
  uploadedAt?: Date;
  verifiedAt?: Date;
  notes?: string;
}

interface RepsCertsData {
  id?: string;
  userId: string;
  overallCompletion: number;
  isEligibleForContracts: boolean;
  documents: RepsCertDocument[];
  lastUpdated: Date;
  status: "draft" | "submitted" | "under_review" | "verified" | "expired";
}

export default function RepsCertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [repsCertsData, setRepsCertsData] = useState<RepsCertsData | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["business_registration"]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadRepsCertsData();
  }, []);

  const loadRepsCertsData = async () => {
    try {
      setLoading(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      if (!db) {
        toast.error("Database not available");
        return;
      }

      // Query for existing Reps and Certs
      const q = query(
        collection(db, COLLECTIONS.REPS_CERTS),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data() as RepsCertsData;
        setRepsCertsData({
          ...data,
          id: doc.id,
          documents: data.documents || [],
          lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated : new Date(),
        });
      } else {
        // Initialize empty Reps and Certs
        setRepsCertsData({
          userId: currentUser.uid,
          overallCompletion: 0,
          isEligibleForContracts: false,
          documents: [],
          lastUpdated: new Date(),
          status: "draft",
        });
      }
    } catch (error) {
      console.error("Error loading Reps and Certs:", error);
      toast.error("Failed to load Representations and Certifications");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (categoryId: string, documentTypeId: string, file: File) => {
    try {
      setUploading(`${categoryId}-${documentTypeId}`);

      // Validate file
      if (!file.type.match(/pdf|image\/(jpeg|png|gif)/)) {
        toast.error("Please upload PDF or image files only");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const currentUser = auth?.currentUser;
      if (!currentUser || !db) return;

      // Check if document already exists
      const existingDocIndex = repsCertsData?.documents?.findIndex(
        (d) => d.categoryId === categoryId && d.documentTypeId === documentTypeId
      ) ?? -1;

      const newDocument: RepsCertDocument = {
        id: existingDocIndex >= 0 ? repsCertsData!.documents[existingDocIndex].id : `${Date.now()}`,
        categoryId,
        documentTypeId,
        name: getDocumentName(categoryId, documentTypeId),
        fileName: file.name,
        fileData: base64,
        fileSize: file.size,
        mimeType: file.type,
        status: "uploaded",
        uploadedAt: new Date(),
      };

      let updatedDocuments;
      if (existingDocIndex >= 0 && repsCertsData?.documents) {
        updatedDocuments = [...repsCertsData.documents];
        updatedDocuments[existingDocIndex] = newDocument;
      } else {
        updatedDocuments = [...(repsCertsData?.documents || []), newDocument];
      }

      // Calculate completion
      const requiredDocs = getRequiredDocumentsCount();
      const uploadedRequiredDocs = updatedDocuments.filter(
        (d) => d.status === "uploaded" || d.status === "verified"
      ).length;
      const completion = Math.min(100, Math.round((uploadedRequiredDocs / requiredDocs) * 100));
      const isEligible = completion >= 70;

      const updatedData: RepsCertsData = {
        userId: currentUser.uid,
        overallCompletion: completion,
        isEligibleForContracts: isEligible,
        documents: updatedDocuments,
        lastUpdated: new Date(),
        status: isEligible ? "submitted" : "draft",
      };

      // Save to Firebase
      const q = query(
        collection(db, COLLECTIONS.REPS_CERTS),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(db, COLLECTIONS.REPS_CERTS), {
          ...updatedData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } else {
        const docRef = doc(db, COLLECTIONS.REPS_CERTS, snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...updatedData,
          updatedAt: Timestamp.now(),
        });
      }

      setRepsCertsData(updatedData);
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this document?")) return;

      const currentUser = auth?.currentUser;
      if (!currentUser || !db || !repsCertsData?.documents) return;

      const updatedDocuments = repsCertsData.documents.filter((d) => d.id !== documentId);

      // Recalculate completion
      const requiredDocs = getRequiredDocumentsCount();
      const uploadedRequiredDocs = updatedDocuments.filter(
        (d) => d.status === "uploaded" || d.status === "verified"
      ).length;
      const completion = Math.min(100, Math.round((uploadedRequiredDocs / requiredDocs) * 100));
      const isEligible = completion >= 70;

      const updatedData: RepsCertsData = {
        ...repsCertsData,
        documents: updatedDocuments,
        overallCompletion: completion,
        isEligibleForContracts: isEligible,
        lastUpdated: new Date(),
        status: isEligible ? "submitted" : "draft",
      };

      const q = query(
        collection(db, COLLECTIONS.REPS_CERTS),
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, COLLECTIONS.REPS_CERTS, snapshot.docs[0].id);
        await updateDoc(docRef, {
          documents: updatedDocuments,
          overallCompletion: completion,
          isEligibleForContracts: isEligible,
          status: isEligible ? "submitted" : "draft",
          updatedAt: Timestamp.now(),
        });
      }

      setRepsCertsData(updatedData);
      toast.success("Document deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const getDocumentName = (categoryId: string, documentTypeId: string) => {
    const category = REPS_CERTS_CATEGORIES.find((c) => c.id === categoryId);
    const doc = category?.documents.find((d) => d.id === documentTypeId);
    return doc?.name || "Unknown Document";
  };

  const getRequiredDocumentsCount = () => {
    return REPS_CERTS_CATEGORIES.reduce((acc, cat) => {
      return acc + cat.documents.filter((d) => d.required).length;
    }, 0);
  };

  const getDocumentStatus = (categoryId: string, documentTypeId: string) => {
    return repsCertsData?.documents?.find(
      (d) => d.categoryId === categoryId && d.documentTypeId === documentTypeId
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "uploaded":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading Representations and Certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Representations and Certifications</h1>
            <p className="text-muted-foreground mt-1">
              SAM.gov required documentation for Government Contractors and SubContractors
            </p>
          </div>
          <Badge
            className={
              repsCertsData?.isEligibleForContracts
                ? "bg-green-500"
                : "bg-yellow-500"
            }
          >
            {repsCertsData?.isEligibleForContracts
              ? "Contract Eligible (70%+ Complete)"
              : `Incomplete (${repsCertsData?.overallCompletion || 0}%)`}
          </Badge>
        </div>
      </div>

      {/* Health Score Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Reps and Certs Completion Score
          </CardTitle>
          <CardDescription>
            Upload all required SAM.gov representations to qualify for federal contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Overall Completion: {repsCertsData?.overallCompletion || 0}%
                </span>
                <span className={`text-sm font-bold ${getHealthColor(repsCertsData?.overallCompletion || 0)}`}>
                  {(repsCertsData?.overallCompletion || 0) >= 70
                    ? "Contract Eligible"
                    : (repsCertsData?.overallCompletion || 0) >= 40
                    ? "In Progress"
                    : "Needs Documents"}
                </span>
              </div>
              <Progress value={repsCertsData?.overallCompletion || 0} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                70% completion required for federal contract eligibility. Required documents are marked with *.
              </p>
            </div>
            <div className="ml-8 text-center">
              <div className={`text-4xl font-bold ${getHealthColor(repsCertsData?.overallCompletion || 0)}`}>
                {repsCertsData?.overallCompletion || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {repsCertsData?.isEligibleForContracts
                  ? "Eligible for Contracts"
                  : "Complete Required Docs"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      {!repsCertsData?.isEligibleForContracts && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> You must complete 70% of required representations and certifications
            to be eligible for federal contract opportunities. Required documents are marked with * below.
          </AlertDescription>
        </Alert>
      )}

      {/* Document Categories */}
      <div className="space-y-4">
        {REPS_CERTS_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const uploadedCount = category.documents.filter((doc) =>
            getDocumentStatus(category.id, doc.id)
          ).length;
          const totalCount = category.documents.length;

          return (
            <Card key={category.id} className="overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {category.title}
                      {category.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {uploadedCount}/{totalCount} Documents
                </Badge>
              </div>

              {isExpanded && (
                <CardContent className="border-t">
                  <div className="space-y-4 pt-4">
                    {category.documents.map((doc) => {
                      const status = getDocumentStatus(category.id, doc.id);
                      const isUploading = uploading === `${category.id}-${doc.id}`;

                      return (
                        <div
                          key={doc.id}
                          className="flex items-start gap-4 p-3 border rounded-lg"
                        >
                          <div className="mt-1">
                            {getStatusIcon(status?.status || "pending")}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {doc.name}
                                {doc.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </h4>
                              {status?.status === "verified" && (
                                <Badge className="bg-green-500">Verified</Badge>
                              )}
                              {status?.status === "uploaded" && (
                                <Badge className="bg-yellow-500">Pending Review</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doc.description}
                            </p>
                            {status?.fileName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploaded: {status.fileName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {status?.fileData ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(status.fileData, "_blank")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(status.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  id={`file-${category.id}-${doc.id}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(category.id, doc.id, file);
                                    }
                                  }}
                                  disabled={isUploading}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUploading}
                                  onClick={() =>
                                    document
                                      .getElementById(`file-${category.id}-${doc.id}`)
                                      ?.click()
                                  }
                                >
                                  {isUploading ? (
                                    <Clock className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-1" />
                                  )}
                                  {isUploading ? "Uploading..." : "Upload"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {repsCertsData?.documents?.filter((d) => d.status === "uploaded" || d.status === "verified").length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Documents Uploaded</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {REPS_CERTS_CATEGORIES.reduce((acc, cat) => acc + cat.documents.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Required</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className={`text-2xl font-bold ${getHealthColor(repsCertsData?.overallCompletion || 0)}`}>
                {repsCertsData?.isEligibleForContracts ? "Yes" : "No"}
              </div>
              <p className="text-sm text-muted-foreground">Contract Eligible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
