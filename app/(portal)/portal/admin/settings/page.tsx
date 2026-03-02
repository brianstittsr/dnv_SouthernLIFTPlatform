"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, AlertCircle } from "lucide-react";

interface SystemConfig {
  id: string;
  industries: Array<{
    id: string;
    name: string;
    description?: string;
    naicsCodes?: string[];
    isActive: boolean;
  }>;
  revenueConfig: {
    id: string;
    name: string;
    platformFeePercentage: number;
    partnerSharePercentage: number;
    leadGenerationFee?: number;
    serviceDeliveryFee?: number;
    introductionFee?: number;
    isDefault: boolean;
  };
  packHealthConfig: {
    id: string;
    introEligibilityThreshold: number;
    criticalThreshold: number;
    warningThreshold: number;
    completenessWeight: number;
    expirationWeight: number;
    qualityWeight: number;
    remediationWeight: number;
  };
  partnerAssignments: Array<{
    id: string;
    partnerId: string;
    partnerName: string;
    verticals: string[];
    capabilities: string[];
    geographicCoverage?: string[];
    isActive: boolean;
  }>;
  settings: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    maxUploadSizeMB: number;
    sessionTimeoutMinutes: number;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for each section
  const [industries, setIndustries] = useState<SystemConfig["industries"]>([]);
  const [revenueConfig, setRevenueConfig] = useState<SystemConfig["revenueConfig"] | null>(null);
  const [packHealthConfig, setPackHealthConfig] = useState<SystemConfig["packHealthConfig"] | null>(null);
  const [partnerAssignments, setPartnerAssignments] = useState<SystemConfig["partnerAssignments"]>([]);
  const [platformSettings, setPlatformSettings] = useState<SystemConfig["settings"] | null>(null);

  // Fetch configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = auth?.currentUser;
        if (!currentUser) {
          router.push("/sign-in");
          return;
        }

        const token = await currentUser.getIdToken();

