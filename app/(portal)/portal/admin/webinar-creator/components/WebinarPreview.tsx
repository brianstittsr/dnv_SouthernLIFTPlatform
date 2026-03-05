"use client";

import { Webinar } from "@/lib/types/webinar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Play,
  HelpCircle
} from "lucide-react";
import { format } from "date-fns";

interface WebinarPreviewProps {
  data: Partial<Webinar>;
}

export function WebinarPreview({ data }: WebinarPreviewProps) {
  const startTime = data.startTime ? new Date(data.startTime) : null;

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 overflow-hidden bg-slate-900 text-white"
        style={{
          backgroundImage: data.hero?.backgroundImage ? `url(${data.hero.backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {data.hero?.backgroundImage && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
        )}
        <div className="container relative z-10 max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <Badge variant="outline" className="bg-primary/20 text-primary-foreground border-primary/30 py-1 px-3">
                Live Webinar Event
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                {data.hero?.headline || data.title || "Mastering Government Contracting"}
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl">
                {data.hero?.subheadline || data.description || "Join us for an in-depth session on strategies to scale your federal business."}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{startTime ? format(startTime, "EEEE, MMMM do") : "Date TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">{startTime ? format(startTime, "p") : "Time TBD"} ({data.timezone})</span>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full shadow-lg shadow-primary/20">
                  {data.registration?.buttonText || data.hero?.ctaText || "Register for Free"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-video bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden group">
                {data.hero?.videoPreviewUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                    <Video className="h-16 w-16 opacity-20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {data.about?.title || "What You'll Learn in This Webinar"}
            </h2>
            <div className="prose prose-lg max-w-none text-slate-600 text-left">
              {data.about?.content || "Details about the webinar will appear here once you add content in the creator."}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            {data.benefits?.map((benefit) => (
              <div key={benefit.id} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="bg-primary/10 p-3 rounded-lg h-fit">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{benefit.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      {(data.speakers?.length || 0) > 0 && (
        <section className="py-20 bg-white">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Meet Your Experts</h2>
              <p className="text-slate-600 mt-4">Learn from industry veterans with decades of combined experience.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-12">
              {data.speakers?.map((speaker) => (
                <div key={speaker.id} className="w-full max-w-xs text-center space-y-4">
                  <div className="mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl">
                    {speaker.imageUrl ? (
                      <img src={speaker.imageUrl} alt={speaker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <User className="h-20 w-20" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{speaker.name}</h4>
                    <p className="text-primary font-medium">{speaker.title}</p>
                  </div>
                  <p className="text-slate-600 text-sm italic">{speaker.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {(data.faqs?.length || 0) > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {data.faqs?.map((faq) => (
                <div key={faq.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2">{faq.question}</h4>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">Ready to Scale Your Success?</h2>
          <p className="text-xl opacity-90">Seats are limited for this exclusive session. Claim yours today!</p>
          <Button size="lg" variant="secondary" className="h-16 px-12 text-xl font-bold rounded-full shadow-2xl">
            {data.registration?.buttonText || "Reserve My Spot Now"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Video(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
