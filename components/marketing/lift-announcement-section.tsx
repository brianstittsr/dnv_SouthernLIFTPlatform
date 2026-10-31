import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

const goals = [
  { value: "500", label: "clients served" },
  { value: "50", label: "new businesses in the federal supply chain" },
  { value: "$2.125M", label: "in capital secured by clients" },
  { value: "600", label: "jobs created" },
];

export function LiftAnnouncementSection() {
  return (
    <section className="border-b bg-muted/40 py-16 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
            <Newspaper className="h-4 w-4" />
            <span>Latest News — Baton Rouge, La., October 5, 2026</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Southern University awarded $1.275 million to launch rural business
            center
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Southern University and A&amp;M College has received a $1.275
            million, three-year cooperative agreement from the Minority Business
            Development Agency (MBDA) to establish the Louisiana Innovation for
            Thriving Rural Business (LIFT) Center — one of only three HBCUs in
            the country selected to lead a Rural Business Center for rural and
            manufacturing-based small businesses.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {goals.map((goal) => (
              <div key={goal.label}>
                <div className="text-3xl font-bold text-primary">
                  {goal.value}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {goal.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Three-year program goals, 2026&ndash;2029.
          </p>
          <div className="mt-8">
            <Link
              href="/press-releases/southern-university-lift-center-mbda-award"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              Read the full press release
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
