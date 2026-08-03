import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Calendar, 
  ExternalLink, 
  Users, 
  Factory, 
  Gem, 
  Shield, 
  MapPin, 
  DollarSign,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "KDM Consortium Platform Launch | May 6, 2026",
  description: "Join the world debut of the KDM-Assoc.com platform. A free virtual event during National Small Business Week connecting SMBs & manufacturers with Federal contracts.",
  openGraph: {
    title: "KDM Consortium Platform Launch | May 6, 2026",
    description: "World debut of the nation's first dual-sided digital platform for government contracting.",
    images: ["/KDM_Consortium_Logo.png"],
  },
};

const PLATFORM_CAPABILITIES = [
  {
    icon: Users,
    title: "Structured Capability Profiles",
    description: "Verified profiles capturing NAICS codes, certifications (CMMC, ITAR, AS9100), geographic footprint, and zone designations.",
  },
  {
    icon: Factory,
    title: "Intelligent Buyer Matchmaking",
    description: "Filterable database connecting Federal agencies, DoD, Prime contractors, and OEMs with qualified domestic SMBs.",
  },
  {
    icon: DollarSign,
    title: "Access-to-Capital Pathways",
    description: "Integrated SBA 7(a) and 504 lending, CDFI financing, and Federal grant program connections.",
  },
  {
    icon: Gem,
    title: "Critical Minerals Infrastructure",
    description: "Dedicated capabilities connecting U.S. processors and manufacturers with government and commercial buyers.",
  },
];

const FOUNDING_PARTNERS = [
  { name: "KDM & Associates", role: "Platform Development" },
  { name: "End to End Enterprise Solutions", role: "System Integration" },
  { name: "HUBZone Council", role: "Zone Development" },
  { name: "Logicore", role: "Readiness Solutions" },
  { name: "DoD SkillBridge", role: "Workforce Development" },
];

export default function KDMLaunchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-800/80 to-slate-900" />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-amber-500 text-slate-900 hover:bg-amber-600 text-lg px-6 py-2">
              <Rocket className="w-5 h-5 mr-2" />
              WORLD DEBUT // PLATFORM LAUNCH
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              KDM Consortium
              <span className="block text-amber-400">Digital Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The nation's first dual-sided digital platform connecting U.S. SMBs & manufacturers 
              with Federal agencies, Prime contractors, and OEMs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8" asChild>
                <a href="https://streamyard.com/watch/fJCre6Qg7neQ" target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-5 w-5" />
                  Join Free Virtual Event
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8" asChild>
                <Link href="/consortium">
                  Learn About Consortium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                <span className="text-lg">May 6, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                <span className="text-lg">11:30 AM ET</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                <span className="text-lg">National Small Business Week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <Badge variant="outline" className="text-amber-400 border-amber-400 mb-4">
                    April 30, 2026
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Six-Founding-Member Consortium Launches Platform
                  </h2>
                </div>
                
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  The KDM Consortium will officially 
                  launch <span className="text-amber-400 font-semibold">KDM-Assoc.com</span> at a 
                  free virtual public event during National Small Business Week, May 3-9, 2026.
                </p>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-8">
                  <p className="text-lg text-gray-200 text-center">
                    Click below or go to{" "}
                    <a 
                      href="https://streamyard.com/watch/fJCre6Qg7neQ" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 underline"
                    >
                      streamyard.com/watch/fJCre6Qg7neQ
                    </a>
                    {" "}to join the free launch event.
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" asChild>
                      <a href="https://streamyard.com/watch/fJCre6Qg7neQ" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join the Event
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    <Factory className="mr-1 h-3 w-3" />
                    Manufacturing
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Gem className="mr-1 h-3 w-3" />
                    Critical Minerals
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Shield className="mr-1 h-3 w-3" />
                    Defense
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <MapPin className="mr-1 h-3 w-3" />
                    HUBZones
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Access to Capital
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-center">
              <p className="text-2xl md:text-3xl text-gray-300 italic leading-relaxed mb-6">
                "The gap between manufacturing capability and Federal contract opportunity is not a 
                talent problem — it is an infrastructure problem. KDM-Assoc.com is that infrastructure. 
                We built this platform with manufacturers and SMBs, for manufacturers and SMBs, 
                and on May 6th, we open it to the nation."
              </p>
              <footer className="text-amber-400 font-semibold">
                — Keith Moore, Chair & Co-Founder, KDM Consortium
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              About the KDM-Assoc.com Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A dual-sided digital operating framework intersecting five critical sectors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PLATFORM_CAPABILITIES.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {index + 1}. {capability.title}
                        </h3>
                        <p className="text-gray-400">{capability.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Second Quote */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-center">
              <p className="text-2xl md:text-3xl text-gray-300 italic leading-relaxed mb-6">
                "Critical minerals. HUBZones. Opportunity Zones. Federal set-asides. These programs 
                exist. What has been missing is the platform that makes them discoverable, matchable, 
                and executable. That platform will launch May 6th."
              </p>
              <footer className="text-amber-400 font-semibold">
                — Nel Varenas, MBA, Co-Founder, KDM Consortium; CEO, KDM & Associates
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Context Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  A Pivotal Moment for U.S. Manufacturing
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  The launch comes at a pivotal moment for U.S. manufacturing policy, with heightened 
                  congressional and executive focus on domestic supply chain resilience, critical 
                  minerals sourcing independence, defense industrial base expansion, and the economic 
                  revitalization of HUBZone and Opportunity Zone communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founding Partners */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Founding Partners
            </h2>
            <p className="text-xl text-gray-400">
              Six founding members contributing domain expertise and production capability
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {FOUNDING_PARTNERS.map((partner, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="font-semibold text-white">{partner.name}</p>
                    <p className="text-sm text-gray-400">{partner.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Sections */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">About KDM Consortium</h3>
                <p className="text-gray-400 leading-relaxed">
                  The KDM Consortium connects U.S. SMBs and manufacturers with Federal agencies, 
                  Prime contractors, OEMs, and critical minerals buyers through intelligent digital 
                  matchmaking and teaming. The Consortium's mission is to strengthen the domestic 
                  industrial base by helping SMBs and manufacturers discover opportunities, build 
                  teaming partnerships, and access the capital needed to compete and win.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">About KDM & Associates</h3>
                <p className="text-gray-400 leading-relaxed">
                  KDM & Associates, LLC is a U.S. manufacturing consulting firm 
                  specializing in helping reshoring OEMs build domestic supplier bases and helping 
                  candidate manufacturers increase their capabilities through quality systems, 
                  digital transformation, automation, AI integration, and workforce development initiatives.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Us for the World Debut
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              May 6, 2026 at 11:30 AM ET • Free Virtual Event • Open to All SMBs & Manufacturers
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8" asChild>
                <a href="https://streamyard.com/watch/fJCre6Qg7neQ" target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-5 w-5" />
                  Join the Launch Event
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/consortium">
                  Explore the Consortium
                </Link>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-gray-500 mb-2">Media Contact</p>
              <p className="text-gray-300">
                Keith Moore |{" "}
                <a href="mailto:kmoore@kdm-assoc.com" className="text-amber-400 hover:text-amber-300">
                  kmoore@kdm-assoc.com
                </a>
                {" "}| (609) 206-1440
              </p>
              <p className="text-amber-400 mt-2">KDM-Assoc.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
