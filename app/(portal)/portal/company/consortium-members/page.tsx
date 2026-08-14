"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogoUploadDialog } from "@/components/portal/company-logo-upload-dialog";
import { Loader2, Building2, ArrowRight, Pencil } from "lucide-react";

interface CompanyIntelligence {
  legalCompanyName?: string;
  companyDescription?: string;
  companyLogo?: string;
  ceoBiography?: string;
}

type ConsortiumMember = TeamMemberDoc & { companyIntelligence?: CompanyIntelligence };

interface CompanyGroup {
  key: string;
  companyName: string;
  companyDescription: string;
  companyLogo?: string;
  primaryMember: ConsortiumMember;
  members: ConsortiumMember[];
  group: "founder" | "member";
}

function getCompanyKey(member: ConsortiumMember): string {
  const name = member.companyIntelligence?.legalCompanyName || member.company || "Unknown Company";
  return name.trim().toLowerCase();
}

function getDisplayCompanyName(member: ConsortiumMember): string {
  return member.companyIntelligence?.legalCompanyName || member.company || "Unknown Company";
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

export default function ConsortiumMembersPage() {
  const { profile: userProfile } = useUserProfile();
  const [founders, setFounders] = useState<CompanyGroup[]>([]);
  const [members, setMembers] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyGroup | null>(null);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setCurrentUserUid(user?.uid || null);
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      if (!db) {
        setError("Firebase not initialized");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, COLLECTIONS.TEAM_MEMBERS),
          where("status", "==", "active"),
          where("tags", "array-contains-any", ["kdm-founder", "kdm-consortium"])
        );
        const snapshot = await getDocs(q);
        const rawMembers: ConsortiumMember[] = [];
        snapshot.forEach((docSnap) => {
          rawMembers.push({ id: docSnap.id, ...docSnap.data() } as ConsortiumMember);
        });

        const map = new Map<string, CompanyGroup>();
        for (const member of rawMembers) {
          const key = getCompanyKey(member);
          const existing = map.get(key);
          if (existing) {
            existing.members.push(member);
            // Prefer primary contact: CEO > founder tag > first listed
            const isBetterPrimary =
              member.isCEO ||
              (member.tags?.includes("kdm-founder") && !existing.primaryMember.tags?.includes("kdm-founder"));
            if (isBetterPrimary) {
              existing.primaryMember = member;
            }
            if (member.tags?.includes("kdm-founder")) {
              existing.group = "founder";
            }
          } else {
            const group: "founder" | "member" = member.tags?.includes("kdm-founder") ? "founder" : "member";
            map.set(key, {
              key,
              companyName: getDisplayCompanyName(member),
              companyDescription: member.companyIntelligence?.companyDescription || "",
              companyLogo: member.companyIntelligence?.companyLogo,
              primaryMember: member,
              members: [member],
              group,
            });
          }
        }

        const all = Array.from(map.values());
        const sortByName = (a: CompanyGroup, b: CompanyGroup) =>
          a.companyName.localeCompare(b.companyName);
        setFounders(all.filter((c) => c.group === "founder").sort(sortByName));
        setMembers(all.filter((c) => c.group === "member").sort(sortByName));
      } catch (err) {
        console.error("Error fetching consortium members:", err);
        setError("Failed to load consortium members.");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">KDM Consortium Members</h1>
        <p className="text-muted-foreground">
          Explore the companies and founders that make up the KDM Consortium.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-12">
          <CompanySection
            title="Founders"
            companies={founders}
            badge="Founding Member"
            currentUserUid={currentUserUid}
            userProfile={userProfile}
            onEditLogo={setEditingCompany}
          />
          <CompanySection
            title="KDM Consortium Members"
            companies={members}
            badge="Consortium Member"
            currentUserUid={currentUserUid}
            userProfile={userProfile}
            onEditLogo={setEditingCompany}
          />
        </div>
      )}

      <CompanyLogoUploadDialog
        teamMemberId={editingCompany?.primaryMember.id || ""}
        companyName={editingCompany?.companyName}
        currentLogo={editingCompany?.companyLogo}
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
        onUpdated={(logo) => {
          if (!editingCompany) return;
          const updater = (list: CompanyGroup[]) =>
            list.map((c) =>
              c.key === editingCompany.key
                ? {
                    ...c,
                    companyLogo: logo,
                    primaryMember: {
                      ...c.primaryMember,
                      companyIntelligence: { ...(c.primaryMember.companyIntelligence || {}), companyLogo: logo },
                    },
                  }
                : c
            );
          setFounders((prev) => updater(prev));
          setMembers((prev) => updater(prev));
          setEditingCompany(null);
        }}
      />
    </div>
  );
}

function CompanySection({
  title,
  companies,
  badge,
  currentUserUid,
  userProfile,
  onEditLogo,
}: {
  title: string;
  companies: CompanyGroup[];
  badge: string;
  currentUserUid: string | null;
  userProfile: ReturnType<typeof useUserProfile>["profile"];
  onEditLogo: (company: CompanyGroup) => void;
}) {
  if (companies.length === 0) return null;

  const isAdmin = userProfile.svpRole === "platform_admin" || userProfile.role === "admin";

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight border-b pb-2">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => {
          const canEditLogo = isAdmin || company.primaryMember.firebaseUid === currentUserUid || company.primaryMember.id === currentUserUid;

          return (
          <Link
            key={company.key}
            href={`/portal/company/consortium-members/${company.primaryMember.id}`}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-muted h-32 flex items-center justify-center p-4">
                  {company.companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.companyLogo}
                      alt={`${company.companyName} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground/60" />
                  )}
                  {canEditLogo && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEditLogo(company);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-background/90 hover:bg-background shadow-sm border"
                      aria-label="Edit company logo"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight">{company.companyName}</h3>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-primary font-medium">
                      {company.primaryMember.title || company.primaryMember.expertise || "CEO"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
                      {company.primaryMember.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.primaryMember.avatar}
                          alt={`${company.primaryMember.firstName} ${company.primaryMember.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {getInitials(company.primaryMember.firstName, company.primaryMember.lastName)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {company.primaryMember.firstName} {company.primaryMember.lastName}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {company.companyDescription || "No capabilities statement available."}
                  </p>

                  <Button variant="ghost" size="sm" className="px-0 text-primary">
                    View profile <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
      </div>
    </section>
  );
}
