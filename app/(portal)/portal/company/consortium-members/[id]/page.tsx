"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, ArrowLeft, Mail, Linkedin, Globe } from "lucide-react";

interface CompanyIntelligence {
  legalCompanyName?: string;
  companyDescription?: string;
  companyLogo?: string;
  ceoBiography?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  yearsInBusiness?: number;
  annualRevenueRange?: string;
  employeeCountRange?: string;
  naicsCodes?: string[];
  certifications?: string[];
  capabilities?: string[];
}

type ConsortiumMember = TeamMemberDoc & { companyIntelligence?: CompanyIntelligence };

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

export default function ConsortiumMemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<ConsortiumMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMember() {
      if (!db) {
        setError("Firebase not initialized");
        setLoading(false);
        return;
      }
      if (!id) {
        setError("Member not specified");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, COLLECTIONS.TEAM_MEMBERS, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMember({ id: docSnap.id, ...docSnap.data() } as ConsortiumMember);
        } else {
          setError("Member not found");
        }
      } catch (err) {
        console.error("Error fetching consortium member:", err);
        setError("Failed to load member profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/portal/company/consortium-members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to KDM Consortium Members
          </Link>
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">{error || "Member not found"}</p>
        </div>
      </div>
    );
  }

  const company = member.companyIntelligence || {};
  const companyName = company.legalCompanyName || member.company || "Unknown Company";
  const capabilitiesStatement = company.companyDescription || "No capabilities statement available.";
  const ceoPicture = member.avatar;
  const companyLogo = company.companyLogo;
  const fullAddress = [company.address, [company.city, company.state, company.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
      <Button variant="ghost" asChild className="mb-2">
        <Link href="/portal/company/consortium-members">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to KDM Consortium Members
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6 md:p-10">
          <div className="grid md:grid-cols-[240px_1fr] gap-8 md:gap-12">
            {/* Company logo & CEO picture */}
            <div className="space-y-6">
              <div className="aspect-square w-full max-w-[220px] mx-auto md:mx-0 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border">
                {companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={companyLogo}
                    alt={`${companyName} logo`}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-muted-foreground/60" />
                )}
              </div>

              <div className="flex flex-col items-center md:items-start">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border mb-3">
                  {ceoPicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ceoPicture}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-muted-foreground">
                      {getInitials(member.firstName, member.lastName)}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold">
                  {member.firstName} {member.lastName}
                </h2>
                <p className="text-sm text-primary font-medium">
                  {member.title || member.expertise || "CEO"}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">{companyName}</h1>
                  {member.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {fullAddress && <p className="text-sm text-muted-foreground">{fullAddress}</p>}
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Capabilities Statement</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {capabilitiesStatement}
                </p>
              </div>

              {company.ceoBiography && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">About the CEO</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {company.ceoBiography}
                  </p>
                </div>
              )}

              {(company.yearsInBusiness || company.annualRevenueRange || company.employeeCountRange) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {company.yearsInBusiness && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Years in Business</p>
                      <p className="font-semibold">{company.yearsInBusiness}</p>
                    </div>
                  )}
                  {company.annualRevenueRange && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Annual Revenue</p>
                      <p className="font-semibold">{company.annualRevenueRange}</p>
                    </div>
                  )}
                  {company.employeeCountRange && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Employees</p>
                      <p className="font-semibold">{company.employeeCountRange}</p>
                    </div>
                  )}
                </div>
              )}

              {(company.naicsCodes?.length || company.certifications?.length || company.capabilities?.length) && (
                <div className="space-y-4 pt-2">
                  {company.naicsCodes && company.naicsCodes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">NAICS Codes</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.naicsCodes.map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.certifications && company.certifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.capabilities && company.capabilities.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Capabilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                {member.emailPrimary && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${member.emailPrimary}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                )}
                {member.linkedIn && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={member.linkedIn.startsWith("http") ? member.linkedIn : `https://${member.linkedIn}`} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {member.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={member.website.startsWith("http") ? member.website : `https://${member.website}`} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
