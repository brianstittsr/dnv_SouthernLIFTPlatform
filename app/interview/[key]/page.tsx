import type { Metadata } from "next";
import { InterviewRunner } from "./interview-runner";

export const metadata: Metadata = {
  title: "AI Interview | Southern University LIFT",
  robots: { index: false, follow: false },
};

/** Public AI interview page (inv_<token> invite links and pub_<slug> shared links). */
export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-[#0b2545] text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Southern University</p>
            <p className="text-lg font-bold">LIFT Rural Business Center</p>
          </div>
          <p className="text-xs text-white/80">An MBDA Rural Business Center</p>
        </div>
      </header>
      <main className="px-4 py-8">
        <InterviewRunner />
      </main>
      <footer className="border-t bg-background px-4 py-6 text-center text-xs text-muted-foreground">
        Southern University LIFT Center - MBDA Rural Business Center. Supported by the U.S. Department of Commerce, Minority Business Development Agency.
      </footer>
    </div>
  );
}
