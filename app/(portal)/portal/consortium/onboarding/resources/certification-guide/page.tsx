"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Shield, Building2, Users, Briefcase, GraduationCap } from "lucide-react";

const CERTIFICATIONS = [
  {
    title: "CMMC Certification",
    icon: Shield,
    level: "Cybersecurity",
    description:
      "The Cybersecurity Maturity Model Certification is required for defense contractors handling controlled unclassified information (CUI).",
    path: "Assess current practices, implement required controls, schedule a C3PAO assessment, and maintain compliance.",
  },
  {
    title: "ISO 9001",
    icon: Award,
    level: "Quality Management",
    description:
      "An internationally recognized quality management system standard that demonstrates consistent product and service quality.",
    path: "Document processes, conduct internal audits, select a registrar, and complete the certification audit.",
  },
  {
    title: "ISO 27001",
    icon: Shield,
    level: "Information Security",
    description:
      "A framework for establishing, implementing, and continually improving an information security management system.",
    path: "Define scope, conduct risk assessment, implement controls, and pass the external audit.",
  },
  {
    title: "Small Business Certifications",
    icon: Building2,
    level: "Socioeconomic",
    description:
      "SBA certifications such as 8(a), HUBZone, WOSB, and SDVOSB provide set-aside and sole-source contract opportunities.",
    path: "Verify eligibility, prepare documentation, and apply through certify.SBA.gov.",
  },
  {
    title: "GSA Schedule",
    icon: Briefcase,
    level: "Federal Contracting Vehicle",
    description:
      "A long-term government contract that establishes pricing and terms for federal buyers.",
    path: "Review MAS categories, prepare proposal, negotiate terms, and obtain a GSA Schedule contract.",
  },
  {
    title: "NIST SP 800-171",
    icon: GraduationCap,
    level: "Cybersecurity Compliance",
    description:
      "A set of security requirements for protecting CUI in nonfederal systems and organizations.",
    path: "Complete a self-assessment, document a System Security Plan, and implement required controls.",
  },
  {
    title: "Joint Venture & Teaming Certifications",
    icon: Users,
    level: "Partnership",
    description:
      "Formal teaming arrangements that allow small businesses to pursue larger contracts while retaining socioeconomic benefits.",
    path: "Identify a partner, define roles and revenue share, and file required SBA or agency notifications.",
  },
];

export default function CertificationGuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/consortium/onboarding">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Onboarding
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Certification Guide</h1>
        <p className="text-muted-foreground mt-2">
          Information on government certifications and how to obtain them
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Certifications Matter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Federal certifications open doors to set-aside contracts, sole-source awards, and preferred
            vendor status. They also signal to prime contractors and government buyers that your
            business meets recognized standards for quality, security, and capability.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {CERTIFICATIONS.map((cert) => (
          <Card key={cert.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <cert.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span>{cert.title}</span>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {cert.level}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{cert.description}</p>
              <div>
                <p className="text-sm font-medium">How to obtain it:</p>
                <p className="text-sm text-muted-foreground">{cert.path}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Select the certifications that align with your target contracts and add them to your
            consortium profile. KDM staff can help validate your readiness and connect you with
            qualified assessors.
          </p>
          <Button variant="outline" asChild>
            <Link href="/portal/consortium/readiness">Go to Readiness</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
