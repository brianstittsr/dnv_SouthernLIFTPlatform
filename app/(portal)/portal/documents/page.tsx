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
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { COLLECTIONS } from "@/lib/schema";

const DEFAULT_DOCUMENT_TYPES = [
  "Proposal",
  "Contract",
  "Template",
  "Report",
  "Invoice",
  "Other",
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
  const { getDisplayName, profile } = useUserProfile();
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
  const [documentTypes, setDocumentTypes] = useState<string[]>(DEFAULT_DOCUMENT_TYPES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch documents from Firestore
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        const docsRef = collection(db, "documents");
        const q = query(docsRef, orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        
        const docs: Document[] = snapshot.docs.map((doc) => {
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

    fetchDocuments();
    fetchDocumentTypes();
  }, []);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      if (selectedFolder !== "All Documents" && doc.folder !== selectedFolder) return false;
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
    if (!uploadFile || !uploadDocType) {
      setUploadError("Choose a file and a document type.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("target", "documents");
      formData.append("documentType", uploadDocType);
      formData.append("uploadedBy", getDisplayName());
      if (profile.id) formData.append("uploaderUid", profile.id);

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
        folder: uploadDocType,
        uploadedBy: getDisplayName(),
        uploadedAt: new Date().toISOString(),
        shared: false,
        fileId: result.fileId,
        downloadUrl: result.fileUrl,
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
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  // Download document
  const handleDownload = async (doc: Document) => {
    const url = doc.downloadUrl || (doc.fileId ? `/api/files/${doc.fileId}?download=1` : null);
    if (!url) {
      alert("No file is attached to this document");
      return;
    }
    window.open(url, "_blank");
  };

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
                disabled={isUploading || !uploadFile || !uploadDocType}
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
                    <Badge variant="outline" className="text-xs">
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
                    placeholder="Search documents..." 
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
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
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
                    filteredDocuments.map((doc) => (
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
                        <Badge variant="secondary">{doc.folder}</Badge>
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
                            <DropdownMenuItem>
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
                  ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
