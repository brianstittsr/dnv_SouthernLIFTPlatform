"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/contexts/user-profile-context";
import { ClientRegistrationModal } from "@/components/client-registration";
import { Building2, ClipboardList, UserPlus, CheckCircle, Users } from "lucide-react";

export default function ClientRegistrationPage() {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal when page loads
  useEffect(() => {
    const timer = setTimeout(() => setIsModalOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Company Profile",
      description: "Share your business information and capabilities",
    },
    {
      icon: ClipboardList,
      title: "Certifications",
      description: "Document your minority business certifications",
    },
    {
      icon: Users,
      title: "KDM & Associates Support",
      description: "Get matched with government contracting opportunities",
    },
    {
      icon: CheckCircle,
      title: "Expert Guidance",
      description: "Access training, proposal support, and teaming partners",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Client Registration</h1>
        <p className="text-muted-foreground">
          Register with KDM & Associates to access exclusive 
          government contracting resources, training, and partnership opportunities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Ready to Register?</CardTitle>
          <CardDescription className="text-base">
            Complete the registration form to get started with KDM & Associates services.
            The form takes about 5-10 minutes to complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button size="lg" onClick={() => setIsModalOpen(true)}>
            <ClipboardList className="h-5 w-5 mr-2" />
            Start Registration
          </Button>
        </CardContent>
      </Card>

      <ClientRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          // Redirect to dashboard or show success message
          router.push("/portal/dashboard");
        }}
      />
    </div>
  );
}
