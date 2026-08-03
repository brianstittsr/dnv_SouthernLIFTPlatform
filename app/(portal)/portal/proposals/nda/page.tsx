"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Sparkles,
  Download,
  Eye,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Archive,
  Copy,
  Mail,
  FileSignature,
  PenTool,
  Building2,
  User,
  Calendar,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Shield,
  ArrowLeft,
  GripVertical,
  Settings,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type NDATemplate,
  type NDADocument,
  type NDASection,
  type NDAStatus,
  type NDATemplateType,
  NDA_TEMPLATE_TYPES,
  NDA_STATUSES,
} from "@/lib/types/proposal";

// CEO Information for countersigning
const CEO_INFO = {
  name: "Nelinia Varenas",
  title: "Chief Executive Officer",
  company: "KDM & Associates",
  email: "nvarenas@kdm-assoc.com",
};

// Default NDA Template Sections
const DEFAULT_NDA_SECTIONS: NDASection[] = [
  {
    id: "1",
    title: "Parties",
    content: `This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

**Disclosing Party:** {{disclosing_party_name}}, {{disclosing_party_company}}
**Receiving Party:** {{receiving_party_name}}, {{receiving_party_company}}`,
    order: 1,
    isEditable: true,
    isRequired: true,
    placeholders: [
      { id: "1", key: "effective_date", label: "Effective Date", type: "date", required: true },
      { id: "2", key: "disclosing_party_name", label: "Disclosing Party Name", type: "name", required: true },
      { id: "3", key: "disclosing_party_company", label: "Disclosing Party Company", type: "company", required: true },
      { id: "4", key: "receiving_party_name", label: "Receiving Party Name", type: "name", required: true },
      { id: "5", key: "receiving_party_company", label: "Receiving Party Company", type: "company", required: true },
    ],
  },
  {
    id: "2",
    title: "Definition of Confidential Information",
    content: `"Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged. This includes, but is not limited to:

- Technical data, trade secrets, know-how
- Research, product plans, products, services
- Customer lists and customer information
- Markets, software, developments, inventions
- Processes, designs, drawings, engineering
- Hardware configuration information, marketing
- Finances, or other business information

Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of the Receiving Party
(b) Was rightfully in the Receiving Party's possession prior to disclosure
(c) Is independently developed by the Receiving Party without use of Confidential Information
(d) Is rightfully obtained from a third party without restriction`,
    order: 2,
    isEditable: true,
    isRequired: true,
  },
  {
    id: "3",
    title: "Obligations of Receiving Party",
    content: `The Receiving Party agrees to:

1. Hold and maintain the Confidential Information in strict confidence
2. Not disclose the Confidential Information to any third parties without prior written consent
3. Not use the Confidential Information for any purpose except as authorized by this Agreement
4. Protect the Confidential Information using the same degree of care used to protect its own confidential information, but in no event less than reasonable care
5. Limit access to Confidential Information to employees, agents, or representatives who have a need to know
6. Ensure that all persons with access to Confidential Information are bound by confidentiality obligations at least as restrictive as those contained herein`,
    order: 3,
    isEditable: true,
    isRequired: true,
  },
  {
    id: "4",
    title: "Term and Termination",
    content: `This Agreement shall remain in effect for a period of {{term_years}} years from the Effective Date, unless earlier terminated by either party upon thirty (30) days written notice.

The obligations of confidentiality shall survive termination of this Agreement for a period of {{survival_years}} years.

Upon termination or expiration of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.`,
    order: 4,
    isEditable: true,
    isRequired: true,
    placeholders: [
      { id: "6", key: "term_years", label: "Term (Years)", type: "text", required: true, defaultValue: "2" },
      { id: "7", key: "survival_years", label: "Survival Period (Years)", type: "text", required: true, defaultValue: "5" },
    ],
  },
  {
    id: "5",
    title: "Remedies",
    content: `The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.`,
    order: 5,
    isEditable: true,
    isRequired: true,
  },
  {
    id: "6",
    title: "General Provisions",
    content: `**Governing Law:** This Agreement shall be governed by and construed in accordance with the laws of the State of {{governing_state}}.

**Entire Agreement:** This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof.

**Amendment:** This Agreement may not be amended except by a written instrument signed by both parties.

**Waiver:** No waiver of any provision of this Agreement shall be effective unless in writing and signed by the waiving party.

**Severability:** If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
    order: 6,
    isEditable: true,
    isRequired: true,
    placeholders: [
      { id: "8", key: "governing_state", label: "Governing State", type: "text", required: true, defaultValue: "North Carolina" },
    ],
  },
  {
    id: "7",
    title: "Signatures",
    content: `IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

**DISCLOSING PARTY:**

Signature: _________________________
Name: {{disclosing_party_name}}
Title: {{disclosing_party_title}}
Company: {{disclosing_party_company}}
Date: {{disclosing_signature_date}}

**RECEIVING PARTY:**

Signature: _________________________
Name: {{receiving_party_name}}
Title: {{receiving_party_title}}
Company: {{receiving_party_company}}
Date: {{receiving_signature_date}}`,
    order: 7,
    isEditable: false,
    isRequired: true,
    placeholders: [
      { id: "9", key: "disclosing_party_title", label: "Disclosing Party Title", type: "text", required: false },
      { id: "10", key: "receiving_party_title", label: "Receiving Party Title", type: "text", required: false },
      { id: "11", key: "disclosing_signature_date", label: "Disclosing Signature Date", type: "date", required: true },
      { id: "12", key: "receiving_signature_date", label: "Receiving Signature Date", type: "date", required: true },
    ],
  },
];

// Mock data for demonstration
const MOCK_TEMPLATES: NDATemplate[] = [
  {
    id: "1",
    name: "Standard Mutual NDA",
    type: "mutual",
    description: "Standard mutual non-disclosure agreement for business partnerships",
    sections: DEFAULT_NDA_SECTIONS,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    isDefault: true,
    tags: ["mutual", "standard", "partnership"],
  },
  {
    id: "2",
    name: "Contractor NDA",
    type: "contractor",
    description: "NDA for independent contractors and consultants",
    sections: DEFAULT_NDA_SECTIONS,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    isDefault: false,
    tags: ["contractor", "consultant", "freelance"],
  },
];

const MOCK_DOCUMENTS: NDADocument[] = [
  {
    id: "1",
    templateId: "1",
    templateName: "Standard Mutual NDA",
    name: "NDA - Acme Corporation",
    status: "completed",
    disclosingParty: {
      name: "Nelinia Varenas",
      title: "CEO",
      company: "KDM & Associates",
      email: "nvarenas@kdm-assoc.com",
    },
    receivingParty: {
      name: "John Smith",
      title: "VP of Operations",
      company: "Acme Corporation",
      email: "jsmith@acme.com",
    },
    sections: DEFAULT_NDA_SECTIONS,
    effectiveDate: "2024-01-20",
    signerSignature: {
      signedBy: "John Smith",
      signedAt: new Date("2024-01-20"),
      timestamp: "2024-01-20T14:30:00Z",
    },
    countersignature: {
      signedBy: "Nelinia Varenas",
      signedAt: new Date("2024-01-21"),
      timestamp: "2024-01-21T09:15:00Z",
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-21"),
    signedAt: new Date("2024-01-20"),
    countersignedAt: new Date("2024-01-21"),
    finalPdfUrl: "/documents/nda-acme-signed.pdf",
  },
  {
    id: "2",
    templateId: "1",
    templateName: "Standard Mutual NDA",
    name: "NDA - TechStart Inc",
    status: "pending_signature",
    disclosingParty: {
      name: "Nelinia Varenas",
      title: "CEO",
      company: "KDM & Associates",
      email: "nvarenas@kdm-assoc.com",
    },
    receivingParty: {
      name: "Sarah Johnson",
      title: "CTO",
      company: "TechStart Inc",
      email: "sjohnson@techstart.com",
    },
    sections: DEFAULT_NDA_SECTIONS,
    effectiveDate: "2024-12-15",
    publicAccessToken: "abc123xyz",
    publicSigningUrl: "/sign/nda/abc123xyz",
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-10"),
    sentAt: new Date("2024-12-10"),
  },
  {
    id: "3",
    templateId: "2",
    templateName: "Contractor NDA",
    name: "NDA - Freelance Developer",
    status: "draft",
    disclosingParty: {
      name: "Nelinia Varenas",
      title: "CEO",
      company: "KDM & Associates",
      email: "nvarenas@kdm-assoc.com",
    },
    receivingParty: {
      name: "",
      company: "",
      email: "",
    },
    sections: DEFAULT_NDA_SECTIONS,
    effectiveDate: "",
    createdAt: new Date("2024-12-18"),
    updatedAt: new Date("2024-12-18"),
  },
];

export default function NDAManagementPage() {
  const [activeTab, setActiveTab] = useState("documents");
  const [templates, setTemplates] = useState<NDATemplate[]>(MOCK_TEMPLATES);
  const [documents, setDocuments] = useState<NDADocument[]>(MOCK_DOCUMENTS);
  const [selectedDocument, setSelectedDocument] = useState<NDADocument | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NDATemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [showTemplateUploadDialog, setShowTemplateUploadDialog] = useState(false);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCountersignDialog, setShowCountersignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<NDADocument | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [showDeleteTemplateDialog, setShowDeleteTemplateDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<NDATemplate | null>(null);
  
  // New document form state
  const [newDocumentData, setNewDocumentData] = useState({
    templateId: "",
    name: "",
    receivingPartyName: "",
    receivingPartyTitle: "",
    receivingPartyCompany: "",
    receivingPartyEmail: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });
  
  // Template upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [newTemplateData, setNewTemplateData] = useState({
    name: "",
    type: "mutual" as NDATemplateType,
    description: "",
    tags: "",
  });

  // Stats
  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === "draft").length,
    pending: documents.filter(d => d.status === "pending_signature" || d.status === "pending_countersign").length,
    completed: documents.filter(d => d.status === "completed").length,
  };

  const getStatusBadge = (status: NDAStatus) => {
    const statusConfig = NDA_STATUSES.find(s => s.value === status);
    const colorMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-700",
      yellow: "bg-yellow-100 text-yellow-700",
      orange: "bg-orange-100 text-orange-700",
      green: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700",
      red: "bg-red-100 text-red-700",
    };
    return (
      <Badge className={cn("font-medium", colorMap[statusConfig?.color || "gray"])}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleCreateDocument = () => {
    const template = templates.find(t => t.id === newDocumentData.templateId);
    if (!template) return;

    const newDoc: NDADocument = {
      id: Date.now().toString(),
      templateId: template.id,
      templateName: template.name,
      name: newDocumentData.name || `NDA - ${newDocumentData.receivingPartyCompany}`,
      status: "draft",
      disclosingParty: {
        name: CEO_INFO.name,
        title: CEO_INFO.title,
        company: CEO_INFO.company,
        email: CEO_INFO.email,
      },
      receivingParty: {
        name: newDocumentData.receivingPartyName,
        title: newDocumentData.receivingPartyTitle,
        company: newDocumentData.receivingPartyCompany,
        email: newDocumentData.receivingPartyEmail,
      },
      sections: [...template.sections],
      effectiveDate: newDocumentData.effectiveDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDocuments(prev => [newDoc, ...prev]);
    setShowNewDocumentDialog(false);
    setNewDocumentData({
      templateId: "",
      name: "",
      receivingPartyName: "",
      receivingPartyTitle: "",
      receivingPartyCompany: "",
      receivingPartyEmail: "",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
    
    // Open editor for the new document
    setSelectedDocument(newDoc);
    setShowDocumentEditor(true);
  };

  const handleSendForSignature = (doc: NDADocument) => {
    const token = Math.random().toString(36).substring(2, 15);
    const updatedDoc: NDADocument = {
      ...doc,
      status: "pending_signature",
      publicAccessToken: token,
      publicSigningUrl: `/sign/nda/${token}`,
      sentAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));
    setShowSendDialog(false);
    setSelectedDocument(null);
    
    // In production, this would send an email
    alert(`NDA sent to ${doc.receivingParty.email}!\n\nSigning URL: ${window.location.origin}/sign/nda/${token}`);
  };

  const handleCountersign = (doc: NDADocument) => {
    const updatedDoc: NDADocument = {
      ...doc,
      status: "completed",
      countersignature: {
        signedBy: CEO_INFO.name,
        signedAt: new Date(),
        timestamp: new Date().toISOString(),
      },
      countersignedAt: new Date(),
      updatedAt: new Date(),
      finalPdfUrl: `/documents/nda-${doc.id}-signed.pdf`,
    };
    
    setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));
    setShowCountersignDialog(false);
    setSelectedDocument(null);
    
    // In production, this would generate PDF and send email
    alert(`NDA countersigned by ${CEO_INFO.name}!\n\nFinal PDF will be emailed to ${doc.receivingParty.email}`);
  };

  const handleDeleteDocument = () => {
    if (!documentToDelete) return;
    setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
    setDocumentToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleArchiveDocument = (doc: NDADocument) => {
    const updatedDoc: NDADocument = {
      ...doc,
      status: "archived",
      archivedAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));
  };

  const handleUploadTemplate = () => {
    if (!uploadedFile) return;
    
    const newTemplate: NDATemplate = {
      id: Date.now().toString(),
      name: newTemplateData.name,
      type: newTemplateData.type,
      description: newTemplateData.description,
      sections: DEFAULT_NDA_SECTIONS, // In production, parse from uploaded file
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newTemplateData.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setShowTemplateUploadDialog(false);
    setUploadedFile(null);
    setNewTemplateData({
      name: "",
      type: "mutual",
      description: "",
      tags: "",
    });
  };

  const copySigningLink = (doc: NDADocument) => {
    if (doc.publicSigningUrl) {
      navigator.clipboard.writeText(`${window.location.origin}${doc.publicSigningUrl}`);
      alert("Signing link copied to clipboard!");
    }
  };

  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
    setTemplateToDelete(null);
    setShowDeleteTemplateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/portal/proposals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              NDA Management
            </h1>
            <p className="text-muted-foreground">
              Create, send, and manage Non-Disclosure Agreements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Template
          </Button>
          <Button onClick={() => setShowNewDocumentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New NDA
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total NDAs</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-3xl font-bold">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Signature</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Your NDAs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your NDAs</CardTitle>
              <CardDescription>View, download, delete, or archive NDA documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Receiving Party</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.receivingParty.name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{doc.receivingParty.company || "Not specified"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{doc.templateName}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>{doc.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedDocument(doc);
                              setShowDocumentEditor(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View / Edit
                            </DropdownMenuItem>
                            {doc.status === "draft" && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedDocument(doc);
                                setShowSendDialog(true);
                              }}>
                                <Send className="mr-2 h-4 w-4" />
                                Send for Signature
                              </DropdownMenuItem>
                            )}
                            {doc.status === "pending_signature" && (
                              <DropdownMenuItem onClick={() => copySigningLink(doc)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Signing Link
                              </DropdownMenuItem>
                            )}
                            {doc.status === "pending_countersign" && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedDocument(doc);
                                setShowCountersignDialog(true);
                              }}>
                                <PenTool className="mr-2 h-4 w-4" />
                                Countersign (CEO)
                              </DropdownMenuItem>
                            )}
                            {doc.finalPdfUrl && (
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {doc.status !== "archived" && (
                              <DropdownMenuItem onClick={() => handleArchiveDocument(doc)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDocumentToDelete(doc);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No NDA documents yet. Click &quot;New NDA&quot; to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className={cn(template.isDefault && "border-primary")}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {NDA_TEMPLATE_TYPES.find(t => t.value === template.type)?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {template.sections.length} sections
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplatePreview(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewDocumentData(prev => ({ ...prev, templateId: template.id }));
                          setShowNewDocumentDialog(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                      {!template.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setTemplateToDelete(template);
                            setShowDeleteTemplateDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pending Actions Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {/* Pending Signatures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Awaiting External Signature
                </CardTitle>
                <CardDescription>NDAs sent out waiting for the receiving party to sign</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.filter(d => d.status === "pending_signature").length > 0 ? (
                  <div className="space-y-3">
                    {documents.filter(d => d.status === "pending_signature").map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Mail className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Sent to {doc.receivingParty.email} on {doc.sentAt?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copySigningLink(doc)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No NDAs awaiting external signature</p>
                )}
              </CardContent>
            </Card>

            {/* Pending Countersignatures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-orange-500" />
                  Awaiting CEO Countersignature
                </CardTitle>
                <CardDescription>NDAs signed by the receiving party, ready for {CEO_INFO.name} to countersign</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.filter(d => d.status === "pending_countersign").length > 0 ? (
                  <div className="space-y-3">
                    {documents.filter(d => d.status === "pending_countersign").map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <FileSignature className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Signed by {doc.signerSignature?.signedBy} on {doc.signerSignature?.signedAt?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button onClick={() => {
                          setSelectedDocument(doc);
                          setShowCountersignDialog(true);
                        }}>
                          <PenTool className="mr-2 h-4 w-4" />
                          Countersign Now
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No NDAs awaiting countersignature</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Document Dialog */}
      <Dialog open={showNewDocumentDialog} onOpenChange={setShowNewDocumentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New NDA</DialogTitle>
            <DialogDescription>
              Select a template and enter the receiving party details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={newDocumentData.templateId}
                onValueChange={(value) => setNewDocumentData(prev => ({ ...prev, templateId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Document Name (Optional)</Label>
              <Input
                placeholder="e.g., NDA - Company Name"
                value={newDocumentData.name}
                onChange={(e) => setNewDocumentData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Receiving Party Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="John Smith"
                    value={newDocumentData.receivingPartyName}
                    onChange={(e) => setNewDocumentData(prev => ({ ...prev, receivingPartyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="VP of Operations"
                    value={newDocumentData.receivingPartyTitle}
                    onChange={(e) => setNewDocumentData(prev => ({ ...prev, receivingPartyTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input
                    placeholder="Acme Corporation"
                    value={newDocumentData.receivingPartyCompany}
                    onChange={(e) => setNewDocumentData(prev => ({ ...prev, receivingPartyCompany: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="john@acme.com"
                    value={newDocumentData.receivingPartyEmail}
                    onChange={(e) => setNewDocumentData(prev => ({ ...prev, receivingPartyEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={newDocumentData.effectiveDate}
                onChange={(e) => setNewDocumentData(prev => ({ ...prev, effectiveDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDocumentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDocument}
              disabled={!newDocumentData.templateId}
            >
              Create NDA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Upload Dialog */}
      <Dialog open={showTemplateUploadDialog} onOpenChange={setShowTemplateUploadDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload NDA Template</DialogTitle>
            <DialogDescription>
              Upload a document to create a new NDA template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".docx,.doc,.pdf,.txt"
                className="hidden"
                id="template-upload"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="template-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  DOCX, DOC, PDF, or TXT
                </p>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                placeholder="e.g., Standard Mutual NDA"
                value={newTemplateData.name}
                onChange={(e) => setNewTemplateData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select
                value={newTemplateData.type}
                onValueChange={(value) => setNewTemplateData(prev => ({ ...prev, type: value as NDATemplateType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NDA_TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe when this template should be used..."
                value={newTemplateData.description}
                onChange={(e) => setNewTemplateData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="mutual, standard, partnership"
                value={newTemplateData.tags}
                onChange={(e) => setNewTemplateData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadTemplate}
              disabled={!uploadedFile || !newTemplateData.name}
            >
              Upload Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Editor Dialog */}
      <Dialog open={showDocumentEditor} onOpenChange={setShowDocumentEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.name}
              {selectedDocument && getStatusBadge(selectedDocument.status)}
            </DialogTitle>
            <DialogDescription>
              Review and edit NDA sections before sending for signature
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 p-4">
              {selectedDocument?.sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        Section {index + 1}: {section.title}
                      </CardTitle>
                      {section.isEditable ? (
                        <Badge variant="outline">Editable</Badge>
                      ) : (
                        <Badge variant="secondary">Locked</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {section.isEditable ? (
                      <Textarea
                        className="min-h-[150px] font-mono text-sm"
                        value={section.content}
                        onChange={(e) => {
                          if (!selectedDocument) return;
                          const updatedSections = selectedDocument.sections.map(s =>
                            s.id === section.id ? { ...s, content: e.target.value } : s
                          );
                          setSelectedDocument({ ...selectedDocument, sections: updatedSections });
                        }}
                      />
                    ) : (
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                        {section.content}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedDocument?.status === "draft" && (
                <Button
                  variant="default"
                  onClick={() => {
                    if (selectedDocument) {
                      setShowDocumentEditor(false);
                      setShowSendDialog(true);
                    }
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send for Signature
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowDocumentEditor(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send for Signature Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send NDA for Signature</DialogTitle>
            <DialogDescription>
              An email will be sent to the receiving party with a link to sign the NDA
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{selectedDocument.name}</p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>To:</strong> {selectedDocument.receivingParty.name}</p>
                  <p><strong>Email:</strong> {selectedDocument.receivingParty.email}</p>
                  <p><strong>Company:</strong> {selectedDocument.receivingParty.company}</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  The receiving party will receive an email with a secure link to:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Review the NDA document</li>
                  <li>• Fill in their name and signature</li>
                  <li>• Submit with timestamp</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Once signed, you will be notified to countersign.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedDocument && handleSendForSignature(selectedDocument)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Countersign Dialog */}
      <Dialog open={showCountersignDialog} onOpenChange={setShowCountersignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              CEO Countersignature
            </DialogTitle>
            <DialogDescription>
              Apply {CEO_INFO.name}&apos;s countersignature to complete the NDA
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Receiving Party Signed</p>
                    <p className="text-sm text-green-600">
                      {selectedDocument.signerSignature?.signedBy} signed on{" "}
                      {selectedDocument.signerSignature?.signedAt?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">Countersigner Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-muted-foreground">Name:</p>
                  <p className="font-medium">{CEO_INFO.name}</p>
                  <p className="text-muted-foreground">Title:</p>
                  <p className="font-medium">{CEO_INFO.title}</p>
                  <p className="text-muted-foreground">Company:</p>
                  <p className="font-medium">{CEO_INFO.company}</p>
                  <p className="text-muted-foreground">Date:</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-sm">
                <p>By clicking &quot;Apply Countersignature&quot;, you confirm that:</p>
                <ul className="mt-2 space-y-1">
                  <li>• {CEO_INFO.name} authorizes this signature</li>
                  <li>• A timestamped PDF will be generated</li>
                  <li>• The final document will be emailed to both parties</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCountersignDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedDocument && handleCountersign(selectedDocument)}
            >
              <FileSignature className="mr-2 h-4 w-4" />
              Apply Countersignature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete NDA Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The NDA &quot;{documentToDelete?.name}&quot; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteDocument}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Template Confirmation Dialog */}
      <AlertDialog open={showDeleteTemplateDialog} onOpenChange={setShowDeleteTemplateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template &quot;{templateToDelete?.name}&quot; will be permanently deleted.
              Any NDAs created from this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteTemplate}
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Preview: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {selectedTemplate?.sections.map((section, index) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <h3 className="font-semibold">{section.title}</h3>
                    {section.isRequired && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {section.content}
                    </pre>
                  </div>
                  {section.placeholders && section.placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Placeholders:</span>
                      {section.placeholders.map((p) => (
                        <Badge key={p.id} variant="outline" className="text-xs">
                          {`{{${p.key}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedTemplate) {
                setNewDocumentData(prev => ({ ...prev, templateId: selectedTemplate.id }));
                setShowTemplatePreview(false);
                setShowNewDocumentDialog(true);
              }
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
