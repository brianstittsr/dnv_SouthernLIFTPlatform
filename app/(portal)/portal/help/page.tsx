"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Users,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  FileText,
  Calendar,
  Settings,
  HelpCircle,
  Video,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const quickStartGuides = [
  {
    role: "Admin",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    steps: [
      "Complete your profile setup",
      "Configure integrations in Settings",
      "Add team members and assign roles",
      "Set up platform preferences",
      "Review audit logs and monitoring",
    ],
    dashboard: "/portal/command-center",
  },
  {
    role: "Buyer",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    steps: [
      "Complete your buyer profile",
      "Browse the supplier directory",
      "Save your favorite suppliers",
      "Request introductions",
      "Review proof packs and credentials",
    ],
    dashboard: "/portal/buyer/dashboard",
  },
  {
    role: "Partner/Affiliate",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-100",
    steps: [
      "Set up your networking profile",
      "Create your proof pack",
      "Start tracking leads",
      "Analyze partner overlaps",
      "Monitor your revenue dashboard",
    ],
    dashboard: "/portal/partner/dashboard",
  },
  {
    role: "SME",
    icon: GraduationCap,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    steps: [
      "Complete your expertise profile",
      "Browse available cohorts",
      "Enroll in relevant programs",
      "Track certification progress",
      "Update your availability",
    ],
    dashboard: "/portal/sme/dashboard",
  },
  {
    role: "Instructor",
    icon: BookOpen,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    steps: [
      "Set up your instructor profile",
      "Create your first cohort",
      "Design curriculum content",
      "Create assessments",
      "Manage student enrollments",
    ],
    dashboard: "/portal/instructor/dashboard",
  },
  {
    role: "Team Member",
    icon: Briefcase,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    steps: [
      "Complete your profile",
      "Create your first opportunity",
      "Set up your calendar",
      "Join active projects",
      "Complete assigned action items",
    ],
    dashboard: "/portal/dashboard",
  },
];

const featureCategories = [
  {
    title: "Opportunity Management",
    icon: Target,
    description: "Track deals through your sales pipeline",
    features: [
      { name: "Create Opportunities", path: "/portal/opportunities/new" },
      { name: "Pipeline View", path: "/portal/opportunities" },
      { name: "Stage Management", path: "/portal/opportunities" },
      { name: "Value Tracking", path: "/portal/opportunities" },
    ],
  },
  {
    title: "Project Management",
    icon: Briefcase,
    description: "Organize and track project progress",
    features: [
      { name: "Create Projects", path: "/portal/projects/new" },
      { name: "Project Dashboard", path: "/portal/projects" },
      { name: "Task Management", path: "/portal/projects" },
      { name: "Team Collaboration", path: "/portal/projects" },
    ],
  },
  {
    title: "Proof Packs",
    icon: FileText,
    description: "Manage compliance documents and credentials",
    features: [
      { name: "Create Proof Pack", path: "/portal/proof-packs/create" },
      { name: "Upload Documents", path: "/portal/proof-packs" },
      { name: "Health Scoring", path: "/portal/proof-packs" },
      { name: "Share with Buyers", path: "/portal/proof-packs" },
    ],
  },
  {
    title: "Learning & Development",
    icon: GraduationCap,
    description: "Cohorts, certifications, and training",
    features: [
      { name: "Browse Cohorts", path: "/portal/sme/cohorts/browse" },
      { name: "Enroll in Programs", path: "/portal/sme/cohorts" },
      { name: "Track Certifications", path: "/portal/sme/certificates" },
      { name: "Create Cohorts", path: "/portal/instructor/cohorts/new" },
    ],
  },
  {
    title: "Networking",
    icon: Users,
    description: "Connect with buyers, partners, and experts",
    features: [
      { name: "Browse Directory", path: "/portal/buyer/directory" },
      { name: "Request Introductions", path: "/portal/buyer/introductions" },
      { name: "Manage Connections", path: "/portal/networking" },
      { name: "Profile Setup", path: "/portal/profile" },
    ],
  },
  {
    title: "Calendar & Meetings",
    icon: Calendar,
    description: "Schedule and manage meetings",
    features: [
      { name: "View Calendar", path: "/portal/calendar" },
      { name: "Schedule Meetings", path: "/portal/calendar" },
      { name: "Meeting History", path: "/portal/meetings" },
      { name: "Availability Settings", path: "/portal/availability" },
    ],
  },
];

