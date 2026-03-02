"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  Layers,
  Network,
  BarChart3,
  Clock,
  Users,
  Building2,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

const antifragilePrinciples = [
  {
    icon: TrendingUp,
    title: "Gain from Disorder",
    description:
      "Unlike fragile systems that break under stress, AntiFragile supply chains actually improve and strengthen when exposed to volatility, randomness, and stressors.",
  },
  {
    icon: Layers,
    title: "Redundancy Over Efficiency",
    description:
      "Strategic redundancy in suppliers, inventory, and logistics creates optionality. What looks like 'waste' in good times becomes survival in bad times.",
  },
  {
    icon: RefreshCw,
    title: "Optionality & Flexibility",
    description:
      "Build systems with multiple options and the ability to pivot quickly. The more options you have, the more you benefit from uncertainty.",
  },
  {
    icon: Target,
    title: "Barbell Strategy",
    description:
      "Combine extremely safe, conservative approaches with small, high-risk/high-reward experiments. Avoid the dangerous middle ground.",
  },
  {
    icon: Network,
    title: "Decentralization",
    description:
      "Distributed networks are more resilient than centralized ones. Multiple smaller suppliers beat one large supplier in volatile environments.",
  },
  {
    icon: Zap,
    title: "Skin in the Game",
    description:
      "Ensure all supply chain partners share both risks and rewards. Aligned incentives create naturally resilient partnerships.",
  },
];

const assessmentAreas = [
  {
    title: "Supplier Concentration Risk",
    description: "Analysis of single points of failure in your supplier base",
    icon: AlertTriangle,
  },
  {
    title: "Geographic Diversification",
    description: "Mapping supplier locations against geopolitical and natural disaster risks",
    icon: Building2,
  },
  {
    title: "Inventory Strategy",
    description: "Evaluation of buffer stock levels and just-in-time vulnerabilities",
    icon: Layers,
  },
  {
    title: "Financial Health Monitoring",
    description: "Supplier financial stability and early warning indicators",
    icon: BarChart3,
  },
  {
    title: "Response Time Analysis",
    description: "How quickly can your supply chain adapt to disruptions?",
    icon: Clock,
  },
  {
    title: "Contractual Flexibility",
    description: "Review of contract terms that enable or restrict adaptability",
    icon: RefreshCw,
  },
];

const benefits = [
  "Identify hidden vulnerabilities before they become crises",
  "Build strategic redundancy without excessive cost",
  "Develop supplier relationships that strengthen under pressure",
  "Create early warning systems for supply chain disruptions",
  "Transform risk management from defensive to opportunistic",
  "Gain competitive advantage during market volatility",
];

export default function AntiFragilePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    // In production, this would submit to an API
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              Supply Chain Resilience
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              AntiFragile Supply Chain
              <span className="text-primary"> Analysis</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Stop just surviving disruptions—start thriving because of them. Our AntiFragile 
              methodology transforms your supply chain from a liability into a competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-8">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Discovery Call
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Schedule Your Discovery Call</DialogTitle>
                    <DialogDescription>
                      Book a free 30-minute consultation to discuss how AntiFragile principles 
                      can transform your supply chain.
                    </DialogDescription>
                  </DialogHeader>
                  {!formSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input id="firstName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input id="lastName" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email *</Label>
                        <Input id="email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input id="company" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone number</Label>
                        <Input id="phone" type="tel" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-50">1-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="challenges">
                          What supply chain challenges are you facing?
                        </Label>
                        <Textarea
                          id="challenges"
                          placeholder="Tell us about your current supply chain concerns..."
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Request Discovery Call
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                      <p className="text-muted-foreground">
                        We've received your request. A member of our team will contact you 
                        within 24 hours to schedule your discovery call.
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white bg-white/10 hover:bg-white/20">
                <ArrowRight className="mr-2 h-5 w-5" />
                Learn More Below
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is AntiFragile Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What is an AntiFragile Supply Chain?
            </h2>
            <p className="text-lg text-muted-foreground">
              Coined by Nassim Nicholas Taleb, "AntiFragile" describes systems that don't just 
              withstand shocks—they actually get stronger from them. While most supply chains 
              are fragile (they break under stress) or at best robust (they resist stress), 
              an AntiFragile supply chain uses stress as fuel for improvement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Fragile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700/80">
                  Breaks under stress. Single suppliers, just-in-time everything, 
                  optimized for efficiency at the expense of resilience.
                </p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Shield className="h-5 w-5" />
                  Robust
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700/80">
                  Resists stress but doesn't improve. Traditional risk management 
                  focuses here—surviving disruptions without learning from them.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  AntiFragile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700/80">
                  Grows stronger from stress. Uses volatility as information, 
                  builds optionality, and gains competitive advantage from chaos.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              "Wind extinguishes a candle but energizes a fire."
            </p>
            <p className="text-muted-foreground">
              — Nassim Nicholas Taleb, <em>Antifragile: Things That Gain from Disorder</em>
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Core AntiFragile Principles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our methodology applies these proven principles to manufacturing supply chains
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {antifragilePrinciples.map((principle) => (
              <Card key={principle.title} className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <principle.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Areas */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our AntiFragile Assessment
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our comprehensive analysis examines your supply chain through the AntiFragile 
                lens, identifying vulnerabilities and opportunities across six critical dimensions.
              </p>
              <div className="space-y-4">
                {assessmentAreas.map((area) => (
                  <div key={area.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <area.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{area.title}</h3>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black text-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">What You'll Receive</h3>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-gray-400 mb-4">
                  Ready to build a supply chain that thrives on uncertainty?
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Your Discovery Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stop Reacting. Start Thriving.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The next disruption isn't a matter of if—it's when. Schedule a free discovery 
              call to learn how AntiFragile principles can transform your supply chain from 
              a source of anxiety into a source of competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => setIsDialogOpen(true)}>
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Discovery Call
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Free 30-minute consultation • No obligation • Actionable insights guaranteed
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
