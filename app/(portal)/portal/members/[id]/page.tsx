"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  ArrowLeft,
  Briefcase,
  Award,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  status?: string;
  joinedDate?: any;
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMember();
  }, [memberId]);

  async function loadMember() {
    try {
      setLoading(true);
      
      if (!db) {
        toast.error("Database connection not available");
        return;
      }
      
      // Try to load from users collection first
      const userDoc = await getDoc(doc(db, "users", memberId));
      
      if (userDoc.exists()) {
        setMember({
          id: userDoc.id,
          ...userDoc.data(),
        } as Member);
      } else {
        // Try team_members collection
        const teamMemberDoc = await getDoc(doc(db, "team_members", memberId));
        
        if (teamMemberDoc.exists()) {
          setMember({
            id: teamMemberDoc.id,
            ...teamMemberDoc.data(),
          } as Member);
        } else {
          toast.error("Member not found");
          router.push("/portal/members");
          return;
        }
      }
    } catch (error) {
      console.error("Error loading member:", error);
      toast.error("Failed to load member");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading member...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Member not found</p>
          <Button onClick={() => router.push("/portal/members")} className="mt-4">
            Back to Members
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    return `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/portal/members")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {member.firstName} {member.lastName}
              </h1>
              {member.title && (
                <p className="text-muted-foreground mt-1">{member.title}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {member.status && (
            <Badge className={getStatusColor(member.status)}>
              {member.status}
            </Badge>
          )}
          {member.role && (
            <Badge variant="outline">{member.role}</Badge>
          )}
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a href={`mailto:${member.email}`} className="text-sm hover:underline">
                {member.email}
              </a>
            </div>
          </CardContent>
        </Card>

        {member.phone && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${member.phone}`} className="text-sm hover:underline">
                  {member.phone}
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {member.company && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{member.company}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Member details and bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {member.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{member.location}</p>
                    </div>
                  </div>
                )}

                {member.joinedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {member.joinedDate?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {member.title && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{member.title}</p>
                    </div>
                  </div>
                )}

                {member.role && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">{member.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Mail className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">Send Message</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact this member
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">View Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Access shared files
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Award className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    View certifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Member activity and engagement history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity log will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Shared files and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document list will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Member Settings</CardTitle>
              <CardDescription>Manage member permissions and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings options will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
