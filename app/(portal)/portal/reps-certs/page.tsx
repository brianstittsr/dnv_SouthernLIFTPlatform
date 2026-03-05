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
// Comprehensive list based on federal contracting requirements
const REPS_CERTS_CATEGORIES = [
  {
    id: "core_registrations",
    title: "1. Core Registrations (Required to be Eligible)",
    description: "Foundational registrations that allow your company to legally receive federal awards",
    required: true,
    documents: [
      { id: "sam_registration", name: "SAM.gov Registration", description: "Active System for Award Management registration - MANDATORY for all federal contractors. Includes UEI, TIN/EIN, banking info, NAICS codes", required: true },
      { id: "uei_verification", name: "UEI (Unique Entity Identifier)", description: "Issued through SAM.gov - replaced DUNS number, used to identify business across all federal systems", required: true },
      { id: "naics_codes", name: "NAICS Codes", description: "All registered North American Industry Classification codes relevant to your business", required: true },
      { id: "cage_code", name: "CAGE Code", description: "Commercial and Government Entity code for federal contracting", required: true },
    ],
  },
  {
    id: "small_business_certs",
    title: "Small Business Certifications (Optional but Critical)",
    description: "SBA certifications for set-aside contract eligibility - unlock billions in contract opportunities",
    required: false,
    documents: [
      { id: "small_business_self_cert", name: "Small Business Self-Certification", description: "Standard small business status via SAM.gov - qualify for small business set-asides", required: false },
      { id: "sba_8a_cert", name: "8(a) Business Development", description: "SBA certification for socially and economically disadvantaged businesses - 9-year program", required: false },
      { id: "wosb_cert", name: "WOSB/EDWOSB Certification", description: "Women-Owned Small Business / Economically Disadvantaged WOSB via SBA or self-certification", required: false },
      { id: "hubzone_cert", name: "HUBZone Certification", description: "Historically Underutilized Business Zone certification via SBA", required: false },
      { id: "sdvosb_cert", name: "SDVOSB Certification", description: "Service-Disabled Veteran-Owned Small Business via VA or SBA", required: false },
      { id: "veteran_owned", name: "Veteran-Owned Small Business (VOSB)", description: "Veteran-owned business certification via VA", required: false },
      { id: "native_american", name: "Native American/Alaska Native/Native Hawaiian", description: "Tribally-owned or Native Hawaiian Organization certifications", required: false },
    ],
  },
  {
    id: "corporate_docs",
    title: "2. Corporate Documentation",
    description: "Business entity and legal compliance documents",
    required: true,
    documents: [
      { id: "articles_incorporation", name: "Articles of Incorporation / Organization", description: "Legal formation documents for your business entity", required: true },
      { id: "operating_agreement", name: "Operating Agreement or Bylaws", description: "Internal governance documents showing business structure", required: true },
      { id: "business_license", name: "Business Licenses", description: "Current state and local business licenses", required: true },
      { id: "certificate_good_standing", name: "Certificate of Good Standing", description: "From state of incorporation showing active status", required: true },
      { id: "dun_bradstreet", name: "Dun & Bradstreet (DUNS) Number", description: "Legacy identifier - still referenced by some agencies", required: false },
    ],
  },
  {
    id: "financial_docs",
    title: "3. Financial Documentation",
    description: "Financial capacity and qualification documents often requested during evaluation",
    required: true,
    documents: [
      { id: "financial_statements", name: "Financial Statements", description: "Balance sheet and income statement (last 2 years) showing financial health", required: true },
      { id: "banking_letter", name: "Banking Letter / Letter of Credit", description: "Confirmation of banking relationship and credit availability", required: false },
      { id: "proof_financial_capability", name: "Proof of Financial Capability", description: "Documentation showing ability to perform on contracts", required: false },
      { id: "cost_accounting_practices", name: "Cost Accounting Practices Disclosure", description: "Required for larger contracts or cost-reimbursement contracts", required: false },
      { id: "bonding_capacity", name: "Bonding Capacity Letter", description: "Surety bond capacity for construction or service contracts requiring bonds", required: false },
    ],
  },
  {
    id: "insurance_docs",
    title: "4. Insurance Documents",
    description: "Insurance coverage often required after contract award",
    required: true,
    documents: [
      { id: "general_liability", name: "General Liability Insurance", description: "Commercial general liability coverage meeting solicitation requirements", required: true },
      { id: "workers_comp", name: "Workers Compensation Insurance", description: "Required if you have employees", required: true },
      { id: "professional_liability", name: "Professional Liability / E&O", description: "Errors and omissions coverage for professional services", required: false },
      { id: "cyber_insurance", name: "Cybersecurity Insurance", description: "Increasingly required for contracts involving data or IT systems", required: false },
    ],
  },
  {
    id: "cybersecurity",
    title: "5. Cybersecurity Compliance (Growing Requirement)",
    description: "Mandatory for DoD contracts and increasingly required across federal agencies",
    required: true,
    documents: [
      { id: "cmmc_cert", name: "CMMC Certification", description: "Cybersecurity Maturity Model Certification Level 1, 2, or 3 depending on contract", required: true },
      { id: "nist_800_171", name: "NIST SP 800-171 Assessment", description: "Self-assessment for protecting Controlled Unclassified Information (CUI)", required: false },
      { id: "sprs_score", name: "SPRS Score Documentation", description: "Supplier Performance Risk System score submission (required for some DoD contracts)", required: false },
      { id: "incident_response", name: "Incident Response Plan", description: "DFARS 252.204-7012 compliant incident reporting procedures", required: true },
      { id: "system_security_plan", name: "System Security Plan (SSP)", description: "Documentation of security controls for your systems", required: false },
    ],
  },
  {
    id: "compliance_legal",
    title: "6. Compliance & Legal Representations",
    description: "Legal compliance and eligibility certifications typically completed in SAM.gov",
    required: true,
    documents: [
      { id: "debarment_cert", name: "Debarment Certification", description: "FAR 52.209-5 - Certify not debarred, suspended, or ineligible", required: true },
      { id: "tax_compliance", name: "Tax Compliance", description: "FAR 52.209-5 - Certify no delinquent federal taxes", required: true },
      { id: "lobbying_cert", name: "Lobbying Certification", description: "Byrd Anti-Lobbying Amendment compliance certification", required: true },
      { id: "drug_free_cert", name: "Drug-Free Workplace", description: "FAR 52.223-6 Drug-Free Workplace certification", required: true },
      { id: "bidding_cert", name: "Bidding Certification", description: "Independent pricing and arm's length negotiations certification", required: true },
      { id: "contingent_fee", name: "Contingent Fee Disclosure", description: "FAR 52.203-5 - No contingent fee arrangements for procurement", required: true },
      { id: "gratuities_cert", name: "Gratuities Certification", description: "FAR 52.203-3 - No improper gratuities or kickbacks", required: true },
      { id: "organizational_conflict", name: "Organizational Conflict of Interest", description: "FAR 52.203-16 - Disclose any conflicts of interest", required: true },
    ],
  },
  {
    id: "trade_compliance",
    title: "7. Trade Compliance & Domestic Preference",
    description: "Domestic sourcing, country of origin, and trade agreement compliance",
    required: true,
    documents: [
      { id: "buy_american_cert", name: "Buy American Act Certification", description: "Domestic end products and construction materials compliance", required: true },
      { id: "trade_agreements", name: "Trade Agreements Act Certificate", description: "FAR 52.225-6 compliance for designated countries", required: true },
      { id: "berry_amendment", name: "Berry Amendment Certification", description: "Domestic specialty metals, food, textiles (if applicable to contract)", required: false },
      { id: "country_origin", name: "Country of Origin Documentation", description: "List of all end products with country of origin", required: true },
    ],
  },
  {
    id: "proposal_documents",
    title: "8. Proposal Documents (When Responding to RFPs)",
    description: "Structured proposal sections typically required when responding to federal solicitations",
    required: false,
    documents: [
      { id: "technical_proposal", name: "Technical Proposal", description: "Approach, methodology, understanding of requirements, staffing plan, deliverables", required: false },
      { id: "past_performance_ppq", name: "Past Performance / PPQ", description: "Project summaries, customer references, CPARS ratings - often as Past Performance Questionnaires", required: false },
      { id: "management_plan", name: "Management / Staffing Plan", description: "Organizational structure, key personnel resumes, transition plan, QA plan", required: false },
      { id: "pricing_proposal", name: "Pricing / Cost Proposal", description: "Cost breakdown, labor categories, indirect rates, pricing assumptions", required: false },
      { id: "key_personnel_letters", name: "Key Personnel Letters of Commitment", description: "Signed letters confirming availability of key staff for contract", required: false },
    ],
  },
  {
    id: "additional_documents",
    title: "9. Additional Documents Often Requested",
    description: "Specialized documents depending on the solicitation type",
    required: false,
    documents: [
      { id: "capability_statement", name: "Capability Statement", description: "One-page marketing document highlighting core competencies - critical for networking", required: false },
      { id: "subcontracting_plan", name: "Subcontracting Plan", description: "Required for large contracts to show small business subcontracting goals", required: false },
      { id: "quality_control_plan", name: "Quality Control Plan", description: "Processes for ensuring deliverable quality", required: false },
      { id: "transition_plan", name: "Transition Plan", description: "Plan for taking over from incumbent or transitioning out", required: false },
      { id: "security_plan", name: "Security Plan", description: "Personnel and facility security procedures", required: false },
      { id: "section_l_m_compliance", name: "Section L & M Compliance Matrix", description: "Mapping showing how proposal addresses all RFP requirements", required: false },
    ],
  },
  {
    id: "past_performance",
    title: "10. Past Performance References",
    description: "Relevant contract performance history to demonstrate capability",
    required: false,
    documents: [
      { id: "cpars_records", name: "CPARS Records", description: "Contractor Performance Assessment Reporting System ratings if available", required: false },
      { id: "past_perf_references", name: "Past Performance References", description: "3-5 references with contact information from similar projects", required: false },
      { id: "relevant_experience", name: "Relevant Experience Summary", description: "Similar projects completed in last 3 years with outcomes", required: false },
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
