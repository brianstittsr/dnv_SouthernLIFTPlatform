"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Handshake, Lightbulb, Shield, Zap } from "lucide-react";

const PILLARS = [
  {
    id: "readiness",
    title: "Readiness",
    icon: Shield,
    description:
      "Ensure your business is prepared for federal contracting. This includes SAM registration, CAGE code, NAICS codes, certifications, and compliance documentation.",
    focus: "Government contracting eligibility and documentation",
  },
  {
    id: "capability",
    title: "Capability",
    icon: Building2,
    description:
      "Define and showcase what your company does best. Capture your core competencies, past performance, facilities, equipment, and capacity.",
    focus: "Skills, resources, and deliverable expertise",
  },
  {
    id: "opportunity",
    title: "Opportunity",
    icon: Lightbulb,
    description:
      "Identify and evaluate federal contract opportunities that align with your capabilities. Use AI-powered matching and SAM.gov integrations.",
    focus: "Contract discovery and bid/no-bid decisions",
  },
  {
    id: "teaming",
    title: "Teaming",
    icon: Handshake,
    description:
      "Build strategic partnerships with other consortium members. Form joint ventures, mentor-protégé relationships, and subcontracting teams.",
    focus: "Partnerships and collaboration",
  },
  {
    id: "growth",
    title: "Growth",
    icon: Zap,
    description:
      "Scale your federal contracting success with performance tracking, pipeline management, capital access, and continuous improvement.",
    focus: "Revenue growth and contract execution",
  },
];

export default function PillarsOverviewPage() {
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
        <h1 className="text-3xl font-bold">Pillars Overview</h1>
        <p className="text-muted-foreground mt-2">
          The five pillars that guide your success in the KDM Consortium
        </p>
      </div>

      <div className="space-y-4">
        {PILLARS.map((pillar) => (
          <Card key={pillar.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <pillar.icon className="h-5 w-5 text-primary" />
                </div>
                {pillar.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{pillar.description}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Focus area:</span> {pillar.focus}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecting Your Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You do not need to master every pillar immediately. Most members start with Readiness
            and Capability, then expand into Opportunity, Teaming, and Growth as they mature. Use
            your profile settings to highlight the pillars most relevant to your business goals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
