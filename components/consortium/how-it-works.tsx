"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, FileEdit, FolderPlus, Search, Trophy, FolderOpen, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const smeSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Register & Verify",
    description: "Create your account and verify your business certifications",
  },
  {
    step: 2,
    icon: FileEdit,
    title: "Build Your Profile",
    description: "Complete your SME profile with capabilities, past performance, and NAICS codes",
  },
  {
    step: 3,
    icon: FolderPlus,
    title: "Create Proof Pack",
    description: "Upload compliance documents, capability statements, and references",
  },
  {
    step: 4,
    icon: Search,
    title: "Get Discovered",
    description: "Buyers browse the directory and request introductions",
  },
  {
    step: 5,
    icon: Trophy,
    title: "Connect & Win",
    description: "Respond to introductions, schedule meetings, and win contracts",
  },
];

const buyerSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Register & Verify",
    description: "Create your buyer account with agency/organization details",
  },
  {
    step: 2,
    icon: FileEdit,
    title: "Complete Buyer Profile",
    description: "Specify your procurement interests, NAICS codes, and requirements",
  },
  {
    step: 3,
    icon: Search,
    title: "Browse SME Directory",
    description: "Search and filter certified small businesses by capability",
  },
  {
    step: 4,
    icon: FolderOpen,
    title: "Review Proof Packs",
    description: "Access comprehensive capability documentation",
  },
  {
    step: 5,
    icon: Handshake,
    title: "Request Introductions",
    description: "Connect with qualified SMEs for your requirements",
  },
];

interface StepProps {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  isLast: boolean;
  color: string;
}

function Step({ step, icon: Icon, title, description, isLast, color }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg",
          color
        )}>
          <Icon className="h-5 w-5" />
        </div>
        {!isLast && (
          <div className={cn("w-0.5 h-full min-h-[60px] mt-2", color.replace("bg-", "bg-").replace("]", "/40]"))} />
        )}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-sm font-medium", color.replace("bg-", "text-"))}>
            Step {step}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-gray-900/85" />
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Path to Government Contracting Success
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Follow our proven process to connect with opportunities and grow your government business.
          </p>
        </div>

        <Tabs defaultValue="sme" className="w-full max-w-3xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="sme">SME Journey</TabsTrigger>
            <TabsTrigger value="buyer">Buyer Journey</TabsTrigger>
          </TabsList>

          <TabsContent value="sme">
            <div className="space-y-0">
              {smeSteps.map((step, index) => (
                <Step
                  key={step.step}
                  {...step}
                  isLast={index === smeSteps.length - 1}
                  color="bg-[#1e3a5f]"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buyer">
            <div className="space-y-0">
              {buyerSteps.map((step, index) => (
                <Step
                  key={step.step}
                  {...step}
                  isLast={index === buyerSteps.length - 1}
                  color="bg-[#7c3aed]"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
