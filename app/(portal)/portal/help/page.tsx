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
  ClipboardList,
  BarChart3,
  Building2,
} from "lucide-react";

const quickStartGuides = [
  {
    role: "LIFT Client",
    icon: GraduationCap,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    steps: [
      "Complete your LIFT client profile",
      "Finish the onboarding steps on My LIFT",
      "Fill out your assigned LIFT forms",
      "Browse and enroll in courses",
      "Track your certificates and progress",
    ],
    dashboard: "/portal/dashboard",
  },
  {
    role: "LIFT Staff",
    icon: Briefcase,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    steps: [
      "Complete your profile",
      "Review new client submissions",
      "Check the LMS dashboard for training metrics",
      "Manage documents and opportunities",
      "Use the role switcher to preview other views",
    ],
    dashboard: "/portal/dashboard",
  },
  {
    role: "Instructor",
    icon: BookOpen,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    steps: [
      "Set up your instructor profile",
      "Create a course and build the curriculum",
      "Schedule sessions and create Zoom meetings",
      "Track learner progress and attendance",
      "Issue and review certificates",
    ],
    dashboard: "/portal/instructor/courses",
  },
  {
    role: "Platform Admin",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    steps: [
      "Configure integrations in Settings",
      "Invite team members and assign roles",
      "Review the LMS dashboard and LIFT reports",
      "Manage forms in the Form Studio",
      "Monitor audit logs and platform health",
    ],
    dashboard: "/portal/command-center",
  },
];

