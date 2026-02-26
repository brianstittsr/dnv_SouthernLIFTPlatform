"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Users,
  Building2,
  Handshake,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Filter,
  UserCheck,
  Briefcase,
  Loader2,
  Plus,
  UserPlus,
  Send,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, Timestamp, addDoc } from "firebase/firestore";
import { COLLECTIONS, type TeamMeemerging businessrDoc, type StrategicPartnerDoc } from "@/lib/schema";
import { toast } from "sonner";
import { useUserProfile } from "@/contexts/user-profile-context";
import { logActivity } from "@/lib/activity-logger";

// Unified contact type for display
interface UnifiedContact {
  id: string;
  source: "team_meemerging businessr" | "strategic_partner" | "user";
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  expertise: string;
  website?: string;
  linkedIn?: string;
  avatar?: string;
  role?: string;
  status: string;
  isClient: boolean;
  contactTypes: string[];
}

// Invitation template
const INVITATION_TEMPLATE = {
  subject: "Invitation to join KDM & Associates SVP Platform",
  body: (inviterName: string, inviterCompany: string) => `
    <h2>You've been invited to join the KDM & Associates SVP Platform!</h2>
    <p><strong>${inviterName}</strong> from <strong>${inviterCompany}</strong> has invited you to join our Strategic Value+ Platform.</p>
    <h3>Platform Benefits:</h3>
    <ul>
      <li><strong>Proof Packs:</strong> Showcase your compliance and certifications to government buyers</li>
      <li><strong>Buyer Connections:</strong> Get introduced to government and prime contractor buyers</li>
      <li><strong>CMMC Cohort Training:</strong> Access CMMC certification programs</li>
      <li><strong>Lead Generation:</strong> Receive qualified leads matched to your capabilities</li>
      <li><strong>SVP Tools:</strong> Access AI-powered tools for proposal creation, lead gen, and more</li>
      <li><strong>Network:</strong> Connect with other suppliers and partners in the ecosystem</li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kdm-assoc.com'}/sign-up" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Join the Platform</a></p>
    <p>If you have any questions, please contact our support team at support@kdm-assoc.com.</p>
    <p>Best regards,<br>The KDM & Associates Team</p>
  `,
};

function getContactTypeBadges(contact: UnifiedContact) {
  const badges: { label: string; variant: "default" | "secondary" | "outline" | "destructive" }[] = [];
  
  if (contact.source === "team_meemerging businessr") {
    if (contact.role === "affiliate") {
      badges.push({ label: "Affiliate", variant: "default" });
    } else if (contact.role === "team") {
      badges.push({ label: "Team", variant: "secondary" });
    } else if (contact.role === "admin") {
      badges.push({ label: "Admin", variant: "destructive" });
    } else if (contact.role === "consultant") {
      badges.push({ label: "Consultant", variant: "outline" });
    }
  } else if (contact.source === "strategic_partner") {
    badges.push({ label: "Partner", variant: "outline" });
  } else if (contact.source === "user") {
    badges.push({ label: "Platform User", variant: "default" });
  }
  
  if (contact.isClient) {
    badges.push({ label: "Client", variant: "default" });
  }
  
  return badges;
}

