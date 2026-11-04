"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  Search,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Folder,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Share2,
  Clock,
  User,
  Loader2,
  FolderOpen,
  Building2,
  Lock,
  Tag,
  X,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, query, orderBy, where, deleteDoc, doc } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { COLLECTIONS } from "@/lib/schema";
import { USER_ROLES } from "@/lib/rbac-types";
import { toast } from "sonner";

const DEFAULT_DOCUMENT_TYPES = [
  "Proposal",
  "Contract",
  "MOU",
  "Partner Agreements",
  "Template",
  "Report",
  "Invoice",
  "Other",
];

/** Preset tags for the upload dialog — common business document categories. */
const DOCUMENT_TAGS = [
  "Agreements",
  "Contracts",
  "Proposals",
  "Invoices",
  "Reports",
  "Deliverables",
  "Capability Statements",
  "Certifications",
  "Financials",
  "Compliance",
  "Legal",
  "Meeting Notes",
  "Training Materials",
  "Templates",
  "Presentations",
  "Marketing",
];

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  folder: string;
  uploadedBy: string;
  uploadedAt: string;
  shared: boolean;
  fileId?: string;
  downloadUrl?: string;
  companyId?: string | null;
  allowedRoles: string[];
  visibleToUids?: string[];
  sourceType?: string;
  sourceLabel?: string;
  tags: string[];
}

interface FolderCount {
  name: string;
  count: number;
}

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "document":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "presentation":
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "image":
      return <FileImage className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
}

function formatDate(dateString: string) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "document";
  if (["ppt", "pptx"].includes(ext)) return "presentation";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  return "other";
}

