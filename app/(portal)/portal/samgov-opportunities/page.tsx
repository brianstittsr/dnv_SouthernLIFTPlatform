"use client";

import { SamgovOpportunitiesView } from "@/components/portal/samgov-opportunities-view";

export default function SamgovOpportunitiesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <SamgovOpportunitiesView initialTab="opportunities" />
    </div>
  );
}
