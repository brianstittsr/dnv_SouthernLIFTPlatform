"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  Search,
  BookOpen, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Cohort {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number;
  maxParticipants: number;
  currentEnrollment: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  price: number;
  level: "beginner" | "intermediate" | "advanced";
}

const MOCK_COHORTS: Cohort[] = [
  {
    id: "mock-1",
    title: "CMMC Level 1 Certification - Spring 2026",
    description: "Comprehensive 12-week program covering all CMMC Level 1 requirements including access control, incident response, and system protection.",
    instructorId: "instructor-1",
    instructorName: "James Thompson",
    startDate: Timestamp.fromDate(new Date("2026-03-15")),
    endDate: Timestamp.fromDate(new Date("2026-06-07")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 14,
    status: "published",
    price: 3500,
    level: "beginner"
  },
  {
    id: "mock-2",
    title: "CMMC Level 2 Advanced Training",
    description: "Advanced 12-week cohort for organizations pursuing CMMC Level 2 certification. Covers advanced security controls and compliance requirements.",
    instructorId: "instructor-2",
    instructorName: "Sarah Chen",
    startDate: Timestamp.fromDate(new Date("2026-04-01")),
    endDate: Timestamp.fromDate(new Date("2026-06-24")),
    duration: 12,
    maxParticipants: 15,
    currentEnrollment: 8,
    status: "published",
    price: 4500,
    level: "advanced"
  },
  {
    id: "mock-3",
    title: "CMMC Fundamentals - Fast Track",
    description: "Accelerated 8-week program for small businesses new to CMMC compliance. Perfect for getting started quickly.",
    instructorId: "instructor-1",
    instructorName: "James Thompson",
    startDate: Timestamp.fromDate(new Date("2026-02-15")),
    endDate: Timestamp.fromDate(new Date("2026-04-10")),
    duration: 8,
    maxParticipants: 25,
    currentEnrollment: 22,
    status: "active",
    price: 2500,
    level: "beginner"
  },
  {
    id: "mock-4",
    title: "CMMC Policy Development Workshop",
    description: "Specialized 12-week cohort focused on developing compliant security policies and procedures for CMMC certification.",
    instructorId: "instructor-3",
    instructorName: "Michael Rodriguez",
    startDate: Timestamp.fromDate(new Date("2026-05-01")),
    endDate: Timestamp.fromDate(new Date("2026-07-24")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 5,
    status: "published",
    price: 3800,
    level: "intermediate"
  }
];

export default function BrowseCohortsPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [filteredCohorts, setFilteredCohorts] = useState<Cohort[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("published");
  const [useMockData, setUseMockData] = useState(true);

  useEffect(() => {
    loadCohorts();
  }, [useMockData]);

  useEffect(() => {
    filterCohorts();
  }, [cohorts, searchQuery, levelFilter, statusFilter]);

  const loadCohorts = async () => {
    setLoading(true);
    
    if (useMockData) {
      // Use mock data
      setCohorts(MOCK_COHORTS);
      setLoading(false);
      return;
    }

    // Load from Firebase
    if (!db) {
      setLoading(false);
      return;
    }
    
    try {
      const q = query(
        collection(db, "cmmcCohorts"),
        where("status", "in", ["published", "active"]),
        orderBy("startDate", "desc")
      );
      
      const snapshot = await getDocs(q);
      const cohortsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cohort[];
      
      setCohorts(cohortsData);
    } catch (error) {
      console.error("Error loading cohorts:", error);
      toast.error("Failed to load cohorts");
    } finally {
      setLoading(false);
    }
  };

  const filterCohorts = () => {
    let filtered = [...cohorts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(c => c.level === levelFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredCohorts(filtered);
  };

  const getAvailableSpots = (cohort: Cohort) => {
    return cohort.maxParticipants - cohort.currentEnrollment;
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "beginner": return "secondary";
      case "intermediate": return "default";
      case "advanced": return "destructive";
      default: return "outline";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse CMMC Cohorts</h1>
          <p className="text-muted-foreground">Find and enroll in CMMC certification training programs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={useMockData ? "default" : "outline"}
            size="sm"
            onClick={() => setUseMockData(!useMockData)}
          >
            {useMockData ? "Mock Data" : "Live Data"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cohorts, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Open for Enrollment</SelectItem>
                <SelectItem value="active">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredCohorts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cohorts Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCohorts.map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{cohort.title}</h3>
                      <Badge variant={getLevelBadgeColor(cohort.level)}>
                        {cohort.level}
                      </Badge>
                      {cohort.status === "active" && (
                        <Badge variant="default">In Progress</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{cohort.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Instructor</div>
                        <div className="font-medium">{cohort.instructorName || "TBD"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Start Date</div>
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {cohort.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {cohort.duration} weeks
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Available Spots</div>
                        <div className="font-medium flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {getAvailableSpots(cohort)} / {cohort.maxParticipants}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${cohort.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {getAvailableSpots(cohort) <= 3 && getAvailableSpots(cohort) > 0 && (
                      <div className="text-sm text-orange-600 font-medium">
                        ⚠️ Only {getAvailableSpots(cohort)} spots remaining!
                      </div>
                    )}
                    {getAvailableSpots(cohort) === 0 && (
                      <div className="text-sm text-red-600 font-medium">
                        ❌ This cohort is full
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/portal/sme/cohorts/browse/${cohort.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    {cohort.status === "published" && getAvailableSpots(cohort) > 0 && (
                      <Link href={`/portal/sme/cohorts/enroll/${cohort.id}`}>
                        <Button variant="default" size="sm" className="w-full">
                          Enroll Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
