'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { VideoModal, extractYouTubeVideoId } from "@/components/video/video-modal";

export function FivePillarsSection() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const openVideoModal = (videoUrl: string, title: string) => {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
      setCurrentVideoId(videoId);
      setCurrentVideoTitle(title);
      setVideoModalOpen(true);
    }
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setCurrentVideoId('');
    setCurrentVideoTitle('');
  };

  const pillarDescriptions = {
    'government-contracting': 'Helping qualified teams pursue and win opportunities that support public priorities, national resilience, and long-term economic strength.',
    'manufacturing': 'Advancing the capacity, capability, and modernization needed to produce more in America with speed, quality, and resilience.',
    'critical-minerals': 'Supporting secure supply chains for the materials essential to defense, energy, infrastructure, and advanced industry.',
    'opportunity-zones': 'Connecting investment and development opportunities to places positioned for revitalization, growth, and strategic advantage.',
    'access-to-capital': 'Bringing the right funding strategies, partners, and pathways together to move projects from concept to reality.'
  };

  const glowStyles = `
    @keyframes pillarGlow {
      0%, 100% {
        filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.4));
      }
      50% {
        filter: drop-shadow(0 0 16px rgba(251, 146, 60, 0.8));
      }
    }
    
    .pillar-item:hover {
      animation: pillarGlow 2s ease-in-out infinite;
    }
  `;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <style>{glowStyles}</style>
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
              <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 font-semibold w-full sm:w-auto" asChild>
                <Link href="/5-pillars">
                  Explore the Five Pillars
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Greek Pillars Diagram */}
          <div>
            <div className="text-right mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Integrated Ecosystem View</p>
            </div>
            <div className="relative w-full max-w-2xl mx-auto">
              {/* KDM Consortium Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white tracking-wider">KDM CONSORTIUM</h3>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent mt-2"></div>
              </div>

              {/* Five Classical Pillars */}
              <div className="flex items-end justify-center gap-6 mb-8">
                {/* Pillar 1 - Government Contracting */}
                <div 
                  className={`pillar-item flex flex-col items-center cursor-pointer transition-all duration-500 ${selectedPillar === 'government-contracting' ? 'scale-110 z-10' : 'hover:scale-105'}`}
                  onClick={() => setSelectedPillar(selectedPillar === 'government-contracting' ? null : 'government-contracting')}
                >
                  <div className="relative h-144 w-60 mb-2">
                    <Image
                      src="/kdm-assets/images/greek-pillar-isolated-on-transparent-background-png.webp"
                      alt="Government Contracting Pillar"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xs leading-tight">Government<br />Contracting</p>
                  </div>
                </div>

                {/* Pillar 2 - Manufacturing */}
                <div 
                  className={`pillar-item flex flex-col items-center cursor-pointer transition-all duration-500 ${selectedPillar === 'manufacturing' ? 'scale-110 z-10' : 'hover:scale-105'}`}
                  onClick={() => setSelectedPillar(selectedPillar === 'manufacturing' ? null : 'manufacturing')}
                >
                  <div className="relative h-144 w-60 mb-2">
                    <Image
                      src="/kdm-assets/images/greek-pillar-isolated-on-transparent-background-png.webp"
                      alt="Manufacturing Pillar"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xs leading-tight">Manufacturing<br />& Supply Chain</p>
                  </div>
                </div>

                {/* Pillar 3 - Critical Minerals */}
                <div 
                  className={`pillar-item flex flex-col items-center cursor-pointer transition-all duration-500 ${selectedPillar === 'critical-minerals' ? 'scale-110 z-10' : 'hover:scale-105'}`}
                  onClick={() => setSelectedPillar(selectedPillar === 'critical-minerals' ? null : 'critical-minerals')}
                >
                  <div className="relative h-144 w-60 mb-2">
                    <Image
                      src="/kdm-assets/images/greek-pillar-isolated-on-transparent-background-png.webp"
                      alt="Critical Minerals Pillar"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xs leading-tight">Critical<br />Minerals</p>
                  </div>
                </div>

                {/* Pillar 4 - Opportunity Zones */}
                <div 
                  className={`pillar-item flex flex-col items-center cursor-pointer transition-all duration-500 ${selectedPillar === 'opportunity-zones' ? 'scale-110 z-10' : 'hover:scale-105'}`}
                  onClick={() => setSelectedPillar(selectedPillar === 'opportunity-zones' ? null : 'opportunity-zones')}
                >
                  <div className="relative h-144 w-60 mb-2">
                    <Image
                      src="/kdm-assets/images/greek-pillar-isolated-on-transparent-background-png.webp"
                      alt="Opportunity Zones Pillar"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xs leading-tight">Opportunity<br />Zones</p>
                  </div>
                </div>

                {/* Pillar 5 - Access to Capital */}
                <div 
                  className={`pillar-item flex flex-col items-center cursor-pointer transition-all duration-500 ${selectedPillar === 'access-to-capital' ? 'scale-110 z-10' : 'hover:scale-105'}`}
                  onClick={() => setSelectedPillar(selectedPillar === 'access-to-capital' ? null : 'access-to-capital')}
                >
                  <div className="relative h-144 w-60 mb-2">
                    <Image
                      src="/kdm-assets/images/greek-pillar-isolated-on-transparent-background-png.webp"
                      alt="Access to Capital Pillar"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xs leading-tight">Access to<br />Capital</p>
                  </div>
                </div>
              </div>

              {/* Description Panel */}
              {selectedPillar && (
                <div className="bg-slate-800/90 border-2 border-white rounded-lg p-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-xl font-bold text-white mb-3 capitalize">
                    {selectedPillar.replace('-', ' ')}
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {pillarDescriptions[selectedPillar as keyof typeof pillarDescriptions]}
                  </p>
                  <Link 
                    href={`/5-pillars/${selectedPillar === 'government-contracting' ? 'defense-cmmc' : selectedPillar === 'manufacturing' ? 'us-manufacturing' : selectedPillar}`}
                    className="inline-flex items-center gap-2 mt-4 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              <p className="text-xs text-gray-400 text-right italic">
                Click on each pillar to see its description.
              </p>
            </div>
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
          <button 
            onClick={() => openVideoModal('https://www.youtube.com/watch?v=6S8OCcK6Vx8', 'Learn More About Our Five Pillars')}
            className="inline-block relative group max-w-2xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform group-hover:scale-105">
              <img 
                src="https://img.youtube.com/vi/6S8OCcK6Vx8/maxresdefault.jpg" 
                alt="Learn More About Our Five Pillars"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <PlayCircle className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </button>
        </div>

        <VideoModal 
          isOpen={videoModalOpen} 
          onClose={closeVideoModal} 
          videoId={currentVideoId} 
          title={currentVideoTitle} 
        />

        {/* Why KDM and Human-Thinking Framework */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-lg">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-12">
              Why KDM and the human-thinking framework
            </h2>

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
              <p className="text-slate-700 mb-4">
                Helping qualified teams pursue and win opportunities that support public priorities, national resilience, and long-term economic strength.
              </p>
              <button 
                onClick={() => openVideoModal('https://youtu.be/YUm-heZ04Dc?si=jOsWLnWEMGu3TtV_', 'Government Contracting Video')}
                className="inline-block relative group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105 w-48">
                  <img 
                    src="https://img.youtube.com/vi/YUm-heZ04Dc/hqdefault.jpg" 
                    alt="Government Contracting Video"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">Watch Government Contracting Video</p>
              </button>
            </div>

            {/* Pillar 2 - Manufacturing */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 2</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Manufacturing</h3>
              <p className="text-slate-700 mb-4">
                Advancing the capacity, capability, and modernization needed to produce more in America with speed, quality, and resilience.
              </p>
              <button 
                onClick={() => openVideoModal('https://www.youtube.com/watch?v=U9c0j7p73Cc', 'Manufacturing Video')}
                className="inline-block relative group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105 w-48">
                  <img 
                    src="https://img.youtube.com/vi/U9c0j7p73Cc/hqdefault.jpg" 
                    alt="Manufacturing Video"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">Watch Manufacturing Video</p>
              </button>
            </div>

            {/* Pillar 3 - Critical Minerals */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 3</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Critical Minerals</h3>
              <p className="text-slate-700 mb-4">
                Supporting secure supply chains for the materials essential to defense, energy, infrastructure, and advanced industry.
              </p>
              <button 
                onClick={() => openVideoModal('https://www.youtube.com/watch?v=Jwcmv9MTz5I', 'Critical Minerals Video')}
                className="inline-block relative group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105 w-48">
                  <img 
                    src="https://img.youtube.com/vi/Jwcmv9MTz5I/hqdefault.jpg" 
                    alt="Critical Minerals Video"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">Watch Critical Minerals Video</p>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pillar 4 - Opportunity Zones */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 4</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Opportunity Zones</h3>
              <p className="text-slate-700 mb-4">
                Connecting investment and development opportunities to places positioned for revitalization, growth, and strategic advantage.
              </p>
              <button 
                onClick={() => openVideoModal('https://www.youtube.com/watch?v=6S8OCcK6Vx8', 'Opportunity Zones Video')}
                className="inline-block relative group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105 w-48">
                  <img 
                    src="https://img.youtube.com/vi/6S8OCcK6Vx8/hqdefault.jpg" 
                    alt="Opportunity Zones Video"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">Watch Opportunity Zones Video</p>
              </button>
            </div>

            {/* Pillar 5 - Access to Capital */}
            <div className="bg-white p-8 rounded-lg">
              <p className="text-teal-600 font-bold mb-2 uppercase text-sm">Pillar 5</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Access to Capital</h3>
              <p className="text-slate-700 mb-4">
                Bringing the right funding strategies, partners, and pathways together to move projects from concept to reality.
              </p>
              <button 
                onClick={() => openVideoModal('https://www.youtube.com/watch?v=QS5IbJ65iq4', 'Access to Capital Video')}
                className="inline-block relative group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105 w-48">
                  <img 
                    src="https://img.youtube.com/vi/QS5IbJ65iq4/hqdefault.jpg" 
                    alt="Access to Capital Video"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">Watch Access to Capital Video</p>
              </button>
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
