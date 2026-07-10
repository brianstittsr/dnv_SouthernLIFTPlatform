"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { USER_ROLES, UserRole } from "@/lib/rbac-types";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Ban,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  KeyRound,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// Safe date formatter that handles various Firebase timestamp formats
function formatDate(dateValue: any): string {
  if (!dateValue) return "—";
  
  try {
    // Handle Firebase Timestamp objects
    if (dateValue._seconds !== undefined && dateValue._nanoseconds !== undefined) {
      return new Date(dateValue._seconds * 1000).toLocaleDateString();
    }
    
    // Handle Firestore Timestamp objects with toDate method
    if (typeof dateValue.toDate === "function") {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle numeric timestamps (milliseconds)
    if (typeof dateValue === "number") {
      return new Date(dateValue).toLocaleDateString();
    }
    
    // Handle ISO strings or RFC 2822 strings (most common from Firebase Auth)
    if (typeof dateValue === "string") {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString();
    }
    
    return "—";
  } catch {
    return "—";
  }
}

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole | "none";
  disabled: boolean;
  createdAt: string;
  lastSignIn?: string;
  tenantId?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserDisplayName, setNewUserDisplayName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("sme_user");
  const [newUserTenantId, setNewUserTenantId] = useState("kdm-svp-platform");
  const [creating, setCreating] = useState(false);

  // Edit user dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("sme_user");
  const [editing, setEditing] = useState(false);

  // Change password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userForPassword, setUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  // Create user
  const handleCreateUser = async () => {
    try {
      setCreating(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          firstName: newUserFirstName,
          lastName: newUserLastName,
          displayName: newUserDisplayName || `${newUserFirstName} ${newUserLastName}`.trim(),
          role: newUserRole,
          tenantId: newUserTenantId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create user");
      }

      // Reset form and close dialog
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserDisplayName("");
      setNewUserRole("sme_user");
      setNewUserTenantId("kdm-svp-platform");
      setCreateDialogOpen(false);

      // Refresh user list
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  // Open edit dialog pre-filled
  const openEditDialog = (user: User) => {
    setUserToEdit(user);
    setEditDisplayName(user.displayName || "");
    setEditFirstName("");
    setEditLastName("");
    setEditRole((user.role as UserRole) || "sme_user");
    setEditDialogOpen(true);
  };

  // Edit user
  const handleEditUser = async () => {
    if (!userToEdit) return;
    try {
      setEditing(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: userToEdit.uid,
          displayName: editDisplayName.trim() || undefined,
          firstName: editFirstName.trim() || undefined,
          lastName: editLastName.trim() || undefined,
          role: editRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setEditing(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!userForPassword) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: userForPassword.uid, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success(`Password updated for ${userForPassword.email}`);
      setPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Suspend/Reactivate user
  const handleToggleSuspend = async (user: User) => {
    try {
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          suspend: !user.disabled,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user status");
      }

      toast.success(user.disabled ? "User reactivated" : "User suspended");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
      setError(err.message || "Failed to suspend user");
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(
        `/api/admin/users?userId=${userToDelete.uid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      // Close dialog and refresh list
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "platform_admin":
        return "destructive";
      case "consortium_partner":
        return "default";
      case "qa_reviewer":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-9xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(USER_ROLES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchUsers} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.displayName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {USER_ROLES[user.role as UserRole] || "None"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.disabled ? "secondary" : "default"}>
                      {user.disabled ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    {user.lastSignIn ? formatDate(user.lastSignIn) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserForPassword(user);
                            setNewPassword("");
                            setConfirmPassword("");
                            setShowPassword(false);
                            setPasswordDialogOpen(true);
                          }}
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          Change Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleSuspend(user)}>
                          {user.disabled ? (
                            <><CheckCircle className="h-4 w-4 mr-2 text-green-600" />Reactivate</>
                          ) : (
                            <><Ban className="h-4 w-4 mr-2 text-yellow-600" />Suspend</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update profile details and role for{" "}
              <span className="font-medium">{userToEdit?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Display Name</Label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Full name shown in the app"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="First"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Last"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as UserRole)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_ROLES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={editing}>
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setNewPassword(""); setConfirmPassword(""); }
          setPasswordDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-medium">{userForPassword?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>New Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="pr-10"
                  onKeyDown={(e) => { if (e.key === "Enter") handleChangePassword(); }}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                changingPassword ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account with email and role assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={newUserFirstName}
                  onChange={(e) => setNewUserFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={newUserLastName}
                  onChange={(e) => setNewUserLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Display Name (Optional)</label>
              <Input
                value={newUserDisplayName}
                onChange={(e) => setNewUserDisplayName(e.target.value)}
                placeholder="Auto-generated from first and last name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newUserRole}
                onValueChange={(value) => setNewUserRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_ROLES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tenant ID</label>
              <Input
                value={newUserTenantId}
                onChange={(e) => setNewUserTenantId(e.target.value)}
                placeholder="tenant-123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user account? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="font-medium">{userToDelete.email}</p>
              <p className="text-sm text-muted-foreground">
                Role: {USER_ROLES[userToDelete.role as UserRole] || "None"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
