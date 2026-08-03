import { Metadata } from "next";
import { ConsortiumMembersGrid } from "@/components/consortium/consortium-members-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Target,
  Users,
  Award,
  Briefcase,
  Handshake,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "KDM Consortium Members | Join Our Network",
  description:
    "Join the KDM Consortium - a selective network of 12-50 expert companies collaborating to compete more effectively for government contracts. View our members and their capabilities.",
  keywords:
    "KDM Consortium members, government contracting network, manufacturing consortium, defense contractors, critical minerals",
};

const BENEFITS = [
  {
    icon: Target,
    title: "Curated Contract Opportunities",
    description:
      "Access to hand-picked government contracts matched to your NAICS codes and pillar focus areas.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Clock,
    title: "Weekly Strategy Meetings",
    description:
      "Join Friday 3pm consortium calls to discuss opportunities, share intel, and form pursuit teams.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Users,
    title: "Government Buyer Access",
    description:
      "Direct introductions to government buyers and prime contractors actively seeking your capabilities.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Briefcase,
    title: "Revenue & Equity Sharing",
    description:
      "Participate in contract delivery with KDM as prime or project manager. Revenue share based on scope.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Award,
    title: "CMMC & Compliance Support",
    description:
      "Navigate CMMC certification and government compliance requirements with expert guidance.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: Handshake,
    title: "Concierge Support (2 hrs/month)",
    description:
      "Personal support from KDM experts for bid strategy, proposal review, and procurement questions.",
    color: "bg-cyan-100 text-cyan-600",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Apply",
    description: "Submit your company information and pay the membership fee.",
  },
  {
    step: "02",
    title: "Onboard",
    description: "Complete your profile with NAICS codes, certifications, and pillar focus areas.",
  },
  {
    step: "03",
    title: "Collaborate",
    description: "Join weekly meetings, pursue contracts, and grow with the consortium.",
  },
];

const FAQS = [
  {
    question: "Who can join the KDM Consortium?",
    answer:
      "The KDM Consortium is selective. We look for companies with relevant capabilities in our five pillar areas: U.S. Manufacturing, Critical Minerals, Defense Contracting, Access to Capital, and Opportunity Zones. Companies should have government contracting experience or strong potential.",
  },
  {
    question: "What is included in the membership?",
    answer:
      "Membership includes: curated opportunity alerts, weekly Friday 3pm consortium meetings, 2 hours/month of concierge support, team assembly for large contracts, buyer introductions, and access to our member network.",
  },
  {
    question: "How does revenue sharing work?",
    answer:
      "When the consortium wins a contract, KDM acts as prime or project manager. Revenue is shared based on each member's scope of delivery. Terms are negotiated per contract with full transparency.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "Membership is month-to-month after the first 3 months. You can cancel anytime with 30 days notice. We want members who are committed to collaborating and competing together.",
  },
  {
    question: "How many members are in the consortium?",
    answer:
      "We maintain a boutique model with 12-50 members maximum. This ensures high-touch service and meaningful collaboration rather than being lost in a large directory.",
  },
];

export default function ConsortiumMembersPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-400 font-medium mb-4">KDM Consortium</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Join a Selective Network of{" "}
              <span className="text-amber-400">Expert Companies</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Collaborate with 12-50 hand-picked members to win and deliver large government
              contracts in manufacturing, critical minerals, defense, and energy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8"
                asChild
              >
                <a href="/consortium">
                  Join the Consortium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8"
                asChild
              >
                <a href="#members">View Our Members</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Founder rate: /month (limited slots) • Regular: ,250/month
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join the KDM Consortium?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get the tools, connections, and support you need to accelerate your government
              contracting success.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${benefit.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From application to contract delivery in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.step} className="relative">
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-amber-200 to-transparent" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Members Grid */}
      <section id="members" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Consortium Members</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the expert companies already collaborating in the KDM Consortium.
            </p>
          </div>
          <ConsortiumMembersGrid showFilters />
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
                <p className="text-gray-300 mb-6">
                  Become part of a selective network that is competing effectively for government contracts together.
                  Limited founder pricing available.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Curated opportunity matching",
                    "Weekly consortium meetings",
                    "2 hrs/month concierge support",
                    "Revenue sharing on contracts",
                    "Government buyer introductions",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Founder Membership</CardTitle>
                  <p className="text-gray-300">Limited time offer</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-400"></span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="line-through">,250</span> regular price
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                    asChild
                  >
                    <a href="/consortium">
                      Join Now
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Cancel anytime. 3-month minimum commitment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Join the KDM Consortium Today
          </h2>
          <p className="text-slate-800 mb-8 max-w-2xl mx-auto">
            Don't miss this opportunity to be part of a selective network of expert companies
            competing effectively for government contracts together.
          </p>
          <Button
            size="lg"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8"
            asChild
          >
            <a href="/consortium">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
