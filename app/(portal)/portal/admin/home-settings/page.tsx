"use client";

import { HomePageSettings } from "@/components/admin/home-page-settings";

export default function HomeSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home Page Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage hero slider speed, popup form timing, and other home page configurations
        </p>
      </div>

      <HomePageSettings />
    </div>
  );
}
