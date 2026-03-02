"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, ExternalLink, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { SourcewellSolicitationDoc, SolicitationStatus, SolicitationCategory } from "@/lib/types/sourcewell";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<SolicitationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Open", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  pending: { label: "Pending", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
  awarded: { label: "Awarded", color: "bg-blue-500", icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: <XCircle className="h-4 w-4" /> },
};

const categoryOptions: { value: SolicitationCategory; label: string }[] = [
  { value: "construction", label: "Construction" },
  { value: "equipment", label: "Equipment" },
  { value: "services", label: "Services" },
  { value: "technology", label: "Technology" },
  { value: "vehicles", label: "Vehicles" },
  { value: "supplies", label: "Supplies" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

export default function SourcewellSolicitationsPage() {
  const [solicitations, setSolicitations] = useState<SourcewellSolicitationDoc[]>([]);
  const [filteredSolicitations, setFilteredSolicitations] = useState<SourcewellSolicitationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<SolicitationStatus | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<SolicitationCategory | "all">("all");
  const [postedAfter, setPostedAfter] = useState<Date | undefined>();
  const [dueBefore, setDueBefore] = useState<Date | undefined>();

  useEffect(() => {
    fetchSolicitations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [solicitations, searchKeyword, selectedStatus, selectedCategory, postedAfter, dueBefore]);

  async function fetchSolicitations() {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, COLLECTIONS.SOURCEWELL_SOLICITATIONS),
        orderBy("postedDate", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SourcewellSolicitationDoc[];
      setSolicitations(data);
    } catch (error) {
      console.error("Error fetching solicitations:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...solicitations];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword) ||
        s.solicitationNumber.toLowerCase().includes(keyword) ||
        s.keywords?.some(k => k.toLowerCase().includes(keyword))
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (postedAfter) {
      const afterTimestamp = Timestamp.fromDate(postedAfter);
      filtered = filtered.filter(s => s.postedDate.seconds >= afterTimestamp.seconds);
    }

    if (dueBefore) {
      const beforeTimestamp = Timestamp.fromDate(dueBefore);
      filtered = filtered.filter(s => s.dueDate && s.dueDate.seconds <= beforeTimestamp.seconds);
    }

    setFilteredSolicitations(filtered);
  }

  function resetFilters() {
    setSearchKeyword("");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setPostedAfter(undefined);
    setDueBefore(undefined);
  }

  const activeFiltersCount = [
    searchKeyword,
    selectedStatus !== "all",
    selectedCategory !== "all",
    postedAfter,
    dueBefore
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SourceWell Solicitations</h1>
          <p className="text-muted-foreground mt-2">
            Search and track cooperative purchasing solicitations
          </p>
        </div>
        <Button asChild>
          <a href="https://proportal.sourcewell-mn.gov/Module/Tenders/en" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            SourceWell Portal
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Find solicitations by keyword, status, category, and dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, or solicitation number..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as SolicitationStatus | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SolicitationCategory | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Posted After</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {postedAfter ? format(postedAfter, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={postedAfter}
                    onSelect={setPostedAfter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Due Before</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueBefore ? format(dueBefore, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueBefore}
                    onSelect={setDueBefore}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${filteredSolicitations.length} solicitation${filteredSolicitations.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredSolicitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No solicitations found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {solicitations.length === 0 
                ? "No solicitations have been added yet. Check back later or visit the SourceWell portal."
                : "Try adjusting your search filters to find more results."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSolicitations.map((solicitation) => (
            <SolicitationCard key={solicitation.id} solicitation={solicitation} />
          ))}
        </div>
      )}
    </div>
  );
}

function SolicitationCard({ solicitation }: { solicitation: SourcewellSolicitationDoc }) {
  const status = statusConfig[solicitation.status];
  const isOpen = solicitation.status === "open";
  const daysUntilDue = solicitation.dueDate 
    ? Math.ceil((solicitation.dueDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", isOpen && "border-l-4 border-l-green-500")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs">
                {solicitation.solicitationNumber}
              </Badge>
              <Badge className={cn("text-white", status.color)}>
                <span className="mr-1">{status.icon}</span>
                {status.label}
              </Badge>
              <Badge variant="secondary">
                {categoryOptions.find(c => c.value === solicitation.category)?.label || solicitation.category}
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">
              <Link href={`/portal/sourcewell/${solicitation.id}`} className="hover:text-primary">
                {solicitation.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {solicitation.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Posted Date</p>
            <p className="font-medium">{format(solicitation.postedDate.toDate(), "MMM d, yyyy")}</p>
          </div>
          {solicitation.dueDate && (
            <div>
              <p className="text-muted-foreground mb-1">Due Date</p>
              <p className={cn("font-medium", daysUntilDue !== null && daysUntilDue < 7 && daysUntilDue > 0 && "text-orange-600")}>
                {format(solicitation.dueDate.toDate(), "MMM d, yyyy")}
                {daysUntilDue !== null && daysUntilDue > 0 && (
                  <span className="text-xs ml-1">({daysUntilDue}d)</span>
                )}
              </p>
            </div>
          )}
          {solicitation.estimatedValue && (
            <div>
              <p className="text-muted-foreground mb-1">Estimated Value</p>
              <p className="font-medium">{solicitation.estimatedValue}</p>
            </div>
          )}
          {solicitation.contractTerm && (
            <div>
              <p className="text-muted-foreground mb-1">Contract Term</p>
              <p className="font-medium">{solicitation.contractTerm}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button asChild size="sm">
            <Link href={`/portal/sourcewell/${solicitation.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          {solicitation.portalUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={solicitation.portalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Portal Link
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
