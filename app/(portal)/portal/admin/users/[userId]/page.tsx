"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { USER_ROLES, UserRole, Permission, ROLE_PERMISSIONS } from "@/lib/rbac-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole | "none";
  disabled: boolean;
  createdAt: string;
  lastSignIn?: string;
  tenantId?: string;
  basePermissions: Permission[];
  customPermissions: Permission[];
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedRole, setSelectedRole] = useState<UserRole>("sme_user");
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Available permissions for custom assignment
  const allPermissions: Permission[] = [
    "proof_pack:create",
    "proof_pack:read",
    "proof_pack:update",
    "proof_pack:delete",
    "proof_pack:submit",
    "proof_pack:review",
    "proof_pack:approve",
    "proof_pack:share",
    "lead:create",
    "lead:read",
    "lead:update",
    "lead:assign",
    "lead:view_all",
    "introduction:request",
    "introduction:read",
    "introduction:respond",
    "introduction:view_all",
    "cohort:create",
    "cohort:read",
    "cohort:update",
    "cohort:enroll",
    "cohort:manage",
    "content:create",
    "content:read",
    "content:update",
    "content:publish",
    "content:delete",
    "revenue:view_own",
    "revenue:view_all",
    "revenue:dispute",
    "revenue:approve",
    "event:create",
    "event:read",
    "event:update",
    "event:manage",
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "user:assign_role",
    "system:configure",
    "system:monitor",
    "system:audit_logs",
    "routing:configure",
    "routing:override",
  ];

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = auth?.currentUser;
        if (!currentUser) {
          router.push("/sign-in");
          return;
        }

        const token = await currentUser.getIdToken();

        // Fetch user from list endpoint with specific user filter
        const response = await fetch(`/api/admin/users?search=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        const userData = data.users.find((u: any) => u.uid === userId);

        if (!userData) {
          throw new Error("User not found");
        }

        // Fetch permissions from Firestore
        const permissionsResponse = await fetch(
          `/api/admin/users/permissions?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let permissions = {
          basePermissions: [],
          customPermissions: [],
        };

        if (permissionsResponse.ok) {
          permissions = await permissionsResponse.json();
        }

        setUser({
          ...userData,
          basePermissions: permissions.basePermissions || [],
          customPermissions: permissions.customPermissions || [],
        });

        setSelectedRole(userData.role || "sme_user");
        setCustomPermissions(permissions.customPermissions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  // Track changes
  useEffect(() => {
    if (user) {
      const roleChanged = selectedRole !== user.role;
      const permissionsChanged =
        JSON.stringify(customPermissions.sort()) !==
        JSON.stringify(user.customPermissions.sort());
      setHasChanges(roleChanged || permissionsChanged);
    }
  }, [selectedRole, customPermissions, user]);

  // Handle role change
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
  };

  // Handle custom permission toggle
  const handlePermissionToggle = (permission: Permission) => {
    setCustomPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      // Update role
      const response = await fetch("/api/admin/users/assign-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.uid,
          role: selectedRole,
          tenantId: user?.tenantId,
          additionalPermissions: customPermissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      setSuccess(
        "Role and permissions updated successfully. User must re-authenticate to receive new permissions."
      );
      setHasChanges(false);

      // Refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  // Get base permissions for selected role
  const basePermissions = ROLE_PERMISSIONS[selectedRole] || [];

  // Group permissions by category
  const permissionsByCategory = {
    "Proof Pack": allPermissions.filter((p) => p.startsWith("proof_pack:")),
    Lead: allPermissions.filter((p) => p.startsWith("lead:")),
    Introduction: allPermissions.filter((p) => p.startsWith("introduction:")),
    Cohort: allPermissions.filter((p) => p.startsWith("cohort:")),
    Content: allPermissions.filter((p) => p.startsWith("content:")),
    Revenue: allPermissions.filter((p) => p.startsWith("revenue:")),
    Event: allPermissions.filter((p) => p.startsWith("event:")),
    User: allPermissions.filter((p) => p.startsWith("user:")),
    System: allPermissions.filter((p) => p.startsWith("system:")),
    Routing: allPermissions.filter((p) => p.startsWith("routing:")),
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/portal/admin/users")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/portal/admin/users")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{user.email}</h1>
            <p className="text-muted-foreground mt-1">
              {user.displayName || "No display name"}
            </p>
          </div>
          <Badge variant={user.disabled ? "secondary" : "default"}>
            {user.disabled ? "Suspended" : "Active"}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {hasChanges && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply them.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="font-mono text-sm">{user.uid}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p>{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tenant ID
              </label>
              <p className="font-mono text-sm">{user.tenantId || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p>{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Sign In
              </label>
              <p>
                {user.lastSignIn
                  ? new Date(user.lastSignIn).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Role Assignment</CardTitle>
            <CardDescription>
              Assign primary role to this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Primary Role
              </label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
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
              <label className="text-sm font-medium text-muted-foreground">
                Base Permissions ({basePermissions.length})
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {basePermissions.slice(0, 5).map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {permission.split(":")[1]}
                  </Badge>
                ))}
                {basePermissions.length > 5 && (
                  <Badge variant="outline">
                    +{basePermissions.length - 5} more
                  </Badge>
                )}
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                User must re-authenticate after role changes to receive new
                permissions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Custom Permissions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Custom Permissions</CardTitle>
          <CardDescription>
            Grant additional permissions beyond the base role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(permissionsByCategory).map(
              ([category, permissions]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-3">{category}</h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {permissions.map((permission) => {
                      const isBasePermission =
                        basePermissions.includes(permission);
                      const isCustomPermission =
                        customPermissions.includes(permission);
                      const isChecked = isBasePermission || isCustomPermission;

                      return (
                        <div
                          key={permission}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={permission}
                            checked={isChecked}
                            disabled={isBasePermission}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission)
                            }
                          />
                          <label
                            htmlFor={permission}
                            className={`text-sm cursor-pointer ${
                              isBasePermission
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {permission.split(":")[1]}
                            {isBasePermission && (
                              <span className="ml-1 text-xs">(base)</span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