const featureCategories = [
  {
    title: "My LIFT & Onboarding",
    icon: ClipboardList,
    description: "Client onboarding steps, intake forms, and program progress",
    features: [
      { name: "Onboarding Steps", path: "/portal/onboarding-progress" },
      { name: "My LIFT Forms", path: "/portal/lift/forms" },
      { name: "My Profile", path: "/portal/profile" },
      { name: "Company Profile", path: "/portal/company" },
    ],
  },
  {
    title: "Courses & Learning (LMS)",
    icon: GraduationCap,
    description: "Enroll in training, complete sessions, earn certificates",
    features: [
      { name: "Browse Courses", path: "/portal/sme/courses/browse" },
      { name: "My Courses", path: "/portal/sme/courses" },
      { name: "My Certificates", path: "/portal/sme/certificates" },
      { name: "Create a Course", path: "/portal/instructor/courses/new" },
    ],
  },
  {
    title: "Documents",
    icon: FileText,
    description: "Upload and manage files with role-based visibility",
    features: [
      { name: "All Documents", path: "/portal/documents" },
      { name: "Upload a Document", path: "/portal/documents" },
      { name: "Group by Company", path: "/portal/documents" },
      { name: "Agreements & MOUs", path: "/portal/agreements" },
    ],
  },
  {
    title: "Opportunities",
    icon: Target,
    description: "Track contracting and business opportunities",
    features: [
      { name: "All Opportunities", path: "/portal/opportunities" },
      { name: "Create Opportunity", path: "/portal/opportunities/new" },
      { name: "Pipeline View", path: "/portal/opportunities" },
      { name: "Group by Company", path: "/portal/opportunities" },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    description: "LMS training metrics and program reporting",
    features: [
      { name: "LMS Dashboard", path: "/portal/admin/lms" },
      { name: "LIFT Reports", path: "/portal/admin/lift/reports" },
      { name: "Certificate Registry", path: "/portal/admin/lms" },
      { name: "Command Center", path: "/portal/command-center" },
    ],
  },
  {
    title: "Team & Directory",
    icon: Users,
    description: "Manage staff, members, and partner organizations",
    features: [
      { name: "Team Members", path: "/portal/admin/team-members" },
      { name: "Invite Someone", path: "/portal/admin/team-members" },
      { name: "Directory", path: "/portal/buyer/directory" },
      { name: "Companies", path: "/portal/company" },
    ],
  },
];

const commonTasks = [
  {
    task: "Complete My Profile",
    description: "Fill in your business details — used for AI-powered matching",
    path: "/portal/profile",
    icon: Users,
  },
  {
    task: "Upload a Document",
    description: "Add files and choose which roles can see them",
    path: "/portal/documents",
    icon: FileText,
  },
  {
    task: "Enroll in a Course",
    description: "Browse the course catalog and join a training program",
    path: "/portal/sme/courses/browse",
    icon: GraduationCap,
  },
  {
    task: "Download a Certificate",
    description: "Get a PDF of your certificate or share it on LinkedIn",
    path: "/portal/sme/certificates",
    icon: Award,
  },
  {
    task: "Create a Zoom Meeting",
    description: "Instructors: add a Zoom meeting to a course session",
    path: "/portal/instructor/courses",
    icon: Video,
  },
  {
    task: "Configure Settings",
    description: "Set up Zoom, email, and other integrations",
    path: "/portal/settings",
    icon: Settings,
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
            Learn how to use the LIFT Rural Business Center platform
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/portal/resources">
            <BookOpen className="mr-2 h-4 w-4" />
            Resource Library
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardDescription>
                Understanding the LIFT Rural Business Center platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    What is the LIFT platform?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The digital home of the Southern University MBDA LIFT Rural
                    Business Center. It manages the full client lifecycle —
                    intake, eligibility, advising, training, capital readiness,
                    and contracting support — for rural Louisiana businesses.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Who uses it?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    LIFT clients (rural business owners), LIFT staff and
                    advisors, course instructors, and platform administrators.
                    Each role sees the tools and data relevant to them.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Key features
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Client onboarding, LIFT forms with AI prefill, document
                    management with role permissions, opportunities, an LMS
                    with certificates, and automated training reports.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Integrations
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Zoom meetings on course sessions with automatic attendance
                    tracking, LinkedIn certificate sharing and course
                    announcements, plus AI-powered reporting — configured in
                    Settings.
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

          {/* LMS deep-dive */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                How the LMS works
              </CardTitle>
              <CardDescription>
                Courses, sessions, certificates, and automatic tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">For learners</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Browse the catalog and enroll in a course</li>
                    <li>Work through modules and sessions in order</li>
                    <li>Join live sessions over Zoom</li>
                    <li>Earn a certificate on completion — download the PDF or share it on LinkedIn</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">For instructors</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Build a curriculum of modules and sessions</li>
                    <li>Create Zoom meetings directly on sessions</li>
                    <li>Sync attendance automatically after each meeting</li>
                    <li>Track learner progress and issue certificates</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">For staff</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>LMS dashboard: enrollments, completions, attendance, certificates</li>
                    <li>Weekly automated training report emailed to staff</li>
                    <li>Certificate registry with public verification links</li>
                    <li>Course announcements drafted for LinkedIn on publish</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
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

          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificates &amp; verification
              </CardTitle>
              <CardDescription>Share and verify training completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Every completed course issues a numbered certificate. From
                  <strong> My LIFT → Certificates</strong> you can download the
                  PDF, copy the public verification link, add it to your
                  LinkedIn profile, or share it as a LinkedIn post.
                </p>
                <p>
                  Anyone can confirm a certificate is genuine at
                  <strong> /verify/certificate/&lt;certificate-number&gt;</strong> —
                  no sign-in required.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Guides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Guides
                </CardTitle>
                <CardDescription>Platform walkthroughs and references</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/portal/resources"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Resource Library
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Templates, guides, and program materials
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/portal/onboarding-progress"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Onboarding Checklist
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Track your LIFT client onboarding steps
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/portal/lift/forms"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      LIFT Forms
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Intake, eligibility, baseline, and program forms
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/portal/settings"
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Integration Setup
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Zoom credentials and platform integrations
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                  <p className="font-medium mb-1">Contact the LIFT Center</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Reach out to the program team for assistance
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/contact">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium mb-1">Report an Issue</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Submit bugs, ideas, and suggestions
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
                    <Link href="/portal/documents">Documents</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/sme/courses">My Courses</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/sme/certificates">Certificates</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/opportunities">Opportunities</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/admin/lms">LMS Dashboard</Link>
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
