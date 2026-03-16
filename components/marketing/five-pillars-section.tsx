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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Five Pillars; KDM's Strategic Engine for Readiness, Scale and Impact.
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              KDM Consortium unites Government Contracting, Manufacturing, Critical Minerals, Opportunity Zones, and Access to Capital to help partners move faster, build stronger, and win together.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Where mission meets market and collaboration yields significant results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold w-full sm:w-auto" asChild>
                <Link href="/contact">
                  Partner With KDM
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-colors w-full sm:w-auto" asChild>
                <Link href="/5-pillars">
                  Explore the Five Pillars
                </Link>
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
              <Link href="/5-pillars/defense-cmmc" className="col-span-1 bg-teal-700 hover:bg-teal-600 transition-colors p-6 border-2 border-white flex items-center justify-center text-center animate-pulse hover:animate-none">
                <div>
                  <h3 className="font-bold text-lg">Government</h3>
                  <h3 className="font-bold text-lg">Contracting</h3>
                </div>
              </Link>
              <div className="col-span-1"></div>

              {/* Middle Row */}
              <Link href="/5-pillars/us-manufacturing" className="col-span-1 bg-amber-600 hover:bg-amber-500 transition-colors p-6 border-2 border-white flex items-center justify-center text-center animate-pulse hover:animate-none">
                <h3 className="font-bold text-lg">Manufacturing</h3>
              </Link>
              <div className="col-span-1 bg-slate-100 text-slate-900 p-6 border-2 border-white flex items-center justify-center text-center">
                <div>
                  <h3 className="font-bold text-lg">KDM</h3>
                  <h3 className="font-bold text-lg">Consortium</h3>
                </div>
              </div>
              <Link href="/5-pillars/opportunity-zones" className="col-span-1 bg-teal-700 hover:bg-teal-600 transition-colors p-6 border-2 border-white flex items-center justify-center text-center animate-pulse hover:animate-none">
                <div>
                  <h3 className="font-bold text-lg">Opportunity</h3>
                  <h3 className="font-bold text-lg">Zones</h3>
                </div>
              </Link>

              {/* Bottom Row */}
              <div className="col-span-1"></div>
              <Link href="/5-pillars/critical-minerals" className="col-span-1 bg-teal-700 hover:bg-teal-600 transition-colors p-6 border-2 border-white flex items-center justify-center text-center animate-pulse hover:animate-none">
                <div>
                  <h3 className="font-bold text-lg">Critical</h3>
                  <h3 className="font-bold text-lg">Minerals</h3>
                </div>
              </Link>
              <Link href="/5-pillars/access-to-capital" className="col-span-1 bg-amber-600 hover:bg-amber-500 transition-colors p-6 border-2 border-white flex items-center justify-center text-center animate-pulse hover:animate-none">
                <div>
                  <h3 className="font-bold text-lg">Access to</h3>
                  <h3 className="font-bold text-lg">Capital</h3>
                </div>
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-right italic">
              Click on each pillar to learn more about that area.
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
        <div className="text-center bg-slate-800/50 p-8 rounded-lg border border-slate-700 mb-16">
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

        {/* Why KDM and Human-Thinking Framework */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-lg">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why KDM and the human-thinking framework
            </h2>
            <p className="text-lg text-slate-600 mb-12">
              This portion of the homepage answers the natural sequence of questions: why it matters, who it serves, what works, how it works, and when it delivers results.
            </p>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Left Column */}
              <div>
                <h3 className="text-amber-500 font-bold mb-3 uppercase text-sm">Why KDM Exists</h3>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">
                  The biggest opportunities are never won in silos.
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  Government priorities, industrial capability, strategic resources, place-based incentives, and capital must work together. KDM Consortium aligns these forces into one coordinated system designed for execution, resilience, and shared prosperity.
                </p>
              </div>

              {/* Right Column */}
              <div className="bg-slate-800 text-white p-8 rounded-lg">
                <h4 className="text-2xl font-bold mb-2">No pillar wins alone.</h4>
                <h4 className="text-2xl font-bold mb-4">Together, they create momentum.</h4>
                <p className="text-gray-300">Strategic ecosystem. Shared execution.</p>
              </div>
            </div>

            {/* Four Boxes Row */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border-2 border-teal-600">
                <h3 className="text-teal-600 font-bold mb-3 uppercase text-sm">Why They Work</h3>
                <p className="text-slate-700">Because no pillar wins alone.</p>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-teal-600">
                <h3 className="text-teal-600 font-bold mb-3 uppercase text-sm">For Whom They Work</h3>
                <p className="text-slate-700">For manufacturers, contractors, investors, agencies, developers, and communities.</p>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-teal-600">
                <h3 className="text-teal-600 font-bold mb-3 uppercase text-sm">What Works</h3>
                <p className="text-slate-700">An integrated model that turns opportunity into contracts, production, investment, and impact.</p>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-teal-600">
                <h3 className="text-teal-600 font-bold mb-3 uppercase text-sm">How They Work</h3>
                <p className="text-slate-700">By aligning mission, capability, resources, incentives, and funding across all five pillars.</p>
              </div>
            </div>

            {/* When It Works Box */}
            <div className="mt-6 bg-white p-6 rounded-lg border-2 border-teal-600">
              <h3 className="text-teal-600 font-bold mb-3 uppercase text-sm">When It Works</h3>
              <p className="text-slate-700">When the right partners are aligned and strategy turns into action.</p>
            </div>
          </div>
        </div>

        {/* Each Pillar Showcase Section */}
        <div className="mt-16">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Each pillar is powerful on its own. Together, they create a force multiplier.
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center max-w-4xl mx-auto">
            The homepage presents the pillars as the core operating structure of the KDM Consortium, with equal visual weight and concise, executive-level explanations.
          </p>

          {/* Pillars Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Pillar 1 - Government Contracting */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 1</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Government Contracting</h3>
              <p className="text-slate-700">
                Helping qualified teams pursue and win opportunities that support public priorities, national resilience, and long-term economic strength.
              </p>
            </div>

            {/* Pillar 2 - Manufacturing */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 2</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Manufacturing</h3>
              <p className="text-slate-700">
                Advancing the capacity, capability, and modernization needed to produce more in America with speed, quality, and resilience.
              </p>
            </div>

            {/* Pillar 3 - Critical Minerals */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 3</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Critical Minerals</h3>
              <p className="text-slate-700">
                Supporting secure supply chains for the materials essential to defense, energy, infrastructure, and advanced industry.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pillar 4 - Opportunity Zones */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 4</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Opportunity Zones</h3>
              <p className="text-slate-700">
                Connecting investment and development opportunities to places positioned for revitalization, growth, and strategic advantage.
              </p>
            </div>

            {/* Pillar 5 - Access to Capital */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 5</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Access to Capital</h3>
              <p className="text-slate-700">
                Bringing the right funding strategies, partners, and pathways together to move projects from concept to reality.
              </p>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="bg-slate-800 text-white p-8 rounded-lg text-center">
            <p className="text-lg font-semibold">
              Government Contracting + Manufacturing + Critical Minerals + Opportunity Zones + Access to Capital = One Powerfully Orchestrated Engine
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
