"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Package,
  Handshake,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// SVP Role definitions with icons and descriptions
const SVP_ROLES = [
  {
    value: "platform_admin",
    label: "Platform Admin",
    icon: Shield,
    color: "text-red-500",
    description: "Full access to all SVP platform features and admin controls",
    sections: ["SVP - SME", "SVP - Partner", "SVP - Buyer", "SVP - QA Review", "SVP - Instructor", "SVP - Admin"],
  },
  {
    value: "sme_user",
    label: "SME User",
    icon: Package,
    color: "text-blue-500",
    description: "Manage Proof Packs, subscriptions, and cohort enrollments",
    sections: ["SVP - SME"],
  },
  {
    value: "partner_user",
    label: "Partner User",
    icon: Handshake,
    color: "text-green-500",
    description: "Manage leads, introductions, and revenue tracking",
    sections: ["SVP - Partner"],
  },
  {
    value: "buyer",
    label: "Buyer",
    icon: Briefcase,
    color: "text-purple-500",
    description: "Browse SME directory and request introductions",
    sections: ["SVP - Buyer"],
  },
  {
    value: "qa_reviewer",
    label: "QA Reviewer",
    icon: ClipboardCheck,
    color: "text-orange-500",
    description: "Review and approve/reject Proof Pack submissions",
    sections: ["SVP - QA Review"],
  },
  {
    value: "cmmc_instructor",
    label: "CMMC Instructor",
    icon: GraduationCap,
    color: "text-indigo-500",
    description: "Create and manage CMMC training cohorts",
    sections: ["SVP - Instructor", "SVP - SME"],
  },
];

interface SvpRoleSwitcherProps {
  onRoleChange?: (role: string | null) => void;
  showPreviewMode?: boolean;
}

export function SvpRoleSwitcher({ onRoleChange, showPreviewMode = true }: SvpRoleSwitcherProps) {
  const { profile } = useUserProfile();
  const [currentSvpRole, setCurrentSvpRole] = useState<string | null>(null);
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      if (!profile?.id || !db) return;

      try {
        const userDoc = await getDoc(doc(db, "users", profile.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentSvpRole(data.svpRole || null);
          setIsPlatformAdmin(data.svpRole === "platform_admin" || data.role === "admin");
        }
      } catch (error) {
        console.error("Error loading user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, [profile?.id]);

  const handlePreviewRoleChange = (role: string) => {
    const newRole = role === "none" ? null : role;
    setPreviewRole(newRole);
    onRoleChange?.(newRole);
  };

  const resetPreview = () => {
    setPreviewRole(null);
    onRoleChange?.(null);
  };

  const effectiveRole = previewRole || currentSvpRole;
  const currentRoleInfo = SVP_ROLES.find((r) => r.value === effectiveRole);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          SVP Role Management
        </CardTitle>
        <CardDescription>
          {isPlatformAdmin
            ? "As a platform admin, you can preview the platform as any role to test permissions."
            : "Your current SVP platform role and permissions."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Role Display */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {currentRoleInfo ? (
              <>
                <currentRoleInfo.icon className={`h-5 w-5 ${currentRoleInfo.color}`} />
                <div>
                  <p className="font-medium">{currentRoleInfo.label}</p>
                  <p className="text-sm text-muted-foreground">{currentRoleInfo.description}</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">No SVP Role Assigned</p>
                  <p className="text-sm text-muted-foreground">Contact an admin to get access to SVP features.</p>
                </div>
              </>
            )}
          </div>
          {previewRole && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              <Eye className="h-3 w-3 mr-1" />
              Preview Mode
            </Badge>
          )}
        </div>

        {/* Visible Sections */}
        {currentRoleInfo && (
          <div>
            <p className="text-sm font-medium mb-2">Visible Sections:</p>
            <div className="flex flex-wrap gap-2">
              {currentRoleInfo.sections.map((section) => (
                <Badge key={section} variant="secondary">
                  {section}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preview Role Switcher (Admin Only) */}
        {isPlatformAdmin && showPreviewMode && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview as Different Role
            </p>
            <div className="flex gap-2">
              <Select
                value={previewRole || "none"}
                onValueChange={handlePreviewRoleChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select role to preview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Platform Admin (Your Role)
                    </span>
                  </SelectItem>
                  {SVP_ROLES.filter((r) => r.value !== "platform_admin").map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="flex items-center gap-2">
                        <role.icon className={`h-4 w-4 ${role.color}`} />
                        {role.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {previewRole && (
                <Button variant="outline" size="icon" onClick={resetPreview}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {previewRole && (
              <Alert className="mt-3 bg-amber-50 border-amber-200">
                <Eye className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  You are previewing the platform as a <strong>{SVP_ROLES.find((r) => r.value === previewRole)?.label}</strong>.
                  The sidebar will show only the sections visible to this role.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export { SVP_ROLES };
