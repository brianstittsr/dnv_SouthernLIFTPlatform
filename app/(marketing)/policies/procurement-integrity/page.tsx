import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, FileText, Lock, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Procurement Integrity & Information Handling Policies | KDM Consortium",
  description:
    "KDM Consortium policies on organizational conflicts of interest (OCI), procurement integrity, information handling, and prohibited uploads.",
  alternates: { canonical: "https://kdm-assoc.com/policies/procurement-integrity" },
};

const policies = [
  {
    icon: Scale,
    title: "Organizational Conflicts of Interest (OCI)",
    sections: [
      {
        heading: "Policy Statement",
        body: "KDM & Associates is committed to identifying, mitigating, and disclosing any organizational conflicts of interest that may arise in the course of its operations. KDM does not simultaneously represent conflicting interests in the same procurement.",
      },
      {
        heading: "Mitigation Measures",
        body: "When a potential OCI is identified, KDM will: (1) promptly disclose the conflict to the affected parties, (2) implement mitigation measures such as firewalls or recusal, (3) decline the engagement if the conflict cannot be adequately mitigated, and (4) document the conflict and resolution.",
      },
      {
        heading: "Member Obligations",
        body: "KDM Consortium members are responsible for disclosing any actual or potential OCI to KDM and to relevant contracting officers. Members must not use non-public information obtained from a government source for private gain.",
      },
    ],
  },
  {
    icon: Shield,
    title: "Procurement Integrity",
    sections: [
      {
        heading: "Standards of Conduct",
        body: "KDM and its consortium members adhere to the procurement integrity standards established by 41 U.S.C. Chapter 21 and FAR Subpart 3.1. KDM does not solicit, accept, or use source selection information or contractor bid or proposal information obtained from a government source.",
      },
      {
        heading: "Prohibited Activities",
        body: "KDM and its members must not: (1) obtain or use non-public source selection information, (2) engage in unauthorized discussions with government personnel regarding pending procurements, (3) offer or accept gratuities to or from government personnel, or (4) engage in any activity that creates an unfair competitive advantage.",
      },
      {
        heading: "Reporting Requirements",
        body: "Any suspected violation of procurement integrity standards must be reported immediately to KDM leadership and, where appropriate, to the relevant agency Inspector General or contracting officer.",
      },
    ],
  },
  {
    icon: Lock,
    title: "Information Handling & Data Security",
    sections: [
      {
        heading: "Platform Classification",
        body: "The KDM platform is a private-sector commercial platform. It is not authorized to store, process, or transmit classified information, Controlled Unclassified Information (CUI), export-controlled technical data, source-selection information, or procurement-sensitive information.",
      },
      {
        heading: "Prohibited Uploads",
        body: "Users must not upload: classified information of any kind, CUI, export-controlled technical data subject to ITAR or EAR, source-selection information, non-public procurement-sensitive information, proprietary proposal information belonging to other companies, or any data requiring handling controls beyond the platform's security posture.",
      },
      {
        heading: "User Responsibility",
        body: "Users are solely responsible for ensuring all uploaded information is appropriately cleared for commercial-platform use. KDM reserves the right to remove any content that appears to violate these restrictions. KDM does not assume liability for improper uploads by users.",
      },
    ],
  },
  {
    icon: FileText,
    title: "Compliance & Enforcement",
    sections: [
      {
        heading: "Member Agreement",
        body: "All KDM Consortium members agree to abide by these policies as a condition of membership. Violations may result in suspension or termination of membership and removal from the consortium.",
      },
      {
        heading: "Government Cooperation",
        body: "KDM cooperates fully with government investigations and audits. KDM will report known or suspected violations of federal procurement law to appropriate authorities.",
      },
      {
        heading: "Policy Updates",
        body: "These policies are reviewed annually and updated as needed to reflect changes in applicable laws, regulations, and best practices. Members will be notified of material changes.",
      },
    ],
  },
];

export default function ProcurementIntegrityPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Policies
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Procurement Integrity &amp; Information Handling
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              KDM Consortium policies governing organizational conflicts of interest, procurement
              integrity, and information handling.
            </p>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {policies.map((policy) => (
              <div key={policy.title}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <policy.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{policy.title}</h2>
                </div>
                <div className="space-y-6">
                  {policy.sections.map((section) => (
                    <Card key={section.heading}>
                      <CardHeader>
                        <CardTitle className="text-lg">{section.heading}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{section.body}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              These policies are provided for informational purposes and do not constitute legal
              advice. KDM &amp; Associates is a private-sector firm and is not affiliated with,
              endorsed by, or sponsored by any government agency. Members should consult their own
              legal counsel for compliance guidance specific to their circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <div className="container py-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
