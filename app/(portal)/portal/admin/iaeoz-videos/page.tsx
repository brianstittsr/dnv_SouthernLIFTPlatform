"use client";

import { IAEOZVideoManager } from "@/components/admin/iaeoz-video-manager";

export default function IAEOZVideosAdminPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-9xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IAEOZ Summit Video Management</h1>
        <p className="text-muted-foreground">
          Manage YouTube videos displayed on the IAEOZ Summit video archive page.
        </p>
      </div>

      <IAEOZVideoManager />
    </div>
  );
}
