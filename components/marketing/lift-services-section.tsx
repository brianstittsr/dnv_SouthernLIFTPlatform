import { ClipboardList, GraduationCap, Landmark } from "lucide-react";

const services = [
  {
    title: "Business Advising & Technical Assistance",
    description:
      "One-on-one advising for rural small businesses — business planning, operations, marketing, workforce, and growth strategy tailored to where your business is today.",
    icon: ClipboardList,
    bullets: [
      "Dedicated LIFT advisor",
      "Personalized service plan",
      "Digital & AI adoption guidance",
    ],
  },
  {
    title: "Training & Workshops",
    description:
      "Support workshops and virtual training built for rural business owners — from starting up to scaling, including our advanced manufacturing program.",
    icon: GraduationCap,
    bullets: [
      "Entrepreneurship training",
      "Advanced manufacturing lab access",
      "Virtual and in-person sessions",
    ],
  },
  {
    title: "Capital & Contracting Readiness",
    description:
      "Get ready to pursue financing and government contracts — financial readiness reviews, loan packaging support, SAM.gov guidance, and proposal assistance.",
    icon: Landmark,
    bullets: [
      "Capital readiness checklist",
      "Procurement & supplier readiness",
      "Proposal development support",
    ],
  },
];

export function LiftServicesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How LIFT Helps Your Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The Southern University MBDA LIFT Rural Business Center delivers
            support services in three connected areas — so rural Louisiana
            businesses can start, stabilize, and grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-card rounded-lg p-8 shadow-sm border flex flex-col"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <service.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {service.description}
              </p>
              <ul className="mt-auto space-y-2">
                {service.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="text-sm flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
