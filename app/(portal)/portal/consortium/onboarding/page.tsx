"use client";

import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  User,
  Building2,
  FileText,
  Award,
  Target,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function ConsortiumOnboardingPage() {
  const { profile } = useUserProfile();
  const router = useRouter();

  const handleStepClick = (stepId: string) => {
    switch (stepId) {
      case "readiness":
        router.push("/portal/consortium/readiness");
        break;
      case "categorization":
        router.push("/portal/consortium/matching");
        break;
      case "active":
        router.push("/portal/consortium/performance");
        break;
      default:
        break;
    }
  };

  const onboardingSteps = [
    {
      id: "profile",
      title: "Stage 1: Profile Setup",
      description: "Complete your personal and company information",
      completed: true,
      icon: User,
    },
    {
      id: "capabilities",
      title: "Stage 2: Capabilities",
      description: "Specify your NAICS codes and certifications",
      completed: true,
      icon: Target,
    },
    {
      id: "readiness",
      title: "Stage 3: Readiness Validation",
      description: "Upload government contracting documentation",
      completed: false,
      icon: Award,
    },
    {
      id: "categorization",
      title: "Stage 4: AI Matching Setup",
      description: "Configure capability categorization and matching preferences",
      completed: false,
      icon: Target,
    },
    {
      id: "active",
      title: "Stage 5: Active Engagement",
      description: "Continuous engagement and performance tracking",
      completed: false,
      icon: TrendingUp,
    },
  ];

  const completedSteps = onboardingSteps.filter((step) => step.completed).length;
  const progress = (completedSteps / onboardingSteps.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consortium Onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress through the KDM Consortium onboarding process
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>
                {completedSteps} of {onboardingSteps.length} steps completed
              </CardDescription>
            </div>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <div className="space-y-4">
        {onboardingSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.id}
              className={step.completed ? "border-green-200 bg-green-50/50" : ""}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {step.title}
                      {step.completed && (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {step.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant={step.completed ? "outline" : "default"}
                    size="sm"
                    disabled={step.completed}
                    onClick={() => handleStepClick(step.id)}
                  >
                    {step.completed ? "View" : "Start"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Resources</CardTitle>
          <CardDescription>
            Helpful resources to guide you through the onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">Consortium Member Guide</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive guide to getting started with the KDM Consortium
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">Pillars Overview</h4>
              <p className="text-sm text-muted-foreground">
                Learn about the 5 pillars and how to select your focus areas
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">NAICS Code Reference</h4>
              <p className="text-sm text-muted-foreground">
                Find the right NAICS codes for your business capabilities
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">Certification Guide</h4>
              <p className="text-sm text-muted-foreground">
                Information on government certifications and how to obtain them
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Our team is here to help you complete your onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              Schedule a Call
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="outline">
              Join Office Hours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
