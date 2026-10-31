import { MessageSquareText, FileSignature, Map, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Complete the Intake Interview",
    description:
      "Start with our AI-guided intake interview. It takes about 15 minutes and tells us about your business, your goals, and what support you need.",
    icon: MessageSquareText,
  },
  {
    number: "02",
    title: "Enroll with the Center",
    description:
      "Confirm your rural eligibility, sign the MBDA Letter of Engagement, and complete a short baseline survey so we can measure your progress.",
    icon: FileSignature,
  },
  {
    number: "03",
    title: "Work Your Service Plan",
    description:
      "Meet your LIFT advisor and follow a personalized plan — advising sessions, workshops, capital readiness, and contracting support.",
    icon: Map,
  },
  {
    number: "04",
    title: "Grow & Report Outcomes",
    description:
      "Check in at 6 and 12 months so we can track jobs, revenue, contracts, and capital — and keep adjusting your plan as your business grows.",
    icon: TrendingUp,
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How to Join the Program
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Enrollment is free and open to eligible rural Louisiana small
            businesses. Here&apos;s what the journey looks like.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-border" />

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <div className="bg-card rounded-lg p-6 shadow-sm border relative z-10">
                  {/* Number Badge */}
                  <div className="absolute -top-4 left-6 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mt-4 mb-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>

                {/* Arrow (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-4 z-20">
                    <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
