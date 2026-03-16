import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";

export function FivePillarsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Text Content */}
          <div>
            <p className="text-amber-400 font-semibold mb-4 uppercase tracking-wide">Homepage Mockup</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Five Pillars. One Aligned Engine for Growth, Readiness, and Impact.
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              KDM Consortium unites Government Contracting, Manufacturing, Critical Minerals, Opportunity Zones, and Access to Capital to help partners move faster, build stronger, and win together.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Where mission meets market and collaboration yields significant results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                Partner With KDM
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Explore the Five Pillars
              </Button>
            </div>
          </div>

          {/* Right Column - Integrated Ecosystem Diagram */}
          <div>
            <div className="text-right mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Integrated Ecosystem View</p>
            </div>
            <div className="grid grid-cols-3 gap-0 border-4 border-white">
              {/* Top Row */}
              <div className="col-span-1"></div>
              <Link href="/5-pillars/defense-cmmc" className="col-span-1 bg-teal-700 hover:bg-teal-600 transition-colors p-6 border-2 border-white flex items-center justify-center text-center">
                <div>
                  <h3 className="font-bold text-lg">Government</h3>
                  <h3 className="font-bold text-lg">Contracting</h3>
                </div>
              </Link>
              <div className="col-span-1"></div>

              {/* Middle Row */}
              <Link href="/5-pillars/us-manufacturing" className="col-span-1 bg-amber-600 hover:bg-amber-500 transition-colors p-6 border-2 border-white flex items-center justify-center text-center">
                <h3 className="font-bold text-lg">Manufacturing</h3>
              </Link>
              <div className="col-span-1 bg-slate-100 text-slate-900 p-6 border-2 border-white flex items-center justify-center text-center">
                <div>
                  <h3 className="font-bold text-lg">KDM</h3>
                  <h3 className="font-bold text-lg">Consortium</h3>
                </div>
              </div>
              <Link href="/5-pillars/opportunity-zones" className="col-span-1 bg-teal-700 hover:bg-teal-600 transition-colors p-6 border-2 border-white flex items-center justify-center text-center">
                <div>
                  <h3 className="font-bold text-lg">Opportunity</h3>
                  <h3 className="font-bold text-lg">Zones</h3>
                </div>
              </Link>

              {/* Bottom Row */}
              <div className="col-span-1"></div>
              <Link href="/5-pillars/critical-minerals" className="col-span-1 bg-teal-700 hover:bg-teal-600 transition-colors p-6 border-2 border-white flex items-center justify-center text-center">
                <div>
                  <h3 className="font-bold text-lg">Critical</h3>
                  <h3 className="font-bold text-lg">Minerals</h3>
                </div>
              </Link>
              <Link href="/5-pillars/access-to-capital" className="col-span-1 bg-amber-600 hover:bg-amber-500 transition-colors p-6 border-2 border-white flex items-center justify-center text-center">
                <div>
                  <h3 className="font-bold text-lg">Access to</h3>
                  <h3 className="font-bold text-lg">Capital</h3>
                </div>
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-right italic">
              (Graphic tiles are intentionally simplified so they render cleanly in Word. Please represent in a cyclical graphic with KDM Consortium in the middle.)
            </p>
          </div>
        </div>

        {/* Four Pillars Taglines */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-amber-400 font-bold mb-2 uppercase text-sm">Industry + Government</h3>
            <p className="text-gray-300">Alignment across public priorities and private execution.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-amber-400 font-bold mb-2 uppercase text-sm">Collaborative</h3>
            <p className="text-gray-300">Moving opportunities from conversation to coordinated action.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-amber-400 font-bold mb-2 uppercase text-sm">Place-Based</h3>
            <p className="text-gray-300">Connecting growth strategies to communities ready to build.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-amber-400 font-bold mb-2 uppercase text-sm">Capital-Ready</h3>
            <p className="text-gray-300">Helping aligned projects move with stronger funding pathways.</p>
          </div>
        </div>

        {/* Video Link */}
        <div className="text-center bg-slate-800/50 p-8 rounded-lg border border-slate-700">
          <h3 className="text-2xl font-bold mb-4">Learn More About Our Five Pillars</h3>
          <p className="text-gray-300 mb-6">Watch this video to understand how our integrated ecosystem drives growth and impact.</p>
          <a 
            href="https://drive.google.com/file/d/1c8mUrZhTOPyYMDHzjZ_7Qi8sc8FtvwoP/view" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <PlayCircle className="h-5 w-5" />
            Watch Five Pillars Explanation Video
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
