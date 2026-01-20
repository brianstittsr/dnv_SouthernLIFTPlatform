"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function AllProofPacksPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const proofPacks = [
    {
      id: "PP-001",
      title: "Q4 2025 Defense Contract",
      submitter: "Acme Defense Corp",
      status: "approved",
      qaScore: 95,
      submittedDate: "2026-01-15",
      reviewedBy: "John Doe"
    },
    {
      id: "PP-002",
      title: "Aerospace Manufacturing Proof",
      submitter: "SkyTech Industries",
      status: "pending",
      qaScore: null,
      submittedDate: "2026-01-18",
      reviewedBy: null
    },
    {
      id: "PP-003",
      title: "IT Services Contract Evidence",
      submitter: "TechSolutions LLC",
      status: "in_review",
      qaScore: null,
      submittedDate: "2026-01-17",
      reviewedBy: "Jane Smith"
    },
    {
      id: "PP-004",
      title: "Construction Project Documentation",
      submitter: "BuildRight Inc",
      status: "rejected",
      qaScore: 62,
      submittedDate: "2026-01-14",
      reviewedBy: "Mike Johnson"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      approved: { variant: "default", label: "Approved", icon: CheckCircle },
      pending: { variant: "secondary", label: "Pending", icon: Clock },
      in_review: { variant: "outline", label: "In Review", icon: AlertCircle },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredPacks = proofPacks.filter(pack =>
    pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.submitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Proof Packs</h1>
          <p className="text-muted-foreground">
            Manage and review all submitted proof packs
          </p>
        </div>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, title, or submitter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({proofPacks.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({proofPacks.filter(p => p.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="in_review">
            In Review ({proofPacks.filter(p => p.status === 'in_review').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({proofPacks.filter(p => p.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({proofPacks.filter(p => p.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Proof Packs</CardTitle>
              <CardDescription>Complete list of submitted proof packs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPacks.map((pack) => (
                  <div key={pack.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <Package className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{pack.title}</h3>
                          {getStatusBadge(pack.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>ID: {pack.id}</span>
                          <span>•</span>
                          <span>{pack.submitter}</span>
                          <span>•</span>
                          <span>Submitted: {pack.submittedDate}</span>
                          {pack.qaScore && (
                            <>
                              <span>•</span>
                              <span className={pack.qaScore >= 80 ? "text-green-600" : "text-yellow-600"}>
                                QA Score: {pack.qaScore}%
                              </span>
                            </>
                          )}
                        </div>
                        {pack.reviewedBy && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed by: {pack.reviewedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