export default function ContactsTab() {
  const { profile: userProfile } = useUserProfile();
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [platformUsers, setPlatformUsers] = useState<UnifiedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add contact dialogs
  const [showAddPlatformDialog, setShowAddPlatformDialog] = useState(false);
  const [showInviteExternalDialog, setShowInviteExternalDialog] = useState(false);
  
  // External invite form
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchPlatformUsers();
  }, []);

  async function fetchContacts() {
    if (!db) {
      setIsLoading(false);
      return;
    }

    try {
      const allContacts: UnifiedContact[] = [];

      // Fetch Team Meemerging businessrs (includes affiliates)
      const teamRef = collection(db, COLLECTIONS.TEAM_MEemerging businessRS);
      const teamSnapshot = await getDocs(query(teamRef));
      teamSnapshot.forEach((doc) => {
        const data = doc.data() as TeamMeemerging businessrDoc;
        const contactTypes: string[] = [];
        if (data.role === "affiliate") contactTypes.push("affiliate");
        if (data.role === "team") contactTypes.push("team");
        if (data.role === "admin") contactTypes.push("admin");
        if (data.role === "consultant") contactTypes.push("consultant");
        if (data.isClient) contactTypes.push("client");

        allContacts.push({
          id: doc.id,
          source: "team_meemerging businessr",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.emailPrimary || "",
          phone: data.mobile,
          company: data.company,
          expertise: data.expertise || "",
          website: data.website,
          linkedIn: data.linkedIn,
          avatar: data.avatar,
          role: data.role,
          status: data.status,
          isClient: data.isClient || false,
          contactTypes,
        });
      });

      // Fetch Strategic Partners
      const partnersRef = collection(db, COLLECTIONS.STRATEGIC_PARTNERS);
      const partnersSnapshot = await getDocs(query(partnersRef));
      partnersSnapshot.forEach((doc) => {
        const data = doc.data() as StrategicPartnerDoc;
        const contactTypes: string[] = ["partner"];
        if (data.isClient) contactTypes.push("client");

        allContacts.push({
          id: doc.id,
          source: "strategic_partner",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone,
          company: data.company,
          expertise: data.expertise || "",
          website: data.website,
          linkedIn: data.linkedIn,
          avatar: data.logo,
          status: data.status,
          isClient: data.isClient || false,
          contactTypes,
        });
      });

      // Sort by name
      allContacts.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );

      setContacts(allContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPlatformUsers() {
    if (!db) return;

    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const usersSnapshot = await getDocs(query(usersRef));
      const users: UnifiedContact[] = [];
      
      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Skip current user
        if (data.userId === userProfile.id) return;
        
        users.push({
          id: docSnap.id,
          source: "user",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone,
          company: data.companyName || data.company,
          expertise: data.industry || "",
          avatar: data.avatarUrl,
          role: data.svpRole || data.role,
          status: "active",
          isClient: false,
          contactTypes: ["platform_user"],
        });
      });
      
      setPlatformUsers(users);
    } catch (error) {
      console.error("Error fetching platform users:", error);
    }
  }

  async function addPlatformUserAsContact(user: UnifiedContact) {
    if (!db) return;
    
    try {
      // Add to contacts subcollection under user
      const contactsRef = collection(db, "users", userProfile.id, "contacts");
      await addDoc(contactsRef, {
        contactUserId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        source: "platform",
        createdAt: Timestamp.now(),
      });
      
      toast.success(`${user.firstName} ${user.lastName} added to your contacts`);
      
      // Log activity
      await logActivity({
        type: "create",
        entityType: "team-meemerging businessr",
        entityId: user.id,
        entityName: `${user.firstName} ${user.lastName}`,
        description: `Added ${user.firstName} ${user.lastName} as a contact`,
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  }

  async function sendExternalInvitation(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    
    setIsSendingInvite(true);
    try {
      // Queue invitation email
      const emailQueueRef = collection(db, "emailQueue");
      await addDoc(emailQueueRef, {
        to: [inviteForm.email],
        subject: INVITATION_TEMPLATE.subject,
        body: INVITATION_TEMPLATE.body(
          `${userProfile.firstName} ${userProfile.lastName}`,
          userProfile.company || "KDM & Associates"
        ),
        fromName: `${userProfile.firstName} ${userProfile.lastName}`,
        fromEmail: userProfile.email,
        status: "pending",
        createdAt: Timestamp.now(),
        metadata: {
          type: "platform_invitation",
          invitedBy: userProfile.id,
          invitedByEmail: userProfile.email,
          invitedUserEmail: inviteForm.email,
          invitedUserName: `${inviteForm.firstName} ${inviteForm.lastName}`,
          invitedUserCompany: inviteForm.company,
        },
      });
      
      // Store pending invitation
      const invitationsRef = collection(db, "pendingInvitations");
      await addDoc(invitationsRef, {
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email,
        company: inviteForm.company,
        invitedBy: userProfile.id,
        invitedByName: `${userProfile.firstName} ${userProfile.lastName}`,
        message: inviteForm.message,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      
      toast.success(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ firstName: "", lastName: "", email: "", company: "", message: "" });
      setShowInviteExternalDialog(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsSendingInvite(false);
    }
  }

  async function toggleClientStatus(contact: UnifiedContact) {
    if (!db) return;
    
    setIsUpdating(true);
    try {
      const collectionName = contact.source === "team_meemerging businessr" 
        ? COLLECTIONS.TEAM_MEemerging businessRS 
        : COLLECTIONS.STRATEGIC_PARTNERS;
      
      const docRef = doc(db, collectionName, contact.id);
      const newIsClient = !contact.isClient;
      
      await updateDoc(docRef, {
        isClient: newIsClient,
        clientSince: newIsClient ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });

      // Log activity
      await logActivity({
        type: "update",
        entityType: contact.source === "team_meemerging businessr" ? "team-meemerging businessr" : "organization",
        entityId: contact.id,
        entityName: `${contact.firstName} ${contact.lastName}`,
        description: newIsClient 
          ? `${contact.firstName} ${contact.lastName} marked as client`
          : `${contact.firstName} ${contact.lastName} removed as client`,
      });

      // Update local state
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? { 
                ...c, 
                isClient: newIsClient,
                contactTypes: newIsClient 
                  ? [...c.contactTypes.filter(t => t !== "client"), "client"]
                  : c.contactTypes.filter(t => t !== "client")
              }
            : c
        )
      );

      setShowClientDialog(false);
      setSelectedContact(null);
    } catch (error) {
      console.error("Error updating client status:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.expertise.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (typeFilter === "affiliates") {
      matchesType = contact.contactTypes.includes("affiliate");
    } else if (typeFilter === "partners") {
      matchesType = contact.contactTypes.includes("partner");
    } else if (typeFilter === "clients") {
      matchesType = contact.isClient;
    } else if (typeFilter === "team") {
      matchesType = contact.contactTypes.includes("team") || contact.contactTypes.includes("admin");
    }
    
    return matchesSearch && matchesType;
  });

  // Stats
  const affiliateCount = contacts.filter(c => c.contactTypes.includes("affiliate")).length;
  const partnerCount = contacts.filter(c => c.contactTypes.includes("partner")).length;
  const clientCount = contacts.filter(c => c.isClient).length;
  const teamCount = contacts.filter(c => c.contactTypes.includes("team") || c.contactTypes.includes("admin")).length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "??";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setTypeFilter("affiliates")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{affiliateCount}</p>
                <p className="text-sm text-muted-foreground">Affiliates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setTypeFilter("partners")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Handshake className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{partnerCount}</p>
                <p className="text-sm text-muted-foreground">Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setTypeFilter("clients")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clientCount}</p>
                <p className="text-sm text-muted-foreground">Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setTypeFilter("team")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamCount}</p>
                <p className="text-sm text-muted-foreground">Team</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Contact Buttons */}
      <div className="flex gap-3">
        <Button onClick={() => setShowAddPlatformDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Platform User
        </Button>
        <Button variant="outline" onClick={() => setShowInviteExternalDialog(true)}>
          <Send className="mr-2 h-4 w-4" />
          Invite External Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, or expertise..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="affiliates">Affiliates</SelectItem>
                <SelectItem value="partners">Partners</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
                <SelectItem value="team">Team Meemerging businessrs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {typeFilter === "all" ? "All Contacts" : 
             typeFilter === "affiliates" ? "Affiliates" :
             typeFilter === "partners" ? "Partners" :
             typeFilter === "clients" ? "Clients" : "Team Meemerging businessrs"}
          </CardTitle>
          <CardDescription>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="text-center">Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <TableRow key={`${contact.source}-${contact.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(contact.firstName, contact.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getContactTypeBadges(contact).map((badge, i) => (
                          <Badge key={i} variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{contact.company || "-"}</TableCell>
                    <TableCell>
                      <span className="text-sm line-clamp-2">{contact.expertise || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary">
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-primary">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        {contact.website && (
                          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                        {contact.linkedIn && (
                          <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={contact.isClient}
                        onCheckedChange={() => {
                          setSelectedContact(contact);
                          setShowClientDialog(true);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery || typeFilter !== "all"
                          ? "No contacts match your search"
                          : "No contacts found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Status Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedContact?.isClient ? "Remove Client Status" : "Mark as Client"}
            </DialogTitle>
            <DialogDescription>
              {selectedContact?.isClient
                ? `Are you sure you want to remove ${selectedContact?.firstName} ${selectedContact?.lastName} as a client?`
                : `Mark ${selectedContact?.firstName} ${selectedContact?.lastName} as a client to serve them with SVP Tools.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedContact && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedContact.firstName, selectedContact.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedContact.firstName} {selectedContact.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                  <div className="flex gap-1 mt-1">
                    {getContactTypeBadges(selectedContact).map((badge, i) => (
                      <Badge key={i} variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedContact && toggleClientStatus(selectedContact)}
              disabled={isUpdating}
              variant={selectedContact?.isClient ? "destructive" : "default"}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : selectedContact?.isClient ? (
                "Remove as Client"
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Mark as Client
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Platform User Dialog */}
      <Dialog open={showAddPlatformDialog} onOpenChange={setShowAddPlatformDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Platform User as Contact</DialogTitle>
            <DialogDescription>
              Search and add users from the platform to your contacts
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or company..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {platformUsers.length > 0 ? (
                platformUsers
                  .filter((user) => 
                    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.company?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.company && (
                            <p className="text-xs text-muted-foreground">{user.company}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addPlatformUserAsContact(user)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPlatformDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite External Contact Dialog */}
      <Dialog open={showInviteExternalDialog} onOpenChange={setShowInviteExternalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite External Contact</DialogTitle>
            <DialogDescription>
              Send an invitation email to join the KDM & Associates SVP Platform
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendExternalInvitation}>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="john.smith@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={inviteForm.company}
                  onChange={(e) => setInviteForm({ ...inviteForm, company: e.target.value })}
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <textarea
                  id="message"
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  placeholder="Add a personal note to the invitation..."
                  className="w-full min-h-[100px] p-3 rounded-md border text-sm"
                />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Invitation includes:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Access to Proof Packs for compliance</li>
                  <li>• Buyer connection opportunities</li>
                  <li>• CMMC cohort training programs</li>
                  <li>• AI-powered SVP Tools</li>
                  <li>• Network with other suppliers</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteExternalDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingInvite}>
                {isSendingInvite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
