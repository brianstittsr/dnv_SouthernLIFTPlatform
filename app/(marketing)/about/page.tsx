import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Building2,
  ArrowRight,
  Factory,
  Handshake,
  TrendingUp,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about KDM & Associates and our mission to help minority-owned businesses win government contracts through strategic teaming, capacity building, and mentorship.",
};

const values = [
  {
    icon: Target,
    title: "Results-Driven",
    description:
      "We measure success by your success. Every engagement is focused on delivering measurable outcomes and contract wins.",
  },
  {
    icon: Users,
    title: "Strategic Teaming",
    description:
      "We leverage our partner network to bring the right expertise and teaming opportunities to every client.",
  },
  {
    icon: Heart,
    title: "Partnership Mindset",
    description:
      "We're not just consultants—we're partners invested in your long-term success and sustainable growth.",
  },
  {
    icon: Award,
    title: "Excellence in Execution",
    description:
      "We combine deep government contracting expertise with hands-on support to ensure every client succeeds.",
  },
];


export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              About KDM & Associates
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Fueling What Works Through{" "}
              <span className="text-primary">Aggregated Resources</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Propelling the next generation of minority government contractors through 
              capacity building, mentorship, and strategic teaming partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To empower small and emerging businesses 
                  to compete and win government contracts by providing accessible, results-driven 
                  support services that bridge the gap between current capabilities 
                  and federal procurement requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  A thriving ecosystem where every capable minority-owned business 
                  has the opportunity to become a qualified government contractor, creating jobs, 
                  strengthening supply chains, and driving economic growth across the nation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Story</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground text-lg leading-relaxed">
                In an exciting development for the large Prime Government Contractors community, 
                the Minority Business Development Agency (MBDA) network, and small, emerging, 
                and emerging small businesses across the country, the MBDA Federal 
                Procurement Center (FPC) is officially transitioning its operations to KDM & Associates, LLC.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                This transition marks a strategic realignment, bringing new leadership, fresh 
                initiatives, and stronger partnerships to better support the escalating demand 
                for shovel-ready, small and emerging businesses to address the Nation&apos;s supply 
                chain requirements. Historical data confirms that small and minority owned 
                businesses have consistently faced barriers to entry in the Federal acquisition sector.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                KDM & Associates, LLC is a business development, government affairs, and public 
                relations firm focused on helping our clients navigate the government procurement 
                process and win government contracts. We help our clients not only win more contracts, 
                but help firms provide more effective and efficient solutions to their clients and customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Value Plus Partnership */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
                Strategic Partnership
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Strategic Value Plus (V+) Partnership
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Uniting manufacturing excellence with government contracting expertise
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <Handshake className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">A Powerful Alliance</h3>
                  <p className="text-muted-foreground">
                    KDM & Associates has partnered with Strategic Value Plus (V+), an industry leader 
                    in operational excellence and manufacturing consulting. This strategic alliance 
                    combines V+&apos;s deep manufacturing expertise with KDM&apos;s proven government 
                    contracting capabilities to deliver comprehensive solutions for businesses 
                    seeking to enter or expand in federal manufacturing contracts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                    <Factory className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Manufacturing + Government Contracting</h3>
                  <p className="text-muted-foreground">
                    This partnership specifically addresses the unique intersection of manufacturing 
                    operations and government procurement. We help manufacturing firms navigate 
                    complex federal requirements while optimizing their production capabilities 
                    to meet stringent government standards and deliverables.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Enhanced Capabilities</h4>
                  <p className="text-muted-foreground text-sm">
                    Access to V+&apos;s proven methodologies for operational excellence, lean manufacturing, 
                    and supply chain optimization combined with KDM&apos;s government contracting expertise.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Supply Chain Solutions</h4>
                  <p className="text-muted-foreground text-sm">
                    Comprehensive support for government manufacturing contractors including 
                    blockchain-enabled supply chain management, quality assurance, and compliance.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Joint Success</h4>
                  <p className="text-muted-foreground text-sm">
                    Together, we provide end-to-end support from manufacturing readiness to 
                    contract award and execution, ensuring clients succeed at every stage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Values</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Building2 className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Win Government Contracts?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join the growing community of emerging small businesses who&apos;ve partnered with 
            KDM & Associates to achieve their goals.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Schedule Introductory Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
