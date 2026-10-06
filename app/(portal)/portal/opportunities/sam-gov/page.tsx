"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  Users,
  Handshake,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Send,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/user-profile-context";

interface Opportunity {
  id: string;
  title: string;
  agency: string;
  solicitationNumber: string;
  postedDate: string;
  deadline: string;
  location: string;
  value: string;
  naicsCodes: string[];
  description: string;
  setAside?: string;
  interestedInTeaming: boolean;
  teamingCount: number;
  isMockData: boolean;
  url?: string;
  noticeId?: string;
}

interface StoredMatch {
  id: string;
  noticeId: string;
  title: string;
  agency: string;
  solicitationNumber: string;
  postedDate: string;
  deadline: string;
  naicsCodes: string[];
  description: string;
  setAside?: string;
  matchScore: number;
  matchReasons: string[];
  uiLink?: string;
}

interface OpportunityAnalysis {
  loading: boolean;
  matchScore?: number;
  matchReasons?: string[];
  partner?: {
    userId: string;
    name: string;
    companyName: string;
    email: string;
    matchScore: number;
    reasons: string[];
    complementaryCapabilities: string[];
    relevantCertifications: string[];
  } | null;
  error?: string;
}

interface CompanyIntelligence {
  legalCompanyName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  companyDescription?: string;
  primaryNaicsCodes?: string[];
  federalDesignations?: {
    eightA?: boolean;
    wosb?: boolean;
    sdvosb?: boolean;
    hubzone?: boolean;
    mbe?: boolean;
    otherDesignations?: string[];
  };
  certifications?: {
    cmmcLevel?: string;
    isoCertifications?: string[];
    otherCertifications?: string[];
  };
  technicalExpertise?: string[];
  serviceOfferings?: string[];
  technologySpecializations?: string[];
  industryFocusAreas?: string[];
  cageCode?: string;
  uei?: string;
  dunsNumber?: string;
  samRegistrationStatus?: "active" | "inactive" | "pending";
  gsaScheduleHolder?: boolean;
  preferredContractTypes?: string[];
  statesServed?: string[];
  regionsServed?: string[];
  willingToPrime?: boolean;
  willingToSub?: boolean;
  seekingPartners?: boolean;
  contractSizePreferences?: string[];
  setAsidePreferences?: string[];
  annualRevenueRange?: string;
  employeeCountRange?: string;
}

const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(safeString).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      safeString(obj.name) ||
      safeString(obj.organizationName) ||
      safeString(obj.value) ||
      safeString(obj.label) ||
      safeString(obj.description) ||
      safeString(obj.title) ||
      safeString(obj.city) ||
      JSON.stringify(value)
    );
  }
  return String(value);
};

const safeStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(safeString).filter(Boolean);
  if (typeof value === "string") return value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "number") return [String(value)];
  return [];
};

const getAgencyName = (value: unknown): string => {
  if (Array.isArray(value)) {
    const names = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          return (
            safeString(obj.organizationName) ||
            safeString(obj.name) ||
            safeString(obj.department) ||
            safeString(obj.agency) ||
            safeString(obj.office) ||
            safeString(obj.subTier) ||
            ""
          );
        }
        return "";
      })
      .filter(Boolean);
    if (names.length) return names.join(" :: ");
  }
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      safeString(obj.organizationName) ||
      safeString(obj.name) ||
      safeString(obj.department) ||
      safeString(obj.agency) ||
      safeString(obj.office) ||
      safeString(obj.subTier) ||
      "Unknown Agency"
    );
  }
  return "Unknown Agency";
};

const getLocationName = (value: unknown): string => {
  if (typeof value === "string" && value) return value;
  if (Array.isArray(value)) return value.map(getLocationName).filter(Boolean).join("; ");
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const city =
      safeString(obj.city) ||
      safeString(obj.cityName) ||
      safeString(obj.placeOfPerformanceCity) ||
      "";
    const state =
      safeString(obj.state) ||
      safeString(obj.stateCode) ||
      safeString(obj.placeOfPerformanceState) ||
      safeString(obj.province) ||
      "";
    const zip =
      safeString(obj.zip) ||
      safeString(obj.zipCode) ||
      safeString(obj.postalCode) ||
      "";
    const country =
      safeString(obj.country) ||
      safeString(obj.countryCode) ||
      safeString(obj.placeOfPerformanceCountry) ||
      "";
    const parts = [city, state, zip, country].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return safeString(obj.formatted) || safeString(obj.location) || "Not specified";
  }
  return "Not specified";
};

