import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Scale, FileWarning, Eye, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Organizational Conflicts of Interest (OCI) Policy | KDM Consortium",
  description:
    "KDM Consortium OCI policy: identification, disclosure, mitigation, and avoidance of organizational conflicts of interest in federal procurement activities.",
  alternates: { canonical: "https://kdm-assoc.com/policies/organizational-conflicts" },
};

const ociTypes = [
  {
    icon: FileWarning,
    title: "Unequal Access to Information",
    description:
      "A situation in which a firm, by virtue of its current or prior work, has had access to non-public information regarding a competitor's proposal, pricing, or technical approach that may provide an unfair competitive advantage.",
  },
  {
    icon: Users,
    title: "Impaired Objectivity",
    description:
      "A situation in which a firm's objectivity in performing work for one client could be compromised by its relationship to another client or by its own self-interest.",
  },
  {
    icon: Eye,
    title: "Biased Ground Rules",
    description:
      "A situation in which a firm has helped prepare or shape a procurement (e.g., drafting specifications, statements of work, or evaluation criteria) and may later compete for the resulting award.",
  },
];

const mitigationSteps = [
  {
    step: "1",
    title: "Identification",
    description:
      "KDM screens member firms, teaming arrangements, and consulting engagements for potential OCIs before participating in or supporting a procurement opportunity.",
  },
  {
    step: "2",
    title: "Disclosure",
    description:
      "KDM requires full disclosure of any actual, potential, or perceived OCI to the relevant contracting officer, client, or teaming partner as soon as it is identified.",
  },
  {
    step: "3",
    title: "Mitigation",
    description:
      "Where an OCI is identified, KDM implements mitigation measures including but not limited to: firewalls, access restrictions, recusal from specific procurement activities, withdrawal from teaming arrangements, or declining to support the affected procurement.",
  },
  {
    step: "4",
    title: "Avoidance",
    description:
      "In cases where mitigation is not feasible or sufficient, KDM will decline the engagement or opportunity to avoid the conflict entirely.",
  },
];

export default function OCIPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Policy
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Organizational Conflicts of Interest (OCI) Policy
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              KDM Consortium's framework for identifying, disclosing, mitigating, and avoiding
              organizational conflicts of interest in all federal procurement activities.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Policy Statement</h2>
            <p className="text-muted-foreground mb-4">
              KDM & Associates and the KDM Consortium are committed to maintaining the highest
              standards of integrity in federal procurement. We comply with the organizational
              conflicts of interest requirements set forth in FAR Subpart 9.5 and applicable
              agency-specific OCI regulations. We do not seek, accept, or use non-public
              procurement-sensitive information or source-selection information to gain unfair
              competitive advantage.
            </p>
            <p className="text-muted-foreground">
              All KDM Consortium members, partners, and staff are expected to identify and disclose
              any actual, potential, or perceived organizational conflict of interest. Failure to
              disclose a known OCI may result in suspension or removal from the Consortium.
            </p>
          </div>
        </div>
      </section>

      {/* OCI Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Types of OCI We Screen For</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {ociTypes.map((type) => (
                <Card key={type.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <type.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mitigation Process */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Mitigation Process</h2>
            <div className="space-y-6">
              {mitigationSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Member Obligations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-primary" />
                  <CardTitle>Member Obligations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  All KDM Consortium members are required to:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Disclose any current or prior engagements that could create an OCI with a procurement opportunity they seek through the Consortium.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Refrain from using non-public information obtained through prior work to gain advantage in a competing procurement.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Notify KDM immediately upon becoming aware of a potential OCI.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Cooperate with KDM's OCI screening and mitigation processes.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Comply with any mitigation plan developed, including firewalls, recusals, or withdrawal from affected procurements.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              This policy is provided for informational purposes and does not constitute legal
              advice. KDM & Associates is a private-sector firm and is not affiliated with, endorsed
              by, or sponsored by any government agency. Members should consult their own legal
              counsel regarding OCI compliance in specific procurement matters. For questions about
              this policy, contact <a href="mailto:legal@kdm-assoc.com" className="text-primary underline">legal@kdm-assoc.com</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <div className="container py-8">
        <Button variant="ghost" asChild>
          <Link href="/policies/procurement-integrity">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procurement Integrity Policies
          </Link>
        </Button>
      </div>
    </div>
  );
}
