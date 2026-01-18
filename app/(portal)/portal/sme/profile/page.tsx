"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";

interface SmeProfile {
  id: string;
  userId: string;
  companyName: string;
  expertise: string[];
  certifications: string[];
  yearsExperience: number;
  bio: string;
  website: string;
  linkedIn: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function SmeProfilePage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smeProfile, setSmeProfile] = useState<Partial<SmeProfile>>({
    companyName: "",
    expertise: [],
    certifications: [],
    yearsExperience: 0,
    bio: "",
    website: "",
    linkedIn: "",
  });

  useEffect(() => {
    loadProfile();
  }, [profile.id]);

  const loadProfile = async () => {
    if (!db || !profile.id) return;
    
    try {
      const docRef = doc(db, "smeProfiles", profile.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSmeProfile(docSnap.data() as SmeProfile);
      }
    } catch (error) {
      console.error("Error loading SME profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!db || !profile.id) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, "smeProfiles", profile.id);
      await updateDoc(docRef, {
        ...smeProfile,
        userId: profile.id,
        updatedAt: Timestamp.now(),
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">SME Profile</h1>
          <p className="text-muted-foreground">Manage your subject matter expert profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your SME profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={smeProfile.companyName}
              onChange={(e) => setSmeProfile({ ...smeProfile, companyName: e.target.value })}
              placeholder="Your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              value={smeProfile.yearsExperience}
              onChange={(e) => setSmeProfile({ ...smeProfile, yearsExperience: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={smeProfile.bio}
              onChange={(e) => setSmeProfile({ ...smeProfile, bio: e.target.value })}
              placeholder="Tell us about your expertise..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={smeProfile.website}
              onChange={(e) => setSmeProfile({ ...smeProfile, website: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
            <Input
              id="linkedIn"
              type="url"
              value={smeProfile.linkedIn}
              onChange={(e) => setSmeProfile({ ...smeProfile, linkedIn: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