        const response = await fetch("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch configuration");
        }

        const data = await response.json();
        setConfig(data);
        setIndustries(data.industries);
        setRevenueConfig(data.revenueConfig);
        setPackHealthConfig(data.packHealthConfig);
        setPartnerAssignments(data.partnerAssignments);
        setPlatformSettings(data.settings);
      } catch (err: any) {
        setError(err.message || "Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [router]);

  // Save configuration section
  const saveSection = async (section: string, data: any) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section, data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      setSuccess(`${section} updated successfully`);
      setHasChanges(false);

      // Refresh config
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform settings without code deployments
        </p>
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

      <Tabs defaultValue="industries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Share</TabsTrigger>
          <TabsTrigger value="packhealth">Pack Health</TabsTrigger>
          <TabsTrigger value="partners">Partner Assignments</TabsTrigger>
          <TabsTrigger value="platform">Platform Settings</TabsTrigger>
        </TabsList>

        {/* Industries Tab */}
        <TabsContent value="industries">
          <Card>
            <CardHeader>
              <CardTitle>Industry Categories</CardTitle>
              <CardDescription>
                Manage industry categories and NAICS code mappings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industries.map((industry, index) => (
                  <div key={industry.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Input
                          value={industry.name}
                          onChange={(e) => {
                            const updated = [...industries];
                            updated[index].name = e.target.value;
                            setIndustries(updated);
                            setHasChanges(true);
                          }}
                          className="font-medium"
                        />
                        <Switch
                          checked={industry.isActive}
                          onCheckedChange={(checked) => {
                            const updated = [...industries];
                            updated[index].isActive = checked;
                            setIndustries(updated);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIndustries(industries.filter((_, i) => i !== index));
                          setHasChanges(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Description"
                      value={industry.description || ""}
                      onChange={(e) => {
                        const updated = [...industries];
                        updated[index].description = e.target.value;
                        setIndustries(updated);
                        setHasChanges(true);
                      }}
                      className="mb-2"
                    />
                    <Input
                      placeholder="NAICS Codes (comma-separated)"
                      value={industry.naicsCodes?.join(", ") || ""}
                      onChange={(e) => {
                        const updated = [...industries];
                        updated[index].naicsCodes = e.target.value.split(",").map(c => c.trim());
                        setIndustries(updated);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIndustries([
                      ...industries,
                      {
                        id: `industry_${Date.now()}`,
                        name: "New Industry",
                        description: "",
                        naicsCodes: [],
                        isActive: true,
                      },
                    ]);
                    setHasChanges(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Industry
                </Button>
              </div>
              <div className="mt-6">
                <Button
                  onClick={() => saveSection("industries", industries)}
                  disabled={!hasChanges || saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Industries"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Share Tab */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Share Configuration</CardTitle>
              <CardDescription>
                Set platform fee and partner share percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueConfig && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Platform Fee Percentage
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={revenueConfig.platformFeePercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setRevenueConfig({
                            ...revenueConfig,
                            platformFeePercentage: value,
                            partnerSharePercentage: 100 - value,
                          });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Partner Share Percentage
                      </label>
                      <Input
                        type="number"
                        value={revenueConfig.partnerSharePercentage}
                        disabled
                      />
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Platform fee and partner share must total 100%
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Lead Generation Fee ($)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={revenueConfig.leadGenerationFee || 0}
                        onChange={(e) => {
                          setRevenueConfig({
                            ...revenueConfig,
                            leadGenerationFee: parseFloat(e.target.value),
                          });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Service Delivery Fee ($)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={revenueConfig.serviceDeliveryFee || 0}
                        onChange={(e) => {
                          setRevenueConfig({
                            ...revenueConfig,
                            serviceDeliveryFee: parseFloat(e.target.value),
                          });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Introduction Fee ($)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={revenueConfig.introductionFee || 0}
                        onChange={(e) => {
                          setRevenueConfig({
                            ...revenueConfig,
                            introductionFee: parseFloat(e.target.value),
                          });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => saveSection("revenueConfig", revenueConfig)}
                    disabled={!hasChanges || saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Revenue Config"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pack Health Tab */}
        <TabsContent value="packhealth">
          <Card>
            <CardHeader>
              <CardTitle>Pack Health Scoring Configuration</CardTitle>
              <CardDescription>
                Configure Pack Health thresholds and scoring weights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {packHealthConfig && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thresholds</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Intro-Eligibility Threshold
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.introEligibilityThreshold}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              introEligibilityThreshold: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Default: 70
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Critical Threshold
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.criticalThreshold}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              criticalThreshold: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Default: 40
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Warning Threshold
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.warningThreshold}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              warningThreshold: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Default: 70
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Scoring Weights (%)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Completeness Weight
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.completenessWeight}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              completenessWeight: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Expiration Weight
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.expirationWeight}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              expirationWeight: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Quality Weight
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.qualityWeight}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              qualityWeight: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Remediation Weight
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={packHealthConfig.remediationWeight}
                          onChange={(e) => {
                            setPackHealthConfig({
                              ...packHealthConfig,
                              remediationWeight: parseFloat(e.target.value),
                            });
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Total weight: {
                          packHealthConfig.completenessWeight +
                          packHealthConfig.expirationWeight +
                          packHealthConfig.qualityWeight +
                          packHealthConfig.remediationWeight
                        }% (must equal 100%)
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button
                    onClick={() => saveSection("packHealthConfig", packHealthConfig)}
                    disabled={!hasChanges || saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Pack Health Config"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner Assignments Tab */}
        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Consortium Partner Vertical Assignments</CardTitle>
              <CardDescription>
                Manage partner vertical and capability assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerAssignments.map((assignment, index) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        placeholder="Partner Name"
                        value={assignment.partnerName}
                        onChange={(e) => {
                          const updated = [...partnerAssignments];
                          updated[index].partnerName = e.target.value;
                          setPartnerAssignments(updated);
                          setHasChanges(true);
                        }}
                        className="font-medium max-w-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPartnerAssignments(partnerAssignments.filter((_, i) => i !== index));
                          setHasChanges(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Verticals (comma-separated)"
                        value={assignment.verticals.join(", ")}
                        onChange={(e) => {
                          const updated = [...partnerAssignments];
                          updated[index].verticals = e.target.value.split(",").map(v => v.trim());
                          setPartnerAssignments(updated);
                          setHasChanges(true);
                        }}
                      />
                      <Input
                        placeholder="Capabilities (comma-separated)"
                        value={assignment.capabilities.join(", ")}
                        onChange={(e) => {
                          const updated = [...partnerAssignments];
                          updated[index].capabilities = e.target.value.split(",").map(c => c.trim());
                          setPartnerAssignments(updated);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setPartnerAssignments([
                      ...partnerAssignments,
                      {
                        id: `partner_${Date.now()}`,
                        partnerId: `partner_${Date.now()}`,
                        partnerName: "New Partner",
                        verticals: [],
                        capabilities: [],
                        isActive: true,
                      },
                    ]);
                    setHasChanges(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner Assignment
                </Button>
              </div>
              <div className="mt-6">
                <Button
                  onClick={() => saveSection("partnerAssignments", partnerAssignments)}
                  disabled={!hasChanges || saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Partner Assignments"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Settings Tab */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                General platform configuration and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {platformSettings && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Disable platform access for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) => {
                        setPlatformSettings({
                          ...platformSettings,
                          maintenanceMode: checked,
                        });
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Registration Enabled</p>
                      <p className="text-sm text-muted-foreground">
                        Allow new user registrations
                      </p>
                    </div>
                    <Switch
                      checked={platformSettings.registrationEnabled}
                      onCheckedChange={(checked) => {
                        setPlatformSettings({
                          ...platformSettings,
                          registrationEnabled: checked,
                        });
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Max Upload Size (MB)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={platformSettings.maxUploadSizeMB}
                      onChange={(e) => {
                        setPlatformSettings({
                          ...platformSettings,
                          maxUploadSizeMB: parseInt(e.target.value),
                        });
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Session Timeout (Minutes)
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="1440"
                      value={platformSettings.sessionTimeoutMinutes}
                      onChange={(e) => {
                        setPlatformSettings({
                          ...platformSettings,
                          sessionTimeoutMinutes: parseInt(e.target.value),
                        });
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <Button
                    onClick={() => saveSection("settings", platformSettings)}
                    disabled={!hasChanges || saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Platform Settings"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
