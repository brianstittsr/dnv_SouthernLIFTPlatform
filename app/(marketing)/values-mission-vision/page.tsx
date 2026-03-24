import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Eye,
  Heart,
  Compass,
  Lightbulb,
  Users,
  Zap,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Values, Mission & Vision | KDM & Associates",
  description:
    "Discover KDM & Associates' mission, vision, and core values that guide our commitment to helping businesses win government contracts.",
};

const values = [
  {
    icon: Target,
    title: "Results-Driven",
    description:
      "We measure success by your success. Every engagement is focused on delivering measurable outcomes, contract wins, and sustainable revenue growth.",
  },
  {
    icon: Heart,
    title: "Partnership Mindset",
    description:
      "We're not just consultants—we're partners invested in your long-term success. We succeed when you succeed, and we're committed to your sustainable growth.",
  },
  {
    icon: Users,
    title: "Integrity & Transparency",
    description:
      "We operate with complete honesty and transparency. You'll always know where you stand, what to expect, and how we're working to achieve your goals.",
  },
  {
    icon: Zap,
    title: "Innovation & Agility",
    description:
      "We embrace new technologies and methodologies to stay ahead of market changes. We adapt quickly to help you seize emerging opportunities.",
  },
  {
    icon: Award,
    title: "Excellence in Execution",
    description:
      "We combine deep expertise with meticulous attention to detail. Every deliverable reflects our commitment to the highest standards of quality.",
  },
  {
    icon: Compass,
    title: "Inclusive Growth",
    description:
      "We're committed to supporting diverse and minority-owned businesses. We believe in creating pathways for underrepresented entrepreneurs to compete and win.",
  },
];

export default function ValuesMissionVisionPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Foundation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Values, Mission <span className="text-primary">&</span> Vision
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              The principles and purpose that guide everything we do at KDM & Associates
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Mission */}
            <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To empower small and diverse businesses to compete and win government 
                  contracts by providing accessible, results-driven support services that 
                  bridge the gap between current capabilities and federal procurement 
                  requirements. We are committed to building sustainable competitive 
                  advantages through strategic partnerships, capacity building, and 
                  technology-enabled solutions.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-2 border-secondary/20 hover:border-secondary/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the trusted partner of choice for small and diverse businesses 
                  seeking to build sustainable, profitable government contracting practices. 
                  We envision a marketplace where capability and opportunity are matched 
                  efficiently, where diverse businesses thrive as prime contractors and 
                  strategic partners, and where innovation drives competitive advantage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our <span className="text-primary">Core Values</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              These principles guide our decisions, actions, and relationships
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commitment Statement */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-lg p-8 md:p-12">
              <div className="flex items-start gap-4">
                <Lightbulb className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-4">Our Commitment</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    At KDM & Associates, we are committed to more than just business success. 
                    We believe in creating pathways for underrepresented entrepreneurs and 
                    minority-owned businesses to compete on an equal footing in the federal 
                    marketplace.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Every decision we make, every service we deliver, and every partnership 
                    we form is guided by our mission to empower businesses and our vision 
                    of a more inclusive, competitive government contracting ecosystem. We 
                    measure our impact not just in contracts won, but in businesses built, 
                    jobs created, and communities strengthened.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Join Us in Our Mission
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Whether you're a business seeking to win government contracts or a partner 
              interested in collaborating with us, we'd love to hear from you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-primary font-semibold hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