const getDeadlineString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      safeString(obj.iso) ||
      safeString(obj.date) ||
      safeString(obj.value) ||
      safeString(obj.raw) ||
      safeString(obj.responseDeadLine) ||
      safeString(obj.deadline) ||
      ""
    );
  }
  return safeString(value);
};

const mockSAMOpportunities: Opportunity[] = [
  {
    id: "sam_1",
    title: "Cybersecurity Services for Federal Agency",
    agency: "Department of Defense",
    solicitationNumber: "HQ0034-24-R-0001",
    postedDate: "2024-06-01",
    deadline: "2024-07-15",
    location: "Washington, DC",
    value: "$2,500,000",
    naicsCodes: ["541512", "541513"],
    description: "Provide comprehensive cybersecurity services including network security, vulnerability assessments, and compliance support for federal agency systems.",
    setAside: "8(a)",
    interestedInTeaming: false,
    teamingCount: 3,
    isMockData: true,
  },
  {
    id: "sam_2",
    title: "IT Infrastructure Modernization",
    agency: "Department of Veterans Affairs",
    solicitationNumber: "VA-362-24-A-0002",
    postedDate: "2024-05-28",
    deadline: "2024-07-30",
    location: "Remote",
    value: "$5,000,000",
    naicsCodes: ["541511", "541512"],
    description: "Modernize IT infrastructure including cloud migration, network upgrades, and system integration for VA medical centers.",
    setAside: "SDVOSB",
    interestedInTeaming: true,
    teamingCount: 5,
    isMockData: true,
  },
  {
    id: "sam_3",
    title: "Manufacturing Support Services",
    agency: "Department of Energy",
    solicitationNumber: "DE-SOL-2024-0003",
    postedDate: "2024-06-03",
    deadline: "2024-08-15",
    location: "Oak Ridge, TN",
    value: "$1,200,000",
    naicsCodes: ["541611", "541690"],
    description: "Provide manufacturing support services including quality assurance, process improvement, and supply chain management.",
    setAside: "HUBZone",
    interestedInTeaming: false,
    teamingCount: 2,
    isMockData: true,
  },
  {
    id: "sam_4",
    title: "Data Analytics and Business Intelligence",
    agency: "Department of Transportation",
    solicitationNumber: "DOT-2024-0004",
    postedDate: "2024-05-20",
    deadline: "2024-07-01",
    location: "Washington, DC",
    value: "$3,750,000",
    naicsCodes: ["541512", "541519"],
    description: "Develop and implement data analytics solutions and business intelligence tools for transportation data analysis.",
    setAside: "WOSB",
    interestedInTeaming: true,
    teamingCount: 4,
    isMockData: true,
  },
  {
    id: "sam_5",
    title: "Professional Engineering Services",
    agency: "Army Corps of Engineers",
    solicitationNumber: "W912DY-24-R-0005",
    postedDate: "2024-06-05",
    deadline: "2024-08-01",
    location: "Multiple Locations",
    value: "$8,000,000",
    naicsCodes: ["541330"],
    description: "Provide professional engineering services for civil works projects including design, construction management, and environmental compliance.",
    setAside: "8(a)",
    interestedInTeaming: false,
    teamingCount: 1,
    isMockData: true,
  },
];

