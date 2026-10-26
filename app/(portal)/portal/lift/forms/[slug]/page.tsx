"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormRunner } from "@/components/forms/form-runner";

/** Client portal runner for a LIFT form (prefilled from earlier answers). */
export default function PortalLiftFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/portal/lift/forms">
          <ArrowLeft className="mr-2 h-4 w-4" />
          My LIFT forms
        </Link>
      </Button>
      <FormRunner slug={slug} context="portal" />
    </div>
  );
}
