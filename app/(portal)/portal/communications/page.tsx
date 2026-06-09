"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  User,
  Building2,
} from "lucide-react";

// Mock communications data
const MOCK_COMMUNICATIONS = [
  {
    id: "1",
    type: "message",
    from: "Acme Manufacturing",
    fromUser: "John Smith",
    subject: "Partnership Request - Aerospace Project",
    message: "We would like to discuss a potential partnership for the upcoming aerospace components RFP. Our company specializes in CNC machining and titanium processing.",
    timestamp: "2 hours ago",
    unread: true,
    status: "unread",
  },
  {
    id: "2",
    type: "announcement",
    from: "KDM Consortium",
    fromUser: "Admin",
    subject: "Weekly Meeting Reminder",
    message: "Reminder: Weekly consortium meeting is scheduled for Friday at 3pm EST. Please join to discuss new opportunities and partnership updates.",
    timestamp: "1 day ago",
    unread: false,
    status: "read",
  },
  {
    id: "3",
    type: "message",
    from: "Tech Solutions LLC",
    fromUser: "Jane Doe",
    subject: "Proposal Collaboration",
    message: "We're interested in collaborating on the software development portion of the defense contract. Let's schedule a call to discuss details.",
    timestamp: "2 days ago",
    unread: false,
    status: "replied",
  },
  {
    id: "4",
    type: "message",
    from: "Prime Defense Systems",
    fromUser: "Mike Johnson",
    subject: "Teaming Agreement",
    message: "Please review the attached teaming agreement for the upcoming RFP. Let us know if you have any questions or need modifications.",
    timestamp: "3 days ago",
    unread: false,
    status: "read",
  },
];

export default function CommunicationsPage() {
  const { profile } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const filteredCommunications = MOCK_COMMUNICATIONS.filter((comm) => {
    const matchesSearch =
      comm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || comm.type === selectedType;
    const matchesStatus = selectedStatus === "all" || comm.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case "read":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "replied":
        return <Send className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-blue-100 text-blue-800">Unread</Badge>;
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "replied":
        return <Badge className="bg-purple-100 text-purple-800">Replied</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground mt-1">
            Manage messages and announcements from consortium partners
          </p>
        </div>
        <Button onClick={() => setNewMessageOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredCommunications.map((comm) => (
          <Card
            key={comm.id}
            className={`hover:shadow-md transition-shadow ${
              comm.unread ? "border-l-4 border-l-blue-500" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {comm.fromUser
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-lg">{comm.subject}</CardTitle>
                    {getStatusBadge(comm.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    {comm.from}
                    <span>•</span>
                    <User className="h-3 w-3" />
                    {comm.fromUser}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {comm.timestamp}
                  </div>
                  {getStatusIcon(comm.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{comm.message}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Reply
                </Button>
                <Button variant="ghost" size="sm">
                  View Thread
                </Button>
                {comm.type === "message" && (
                  <Button variant="ghost" size="sm">
                    Archive
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No communications found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more messages.
            </p>
          </CardContent>
        </Card>
      )}

      {/* New Message Modal */}
      {newMessageOpen && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>New Message</CardTitle>
            <CardDescription>Send a message to consortium partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acme">Acme Manufacturing</SelectItem>
                  <SelectItem value="tech">Tech Solutions LLC</SelectItem>
                  <SelectItem value="prime">Prime Defense Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Enter subject" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Type your message..." rows={6} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNewMessageOpen(false)}>
                Cancel
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
