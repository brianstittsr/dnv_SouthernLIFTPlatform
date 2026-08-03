"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  UserPlus,
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Upload,
  Download,
  Factory,
  Users,
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Award,
  Briefcase,
  FileDown,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { arrayUnion, collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import {
  COLLECTIONS,
  type SupplierReadinessStageId,
  type TBMNCSupplierDoc,
  type TeamMemberDoc,
} from "@/lib/schema";

// Supplier readiness stages based on typical OEM qualification process
const supplierStages = [
  { id: "registration", name: "Registration", color: "bg-gray-500", order: 1 },
  { id: "documentation", name: "Documentation Review", color: "bg-blue-500", order: 2 },
  { id: "assessment", name: "Capability Assessment", color: "bg-purple-500", order: 3 },
  { id: "quality", name: "Quality System Review", color: "bg-yellow-500", order: 4 },
  { id: "audit", name: "On-Site Audit", color: "bg-orange-500", order: 5 },
  { id: "corrective", name: "Corrective Actions", color: "bg-red-500", order: 6 },
  { id: "approved", name: "Approved Supplier", color: "bg-green-500", order: 7 },
];

// Deliverables required for supplier readiness
const deliverableCategories = [
  {
    id: "company-info",
    name: "Company Information",
    deliverables: [
      { id: "d1", name: "Company Profile & Overview", required: true },
      { id: "d2", name: "Organizational Chart", required: true },
      { id: "d3", name: "Financial Statements (3 years)", required: true },
      { id: "d4", name: "Business Continuity Plan", required: true },
    ],
  },
  {
    id: "quality",
    name: "Quality Management",
    deliverables: [
      { id: "d5", name: "ISO 9001 Certificate", required: true },
      { id: "d6", name: "IATF 16949 Certificate", required: true },
      { id: "d7", name: "Quality Manual", required: true },
      { id: "d8", name: "Control Plan Template", required: true },
      { id: "d9", name: "PPAP Documentation", required: true },
      { id: "d10", name: "Measurement System Analysis (MSA)", required: true },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing Capability",
    deliverables: [
      { id: "d11", name: "Process Flow Diagrams", required: true },
      { id: "d12", name: "Equipment List & Capacity", required: true },
      { id: "d13", name: "Facility Layout", required: true },
      { id: "d14", name: "Production Capacity Analysis", required: true },
    ],
  },
  {
    id: "environmental",
    name: "Environmental & Safety",
    deliverables: [
      { id: "d15", name: "ISO 14001 Certificate", required: false },
      { id: "d16", name: "Environmental Policy", required: true },
      { id: "d17", name: "Safety Program Documentation", required: true },
      { id: "d18", name: "OSHA Compliance Records", required: true },
    ],
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    deliverables: [
      { id: "d19", name: "Sub-Supplier List", required: true },
      { id: "d20", name: "Raw Material Specifications", required: true },
      { id: "d21", name: "Logistics & Shipping Capabilities", required: true },
    ],
  },
];

// Mock suppliers data

type TBMNCSupplier = Omit<TBMNCSupplierDoc, "id"> & { id: string };

export default function TBMNCSupplierReadinessPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<TBMNCSupplier | null>(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAssignAffiliateOpen, setIsAssignAffiliateOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("TBMNC Supplier Registration Form");
  const [emailMessage, setEmailMessage] = useState("Please find attached the TBMNC Supplier Registration Form. Complete this form and return it to begin the supplier qualification process.");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [suppliers, setSuppliers] = useState<TBMNCSupplier[]>([]);
  const [affiliates, setAffiliates] = useState<TeamMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const supplierSnap = await getDocs(collection(db, COLLECTIONS.TBMNC_SUPPLIERS));
        const memberSnap = await getDocs(collection(db, COLLECTIONS.TEAM_MEMBERS));

        const supplierRows: TBMNCSupplier[] = [];
        supplierSnap.forEach((d) => {
          supplierRows.push({ id: d.id, ...(d.data() as Omit<TBMNCSupplierDoc, "id">) });
        });

        const memberRows: TeamMemberDoc[] = [];
        memberSnap.forEach((d) => {
          memberRows.push({ id: d.id, ...(d.data() as Omit<TeamMemberDoc, "id">) } as TeamMemberDoc);
        });

        setSuppliers(supplierRows);
        setAffiliates(memberRows);
      } catch (error) {
        console.error("Error loading TBMNC data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate PDF of the Registration Wizard
  const generateRegistrationPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Create a printable HTML version
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <title>TBMNC Supplier Registration Form</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #C8A951; padding-bottom: 20px; }
    .logo { font-size: 24pt; font-weight: bold; color: #1a1a1a; }
    .logo-accent { color: #C8A951; }
    .subtitle { font-size: 10pt; color: #666; margin-top: 5px; }
    .title { font-size: 18pt; font-weight: bold; margin: 20px 0 10px; color: #1a1a1a; }
    .section { margin: 25px 0; page-break-inside: avoid; }
    .section-title { font-size: 14pt; font-weight: bold; color: #C8A951; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
    .field-row { display: flex; margin-bottom: 12px; }
    .field { flex: 1; margin-right: 15px; }
    .field:last-child { margin-right: 0; }
    .field-label { font-size: 9pt; font-weight: bold; color: #666; margin-bottom: 3px; }
    .field-input { border-bottom: 1px solid #999; min-height: 20px; padding: 3px 0; }
    .checkbox-group { display: flex; flex-wrap: wrap; }
    .checkbox-item { width: 50%; display: flex; align-items: center; margin-bottom: 8px; }
    .checkbox { width: 14px; height: 14px; border: 1px solid #666; margin-right: 8px; }
    .textarea { border: 1px solid #999; min-height: 60px; padding: 5px; margin-top: 5px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 9pt; color: #666; text-align: center; }
    .required { color: #c00; }
    .instructions { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">KDM &amp; Associates</div>
    <div class="subtitle">Toyota Battery Manufacturing North Carolina - Supplier Qualification Program</div>
  </div>
  
  <div class="title">Supplier Registration Form</div>
  
  <div class="instructions">
    <strong>Instructions:</strong> Complete all required fields (*) and return this form along with the required attachments to begin the supplier qualification process. For questions, contact your KDM & Associates representative.
  </div>

  <div class="section">
    <div class="section-title">1. Company Information</div>
    <div class="field-row">
      <div class="field"><div class="field-label">Company Name <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">DUNS number</div><div class="field-input"></div></div>
    </div>
    <div class="field-row">
      <div class="field"><div class="field-label">Street Address <span class="required">*</span></div><div class="field-input"></div></div>
    </div>
    <div class="field-row">
      <div class="field"><div class="field-label">City <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">State <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">ZIP Code <span class="required">*</span></div><div class="field-input"></div></div>
    </div>
    <div class="field-row">
      <div class="field"><div class="field-label">Primary Contact Name <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">Title</div><div class="field-input"></div></div>
    </div>
    <div class="field-row">
      <div class="field"><div class="field-label">Contact Email <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">Contact Phone <span class="required">*</span></div><div class="field-input"></div></div>
    </div>
    <div class="field-row">
      <div class="field"><div class="field-label">Website</div><div class="field-input"></div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Manufacturing Capabilities</div>
    <div class="field-label">Primary Manufacturing Processes (check all that apply):</div>
    <div class="checkbox-group">
      <div class="checkbox-item"><div class="checkbox"></div>CNC Machining</div>
      <div class="checkbox-item"><div class="checkbox"></div>Metal Stamping</div>
      <div class="checkbox-item"><div class="checkbox"></div>Injection Molding</div>
      <div class="checkbox-item"><div class="checkbox"></div>Die Casting</div>
      <div class="checkbox-item"><div class="checkbox"></div>Welding</div>
      <div class="checkbox-item"><div class="checkbox"></div>Assembly</div>
      <div class="checkbox-item"><div class="checkbox"></div>Electronics/PCB</div>
      <div class="checkbox-item"><div class="checkbox"></div>Battery Components</div>
      <div class="checkbox-item"><div class="checkbox"></div>Wire Harness</div>
      <div class="checkbox-item"><div class="checkbox"></div>Plastics</div>
      <div class="checkbox-item"><div class="checkbox"></div>Coatings/Finishing</div>
      <div class="checkbox-item"><div class="checkbox"></div>Testing Services</div>
    </div>
    <div class="field-row" style="margin-top: 15px;">
      <div class="field"><div class="field-label">Annual Revenue Range <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">number of Employees <span class="required">*</span></div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">Facility Size (sq ft)</div><div class="field-input"></div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. Quality & Certifications</div>
    <div class="field-label">Current Certifications (check all that apply):</div>
    <div class="checkbox-group">
      <div class="checkbox-item"><div class="checkbox"></div>ISO 9001</div>
      <div class="checkbox-item"><div class="checkbox"></div>IATF 16949</div>
      <div class="checkbox-item"><div class="checkbox"></div>ISO 14001</div>
      <div class="checkbox-item"><div class="checkbox"></div>ISO 45001</div>
      <div class="checkbox-item"><div class="checkbox"></div>AS9100</div>
      <div class="checkbox-item"><div class="checkbox"></div>ISO 13485</div>
      <div class="checkbox-item"><div class="checkbox"></div>NADCAP</div>
      <div class="checkbox-item"><div class="checkbox"></div>Other: ___________</div>
    </div>
    <div class="field-row" style="margin-top: 15px;">
      <div class="field"><div class="field-label">PPAP Experience Level</div><div class="field-input"></div></div>
    </div>
    <div class="field-label" style="margin-top: 15px;">Quality Management System Description:</div>
    <div class="textarea"></div>
    <div class="field-label" style="margin-top: 15px;">Current/Past Automotive OEM Customers:</div>
    <div class="textarea"></div>
  </div>

  <div class="section">
    <div class="section-title">4. Required Attachments</div>
    <div class="checkbox-group">
      <div class="checkbox-item"><div class="checkbox"></div>Company Profile/Brochure <span class="required">*</span></div>
      <div class="checkbox-item"><div class="checkbox"></div>ISO 9001 Certificate <span class="required">*</span></div>
      <div class="checkbox-item"><div class="checkbox"></div>IATF 16949 Certificate (if applicable)</div>
      <div class="checkbox-item"><div class="checkbox"></div>Financial Statements (3 years) <span class="required">*</span></div>
      <div class="checkbox-item"><div class="checkbox"></div>Facility Photos</div>
      <div class="checkbox-item"><div class="checkbox"></div>Equipment List</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">5. Certification</div>
    <p style="font-size: 10pt;">I certify that all information provided is accurate and complete to the best of my knowledge. I understand that false or misleading information may result in disqualification from the supplier qualification process.</p>
    <div class="field-row" style="margin-top: 20px;">
      <div class="field"><div class="field-label">Authorized Signature</div><div class="field-input" style="min-height: 30px;"></div></div>
      <div class="field"><div class="field-label">Date</div><div class="field-input"></div></div>
    </div>
    <div class="field-row">
      <div class="field"><div class="field-label">Printed Name</div><div class="field-input"></div></div>
      <div class="field"><div class="field-label">Title</div><div class="field-input"></div></div>
    </div>
  </div>

  <div class="footer">
    <p><strong>KDM & Associates</strong> | Toyota Battery Manufacturing NC Supplier Qualification Program</p>
    <p>For questions, contact your KDM & Associates representative or email support@kdm-assoc.com</p>
    <p>Form Version 1.0 | Generated ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
      `;

      // Open print dialog with the PDF content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Send email with registration form
  const sendRegistrationEmail = async () => {
    if (!emailTo) {
      alert('Please enter an email address');
      return;
    }
    setIsSendingEmail(true);
    try {
      // Create mailto link with pre-filled content
      const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage + '\n\nPlease download and complete the attached TBMNC Supplier Registration Form.')}`;
      window.open(mailtoLink, '_blank');
      setIsEmailDialogOpen(false);
      setEmailTo('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error opening email client. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredSuppliers = useMemo(() => suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = !stageFilter || supplier.stage === stageFilter;
    return matchesSearch && matchesStage;
  }), [suppliers, searchQuery, stageFilter]);

  const getStageInfo = (stageId: string) => {
    return supplierStages.find((s) => s.id === stageId) || supplierStages[0];
  };

  const getStageProgress = (stageId: string) => {
    const stage = supplierStages.find((s) => s.id === stageId);
    if (!stage) return 0;
    return Math.round((stage.order / supplierStages.length) * 100);
  };

  const affiliatesForAssignment = useMemo(
    () => affiliates.filter((m) => m.role === "affiliate" && m.status === "active"),
    [affiliates]
  );

  const affiliateNameById = useMemo(() => {
    const map = new Map<string, string>();
    affiliatesForAssignment.forEach((m) => map.set(m.id, `${m.firstName} ${m.lastName}`.trim()));
    return map;
  }, [affiliatesForAssignment]);

  // Stats
  const totalSuppliers = suppliers.length;
  const approvedSuppliers = suppliers.filter((s) => s.stage === "approved").length;
  const inProgressSuppliers = suppliers.filter((s) => !(["approved", "registration"] as SupplierReadinessStageId[]).includes(s.stage)).length;
  const needsAttention = suppliers.filter((s) => s.assignedAffiliateIds.length === 0 && s.stage !== "approved").length;

  const formatMaybeTimestamp = (ts?: Timestamp) => {
    if (!ts) return "";
    return ts.toDate().toLocaleDateString();
  };

  const assignAffiliateToSelectedSupplier = async (affiliateId: string) => {
    if (!db || !selectedSupplier) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.TBMNC_SUPPLIERS, selectedSupplier.id), {
        assignedAffiliateIds: arrayUnion(affiliateId),
        updatedAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
      });

      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === selectedSupplier.id
            ? {
                ...s,
                assignedAffiliateIds: s.assignedAffiliateIds.includes(affiliateId)
                  ? s.assignedAffiliateIds
                  : [...s.assignedAffiliateIds, affiliateId],
                updatedAt: Timestamp.now(),
                lastActivity: Timestamp.now(),
              }
            : s
        )
      );

      setSelectedSupplier((prev) => {
        if (!prev) return prev;
        if (prev.id !== selectedSupplier.id) return prev;
        return {
          ...prev,
          assignedAffiliateIds: prev.assignedAffiliateIds.includes(affiliateId)
            ? prev.assignedAffiliateIds
            : [...prev.assignedAffiliateIds, affiliateId],
          updatedAt: Timestamp.now(),
          lastActivity: Timestamp.now(),
        };
      });

      setIsAssignAffiliateOpen(false);
    } catch (error) {
      console.error("Error assigning affiliate:", error);
      alert("Error assigning affiliate. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-9xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span>Initiatives</span>
            <ChevronRight className="h-4 w-4" />
            <span>TBMNC</span>
          </div>
          <h1 className="text-3xl font-bold">TBMNC Supplier Readiness</h1>
          <p className="text-muted-foreground">
            Toyota Battery Manufacturing North Carolina - Supplier Qualification Program
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsWizardOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Registration Wizard
          </Button>
          <Button variant="outline" onClick={generateRegistrationPdf} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Email Form
          </Button>
          <Button onClick={() => setIsAddSupplierOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">In qualification pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loading ? "—" : approvedSuppliers}</div>
            <p className="text-xs text-muted-foreground">Qualified suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loading ? "—" : inProgressSuppliers}</div>
            <p className="text-xs text-muted-foreground">Active qualifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{loading ? "—" : needsAttention}</div>
            <p className="text-xs text-muted-foreground">Unassigned suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Pipeline</CardTitle>
          <CardDescription>Visual overview of suppliers by qualification stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {supplierStages.map((stage) => {
              const count = suppliers.filter((s) => s.stage === stage.id).length;
              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex-1 min-w-[140px] p-4 rounded-lg border-2 cursor-pointer transition-all",
                    stageFilter === stage.id ? "border-primary" : "border-transparent",
                    "hover:border-primary/50"
                  )}
                  onClick={() => setStageFilter(stageFilter === stage.id ? null : stage.id)}
                >
                  <div className={cn("w-3 h-3 rounded-full mb-2", stage.color)} />
                  <p className="font-medium text-sm">{stage.name}</p>
                  <p className="text-2xl font-bold">{loading ? "—" : count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">Supplier Tracker</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Assignments</TabsTrigger>
        </TabsList>

        {/* Supplier Tracker Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={stageFilter || "all"}
              onValueChange={(v) => setStageFilter(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {supplierStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Suppliers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assigned Affiliates</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => {
                    const stage = getStageInfo(supplier.stage);
                    return (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Factory className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{supplier.companyName}</p>
                              <p className="text-sm text-muted-foreground">
                                {supplier.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-white", stage.color)}>
                            {stage.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{supplier.progress}%</span>
                              <span className="text-muted-foreground">
                                {supplier.deliverables.completed}/{supplier.deliverables.total}
                              </span>
                            </div>
                            <Progress value={supplier.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.assignedAffiliateIds.length > 0 ? (
                            <div className="flex -space-x-2">
                              {supplier.assignedAffiliateIds
                                .map((id) => affiliateNameById.get(id))
                                .filter((n): n is string => !!n)
                                .slice(0, 3)
                                .map((name, i) => (
                                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {name.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {supplier.assignedAffiliateIds.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                  +{supplier.assignedAffiliateIds.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatMaybeTimestamp(supplier.lastActivity)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedSupplier(supplier)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setIsAssignAffiliateOpen(true);
                                }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign Affiliate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileCheck className="mr-2 h-4 w-4" />
                                Review Deliverables
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-6">
          {deliverableCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{deliverable.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {deliverable.required ? "Required" : "Optional"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deliverable.required && (
                          <Badge variant="secondary">Required</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Affiliate Assignments Tab */}
        <TabsContent value="affiliates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate-Supplier Assignments</CardTitle>
              <CardDescription>
                Match affiliates with suppliers based on expertise requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Assigned Suppliers</TableHead>
                    <TableHead>Pending Deliverables</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliatesForAssignment.map((affiliate) => {
                    const assignedSuppliers = suppliers.filter((s) =>
                      s.assignedAffiliateIds.includes(affiliate.id)
                    );
                    return (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {`${affiliate.firstName} ${affiliate.lastName}`
                                  .trim()
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{`${affiliate.firstName} ${affiliate.lastName}`.trim()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {affiliate.expertise}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignedSuppliers.length}</TableCell>
                        <TableCell>
                          {assignedSuppliers.reduce(
                            (sum, s) => sum + (s.deliverables.total - s.deliverables.completed),
                            0
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Details Dialog */}
      <Dialog open={!!selectedSupplier && !isAssignAffiliateOpen} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-5xl">
          {selectedSupplier && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSupplier.companyName}</DialogTitle>
                <DialogDescription>Supplier qualification details</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Contact</Label>
                    <p className="font-medium">{selectedSupplier.contactName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Stage</Label>
                    <Badge className={cn("text-white", getStageInfo(selectedSupplier.stage).color)}>
                      {getStageInfo(selectedSupplier.stage).name}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedSupplier.contactEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="text-sm">{selectedSupplier.contactPhone}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="text-sm">{selectedSupplier.location}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="text-sm">{selectedSupplier.website}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Progress</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{selectedSupplier.progress}% Complete</span>
                      <span>
                        {selectedSupplier.deliverables.completed}/{selectedSupplier.deliverables.total} Deliverables
                      </span>
                    </div>
                    <Progress value={selectedSupplier.progress} className="h-3" />
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Capabilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSupplier.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSupplier.certifications.length > 0 ? (
                      selectedSupplier.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          <Award className="mr-1 h-3 w-3" />
                          {cert}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No certifications yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Assigned Affiliates</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSupplier.assignedAffiliateIds.length > 0 ? (
                      selectedSupplier.assignedAffiliateIds
                        .map((id) => ({ id, name: affiliateNameById.get(id) }))
                        .filter((a): a is { id: string; name: string } => !!a.name)
                        .map(({ id, name }) => (
                          <div key={id} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{name}</span>
                          </div>
                        ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No affiliates assigned</span>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSupplier(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsAssignAffiliateOpen(true);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Affiliate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Affiliate Dialog */}
      <Dialog open={isAssignAffiliateOpen} onOpenChange={setIsAssignAffiliateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Affiliate</DialogTitle>
            <DialogDescription>
              Select an affiliate to assign to {selectedSupplier?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {affiliatesForAssignment.map((affiliate) => (
              <div
                key={affiliate.id}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50",
                  ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {`${affiliate.firstName} ${affiliate.lastName}`
                        .trim()
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{`${affiliate.firstName} ${affiliate.lastName}`.trim()}</p>
                    <Badge variant="outline" className="text-xs">
                      {affiliate.expertise}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" onClick={() => assignAffiliateToSelectedSupplier(affiliate.id)}>
                  Assign
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignAffiliateOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>TBMNC Supplier Registration Wizard</DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 5 - Complete all steps to register as a potential supplier
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[
              { step: 1, title: "Company Info" },
              { step: 2, title: "Capabilities" },
              { step: 3, title: "Quality" },
              { step: 4, title: "Attachments" },
              { step: 5, title: "Review" },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      wizardStep >= item.step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {wizardStep > item.step ? <CheckCircle className="h-5 w-5" /> : item.step}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">{item.title}</span>
                </div>
                {index < 4 && (
                  <div
                    className={cn(
                      "w-16 h-1 mx-2",
                      wizardStep > item.step ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Company Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input placeholder="Enter company name" />
                  </div>
                  <div className="space-y-2">
                    <Label>DUNS number</Label>
                    <Input placeholder="9-digit DUNS number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input placeholder="Street address" />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input placeholder="State" />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code *</Label>
                    <Input placeholder="ZIP code" />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Contact Name *</Label>
                    <Input placeholder="Contact name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email *</Label>
                    <Input type="email" placeholder="email@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone *</Label>
                    <Input type="tel" placeholder="(xxx) xxx-xxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="www.company.com" />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Manufacturing Capabilities</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Manufacturing Processes *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "CNC Machining",
                        "Metal Stamping",
                        "Injection Molding",
                        "Die Casting",
                        "Welding",
                        "Assembly",
                        "Electronics",
                        "Battery Components",
                        "Wire Harness",
                        "Plastics",
                        "Coatings",
                        "Testing",
                      ].map((process) => (
                        <div key={process} className="flex items-center gap-2">
                          <input type="checkbox" id={process} className="rounded" />
                          <Label htmlFor={process} className="font-normal">
                            {process}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Revenue Range *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-1m">Under $1M</SelectItem>
                        <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                        <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                        <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                        <SelectItem value="over-100m">Over $100M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>number of Employees *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50</SelectItem>
                        <SelectItem value="51-100">51-100</SelectItem>
                        <SelectItem value="101-250">101-250</SelectItem>
                        <SelectItem value="251-500">251-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Facility Size (sq ft)</Label>
                    <Input placeholder="e.g., 50,000" />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Quality & Certifications</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Certifications</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "ISO 9001",
                        "IATF 16949",
                        "ISO 14001",
                        "ISO 45001",
                        "AS9100",
                        "ISO 13485",
                        "NADCAP",
                        "Other",
                      ].map((cert) => (
                        <div key={cert} className="flex items-center gap-2">
                          <input type="checkbox" id={cert} className="rounded" />
                          <Label htmlFor={cert} className="font-normal">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Quality Management System</Label>
                    <Textarea placeholder="Describe your quality management system..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Automotive Customers</Label>
                    <Textarea placeholder="List current or past automotive OEM customers..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>PPAP Experience Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Experience</SelectItem>
                        <SelectItem value="basic">Basic (Level 1-2)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Level 3)</SelectItem>
                        <SelectItem value="advanced">Advanced (Level 4-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Company Attachments</h3>
                <p className="text-sm text-muted-foreground">
                  Upload required documents to support your registration
                </p>
                <div className="space-y-4">
                  {[
                    { name: "Company Profile/Brochure", required: true },
                    { name: "ISO 9001 Certificate", required: true },
                    { name: "IATF 16949 Certificate", required: false },
                    { name: "Financial Statements", required: true },
                    { name: "Facility Photos", required: false },
                    { name: "Equipment List", required: false },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-4 border rounded-lg border-dashed"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {doc.name}
                            {doc.required && <span className="text-destructive ml-1">*</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">PDF, DOC, or image files</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Review & Submit</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Please review your registration information before submitting. Once submitted,
                    a KDM & Associates representative will review your application and contact you
                    within 3-5 business days.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Company Information - Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Manufacturing Capabilities - Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Quality & Certifications - Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Attachments - 2 of 3 required documents uploaded</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="terms" className="rounded" />
                  <Label htmlFor="terms" className="font-normal text-sm">
                    I certify that all information provided is accurate and complete to the best of my knowledge.
                  </Label>
                </div>
              </div>
            )}
          </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={() => (wizardStep === 1 ? setIsWizardOpen(false) : setWizardStep(wizardStep - 1))}
            >
              {wizardStep === 1 ? "Cancel" : "Back"}
            </Button>
            {wizardStep < 5 ? (
              <Button onClick={() => setWizardStep(wizardStep + 1)}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setIsWizardOpen(false)}>
                Submit Registration
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Manually add a supplier to the qualification pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input placeholder="Enter company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name *</Label>
                <Input placeholder="Primary contact" />
              </div>
              <div className="space-y-2">
                <Label>Contact Email *</Label>
                <Input type="email" placeholder="email@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="(xxx) xxx-xxxx" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="City, State" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Initial Stage</Label>
              <Select defaultValue="registration">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supplierStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddSupplierOpen(false)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Registration Form Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Registration Form</DialogTitle>
            <DialogDescription>
              Send the TBMNC Supplier Registration Form to a potential supplier
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Email *</Label>
              <Input
                type="email"
                placeholder="supplier@company.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This will open your default email client with the message pre-filled. 
                You can then attach the PDF form before sending.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendRegistrationEmail} disabled={isSendingEmail || !emailTo}>
              {isSendingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Open Email Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
