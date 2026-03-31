"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getHomePageSettings,
  saveHomePageSettings,
  defaultHomePageSettings,
} from "@/lib/firebase-home-settings";
import type { HomePageSettingsDoc } from "@/lib/schema";

export function HomePageSettings() {
  const [settings, setSettings] = useState<HomePageSettingsDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getHomePageSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await saveHomePageSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof HomePageSettingsDoc>(
    key: K,
    value: HomePageSettingsDoc[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-20">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Slider Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Slider Settings</CardTitle>
          <CardDescription>
            Configure the behavior and timing of the hero carousel on the home page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Slider Speed */}
          <div className="space-y-2">
            <Label htmlFor="heroSliderSpeed">
              Slider Speed (milliseconds)
              <span className="text-muted-foreground text-sm ml-2">
                Current: {settings.heroSliderSpeed}ms ({(settings.heroSliderSpeed / 1000).toFixed(1)}s)
              </span>
            </Label>
            <Input
              id="heroSliderSpeed"
              type="number"
              min="1000"
              max="30000"
              step="500"
              value={settings.heroSliderSpeed}
              onChange={(e) =>
                updateSetting("heroSliderSpeed", parseInt(e.target.value, 10))
              }
              placeholder="6000"
            />
            <p className="text-xs text-muted-foreground">
              Time in milliseconds between slide transitions. Default is 6000ms (6 seconds).
            </p>
          </div>

          {/* Hero Slider AutoPlay */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="heroSliderAutoPlay">Enable Autoplay</Label>
              <p className="text-xs text-muted-foreground">
                Automatically advance slides
              </p>
            </div>
            <Switch
              id="heroSliderAutoPlay"
              checked={settings.heroSliderAutoPlay}
              onCheckedChange={(checked) =>
                updateSetting("heroSliderAutoPlay", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Popup Form Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Popup Form Settings</CardTitle>
          <CardDescription>
            Configure the contact popup form that appears on the home page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Popup Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="popupFormEnabled">Enable Popup Form</Label>
              <p className="text-xs text-muted-foreground">
                Show the contact form popup on the home page
              </p>
            </div>
            <Switch
              id="popupFormEnabled"
              checked={settings.popupFormEnabled}
              onCheckedChange={(checked) =>
                updateSetting("popupFormEnabled", checked)
              }
            />
          </div>

          {/* Popup Trigger Delay */}
          <div className="space-y-2">
            <Label htmlFor="popupFormTriggerDelay">
              Popup Trigger Delay (seconds)
              <span className="text-muted-foreground text-sm ml-2">
                Current: {settings.popupFormTriggerDelay}s
              </span>
            </Label>
            <Input
              id="popupFormTriggerDelay"
              type="number"
              min="0"
              max="300"
              step="5"
              value={settings.popupFormTriggerDelay}
              onChange={(e) =>
                updateSetting("popupFormTriggerDelay", parseInt(e.target.value, 10))
              }
              placeholder="60"
            />
            <p className="text-xs text-muted-foreground">
              Number of seconds to wait before showing the popup. Set to 0 to disable auto-show.
            </p>
          </div>

          {/* Popup Position */}
          <div className="space-y-2">
            <Label htmlFor="popupFormPosition">Popup Position</Label>
            <Select
              value={settings.popupFormPosition}
              onValueChange={(value) =>
                updateSetting(
                  "popupFormPosition",
                  value as "bottom-right" | "bottom-left" | "center"
                )
              }
            >
              <SelectTrigger id="popupFormPosition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Popup Title */}
          <div className="space-y-2">
            <Label htmlFor="popupFormTitle">Popup Title</Label>
            <Input
              id="popupFormTitle"
              value={settings.popupFormTitle}
              onChange={(e) => updateSetting("popupFormTitle", e.target.value)}
              placeholder="KDM & Associates"
            />
          </div>

          {/* Popup Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="popupFormSubtitle">Popup Subtitle</Label>
            <Input
              id="popupFormSubtitle"
              value={settings.popupFormSubtitle}
              onChange={(e) => updateSetting("popupFormSubtitle", e.target.value)}
              placeholder="Schedule an introductory session..."
            />
          </div>

          {/* Popup Description */}
          <div className="space-y-2">
            <Label htmlFor="popupFormDescription">Popup Description</Label>
            <Textarea
              id="popupFormDescription"
              value={settings.popupFormDescription}
              onChange={(e) => updateSetting("popupFormDescription", e.target.value)}
              placeholder="Tell us about your business..."
              rows={3}
            />
          </div>

          {/* Popup Button Text */}
          <div className="space-y-2">
            <Label htmlFor="popupFormButtonText">Button Text</Label>
            <Input
              id="popupFormButtonText"
              value={settings.popupFormButtonText}
              onChange={(e) => updateSetting("popupFormButtonText", e.target.value)}
              placeholder="Schedule Session"
            />
          </div>

          {/* Popup Success Message */}
          <div className="space-y-2">
            <Label htmlFor="popupFormSuccessMessage">Success Message</Label>
            <Textarea
              id="popupFormSuccessMessage"
              value={settings.popupFormSuccessMessage}
              onChange={(e) => updateSetting("popupFormSuccessMessage", e.target.value)}
              placeholder="Thank you! We'll be in touch..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
        <Button
          onClick={loadSettings}
          variant="outline"
          size="lg"
          disabled={isSaving}
        >
          Reset to Saved
        </Button>
      </div>
    </div>
  );
}
