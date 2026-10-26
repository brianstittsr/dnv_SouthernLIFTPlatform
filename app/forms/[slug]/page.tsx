import type { Metadata } from "next";
import { FormRunner } from "@/components/forms/form-runner";

export const metadata: Metadata = {
  title: "LIFT Center Form | Southern University",
  robots: { index: false, follow: false },
};

/** Public form runner (e.g., LIFT intake and workshop registration) with LIFT/MBDA branding. */
export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-muted/30">
      <a href="#form-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-background focus:px-3 focus:py-2">
        Skip to form
      </a>
      <header className="border-b bg-[#0b2545] text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Southern University</p>
            <p className="text-lg font-bold">LIFT Rural Business Center</p>
          </div>
          <p className="text-xs text-white/80">An MBDA Rural Business Center</p>
        </div>
      </header>
      <main id="form-main" className="px-4 py-8" tabIndex={-1}>
        <FormRunner slug={slug} context="public" />
      </main>
      <footer className="border-t bg-background px-4 py-6 text-center text-xs text-muted-foreground">
        Southern University LIFT Center - MBDA Rural Business Center. Supported by the U.S. Department of Commerce, Minority Business Development Agency.
      </footer>
    </div>
  );
}
