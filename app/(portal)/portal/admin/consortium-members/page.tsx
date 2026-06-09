"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Send,
  CheckCircle2,
  UserX,
  CalendarPlus,
} from "lucide-react";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type ConsortiumMemberDoc } from "@/lib/schema";
import { logActivity } from "@/lib/activity-logger";

export default function ConsortiumMembersPage() {
  const [members, setMembers] = useState<ConsortiumMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ConsortiumMemberDoc | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailPrimary: "",
    emailSecondary: "",
    mobile: "",
    expertise: "",
    title: "",
    company: "",
    location: "",
    bio: "",
    linkedIn: "",
    website: "",
    membershipTier: "core-capture" as "founder" | "core-capture" | "elite" | "standard",
    membershipStatus: "active" as "active" | "inactive" | "pending" | "suspended",
    tags: [] as string[],
  });

  const fetchMembers = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CONSORTIUM_MEMBERS));
      const membersData: ConsortiumMemberDoc[] = [];
      querySnapshot.forEach((docSnap) => {
        membersData.push({ id: docSnap.id, ...docSnap.data() } as ConsortiumMemberDoc);
      });
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching consortium members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      emailPrimary: "",
      emailSecondary: "",
      mobile: "",
      expertise: "",
      title: "",
      company: "",
      location: "",
      bio: "",
      linkedIn: "",
      website: "",
      membershipTier: "core-capture",
      membershipStatus: "active",
      tags: [],
    });
    setEditingMember(null);
  };

  const handleSaveMember = async () => {
    if (!db) {
      alert("Firebase not initialized");
      return;
    }
    try {
      if (editingMember) {
        const docRef = doc(db, COLLECTIONS.CONSORTIUM_MEMBERS, editingMember.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: Timestamp.now(),
        });
        await logActivity({
          type: "update",
          entityType: "consortium-member",
          entityId: editingMember.id,
          entityName: `${formData.firstName} ${formData.lastName}`,
          description: `Consortium member updated: ${formData.firstName} ${formData.lastName}`,
        });
      } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.CONSORTIUM_MEMBERS), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        await logActivity({
          type: "create",
          entityType: "consortium-member",
          entityId: docRef.id,
          entityName: `${formData.firstName} ${formData.lastName}`,
          description: `Consortium member created: ${formData.firstName} ${formData.lastName}`,
        });
      }
      setDialogOpen(false);
      resetForm();
      await fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Error saving member. Check console for details.");
    }
  };

  const handleDeleteMember = async (id: string, memberName: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this consortium member?")) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.CONSORTIUM_MEMBERS, id));
      await logActivity({
        type: "delete",
        entityType: "consortium-member",
        entityId: id,
        entityName: memberName,
        description: `Consortium member removed: ${memberName}`,
      });
      await fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Error deleting member. Check console for details.");
    }
  };

  const handleResendWelcomeEmail = async (member: ConsortiumMemberDoc) => {
    if (!db) {
      alert('Database not initialized');
      return;
    }

    try {
      const { auth } = await import('@/lib/firebase');
      const token = auth?.currentUser?.getIdToken ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }

      // Find the user ID from the users collection by email
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userDoc = usersSnapshot.docs.find(doc => doc.data().email === member.emailPrimary);
      
      if (!userDoc) {
        alert('User not found in users collection. They may need to sign up first.');
        return;
      }

      const response = await fetch('/api/admin/resend-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userDoc.id }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Welcome email resent successfully to ${member.emailPrimary}\nUsername: ${result.username}`);
      } else {
        alert(`Failed to resend email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resending welcome email:', error);
      alert('Error resending welcome email. Check console for details.');
    }
  };

  const handleEditMember = (member: ConsortiumMemberDoc) => {
    setEditingMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      emailPrimary: member.emailPrimary,
      emailSecondary: member.emailSecondary || "",
      mobile: member.mobile || "",
      expertise: member.expertise,
      title: member.title || "",
      company: member.company || "",
      location: member.location || "",
      bio: member.bio || "",
      linkedIn: member.linkedIn || "",
      website: member.website || "",
      membershipTier: member.membershipTier || "core-capture",
      membershipStatus: member.membershipStatus,
      tags: member.tags || [],
    });
    setDialogOpen(true);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.emailPrimary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    const matchesTier = tierFilter === "all" || member.membershipTier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case "core-capture":
        return <Badge variant="default">Core Capture</Badge>;
      case "elite":
        return <Badge variant="secondary">Elite</Badge>;
      case "standard":
        return <Badge variant="outline">Standard</Badge>;
      default:
        return <Badge variant="outline">{tier || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Consortium Members</h1>
          <p className="text-muted-foreground">Manage KDM Consortium membership</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Users className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
          <CardDescription>
            {members.length} consortium member{members.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="core-capture">Core Capture</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.title}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{member.emailPrimary}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.company || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {member.expertise}
                      </TableCell>
                      <TableCell>{getTierBadge(member.membershipTier)}</TableCell>
                      <TableCell>
                        {member.membershipStatus === "active" ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : member.membershipStatus === "pending" ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <UserX className="h-3 w-3 mr-1" />
                            {member.membershipStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResendWelcomeEmail(member)}
                            title="Resend welcome email"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMember(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Consortium Member" : "Add Consortium Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update consortium member information"
                : "Add a new consortium member to the platform"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailPrimary">Email (Primary) *</Label>
                <Input
                  id="emailPrimary"
                  type="email"
                  value={formData.emailPrimary}
                  onChange={(e) => setFormData({ ...formData, emailPrimary: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailSecondary">Email (Secondary)</Label>
                <Input
                  id="emailSecondary"
                  type="email"
                  value={formData.emailSecondary}
                  onChange={(e) => setFormData({ ...formData, emailSecondary: e.target.value })}
                  placeholder="john@gmail.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="CEO / Founder"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Manufacturing Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise *</Label>
              <Input
                id="expertise"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                placeholder="Manufacturing, Defense Contracting, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="membershipTier">Membership Tier</Label>
                <Select
                  value={formData.membershipTier}
                  onValueChange={(value: any) => setFormData({ ...formData, membershipTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core-capture">Core Capture</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="membershipStatus">Status</Label>
                <Select
                  value={formData.membershipStatus}
                  onValueChange={(value: any) => setFormData({ ...formData, membershipStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Washington, DC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief biography..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember}>
              {editingMember ? "Update" : "Add"} Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
