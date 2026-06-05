"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  RefreshCw,
  Play,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  onboardingStatus?: "not_started" | "in_progress" | "completed" | "skipped";
  onboardingType?: "consortium" | "affiliate" | "founder";
  onboardingStartedAt?: string;
  onboardingCompletedAt?: string;
  createdAt: string;
}

export default function OnboardingManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [triggeringUser, setTriggeringUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In production, fetch from Firestore
      // For now, use mock data
      const mockUsers: User[] = [
        {
          uid: "user_1",
          email: "john.doe@example.com",
          displayName: "John Doe",
          firstName: "John",
          lastName: "Doe",
          company: "Tech Solutions Inc",
          onboardingStatus: "not_started",
          onboardingType: "consortium",
          createdAt: "2024-06-01",
        },
        {
          uid: "user_2",
          email: "jane.smith@example.com",
          displayName: "Jane Smith",
          firstName: "Jane",
          lastName: "Smith",
          company: "Defense Contractors LLC",
          onboardingStatus: "in_progress",
          onboardingType: "affiliate",
          onboardingStartedAt: "2024-06-02",
          createdAt: "2024-05-28",
        },
        {
          uid: "user_3",
          email: "mike.johnson@example.com",
          displayName: "Mike Johnson",
          firstName: "Mike",
          lastName: "Johnson",
          company: "Innovative Solutions",
          onboardingStatus: "completed",
          onboardingType: "consortium",
          onboardingStartedAt: "2024-05-20",
          onboardingCompletedAt: "2024-05-22",
          createdAt: "2024-05-15",
        },
        {
          uid: "user_4",
          email: "sarah.williams@example.com",
          displayName: "Sarah Williams",
          firstName: "Sarah",
          lastName: "Williams",
          company: "Federal Services Group",
          onboardingStatus: "skipped",
          onboardingType: "founder",
          createdAt: "2024-06-03",
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.onboardingStatus === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const triggerOnboarding = async (userId: string, onboardingType: string) => {
    setTriggeringUser(userId);
    try {
      // In production, this would:
      // 1. Update user's onboarding status in Firestore
      // 2. Send email notification with onboarding link
      // 3. Set onboardingStartedAt timestamp
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update local state
      setUsers(
        users.map((user) =>
          user.uid === userId
            ? {
                ...user,
                onboardingStatus: "in_progress",
                onboardingType: onboardingType as any,
                onboardingStartedAt: new Date().toISOString(),
              }
            : user
        )
      );
      
      toast.success(`Onboarding triggered for user`);
    } catch (error) {
      toast.error("Failed to trigger onboarding");
    } finally {
      setTriggeringUser(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-blue-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "skipped":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Skipped
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <UserPlus className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Management</h1>
          <p className="text-muted-foreground">
            Trigger and monitor user onboarding processes
          </p>
        </div>
        <Button onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email, name, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Onboarding Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.displayName || user.email}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.company || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.onboardingType || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.onboardingStatus)}</TableCell>
                    <TableCell>
                      {user.onboardingStartedAt
                        ? new Date(user.onboardingStartedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {user.onboardingCompletedAt
                        ? new Date(user.onboardingCompletedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {user.onboardingStatus !== "completed" && (
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => triggerOnboarding(user.uid, value)}
                            disabled={triggeringUser === user.uid}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Trigger..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consortium">Consortium</SelectItem>
                              <SelectItem value="affiliate">Affiliate</SelectItem>
                              <SelectItem value="founder">Founder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