export default function DocumentsPage() {
  const { getDisplayName, profile, isLoading: profileLoading } = useUserProfile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState("");
  const [uploadCustomType, setUploadCustomType] = useState("");
  const [uploadVisibility, setUploadVisibility] = useState<"all" | "roles">("all");
  const [uploadRoles, setUploadRoles] = useState<string[]>([]);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  // Filter bar — documents matching ANY selected tag pass.
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Share modal — shows the link and copies on demand.
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const [documentTypes, setDocumentTypes] = useState<string[]>(DEFAULT_DOCUMENT_TYPES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Staff/admin default to the company-grouped view; other members can toggle it.
  const [groupByCompany, setGroupByCompany] = useState<boolean | null>(null);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});

  // Fetch documents from Firestore — staff/admins read everything; members
  // query by allowedRoles so the Firestore rules can prove every returned
  // record is visible to them ('all' covers unrestricted docs).
  useEffect(() => {
    if (profileLoading) return;
    const staffViewer =
      profile.role === "admin" ||
      profile.role === "staff" ||
      profile.svpRole === "platform_admin" ||
      profile.svpRole === "staff" ||
      (profile.svpRoles?.includes("staff") ?? false) ||
      (profile.svpRoles?.includes("platform_admin") ?? false);
    const viewerRoleKeys = [
      ...new Set(
        [profile.role, profile.svpRole, ...(profile.svpRoles ?? []), "all"].filter(
          (value): value is string => Boolean(value)
        )
      ),
    ];

    const fetchDocuments = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        const docsRef = collection(db, "documents");

        // Members can see docs shared with their roles AND docs addressed to
        // them individually via visibleToUids (generated outputs like their
        // own submission PDFs and certificates) — two queries, merged by id.
        let snapshotDocs;
        if (staffViewer) {
          const snapshot = await getDocs(query(docsRef, orderBy("uploadedAt", "desc")));
          snapshotDocs = snapshot.docs;
        } else {
          const [byRole, byUid] = await Promise.all([
            getDocs(query(docsRef, where("allowedRoles", "array-contains-any", viewerRoleKeys))),
            // Archives store the Firebase Auth uid — authUid, not the
            // teamMembers doc id that profile.id may hold.
            profile.authUid
              ? getDocs(query(docsRef, where("visibleToUids", "array-contains", profile.authUid)))
              : Promise.resolve(null),
          ]);
          const merged = new Map<string, (typeof byRole.docs)[number]>();
          for (const d of [...byRole.docs, ...(byUid?.docs ?? [])]) merged.set(d.id, d);
          snapshotDocs = [...merged.values()];
        }

        const docs: Document[] = snapshotDocs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Untitled",
            type: data.type || getFileType(data.name || ""),
            size: data.size || formatFileSize(data.sizeBytes || 0),
            sizeBytes: data.sizeBytes || 0,
            folder: data.folder || "Uncategorized",
            uploadedBy: data.uploadedBy || "Unknown",
            uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || data.uploadedAt || "",
            shared: data.shared || false,
            fileId: data.fileId,
            downloadUrl: data.downloadUrl || (data.fileId ? `/api/files/${data.fileId}` : undefined),
            companyId: data.companyId || null,
            allowedRoles: Array.isArray(data.allowedRoles)
              ? data.allowedRoles.filter(
                  (value: unknown): value is string => typeof value === "string"
                )
              : ["all"],
            visibleToUids: Array.isArray(data.visibleToUids)
              ? data.visibleToUids.filter(
                  (value: unknown): value is string => typeof value === "string"
                )
              : undefined,
            sourceType: typeof data.sourceType === "string" ? data.sourceType : undefined,
            sourceLabel: typeof data.sourceLabel === "string" ? data.sourceLabel : undefined,
            tags: Array.isArray(data.tags)
              ? data.tags.filter(
                  (value: unknown): value is string => typeof value === "string"
                )
              : [],
          };
        });

        setDocuments(docs);

        // Calculate folder counts
        const folderCounts: Record<string, number> = {};
        docs.forEach((doc) => {
          folderCounts[doc.folder] = (folderCounts[doc.folder] || 0) + 1;
        });

        const folderList: FolderCount[] = [
          { name: "All Documents", count: docs.length },
          ...Object.entries(folderCounts).map(([name, count]) => ({ name, count })),
        ];
        setFolders(folderList);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDocumentTypes = async () => {
      if (!db) return;
      try {
        const settingsSnap = await getDoc(doc(db, COLLECTIONS.PLATFORM_SETTINGS, "global"));
        const options = settingsSnap.data()?.dropdownLists?.documentTypes;
        if (Array.isArray(options) && options.length > 0) {
          setDocumentTypes(options.filter((t): t is string => typeof t === "string"));
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    // Company names for the grouped view — staff/admin can read companies
    // per the Firestore rules; other members get an empty map and their docs
    // just bucket under "Unassigned".
    const fetchCompanyNames = async () => {
      if (!db) return;
      try {
        const snap = await getDocs(collection(db, COLLECTIONS.COMPANIES));
        const names: Record<string, string> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          names[d.id] = data.legalCompanyName || data.displayName || "Unnamed company";
        });
        setCompanyNames(names);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchDocuments();
    fetchDocumentTypes();
    fetchCompanyNames();
  }, [profileLoading, profile.role, profile.svpRole, profile.svpRoles, profile.authUid]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      if (selectedFolder !== "All Documents" && doc.folder !== selectedFolder) return false;
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (selectedTags.length > 0 && !doc.tags.some((tag) => selectedTags.includes(tag))) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inName = doc.name.toLowerCase().includes(q);
        const inUploader = doc.uploadedBy.toLowerCase().includes(q);
        const inFolder = doc.folder.toLowerCase().includes(q);
        const inTags = doc.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!inName && !inUploader && !inFolder && !inTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.sizeBytes - a.sizeBytes;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  // Delete document
  const handleDelete = async (docId: string, fileId?: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "documents", docId));

      // Delete the stored file bytes (best-effort; legacy docs may not have one)
      if (fileId) {
        try {
          await fetch(`/api/files/${fileId}`, { method: "DELETE" });
        } catch (fileError) {
          console.error("Error deleting stored file:", fileError);
        }
      }

      // Update local state
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  // Upload document
  const handleUpload = async () => {
    const effectiveType =
      uploadDocType === "Other" ? uploadCustomType.trim() : uploadDocType;
    if (!uploadFile || !effectiveType) {
      setUploadError(
        uploadDocType === "Other"
          ? "Specify the document type."
          : "Choose a file and a document type."
      );
      return;
    }
    if (uploadVisibility === "roles" && uploadRoles.length === 0) {
      setUploadError("Select at least one role, or choose Everyone.");
      return;
    }
    const allowedRoles =
      uploadVisibility === "all" ? ["all"] : uploadRoles;

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("target", "documents");
      formData.append("documentType", effectiveType);
      formData.append("uploadedBy", getDisplayName());
      formData.append("allowedRoles", JSON.stringify(allowedRoles));
      formData.append("tags", JSON.stringify(uploadTags));
      if (profile.id) formData.append("uploaderUid", profile.id);
      if (profile.companyId) formData.append("companyId", profile.companyId);

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const newDoc: Document = {
        id: result.documentId,
        name: uploadFile.name,
        type: getFileType(uploadFile.name),
        size: formatFileSize(uploadFile.size),
        sizeBytes: uploadFile.size,
        folder: effectiveType,
        uploadedBy: getDisplayName(),
        uploadedAt: new Date().toISOString(),
        shared: false,
        fileId: result.fileId,
        downloadUrl: result.fileUrl,
        companyId: profile.companyId || null,
        allowedRoles,
        tags: uploadTags,
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setFolders((prev) => {
        const next = prev.map((f) =>
          f.name === newDoc.folder || f.name === "All Documents"
            ? { ...f, count: f.count + 1 }
            : f
        );
        if (!next.some((f) => f.name === newDoc.folder)) {
          next.push({ name: newDoc.folder, count: 1 });
        }
        return next;
      });

      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadDocType("");
      setUploadCustomType("");
      setUploadVisibility("all");
      setUploadRoles([]);
      setUploadTags([]);
      setCustomTag("");
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  // Company grouping — staff and admins see every company's documents;
  // members can opt into the same grouped view.
  const isStaffViewer =
    profile.role === "admin" ||
    profile.role === "staff" ||
    profile.svpRole === "platform_admin" ||
    profile.svpRole === "staff" ||
    (profile.svpRoles?.includes("staff") ?? false);
  const showGrouped = groupByCompany ?? isStaffViewer;

  const companyNameFor = (doc: Document) =>
    (doc.companyId && companyNames[doc.companyId]) || "Unassigned";

  const groupedByCompany = showGrouped
    ? filteredDocuments.reduce<Record<string, Document[]>>((acc, d) => {
        const key = companyNameFor(d);
        (acc[key] ||= []).push(d);
        return acc;
      }, {})
    : null;

  const groupedCompanyNames = groupedByCompany
    ? Object.keys(groupedByCompany).sort((a, b) => {
        if (a === "Unassigned") return 1;
        if (b === "Unassigned") return -1;
        return a.localeCompare(b);
      })
    : [];

  // Tag helpers — toggles for the upload dialog and the filter bar
  const toggleUploadTag = (tag: string) =>
    setUploadTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  const addCustomTag = () => {
    const tag = customTag.trim();
    if (!tag) return;
    setUploadTags((prev) =>
      prev.some((t) => t.toLowerCase() === tag.toLowerCase()) ? prev : [...prev, tag]
    );
    setCustomTag("");
  };
  const toggleFilterTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  // Every tag present on loaded documents — drives the filter chip row.
  const availableTags = [
    ...new Set(documents.flatMap((doc) => doc.tags)),
  ].sort((a, b) => a.localeCompare(b));

  // Download document
  const handleDownload = async (doc: Document) => {
    const url = doc.downloadUrl || (doc.fileId ? `/api/files/${doc.fileId}?download=1` : null);
    if (!url) {
      alert("No file is attached to this document");
      return;
    }
    window.open(url, "_blank");
  };

  // Share — opens a modal showing the link. Restricted docs still require
  // a matching role to open, which the modal states up front.
  const shareUrlFor = (doc: Document): string | null => {
    const url = doc.downloadUrl || (doc.fileId ? `/api/files/${doc.fileId}` : null);
    if (!url) return null;
    return new URL(url, window.location.origin).toString();
  };

  const handleShare = (doc: Document) => {
    if (!shareUrlFor(doc)) {
      toast.error("No file is attached to this document");
      return;
    }
    setShareDoc(doc);
  };

  const copyShareLink = async () => {
    if (!shareDoc) return;
    const url = shareUrlFor(shareDoc);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const renderDocRow = (doc: Document) => (
    <TableRow key={doc.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          {getFileIcon(doc.type)}
          <div>
            <p className="font-medium">{doc.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {doc.uploadedBy}
              {doc.shared && (
                <Badge variant="outline" className="text-xs">
                  <Share2 className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="secondary">{doc.folder}</Badge>
          {doc.sourceLabel && (
            <Badge variant="outline" className="text-xs" title={doc.sourceType}>
              {doc.sourceLabel}
            </Badge>
          )}
          {!doc.allowedRoles.includes("all") && (
            <Badge
              variant="outline"
              className="text-xs"
              title={`Visible to: ${doc.allowedRoles
                .map((role) => USER_ROLES[role as keyof typeof USER_ROLES] || role)
                .join(", ")}`}
            >
              <Lock className="h-3 w-3 mr-1" />
              Restricted
            </Badge>
          )}
          {doc.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{doc.size}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(doc.uploadedAt)}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => doc.downloadUrl && window.open(doc.downloadUrl, "_blank")}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(doc)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare(doc)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(doc.id, doc.fileId)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const docTableHead = (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Folder</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Uploaded</TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage proposals, templates, and project documents
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Add a file to the document library and choose its type.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="doc-file">File</Label>
                <Input
                  id="doc-file"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={uploadDocType} onValueChange={setUploadDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {uploadDocType === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="doc-custom-type">Specify document type</Label>
                  <Input
                    id="doc-custom-type"
                    value={uploadCustomType}
                    onChange={(e) => setUploadCustomType(e.target.value)}
                    placeholder="e.g., NDA, Board Resolution"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Who can see this document</Label>
                <RadioGroup
                  value={uploadVisibility}
                  onValueChange={(value) =>
                    setUploadVisibility(value === "roles" ? "roles" : "all")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="vis-all" />
                    <Label htmlFor="vis-all" className="font-normal">
                      Everyone — all signed-in users
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="roles" id="vis-roles" />
                    <Label htmlFor="vis-roles" className="font-normal">
                      Specific roles only
                    </Label>
                  </div>
                </RadioGroup>
                {uploadVisibility === "roles" && (
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                    {Object.entries(USER_ROLES).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${key}`}
                          checked={uploadRoles.includes(key)}
                          onCheckedChange={(checked) =>
                            setUploadRoles((prev) =>
                              checked
                                ? [...prev, key]
                                : prev.filter((role) => role !== key)
                            )
                          }
                        />
                        <Label
                          htmlFor={`role-${key}`}
                          className="font-normal text-sm"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  LIFT Staff and Platform Admins can always see every document.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Tags (optional)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {DOCUMENT_TAGS.map((tag) => {
                    const active = uploadTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleUploadTag(tag)}
                        className={
                          active
                            ? "rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                            : "rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    placeholder="Add a custom tag"
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                {uploadTags.some((tag) => !DOCUMENT_TAGS.includes(tag)) && (
                  <div className="flex flex-wrap gap-1.5">
                    {uploadTags
                      .filter((tag) => !DOCUMENT_TAGS.includes(tag))
                      .map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => toggleUploadTag(tag)}
                            className="ml-1 hover:text-destructive"
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  !uploadFile ||
                  !uploadDocType ||
                  (uploadDocType === "Other" && !uploadCustomType.trim()) ||
                  (uploadVisibility === "roles" && uploadRoles.length === 0)
                }
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Folders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 p-2">
              {folders.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No folders yet</p>
              ) : (
                folders.map((folder) => (
                  <Button
                    key={folder.name}
                    variant={selectedFolder === folder.name ? "secondary" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedFolder(folder.name)}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      {folder.name}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        selectedFolder === folder.name
                          ? "text-xs text-white border-white/40"
                          : "text-xs"
                      }
                    >
                      {folder.count}
                    </Badge>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search name, uploader, folder, or tag..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant={showGrouped ? "secondary" : "outline"}
                  onClick={() => setGroupByCompany(!showGrouped)}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  {showGrouped ? "Grouped by company" : "Group by company"}
                </Button>
              </div>
              {availableTags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-4">
                  <span className="text-xs font-medium text-muted-foreground mr-1">
                    <Tag className="mr-1 inline h-3 w-3" />
                    Filter by tag:
                  </span>
                  {availableTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFilterTag(tag)}
                        className={
                          active
                            ? "rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                            : "rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="ml-1 text-xs text-muted-foreground underline hover:text-primary"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Table — flat list, or grouped by company */}
          {isLoading || filteredDocuments.length === 0 || !showGrouped || !groupedByCompany ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                {docTableHead}
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground mt-2">Loading documents...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No documents found</p>
                        <p className="text-sm text-muted-foreground">Upload documents to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map(renderDocRow)
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          ) : (
            groupedCompanyNames.map((company) => (
              <Card key={company}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {company}
                    </span>
                    <Badge variant="outline">{groupedByCompany[company].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    {docTableHead}
                    <TableBody>
                      {groupedByCompany[company].map(renderDocRow)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Share dialog */}
      <Dialog open={shareDoc !== null} onOpenChange={(open) => !open && setShareDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share document</DialogTitle>
            <DialogDescription>
              {shareDoc?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  value={shareDoc ? shareUrlFor(shareDoc) ?? "" : ""}
                  className="pl-9 pr-2 font-mono text-xs"
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <Button onClick={copyShareLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {shareDoc?.allowedRoles.includes("all")
                ? "Any signed-in user can open this link."
                : "Only signed-in users with the selected roles can open this link."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDoc(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