const commonTasks = [
  {
    task: "Update My Profile",
    description: "Edit personal information, expertise, and networking details",
    path: "/portal/profile",
    icon: Users,
  },
  {
    task: "Create an Opportunity",
    description: "Add a new deal to your pipeline",
    path: "/portal/opportunities/new",
    icon: Target,
  },
  {
    task: "Upload Documents",
    description: "Add certifications and compliance documents to your proof pack",
    path: "/portal/proof-packs",
    icon: FileText,
  },
  {
    task: "Browse Directory",
    description: "Find suppliers, partners, or service providers",
    path: "/portal/buyer/directory",
    icon: Search,
  },
  {
    task: "Configure Settings",
    description: "Manage integrations, notifications, and preferences",
    path: "/portal/settings",
    icon: Settings,
  },
  {
    task: "View Analytics",
    description: "Access reports and performance metrics",
    path: "/portal/command-center",
    icon: TrendingUp,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = quickStartGuides.filter((guide) =>
    guide.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeatures = featureCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to use the SVP Platform features and capabilities
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/docs/USER-ROLES-DASHBOARDS.md" target="_blank">
            <FileText className="mr-2 h-4 w-4" />
            View Full Documentation
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help topics, features, or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="common-tasks">Common Tasks</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guides by Role</CardTitle>
              <CardDescription>
                Choose your role to see a personalized getting started guide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGuides.map((guide) => {
                  const Icon = guide.icon;
                  return (
                    <Card key={guide.role} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${guide.bgColor}`}>
                            <Icon className={`h-6 w-6 ${guide.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{guide.role}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {guide.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={guide.dashboard}>
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Platform Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Understanding the SVP Platform ecosystem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    What is SVP Platform?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive business management platform connecting buyers, suppliers,
                    partners, and experts. Manage opportunities, projects, compliance, learning,
                    and networking all in one place.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Who Uses SVP Platform?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Administrators, buyers, partners/affiliates, SMEs, instructors, QA reviewers,
                    and team members. Each role has specialized tools and dashboards.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Key Features
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    CRM, project management, proof packs, learning cohorts, certifications,
                    networking directory, calendar, analytics, and integrations.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Integrations
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with Mattermost, Apollo, GoHighLevel, Zoom, LinkedIn, and more.
                    Configure integrations in Settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredFeatures.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.features.map((feature) => (
                        <Link
                          key={feature.name}
                          href={feature.path}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <span className="text-sm">{feature.name}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Common Tasks Tab */}
        <TabsContent value="common-tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Performed Tasks</CardTitle>
              <CardDescription>Quick access to common workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {commonTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <Link
                      key={task.task}
                      href={task.path}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {task.task}
                        </h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Tutorials
              </CardTitle>
              <CardDescription>Watch step-by-step guides (Coming Soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Video tutorials are coming soon. Check back later for guided walkthroughs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>Detailed guides and references</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/docs/USER-ROLES-DASHBOARDS.md"
                  target="_blank"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      User Roles & Dashboards
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complete role definitions and capabilities
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/docs/CREATE-USER-PROFILE.md"
                  target="_blank"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Profile Setup Guide
                    </p>
                    <p className="text-sm text-muted-foreground">
                      How to create and manage your profile
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/docs/MEMBER-STORAGE-SYSTEM.md"
                  target="_blank"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Member Storage System
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Understanding data structure
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Support & Contact
                </CardTitle>
                <CardDescription>Get help when you need it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <p className="font-medium mb-1">Platform Settings</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure integrations, notifications, and preferences
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Open Settings
                    </Link>
                  </Button>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium mb-1">Contact Administrator</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Reach out to your platform admin for assistance
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/admin/user-management">
                      <Users className="mr-2 h-4 w-4" />
                      View Admins
                    </Link>
                  </Button>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium mb-1">Feature Requests</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Submit ideas and suggestions for improvements
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/bug-tracker">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Bug Tracker
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Frequently accessed pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/profile">My Profile</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/settings">Settings</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/calendar">Calendar</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/opportunities">Opportunities</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/projects">Projects</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/command-center">Command Center</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
                <CardDescription>Platform health and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/portal/admin/monitoring">
                    View Monitoring
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
