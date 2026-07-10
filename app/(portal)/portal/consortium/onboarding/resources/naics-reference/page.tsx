"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search } from "lucide-react";

const NAICS_CATEGORIES = [
  {
    code: "541330",
    title: "Engineering Services",
    description: "Architectural, engineering, and related services for federal facilities and systems.",
  },
  {
    code: "541511",
    title: "Custom Computer Programming",
    description: "Software development, systems integration, and IT modernization services.",
  },
  {
    code: "541512",
    title: "Computer Systems Design Services",
    description: "Cybersecurity, cloud infrastructure, and systems design support.",
  },
  {
    code: "541611",
    title: "Administrative Management Consulting",
    description: "Management, financial, and general consulting services.",
  },
  {
    code: "541519",
    title: "Other Computer Related Services",
    description: "IT support, data processing, and computer-related professional services.",
  },
  {
    code: "561210",
    title: "Facilities Support Services",
    description: "Facility management, maintenance, and operations support.",
  },
  {
    code: "611430",
    title: "Professional and Management Development Training",
    description: "Training, workforce development, and certification programs.",
  },
  {
    code: "541710",
    title: "Research and Development in the Physical, Engineering, and Life Sciences",
    description: "R&D services for defense, energy, and health applications.",
  },
  {
    code: "336413",
    title: "Other Aircraft Parts and Auxiliary Equipment Manufacturing",
    description: "Aerospace components, parts, and auxiliary equipment manufacturing.",
  },
  {
    code: "332710",
    title: "Machine Shops",
    description: "Precision machining and fabricated metal product manufacturing.",
  },
  {
    code: "334419",
    title: "Other Electronic Component Manufacturing",
    description: "Electronic components, sensors, and related hardware manufacturing.",
  },
  {
    code: "236220",
    title: "Commercial and Institutional Building Construction",
    description: "Federal building construction, renovation, and related services.",
  },
];

export default function NaicsReferencePage() {
  const [query, setQuery] = useState("");

  const filtered = NAICS_CATEGORIES.filter(
    (item) =>
      item.code.includes(query) ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">NAICS Code Reference</h1>
        <p className="text-muted-foreground mt-2">
          Find the right NAICS codes for your business capabilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is a NAICS Code?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The North American Industry Classification System (NAICS) is used by federal agencies
            to classify businesses and award contracts. Your primary NAICS codes determine which
            opportunities you are eligible to pursue. You can select multiple codes that reflect
            your products and services.
          </p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by code, title, or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.code}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{item.title}</span>
                <Badge variant="secondary">{item.code}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No NAICS codes found matching your search.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Reference: Census Bureau NAICS lookup is available at census.gov/naics. Use the codes that
        best represent the work you will perform under each federal contract.
      </p>
    </div>
  );
}

