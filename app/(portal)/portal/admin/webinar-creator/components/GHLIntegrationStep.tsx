"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Webinar } from "@/lib/types/webinar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GHLIntegrationStepProps {
  data: Partial<Webinar>;
  updateData: (updates: Partial<Webinar>) => void;
}

export function GHLIntegrationStep({ data, updateData }: GHLIntegrationStepProps) {
  const updateGHL = (updates: any) => {
    updateData({
      ghlIntegration: { 
        ...(data.ghlIntegration || { enabled: false }), 
        ...updates 
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              GoHighLevel Integration
            </h3>
            <p className="text-sm text-muted-foreground">
              Sync registrations directly to your GHL account.
            </p>
          </div>
          <Switch
            checked={data.ghlIntegration?.enabled || false}
            onCheckedChange={(enabled) => updateGHL({ enabled })}
          />
        </div>

        {data.ghlIntegration?.enabled ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure the connection to your GoHighLevel sub-account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ghlApiKey">API Key</Label>
                <Input
                  id="ghlApiKey"
                  type="password"
                  placeholder="Enter your GHL API Key"
                  value={data.ghlIntegration?.apiKey || ""}
                  onChange={(e) => updateGHL({ apiKey: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationId">Location ID</Label>
                  <Input
                    id="locationId"
                    placeholder="Enter GHL Location ID"
                    value={data.ghlIntegration?.locationId || ""}
                    onChange={(e) => updateGHL({ locationId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formId">Form ID</Label>
                  <Input
                    id="formId"
                    placeholder="Optional GHL Form ID"
                    value={data.ghlIntegration?.formId || ""}
                    onChange={(e) => updateGHL({ formId: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ghlTags">Tags (comma separated)</Label>
                <Input
                  id="ghlTags"
                  placeholder="webinar, march-2024, govcon"
                  value={data.ghlIntegration?.tags?.join(", ") || ""}
                  onChange={(e) => updateGHL({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                />
                <p className="text-xs text-muted-foreground">
                  These tags will be added to every contact created from this webinar.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Integration Disabled</AlertTitle>
            <AlertDescription>
              Toggle the switch above to enable GoHighLevel integration. 
              When disabled, registration data will still be saved in the SVP database.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
