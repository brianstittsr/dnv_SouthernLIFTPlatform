import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to Grow Your Rural Business?
          </h2>
          <p className="mt-4 text-xl opacity-95 max-w-3xl mx-auto font-medium">
            No-cost advising, training, capital readiness, and contracting
            support for rural Louisiana small businesses.
          </p>
          <p className="mt-6 text-lg opacity-90 max-w-2xl mx-auto">
            Start with a short intake interview — a LIFT advisor will review
            your goals and help you build a plan.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/forms/lift-intake">
                Start the Intake Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Browse Workshops
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link href="tel:+1-225-771-0000">
                <Phone className="mr-2 h-5 w-5" />
                Call (225) 771-0000
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <div className="text-3xl font-bold">No-Cost</div>
              <div className="text-sm opacity-80">All Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Rural</div>
              <div className="text-sm opacity-80">Louisiana Focus</div>
            </div>
            <div>
              <div className="text-3xl font-bold">MBDA</div>
              <div className="text-sm opacity-80">Federally Funded</div>
            </div>
          </div>

          <p className="mt-10 text-xs opacity-70 max-w-2xl mx-auto">
            Funded in part by the U.S. Department of Commerce, Minority Business
            Development Agency (MBDA). Program participation does not guarantee
            funding, certification, or contract awards.
          </p>
        </div>
      </div>
    </section>
  );
}
