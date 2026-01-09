import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "See how KDM & Associates has helped MBEs win government contracts and build sustainable businesses through strategic teaming and capacity building.",
};

const stats = [
  {
    value: "300+",
    label: "MBE Clients Served",
    icon: Users,
  },
  {
    value: "$50B+",
    label: "Contract Transactions",
    icon: DollarSign,
  },
  {
    value: "14+",
    label: "Shared Outcome Agreements",
    icon: Award,
  },
  {
    value: "100+",
    label: "Resource Partners",
    icon: Building2,
  },
];

const services = [
  "Federal contract opportunity identification",
  "Advice on how to bid set-aside contracts – 8(a), WOSB, SDVOSB, HUBZone",
  "Introductions to Government & Military contracting officers",
  "Introductions to/advocacy with Government & Defense Small Business program directors",
  "Help in putting together strategic teaming partnerships",
  "Explanation of Federal Mentor-Protégé Program advantages",
  "Boosting participation in Export & Overseas Project opportunities",
  "Business Development coaching advice",
  "Guidance on Government contracting portal registrations",
  "Recommendations on certifications",
  "Pointers on integrating technology in business operations",
  "Alerts about upcoming conferences, industry outreach days, webinars, education & networking",
];

const industries = [
  "Information Technology",
  "Professional Services",
  "Construction",
  "Manufacturing",
  "Healthcare",
  "Logistics & Transportation",
  "Engineering",
  "Environmental Services",
  "Security Services",
  "Facilities Management",
];

export default function OurWorkPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Work
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Building Success for{" "}
              <span className="text-primary">MBEs</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              We help minority-owned businesses build, grow, and scale their government 
              contract revenues through strategic teaming, capacity building, and mentorship.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Build, Grow & Scale
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Your Government Contract Revenues
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Industries We Serve
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our clients span a wide range of industries seeking government contracts.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {industries.map((industry) => (
              <Badge key={industry} variant="secondary" className="text-sm py-2 px-4">
                {industry}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Success Approach */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Our Approach to Your Success
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <CardTitle>Assess</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    We evaluate your current capabilities, certifications, and readiness 
                    for government contracting opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <CardTitle>Develop</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    We build your capacity through training, strategic teaming, and 
                    targeted support services.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    We facilitate introductions to contracting officers, prime contractors, 
                    and strategic partners.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Grow Your Government Contracting Business?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join the hundreds of MBEs who have partnered with KDM & Associates 
            to achieve their government contracting goals.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Become a KDM Client
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
