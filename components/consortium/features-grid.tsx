"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Handshake,
  FileCheck,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Search,
  FolderOpen,
  Send,
  Star,
  ShieldCheck,
  Clock,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  DollarSign,
} from "lucide-react";

const smeFeatures = [
  {
    icon: Handshake,
    title: "Government Introductions",
    description: "Get matched with government buyers actively seeking your capabilities",
  },
  {
    icon: FileCheck,
    title: "Proof Pack Builder",
    description: "Create compelling capability statements with compliance documentation",
  },
  {
    icon: Target,
    title: "Opportunity Intelligence",
    description: "Receive curated opportunity alerts matching your NAICS codes and certifications",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Monitor your introduction success rate, revenue, and profile views",
  },
  {
    icon: Award,
    title: "Certification Support",
    description: "Access training for 8(a), WOSB, SDVOSB, HUBZone, and CMMC certifications",
  },
  {
    icon: Calendar,
    title: "Networking Events",
    description: "Connect with buyers and primes at exclusive consortium events",
  },
];

const buyerFeatures = [
  {
    icon: Search,
    title: "Vetted SME Directory",
    description: "Browse pre-qualified small businesses by capability, certification, and past performance",
  },
  {
    icon: FolderOpen,
    title: "Proof Pack Access",
    description: "Review comprehensive capability documentation before introductions",
  },
  {
    icon: Send,
    title: "Introduction Requests",
    description: "Request warm introductions to SMEs that match your requirements",
  },
  {
    icon: Star,
    title: "Favorites & Lists",
    description: "Save and organize SMEs for current and future procurements",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Verification",
    description: "Access verified certifications and compliance documentation",
  },
  {
    icon: Clock,
    title: "Streamlined Procurement",
    description: "Reduce time-to-award with pre-vetted, ready-to-perform contractors",
  },
];

const instructorFeatures = [
  {
    icon: BookOpen,
    title: "Cohort Management",
    description: "Lead training cohorts with built-in curriculum and progress tracking",
  },
  {
    icon: ClipboardCheck,
    title: "Student Assessments",
    description: "Create and grade assessments with automated scoring",
  },
  {
    icon: GraduationCap,
    title: "Certificate Issuance",
    description: "Issue completion certificates to successful participants",
  },
  {
    icon: DollarSign,
    title: "Revenue Sharing",
    description: "Earn commissions on cohort enrollments and certifications",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-gray-900/80" />
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Join the KDM Consortium?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Unlock powerful tools and connections designed to accelerate your government contracting success.
          </p>
        </div>

        <Tabs defaultValue="sme" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="sme">For SMEs</TabsTrigger>
            <TabsTrigger value="buyer">For Buyers</TabsTrigger>
            <TabsTrigger value="instructor">For Instructors</TabsTrigger>
          </TabsList>

          <TabsContent value="sme">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smeFeatures.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-[#1e3a5f]" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buyer">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyerFeatures.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-[#7c3aed]" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="instructor">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {instructorFeatures.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#c9a227]/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-[#c9a227]" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
