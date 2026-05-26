import { Building2, Lock, Mail } from "lucide-react";
import { ParkedWebsiteAccessForm } from "@/components/marketing/parked-website-access-form";

export function ParkedWebsiteGate() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/85 shadow-2xl shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-8 border-b border-slate-800 px-8 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
              <Building2 className="h-4 w-4" />
              Website Parked
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                KDM &amp; Associates is temporarily parked.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                This website is currently in parked mode. Please contact the owner for more information or for access while the public site is unavailable.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="mb-3 inline-flex rounded-full bg-slate-800 p-2 text-amber-300">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">Need more information?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Contact the site owner directly for scheduling, support, or access details.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="mb-3 inline-flex rounded-full bg-slate-800 p-2 text-amber-300">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">Owner access available</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  If you have the owner password, enter it to continue to the original homepage.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-950/70 px-8 py-10 lg:px-10 lg:py-14">
            <div className="mx-auto max-w-md space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">
                  Private Access
                </p>
                <h2 className="text-2xl font-semibold text-white">Unlock the live website</h2>
                <p className="text-sm leading-6 text-slate-400">
                  Enter the owner password below. After it is accepted, you will be redirected to the original homepage.
                </p>
              </div>

              <ParkedWebsiteAccessForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
