"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { 
  User, 
  Save, 
  Briefcase, 
  Award, 
  Handshake,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Plus,
  X,
  GraduationCap,
  Calendar,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Affiliate categories
const affiliateCategories = [
  { id: "manufacturing", name: "Manufacturing Operations" },
  { id: "quality", name: "Quality & ISO" },
  { id: "technology", name: "Technology & AI" },
  { id: "finance", name: "Finance & Accounting" },
  { id: "hr", name: "Human Resources" },
  { id: "marketing", name: "Marketing & Sales" },
  { id: "legal", name: "Legal & Compliance" },
  { id: "supply-chain", name: "Supply Chain" },
];

// Industries
const industries = [
  "Aerospace", "Automotive", "Electronics", "Food & Beverage",
  "Medical Devices", "Pharmaceuticals", "Plastics", "Textiles",
  "Metal Fabrication", "Chemical", "Energy", "Other"
];

export default function SmeProfilePage() {
  const { profile: userProfile, getDisplayName, getInitials } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Local profile state synced with userProfile context
  const [profile, setProfile] = useState({
    firstName: userProfile.firstName || "",
    lastName: userProfile.lastName || "",
    email: userProfile.email || "",
    phone: userProfile.phone || "",
    company: userProfile.company || "",
    title: userProfile.jobTitle || "",
    location: userProfile.location || "",
    bio: userProfile.bio || "",
    website: "",
    categories: [] as string[],
    expertise: [] as string[],
    industries: [] as string[],
    certifications: [] as any[],
    idealReferral: "",
    uniqueValueProposition: "",
    problemsYouSolve: "",
    targetClientProfile: "",
    goalsThisQuarter: "",
  });

  const [newExpertise, setNewExpertise] = useState("");
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    date: "",
    expires: "",
  });
  const [showCertDialog, setShowCertDialog] = useState(false);

  // Sync profile state with userProfile context when it loads
  useEffect(() => {
    if (userProfile.id) {
      setProfile((prev) => ({
        ...prev,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        company: userProfile.company || "",
        title: userProfile.jobTitle || "",
        location: userProfile.location || "",
        bio: userProfile.bio || "",
      }));
      
      if (userProfile.avatarUrl && !avatarPreview) {
        setAvatarPreview(userProfile.avatarUrl);
      }
    }
  }, [userProfile.id, userProfile.firstName, userProfile.lastName, userProfile.email, 
      userProfile.phone, userProfile.jobTitle, userProfile.company, userProfile.location, 
      userProfile.bio, userProfile.avatarUrl]);

  const updateProfile = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleAvatarUpload = async (base64Image: string) => {
    if (!auth?.currentUser || !db) {
      toast.error("Authentication required");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        avatarUrl: base64Image,
        updatedAt: Timestamp.now(),
      });
      
      setAvatarPreview(base64Image);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update profile photo");
    }
  };

  const saveProfile = async () => {
    if (!auth?.currentUser || !db) {
      toast.error("Authentication required");
      return;
    }

    setIsSaving(true);
    try {
      const now = Timestamp.now();
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        company: profile.company,
        jobTitle: profile.title,
        location: profile.location,
        bio: profile.bio,
        avatarUrl: avatarPreview || userProfile.avatarUrl || "",
        updatedAt: now,
      });
      
      if (userProfile.id && userProfile.id !== auth.currentUser.uid) {
        try {
          const teamMemberRef = doc(db, "team_members", userProfile.id);
          await updateDoc(teamMemberRef, {
            firstName: profile.firstName,
            lastName: profile.lastName,
            mobile: profile.phone,
            company: profile.company,
            title: profile.title,
            location: profile.location,
            bio: profile.bio,
            avatar: avatarPreview || userProfile.avatarUrl || "",
            updatedAt: now,
          });
        } catch (error) {
          console.log("No team member to update or error:", error);
        }
      }
      
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      updateProfile("expertise", [...profile.expertise, newExpertise.trim()]);
      setNewExpertise("");
    }
  };

  const removeExpertise = (item: string) => {
    updateProfile("expertise", profile.expertise.filter((e) => e !== item));
  };

  const toggleCategory = (categoryId: string) => {
    if (profile.categories.includes(categoryId)) {
      updateProfile("categories", profile.categories.filter((c) => c !== categoryId));
    } else {
      updateProfile("categories", [...profile.categories, categoryId]);
    }
  };

  const toggleIndustry = (industry: string) => {
    if (profile.industries.includes(industry)) {
      updateProfile("industries", profile.industries.filter((i) => i !== industry));
    } else {
      updateProfile("industries", [...profile.industries, industry]);
    }
  };

  const addCertification = () => {
    if (newCertification.name.trim()) {
      const cert = {
        id: Date.now().toString(),
        name: newCertification.name,
        issuer: newCertification.issuer,
        date: newCertification.date,
        expires: newCertification.expires || null,
        status: "active" as const,
      };
      updateProfile("certifications", [...profile.certifications, cert]);
      setNewCertification({ name: "", issuer: "", date: "", expires: "" });
      setShowCertDialog(false);
    }
  };

  const removeCertification = (id: string) => {
    updateProfile("certifications", profile.certifications.filter((c: any) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SME Profile</h1>
          <p className="text-muted-foreground">
            Manage your subject matter expert profile and networking preferences
          </p>
        </div>
        <Button onClick={saveProfile} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Profile Header Card with Photo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <AvatarUpload
              currentAvatar={avatarPreview || userProfile.avatarUrl}
              initials={getInitials()}
              onUpload={handleAvatarUpload}
              size="lg"
            />

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {profile.firstName || userProfile.firstName} {profile.lastName || userProfile.lastName}
                </h2>
                <Badge variant="secondary">SME</Badge>
              </div>
              <p className="text-muted-foreground">{profile.title || "Add your professional title"}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {profile.company}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basic">
            <User className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="professional">
            <Briefcase className="h-4 w-4 mr-2" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="h-4 w-4 mr-2" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="networking">
            <Handshake className="h-4 w-4 mr-2" />
            Networking
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact and company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => updateProfile("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => updateProfile("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateProfile("email", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => updateProfile("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => updateProfile("company", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => updateProfile("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => updateProfile("bio", e.target.value)}
                  rows={4}
                  placeholder="Tell others about yourself and your background..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Title</CardTitle>
              <CardDescription>Your role and professional identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={profile.title}
                  onChange={(e) => updateProfile("title", e.target.value)}
                  placeholder="e.g., Manufacturing Consultant, ISO Specialist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => updateProfile("website", e.target.value)}
                    className="pl-10"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Select the categories that best describe your expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {affiliateCategories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={profile.categories.includes(cat.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industries</CardTitle>
              <CardDescription>Select the industries you have experience in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <Badge
                    key={industry}
                    variant={profile.industries.includes(industry) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>Add your specific skills and areas of expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pr-1">
                    {skill}
                    <button
                      onClick={() => removeExpertise(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {profile.expertise.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExpertise()}
                />
                <Button onClick={addExpertise}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Professional Certifications</CardTitle>
                  <CardDescription>Manage your certifications and credentials</CardDescription>
                </div>
                <Button onClick={() => setShowCertDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.certifications.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-full",
                        cert.status === "active" ? "bg-green-100" : "bg-yellow-100"
                      )}>
                        <GraduationCap className={cn(
                          "h-5 w-5",
                          cert.status === "active" ? "text-green-600" : "text-yellow-600"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuer} • Issued {new Date(cert.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                        </p>
                        {cert.expires && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(cert.expires).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCertification(cert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {profile.certifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No certifications added yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowCertDialog(true)}
                    >
                      Add Your First Certification
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Networking Tab */}
        <TabsContent value="networking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Networking Profile</CardTitle>
              <CardDescription>
                This information helps other affiliates understand how to refer business to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idealReferral">Who is your ideal referral partner?</Label>
                <Textarea
                  id="idealReferral"
                  value={profile.idealReferral}
                  onChange={(e) => updateProfile("idealReferral", e.target.value)}
                  rows={3}
                  placeholder="Describe the type of affiliate who would be a great referral partner for you..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueValueProposition">What is your unique value proposition?</Label>
                <Textarea
                  id="uniqueValueProposition"
                  value={profile.uniqueValueProposition}
                  onChange={(e) => updateProfile("uniqueValueProposition", e.target.value)}
                  rows={3}
                  placeholder="What makes you different from others in your field?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemsYouSolve">What problems do you solve for clients?</Label>
                <Textarea
                  id="problemsYouSolve"
                  value={profile.problemsYouSolve}
                  onChange={(e) => updateProfile("problemsYouSolve", e.target.value)}
                  rows={3}
                  placeholder="Describe the main challenges you help clients overcome..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetClientProfile">Describe your ideal client</Label>
                <Textarea
                  id="targetClientProfile"
                  value={profile.targetClientProfile}
                  onChange={(e) => updateProfile("targetClientProfile", e.target.value)}
                  rows={3}
                  placeholder="Industry, company size, specific needs..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalsThisQuarter">What are your goals this quarter?</Label>
                <Textarea
                  id="goalsThisQuarter"
                  value={profile.goalsThisQuarter}
                  onChange={(e) => updateProfile("goalsThisQuarter", e.target.value)}
                  rows={3}
                  placeholder="What do you hope to achieve through the affiliate network?"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
