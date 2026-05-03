"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Calendar,
  Target,
  Users,
  Award,
  Briefcase,
  Globe,
  Handshake,
  Clock,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface ConsortiumMemberData {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  bio?: string;
  avatar?: string;
  companyName?: string;
  companyDescription?: string;
  website?: string;
  linkedIn?: string;
  naicsCodes?: string[];
  certifications?: string[];
  consortiumPillarFocus?: string[];
  consortiumJoinedAt?: Timestamp;
  stripeSubscriptionId?: string;
}

const PILLARS = [
  { id: "us-manufacturing", label: "U.S. Manufacturing", icon: Building2, color: "bg-blue-100 text-blue-800" },
  { id: "critical-minerals", label: "Critical Minerals", icon: Target, color: "bg-purple-100 text-purple-800" },
  { id: "defense-contracting", label: "Defense Contracting", icon: Award, color: "bg-green-100 text-green-800" },
  { id: "access-to-capital", label: "Access to Capital", icon: Briefcase, color: "bg-amber-100 text-amber-800" },
  { id: "opportunity-zones", label: "Opportunity Zones", icon: Globe, color: "bg-rose-100 text-rose-800" },
];

export default function ConsortiumDashboardPage() {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<ConsortiumMemberData | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [pursuits, setPursuits] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!db || !profile.id) return;

      try {
        // Get team member data
        const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, profile.id);
        const teamMemberSnap = await getDoc(teamMemberRef);

        if (teamMemberSnap.exists()) {
          const data = teamMemberSnap.data();
          setMemberData({
            id: teamMemberSnap.id,
            ...data,
          } as ConsortiumMemberData);

          // Check if onboarding is complete
          if (!data.consortiumOnboardingComplete) {
            // Onboarding wizard should handle this, but redirect just in case
            router.push("/portal/profile");
            return;
          }
        }

        // TODO: Fetch upcoming meetings from events collection
        // TODO: Fetch matching pursuits based on pillar focus
      } catch (error) {
        console.error("Error fetching consortium data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [profile, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!memberData) {
    return (
      <Alert>
        <AlertDescription>
          Consortium member data not found. Please contact support at kmoore@kdm-assoc.com
        </AlertDescription>
      </Alert>
    );
  }

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={memberData.avatar} />
            <AvatarFallback className="bg-amber-100 text-amber-800 text-lg">
              {memberData.firstName?.[0]}
              {memberData.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {memberData.firstName}</h1>
            <p className="text-muted-foreground">
              KDM Consortium Member since {formatDate(memberData.consortiumJoinedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/portal/pursuits">
              <Target className="w-4 h-4 mr-2" />
              View Pursuits
            </a>
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600" asChild>
            <a href="/book-call">
              <Handshake className="w-4 h-4 mr-2" />
              Book Concierge Call
            </a>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Next Meeting</span>
            </div>
            <p className="text-lg font-semibold mt-1">Fridays 3pm</p>
            <p className="text-xs text-muted-foreground">Weekly Consortium Call</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Pursuits</span>
            </div>
            <p className="text-lg font-semibold mt-1">View Board</p>
            <p className="text-xs text-muted-foreground">
              <a href="/portal/pursuits" className="text-amber-600 hover:underline">
                Browse opportunities →
              </a>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Concierge Hours</span>
            </div>
            <p className="text-lg font-semibold mt-1">2 hrs/month</p>
            <p className="text-xs text-muted-foreground">
              <a href="/book-call" className="text-amber-600 hover:underline">
                Schedule now →
              </a>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Member Directory</span>
            </div>
            <p className="text-lg font-semibold mt-1">12-50 Members</p>
            <p className="text-xs text-muted-foreground">Curated network</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Company Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{memberData.companyName}</CardTitle>
                  <CardDescription>{memberData.companyDescription}</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/portal/profile">
                    Edit Profile
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pillar Focus */}
              {memberData.consortiumPillarFocus && memberData.consortiumPillarFocus.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">5 Pillars Focus Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {memberData.consortiumPillarFocus.map((pillarId) => {
                      const pillar = PILLARS.find((p) => p.id === pillarId);
                      if (!pillar) return null;
                      const Icon = pillar.icon;
                      return (
                        <Badge key={pillarId} className={`${pillar.color} gap-1`}>
                          <Icon className="w-3 h-3" />
                          {pillar.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NAICS Codes */}
              {memberData.naicsCodes && memberData.naicsCodes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">NAICS Codes:</p>
                  <div className="flex flex-wrap gap-1">
                    {memberData.naicsCodes.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {memberData.certifications && memberData.certifications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-1">
                    {memberData.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-4 pt-2">
                {memberData.website && (
                  <a
                    href={memberData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {memberData.linkedIn && (
                  <a
                    href={memberData.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                  >
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:border-amber-300 transition-colors cursor-pointer" onClick={() => router.push("/portal/pursuits")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pursuit Board</p>
                      <p className="text-sm text-muted-foreground">Browse opportunities</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-amber-300 transition-colors cursor-pointer" onClick={() => router.push("/events")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Events & Meetings</p>
                      <p className="text-sm text-muted-foreground">Upcoming briefings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-amber-300 transition-colors cursor-pointer" onClick={() => router.push("/book-call")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Handshake className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Book Concierge</p>
                      <p className="text-sm text-muted-foreground">Schedule support</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Public Profile</CardTitle>
              <CardDescription>
                This is how you appear on the KDM Consortium member page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={memberData.avatar} />
                  <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                    {memberData.firstName?.[0]}
                    {memberData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {memberData.firstName} {memberData.lastName}
                  </h3>
                  <p className="text-muted-foreground">{memberData.title}</p>
                  {memberData.bio && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">{memberData.bio}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">{memberData.companyName}</h4>
                <p className="text-sm text-muted-foreground">{memberData.companyDescription}</p>
              </div>

              <Button asChild>
                <a href="/portal/profile">Edit Full Profile</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <a href="/5-pillars" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    <span>The 5 Pillars Strategy</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
                <a href="/portal/pursuits" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Pursuit Board</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </a>
                <a href="/events" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span>Events & Briefings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
