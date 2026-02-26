import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Users } from "lucide-react";
import { TeamMeemerging businessrCard } from "@/components/marketing/team-meemerging businessr-card";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the KDM & Associates management team - experienced professionals dedicated to helping emerging small businesses succeed in government contracting.",
};

const teamMeemerging businessrs = [
  {
    id: "keith-moore",
    name: "Keith Moore",
    title: "CEO",
    initials: "KM",
    imageName: "Keith_Moore",
    staticImageUrl: "/about/NewImages/Moore_Keith3.png",
    bio: "Leading KDM & Associates with a vision to empower small emerging businesses in government contracting."
  },
  {
    id: "miranda-bouldin",
    name: "Miranda Bouldin",
    title: "President",
    initials: "MB",
    imageName: "Miranda_Bouldin",
    bio: "Creator of Space Defense Brief & TechGeekette Brief | CEO, LogiCore | Strategic Insights on Space Command, Space Force & National Defense | GovCon | Defense Logistics | Cybersecurity"
  },
  {
    id: "kirk-gimenez",
    name: "Kirk Gimenez",
    title: "Media & Marketing Partner",
    initials: "KG",
    imageName: "Kirk_Gimenez",
    bio: "Elevating Latinos & minorities. Triple M: Media, Marketing & Money man. Xizzle TV Founder! 2-time Emmy Winner, Ex-ESPN anchor, Elite Closer University partner, SVP Brickell Capital Finance"
  },
  {
    id: "charles-sills",
    name: "Charles Sills",
    title: "COO",
    initials: "CS",
    imageName: "Charles_Sills",
    staticImageUrl: "/about/NewImages/Sills_Charles.png",
    bio: "Overseeing operations and ensuring excellence in service delivery to our clients."
  },
  {
    id: "oscar-frazier",
    name: "Oscar Frazier",
    title: "Consultant",
    initials: "OF",
    imageName: "Oscar_Frazier",
    staticImageUrl: "/about/NewImages/Frazier_Oscar.png",
    bio: "Providing expert guidance on government contracting strategies and business development."
  },
  {
    id: "pamela-ramos-brown",
    name: "Pamela Ramos-Brown",
    title: "KDM Consultant",
    initials: "PR",
    imageName: "Pamela_Ramos_Brown",
    staticImageUrl: "/about/NewImages/Ramos_Brown_Pamela.png",
    bio: "Supporting clients with strategic consulting and capacity building initiatives."
  },
  {
    id: "calvin-minor",
    name: "Calvin Minor",
    title: "Operations Support Manager",
    initials: "CM",
    imageName: "Calvin_Minor",
    staticImageUrl: "/about/NewImages/Minor_Calvin.png",
    bio: "Managing day-to-day operations and ensuring seamless client support."
  },
  {
    id: "manpreet-hundal",
    name: "Manpreet Hundal",
    title: "Compliance and Data Specialist",
    initials: "MH",
    imageName: "Manpreet_Hundal",
    staticImageUrl: "/about/NewImages/Manpreet_Hundal.png",
    bio: "Ensuring compliance excellence and data-driven insights for our clients."
  },
  {
    id: "timothy-webster",
    name: "Timothy Maurice Webster",
    title: "Director of International Communications",
    initials: "TW",
    imageName: "Timothy_Webster",
    staticImageUrl: "/about/NewImages/Webster_Timothy.png",
    bio: "Leading international outreach and communication strategies for global opportunities."
  },
  {
    id: "jose-nino",
    name: "Jose F. Niño",
    title: "Director of Hispanic Affairs",
    initials: "JN",
    imageName: "Jose_Nino",
    staticImageUrl: "/about/NewImages/Nino_Jose.png",
    bio: "Championing Hispanic business interests and expanding outreach to the Hispanic community.",
  },
];

export default function TeamPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Team
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              KDM & Associates{" "}
              <span className="text-primary">Management</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Meet the experienced professionals dedicated to helping small emerging 
              businesses succeed in government contracting.
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMeemerging businessrs.map((meemerging businessr) => (
              <TeamMeemerging businessrCard key={meemerging businessr.id} meemerging businessr={meemerging businessr} />
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container text-center">
          <Users className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A Team Approach to Your Success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our diverse team brings together expertise in government contracting, 
            business development, technology, and community engagement to support 
            your journey to success.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/contact">
              Work With Our Team
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