export default function SAMOpportunitiesPage() {
  const { profile } = useUserProfile();
  const authUid = profile?.authUid || profile?.id;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [useMockData, setUseMockData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [setAsideFilter, setSetAsideFilter] = useState<string>("all");
  const [companyIntelligence, setCompanyIntelligence] = useState<CompanyIntelligence | null>(null);

  // Advanced search (server-side SAM.gov query params)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advNaics, setAdvNaics] = useState("");
  const [advPsc, setAdvPsc] = useState("");
  const [advNoticeType, setAdvNoticeType] = useState<string>("all");
  const [advDeadlineDays, setAdvDeadlineDays] = useState<string>("any");

  // Stored AI matches delivered by the scheduled sync (samgovOpportunities)
  const [matchedOpps, setMatchedOpps] = useState<StoredMatch[]>([]);
  const [matchedLoading, setMatchedLoading] = useState(false);

  // On-demand AI analysis per displayed opportunity
  const [analyses, setAnalyses] = useState<Record<string, OpportunityAnalysis>>({});
  const [submittingTeaming, setSubmittingTeaming] = useState<Record<string, boolean>>({});
  const [submittedTeaming, setSubmittedTeaming] = useState<Record<string, boolean>>({});

  // Persisted "Flag for Teaming" state (teamingInterests/{uid}_{noticeId})
  const [teamingFlags, setTeamingFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadOpportunities();
  }, [useMockData]);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchQuery, agencyFilter, setAsideFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock SAM.gov data
        setOpportunities(mockSAMOpportunities);
      } else {
        // Fetch live data from SAM.gov API proxy
        const response = await fetch("/api/opportunities/sam-gov", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: searchQuery || undefined,
            is_active: true,
            size: 25,
            page: 0,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        const mapped: Opportunity[] = (data.opportunitiesData || []).map((opp: Record<string, unknown>) => ({
          id: safeString(opp.noticeId) || safeString(opp.solicitationNumber) || Math.random().toString(36).slice(2),
          noticeId: safeString(opp.noticeId),
          title: safeString(opp.title) || "Untitled",
          agency: getAgencyName(opp.organizationHierarchy || opp.department),
          solicitationNumber: safeString(opp.solicitationNumber),
          postedDate: safeString(opp.postedDate),
          deadline: getDeadlineString(opp.responseDeadLine),
          location: getLocationName(opp.placeOfPerformance),
          value: "See solicitation",
          naicsCodes: opp.naicsCode ? safeStringList(opp.naicsCode) : opp.naicsCodes ? safeStringList(opp.naicsCodes) : opp.naics ? safeStringList(opp.naics) : [],
          description: safeString(opp.description),
          setAside: safeString(opp.typeOfSetAsideDescription || opp.setAside) || undefined,
          interestedInTeaming: false,
          teamingCount: 0,
          isMockData: false,
          url: safeString(opp.uiLink) || undefined,
        }));
        setOpportunities(mapped);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load opportunities";
      toast.error(message);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Server-side SAM.gov search using the advanced filter fields
  const runAdvancedSearch = async () => {
    setUseMockData(false);
    setLoading(true);
    try {
      const params: Record<string, unknown> = { is_active: true, size: 25, page: 0 };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (advNaics.trim()) params.naics = advNaics.trim().split(",")[0].trim();
      if (advPsc.trim()) params.psc = advPsc.trim();
      if (advNoticeType !== "all") params.notice_type = advNoticeType;
      if (advDeadlineDays !== "any") {
        params["response_date.from"] = new Date().toISOString().split("T")[0];
        params["response_date.to"] = new Date(
          Date.now() + parseInt(advDeadlineDays, 10) * 86400000
        ).toISOString().split("T")[0];
      }

      const response = await fetch("/api/opportunities/sam-gov", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${response.status}`);
      }
      const data = await response.json();
      const mapped: Opportunity[] = (data.opportunitiesData || []).map((opp: Record<string, unknown>) => ({
        id: safeString(opp.noticeId) || safeString(opp.solicitationNumber) || Math.random().toString(36).slice(2),
        noticeId: safeString(opp.noticeId),
        title: safeString(opp.title) || "Untitled",
        agency: getAgencyName(opp.organizationHierarchy || opp.department),
        solicitationNumber: safeString(opp.solicitationNumber),
        postedDate: safeString(opp.postedDate),
        deadline: getDeadlineString(opp.responseDeadLine),
        location: getLocationName(opp.placeOfPerformance),
        value: "See solicitation",
        naicsCodes: opp.naicsCode ? safeStringList(opp.naicsCode) : opp.naicsCodes ? safeStringList(opp.naicsCodes) : opp.naics ? safeStringList(opp.naics) : [],
        description: safeString(opp.description),
        setAside: safeString(opp.typeOfSetAsideDescription || opp.setAside) || undefined,
        interestedInTeaming: false,
        teamingCount: 0,
        isMockData: false,
        url: safeString(opp.uiLink) || undefined,
      }));
      setOpportunities(mapped);
      if (mapped.length === 0) toast.info("No opportunities matched your search criteria");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Stored AI matches delivered by the scheduled SAM.gov sync
  useEffect(() => {
    const firestore = db;
    if (!firestore || !authUid) return;
    const loadMatched = async () => {
      setMatchedLoading(true);
      try {
        const q = query(
          collection(firestore, COLLECTIONS.SAMGOV_OPPORTUNITIES),
          where("userId", "==", authUid),
          where("hidden", "==", false)
        );
        const snap = await getDocs(q);
        const rows: StoredMatch[] = snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            noticeId: x.noticeId || "",
            title: x.title || "Untitled",
            agency: safeString(x.agency || x.organizationHierarchy) || "Unknown Agency",
            solicitationNumber: x.solicitationNumber || "",
            postedDate: x.postedDate || "",
            deadline: x.responseDeadline?.toDate?.()?.toISOString() || "",
            naicsCodes: x.naicsCode ? [String(x.naicsCode)] : [],
            description: x.description || "",
            setAside: x.typeOfSetAsideDescription || undefined,
            matchScore: x.matchScore ?? 0,
            matchReasons: Array.isArray(x.matchReasons) ? x.matchReasons : [],
            uiLink: x.uiLink || `https://sam.gov/opp/${x.noticeId}/view`,
          };
        });
        rows.sort((a, b) => b.matchScore - a.matchScore);
        setMatchedOpps(rows);
      } catch (error) {
        console.error("Failed to load matched opportunities:", error);
      } finally {
        setMatchedLoading(false);
      }
    };
    loadMatched();
  }, [authUid]);

  // Persisted teaming flags
  useEffect(() => {
    const firestore = db;
    if (!firestore || !authUid) return;
    const loadFlags = async () => {
      try {
        const snap = await getDocs(
          query(collection(firestore, COLLECTIONS.TEAMING_INTERESTS), where("userId", "==", authUid))
        );
        const flags: Record<string, boolean> = {};
        snap.docs.forEach((d) => {
          const x = d.data();
          if (x.noticeId) flags[x.noticeId] = !!x.interested;
        });
        setTeamingFlags(flags);
      } catch (error) {
        console.error("Failed to load teaming flags:", error);
      }
    };
    loadFlags();
  }, [authUid]);

  // On-demand AI analysis: fit rationale + suggested KDM partner
  const analyzeOpportunity = useCallback(
    async (opp: { id: string; noticeId?: string; title: string; agency?: string; solicitationNumber?: string; naicsCodes: string[]; description: string; setAside?: string; deadline?: string }) => {
      if (!auth?.currentUser) {
        toast.error("You must be logged in to run AI analysis");
        return;
      }
      setAnalyses((prev) => ({ ...prev, [opp.id]: { loading: true } }));
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch("/api/samgov/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            opportunity: {
              id: opp.id,
              noticeId: opp.noticeId,
              title: opp.title,
              agency: opp.agency,
              solicitationNumber: opp.solicitationNumber,
              naicsCode: opp.naicsCodes[0],
              naicsCodes: opp.naicsCodes,
              description: opp.description,
              setAside: opp.setAside,
              deadline: opp.deadline,
            },
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Analysis failed");
        setAnalyses((prev) => ({
          ...prev,
          [opp.id]: {
            loading: false,
            matchScore: data.matchScore,
            matchReasons: data.matchReasons || [],
            partner: data.partner || null,
          },
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Analysis failed";
        setAnalyses((prev) => ({ ...prev, [opp.id]: { loading: false, error: message } }));
        toast.error(message);
      }
    },
    []
  );

  // Submit a teaming request to the suggested partner
  const submitTeamingRequest = useCallback(
    async (
      opp: { id: string; noticeId?: string; title: string; agency?: string; solicitationNumber?: string; naicsCodes: string[]; description: string; setAside?: string; deadline?: string; url?: string },
      partner: NonNullable<OpportunityAnalysis["partner"]>,
      matchReasons?: string[]
    ) => {
      if (!auth?.currentUser) {
        toast.error("You must be logged in to send a teaming request");
        return;
      }
      const key = `${opp.id}_${partner.userId}`;
      setSubmittingTeaming((prev) => ({ ...prev, [key]: true }));
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch("/api/teaming/request", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            partnerUserId: partner.userId,
            partnerMatchScore: partner.matchScore,
            partnerReasons: partner.reasons,
            opportunity: {
              noticeId: opp.noticeId || opp.id,
              title: opp.title,
              agency: opp.agency,
              solicitationNumber: opp.solicitationNumber,
              naicsCode: opp.naicsCodes[0],
              setAside: opp.setAside,
              responseDeadline: opp.deadline,
              uiLink: opp.url,
              description: opp.description,
            },
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to send");
        setSubmittedTeaming((prev) => ({ ...prev, [key]: true }));
        toast.success(`Teaming request sent to ${partner.companyName || partner.name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send teaming request");
      } finally {
        setSubmittingTeaming((prev) => ({ ...prev, [key]: false }));
      }
    },
    []
  );

  // Shared renderer for the AI rationale + partner suggestion block
  const renderAnalysisPanel = (
    oppId: string,
    opp: { id: string; noticeId?: string; title: string; agency?: string; solicitationNumber?: string; naicsCodes: string[]; description: string; setAside?: string; deadline?: string; url?: string },
    existingReasons?: string[]
  ) => {
    const analysis = analyses[oppId];
    const reasons = analysis?.matchReasons?.length ? analysis.matchReasons : existingReasons;

    return (
      <div className="mt-3 space-y-3">
        {/* AI rationale */}
        {reasons && reasons.length > 0 && (
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm font-medium text-purple-900 flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4" /> Why consider this opportunity
            </p>
            <ul className="text-sm text-purple-900 list-disc pl-5 space-y-0.5">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Partner suggestion */}
        {analysis?.loading && (
          <div className="p-3 rounded-lg bg-muted flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing fit and finding partners…
          </div>
        )}
        {analysis?.partner && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 space-y-2">
            <p className="text-sm font-medium text-green-900 flex items-center gap-2">
              <Handshake className="h-4 w-4" /> Suggested KDM Consortium Partner
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {analysis.partner.name || analysis.partner.companyName}
                  {analysis.partner.companyName && analysis.partner.name && ` — ${analysis.partner.companyName}`}
                </p>
                <p className="text-xs text-muted-foreground">{analysis.partner.email}</p>
              </div>
              <Badge className="bg-green-600 hover:bg-green-600">{analysis.partner.matchScore}% Match</Badge>
            </div>
            {analysis.partner.reasons.length > 0 && (
              <ul className="text-sm text-green-900 list-disc pl-5 space-y-0.5">
                {analysis.partner.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
            {analysis.partner.complementaryCapabilities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.partner.complementaryCapabilities.map((cap) => (
                  <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                ))}
              </div>
            )}
            <Button
              size="sm"
              onClick={() => submitTeamingRequest(opp, analysis.partner!, reasons)}
              disabled={submittingTeaming[`${opp.id}_${analysis.partner.userId}`] || submittedTeaming[`${opp.id}_${analysis.partner.userId}`]}
            >
              <Send className="h-4 w-4 mr-1" />
              {submittedTeaming[`${opp.id}_${analysis.partner.userId}`]
                ? "Teaming Request Sent"
                : submittingTeaming[`${opp.id}_${analysis.partner.userId}`]
                  ? "Sending…"
                  : "Submit Teaming Request"}
            </Button>
          </div>
        )}
        {analysis && !analysis.loading && !analysis.partner && !analysis.error && (
          <p className="text-xs text-muted-foreground">
            No consortium partner with overlapping NAICS was identified for this opportunity.
          </p>
        )}
        {!analysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeOpportunity(opp)}
            className="text-purple-700 border-purple-300"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Analyze Fit &amp; Find Partner
          </Button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const firestore = db;
    if (!firestore || !profile.id) return;

    const loadCompanyIntelligence = async () => {
      try {
        const snap = await getDoc(doc(firestore, COLLECTIONS.TEAM_MEMBERS, profile.id));
        const data = snap.data()?.companyIntelligence as CompanyIntelligence | undefined;
        setCompanyIntelligence(data || null);
      } catch (error) {
        console.error("Failed to load Company Intelligence:", error);
      }
    };

    loadCompanyIntelligence();
  }, [profile.id]);

  const { recommendTeaming, teamingReasons } = useMemo(() => {
    if (!companyIntelligence) {
      return { recommendTeaming: false, teamingReasons: ["No Company Intelligence data available"] };
    }

    const reasons: string[] = [];

    if (companyIntelligence.seekingPartners) {
      reasons.push("Actively seeking partners");
    }
    if (companyIntelligence.willingToSub && !companyIntelligence.willingToPrime) {
      reasons.push("Prefer to work as a subcontractor");
    }
    if (companyIntelligence.willingToPrime && !companyIntelligence.willingToSub) {
      reasons.push("Prefer to act as prime contractor");
    }
    if (companyIntelligence.employeeCountRange && ["1-10", "11-50"].includes(companyIntelligence.employeeCountRange)) {
      reasons.push("Smaller team size may benefit from partners");
    }
    if (companyIntelligence.contractSizePreferences?.some((range) => range.includes("1M") || range.includes("5M") || range.includes("10M"))) {
      reasons.push("Contract size preferences include larger opportunities");
    }

    const recommend =
      !!companyIntelligence.seekingPartners ||
      (companyIntelligence.willingToSub === true && companyIntelligence.willingToPrime !== true) ||
      (["1-10", "11-50"].includes(companyIntelligence.employeeCountRange || "") && !companyIntelligence.willingToPrime) ||
      companyIntelligence.contractSizePreferences?.some((range) => range.includes("1M") || range.includes("5M") || range.includes("10M")) ||
      false;

    if (reasons.length === 0) {
      reasons.push("No strong Company Intelligence signal for teaming");
    }

    return { recommendTeaming: recommend, teamingReasons: reasons };
  }, [companyIntelligence]);

  const filterOpportunities = () => {
    let filtered = [...opportunities];

    if (searchQuery) {
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.solicitationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (agencyFilter !== "all") {
      filtered = filtered.filter((opp) => opp.agency === agencyFilter);
    }

    if (setAsideFilter !== "all") {
      filtered = filtered.filter((opp) => opp.setAside === setAsideFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const toggleTeamingInterest = async (opportunityId: string) => {
    const opportunity = opportunities.find((opp) => opp.id === opportunityId);
    const interested = !opportunity?.interestedInTeaming;

    setOpportunities(
      opportunities.map((opp) =>
        opp.id === opportunityId ? { ...opp, interestedInTeaming: interested } : opp
      )
    );

    // Persist so other members can see teaming interest
    const noticeId = opportunity?.noticeId || opportunityId;
    if (db && authUid && !opportunity?.isMockData) {
      const firestore = db;
      try {
        await setDoc(
          doc(firestore, COLLECTIONS.TEAMING_INTERESTS, `${authUid}_${noticeId}`),
          {
            userId: authUid,
            noticeId,
            opportunityTitle: opportunity?.title || "",
            interested,
            updatedAt: new Date(),
          },
          { merge: true }
        );
        setTeamingFlags((prev) => ({ ...prev, [noticeId]: interested }));
      } catch (error) {
        console.error("Failed to persist teaming interest:", error);
      }
    }

    if (interested) {
      toast.success("Flagged for teaming - other partners can now see your interest");
    } else {
      toast.info("Teaming flag removed");
    }
  };

  const getDaysUntilDeadline = (deadline: string): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return null;
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (days: number | null): string => {
    if (days === null) return "text-muted-foreground";
    if (days < 0) return "text-red-600";
    if (days <= 7) return "text-red-600";
    if (days <= 30) return "text-yellow-600";
    return "text-green-600";
  };

  const agencies = Array.from(new Set(opportunities.map((opp) => opp.agency)));
  const setAsides = Array.from(new Set(opportunities.map((opp) => opp.setAside).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SAM.gov Opportunities</h1>
          <p className="text-muted-foreground">
            Browse government contracting opportunities from SAM.gov
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="mockData">Use Mock Data</Label>
            <Switch
              id="mockData"
              checked={useMockData}
              onCheckedChange={setUseMockData}
            />
          </div>
          <Button onClick={loadOpportunities} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Filter Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Active Search &amp; Filter Variables
          </CardTitle>
          <CardDescription>
            Variables from your Company Intelligence and current filter selections used to find opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!companyIntelligence ? (
            <p className="text-sm text-muted-foreground">Loading Company Intelligence...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{companyIntelligence.legalCompanyName || profile.company || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Primary NAICS</p>
                <div className="flex flex-wrap gap-1">
                  {(companyIntelligence.primaryNaicsCodes || profile.naicsCodes || []).length > 0 ? (
                    (companyIntelligence.primaryNaicsCodes || profile.naicsCodes || []).map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {companyIntelligence.city ? `${companyIntelligence.city}, ${companyIntelligence.state}` : profile.state || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">States Served</p>
                <p className="font-medium">{(companyIntelligence.statesServed || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Federal Designations</p>
                <div className="flex flex-wrap gap-1">
                  {companyIntelligence.federalDesignations ? (
                    <>
                      {companyIntelligence.federalDesignations.eightA && <Badge variant="outline" className="text-xs">8(a)</Badge>}
                      {companyIntelligence.federalDesignations.wosb && <Badge variant="outline" className="text-xs">WOSB</Badge>}
                      {companyIntelligence.federalDesignations.sdvosb && <Badge variant="outline" className="text-xs">SDVOSB</Badge>}
                      {companyIntelligence.federalDesignations.hubzone && <Badge variant="outline" className="text-xs">HUBZone</Badge>}
                      {companyIntelligence.federalDesignations.mbe && <Badge variant="outline" className="text-xs">MBE</Badge>}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Size Preferences</p>
                <p className="font-medium">{(companyIntelligence.contractSizePreferences || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Set-Aside Preferences</p>
                <p className="font-medium">{(companyIntelligence.setAsidePreferences || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CMMC Level</p>
                <p className="font-medium">{companyIntelligence.certifications?.cmmcLevel ? `Level ${companyIntelligence.certifications.cmmcLevel}` : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Other Certifications</p>
                <p className="font-medium">{(companyIntelligence.certifications?.otherCertifications || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">SAM Registration</p>
                <p className="font-medium">{companyIntelligence.samRegistrationStatus || profile.samRegistrationStatus || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CAGE / UEI</p>
                <p className="font-medium">{`${companyIntelligence.cageCode || profile.cageCode || "—"} / ${companyIntelligence.uei || profile.uei || "—"}`}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Service Offerings</p>
                <p className="font-medium">{(companyIntelligence.serviceOfferings || []).join(", ") || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Technology Specializations</p>
                <p className="font-medium">{(companyIntelligence.technologySpecializations || []).join(", ") || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Industry Focus Areas</p>
                <p className="font-medium">{(companyIntelligence.industryFocusAreas || []).join(", ") || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Capabilities Statement</p>
                <p className="font-medium">{companyIntelligence.companyDescription || profile.companyDescription || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Readiness / Capabilities Documents</p>
                <div className="flex flex-wrap gap-2">
                  {profile.readinessDocuments && profile.readinessDocuments.length > 0 ? (
                    profile.readinessDocuments.map((doc, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{doc.type}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Current UI Filters</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Search: {searchQuery || "—"}</Badge>
                  <Badge variant="secondary" className="text-xs">Agency: {agencyFilter}</Badge>
                  <Badge variant="secondary" className="text-xs">Set-Aside: {setAsideFilter}</Badge>
                  <Badge variant="secondary" className="text-xs">{useMockData ? "Mock Data" : "Live SAM.gov"}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teaming Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Teaming Recommendation
          </CardTitle>
          <CardDescription>
            Suggested default for the &quot;Flag for Teaming&quot; switch based on your Company Intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${recommendTeaming ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {recommendTeaming ? <Handshake className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {recommendTeaming ? "Teaming is recommended (toggle ON)" : "Teaming is not recommended by default (toggle OFF)"}
              </p>
              <p className="text-sm text-muted-foreground">{teamingReasons.join(" • ")}</p>
            </div>
            <Badge variant={recommendTeaming ? "default" : "secondary"}>
              {recommendTeaming ? "ON" : "OFF"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Matched for You — AI-scored matches delivered by the scheduled sync */}
      {(matchedLoading || matchedOpps.length > 0) && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Matched for You
            </CardTitle>
            <CardDescription>
              Opportunities our scheduled SAM.gov sync AI-matched to your Company Intelligence profile, with rationale and a suggested consortium partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchedLoading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {matchedOpps.map((m) => (
                  <Card key={m.id} className="bg-purple-50/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold">{m.title}</h3>
                            <Badge className="bg-purple-600 hover:bg-purple-600 ml-2">
                              {m.matchScore}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {m.agency}
                            {m.solicitationNumber && (
                              <>
                                <span>•</span>
                                <span>{m.solicitationNumber}</span>
                              </>
                            )}
                            {m.deadline && (
                              <>
                                <span>•</span>
                                <span>Due {new Date(m.deadline).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          {m.setAside && <Badge variant="secondary" className="mt-2">{m.setAside}</Badge>}
                          {renderAnalysisPanel(`matched_${m.id}`, {
                            id: `matched_${m.id}`,
                            noticeId: m.noticeId,
                            title: m.title,
                            agency: m.agency,
                            solicitationNumber: m.solicitationNumber,
                            naicsCodes: m.naicsCodes,
                            description: m.description,
                            setAside: m.setAside,
                            deadline: m.deadline,
                            url: m.uiLink,
                          }, m.matchReasons)}
                        </div>
                        {m.uiLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={m.uiLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View on SAM.gov
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runAdvancedSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="agency">Agency</Label>
              <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                <SelectTrigger id="agency">
                  <SelectValue placeholder="All Agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="setAside">Set-Aside</Label>
              <Select value={setAsideFilter} onValueChange={setSetAsideFilter}>
                <SelectTrigger id="setAside">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {setAsides.filter((type: string | undefined): type is string => type !== undefined).map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runAdvancedSearch} disabled={loading}>
              <Search className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Search SAM.gov
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced((v) => !v)}>
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Advanced
              {showAdvanced ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="advNaics">NAICS Code</Label>
                <Input
                  id="advNaics"
                  placeholder="e.g. 541512"
                  value={advNaics}
                  onChange={(e) => setAdvNaics(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="advPsc">PSC / Product Service Code</Label>
                <Input
                  id="advPsc"
                  placeholder="e.g. D302"
                  value={advPsc}
                  onChange={(e) => setAdvPsc(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="advNoticeType">Notice Type</Label>
                <Select value={advNoticeType} onValueChange={setAdvNoticeType}>
                  <SelectTrigger id="advNoticeType">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="r">Solicitation (RFP)</SelectItem>
                    <SelectItem value="p">Presolicitation</SelectItem>
                    <SelectItem value="s">Sources Sought</SelectItem>
                    <SelectItem value="o">Combined Synopsis/Solicitation</SelectItem>
                    <SelectItem value="a">Award Notice</SelectItem>
                    <SelectItem value="g">Sale of Surplus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="advDeadline">Response Deadline</Label>
                <Select value={advDeadlineDays} onValueChange={setAdvDeadlineDays}>
                  <SelectTrigger id="advDeadline">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="7">Next 7 days</SelectItem>
                    <SelectItem value="30">Next 30 days</SelectItem>
                    <SelectItem value="60">Next 60 days</SelectItem>
                    <SelectItem value="90">Next 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mock Data Notice */}
      {useMockData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Filter className="h-4 w-4" />
              <span className="text-sm">
                Displaying mock SAM.gov data for demonstration. Toggle off &quot;Use Mock Data&quot; to fetch live opportunities (requires SAM.gov API key in Settings &gt; Integrations).
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opportunity) => {
            const daysUntilDeadline = getDaysUntilDeadline(opportunity.deadline);
            return (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{opportunity.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {opportunity.agency}
                            <span>•</span>
                            <span>{opportunity.solicitationNumber}</span>
                          </div>
                        </div>
                        {opportunity.setAside && (
                          <Badge variant="secondary">{opportunity.setAside}</Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Deadline</div>
                            <div className={`font-medium ${getDeadlineColor(daysUntilDeadline)}`}>
                              {daysUntilDeadline === null ? "No deadline" : `${daysUntilDeadline} days`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Location</div>
                            <div className="font-medium">{opportunity.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Value</div>
                            <div className="font-medium">{opportunity.value}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Teaming Interest</div>
                            <div className="font-medium">{opportunity.teamingCount} partners</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {opportunity.description}
                      </p>

                      {/* NAICS Codes */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.naicsCodes.map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                      </div>

                      {/* Teaming Flag */}
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Switch
                          checked={opportunity.interestedInTeaming || !!teamingFlags[opportunity.noticeId || opportunity.id]}
                          onCheckedChange={() => toggleTeamingInterest(opportunity.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Handshake className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">
                              {opportunity.interestedInTeaming || teamingFlags[opportunity.noticeId || opportunity.id]
                                ? "Interested in Teaming"
                                : "Flag for Teaming"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opportunity.interestedInTeaming || teamingFlags[opportunity.noticeId || opportunity.id]
                              ? "Other partners on the platform can see your interest"
                              : "Flag this opportunity to find teaming partners"}
                          </p>
                        </div>
                      </div>

                      {/* AI rationale + suggested partner */}
                      {renderAnalysisPanel(opportunity.id, opportunity)}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => analyzeOpportunity(opportunity)}
                        disabled={analyses[opportunity.id]?.loading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        AI Match Partners
                      </Button>
                      {opportunity.url || opportunity.noticeId ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={opportunity.url || `https://sam.gov/opp/${opportunity.noticeId}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View on SAM.gov
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Sample Notice
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}
