import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail } from "lucide-react";
import { TeamMemberBio } from "@/components/marketing/team-member-bio";

// Team member data - matches the main team page
const teamMembers = [
  {
    id: "keith-moore",
    name: "Keith Moore",
    title: "CEO",
    initials: "KM",
    imageName: "Keith_Moore",
    bio: "Leading KDM & Associates with a vision to empower minority-owned businesses in government contracting.",
    fullBio: `Keith Moore serves as the Chief Executive Officer of KDM & Associates, bringing extensive experience in government contracting and business development. With a deep commitment to empowering minority-owned businesses, Keith leads the organization's strategic vision and growth initiatives.

Under his leadership, KDM & Associates has become a trusted partner for MBEs seeking to navigate the complex landscape of federal procurement. Keith's expertise spans strategic teaming, capacity building, and creating pathways for small businesses to compete successfully for government contracts.

His approach combines practical business acumen with a genuine passion for creating opportunities that drive economic growth and strengthen supply chains across the nation. Keith is dedicated to building an ecosystem where every capable minority-owned business has the resources and support needed to thrive in government contracting.`
  },
  {
    id: "charles-sills",
    name: "Charles Sills",
    title: "COO",
    initials: "CS",
    imageName: "Charles_Sills",
    bio: "Overseeing operations and ensuring excellence in service delivery to our MBE clients.",
    fullBio: `Charles Sills is a recognized authority on U.S. Government Contracting, and an advocate for Small Business access to Federal and Military contracting opportunities, serving as a member of the U.S. Chamber of Commerce's Small Business Council; an observer to the White House-sponsored Inter-Agency Task Force on Veterans Business Development; and a member of VET-Force (Veterans Entrepreneurship Task Force). He has helped moderate the Army, Navy and Air Force Contracting Summits in Jacksonville, Norfolk Naval Base, Ft. Hood, Texas and Eglin Air Force Base for the Defense Leadership Forum; keynoted the Veterans Day Panel on "Wartime and Worldwide Government Contracting" at the Mt. Vernon Chamber's forum on "Winning Army Contracts – from Ft. Belvoir to Afghanistan"; and was commended by the Small Business Affairs Director, U.S. Army, for the "overwhelming response" to his presentation on the "Marketing to Prime Contractors" Panel at the National Veteran Small Business Conference.

He is President of FED/Contracting LLC, a Washington DC-based consultancy that assists U.S. Small Businesses, as well as overseas firms and their American affiliates, in accessing Government acquisition programs; helps Prime Contractors qualify Veteran, Minority and Woman-owned vendors as teammates for project opportunities with mandated Diversity Supplier content; and brings Small Businesses and Fortune 1000 corporations together under Government Agency 'Mentor-Protégé' partnerships. Based on the U.S. Defense Dept. Mentor-Protégé program that he managed for Trillacorpe Construction, a Service-Disabled Veteran-Owned Small Business, the company was awarded the prestigious 2010 Defense Dept. Nunn-Perry Award for "superior performance in the areas of business growth and return on investment, Government contracting, technical performance and quality management".

Mr. Sills is a former Naval Intelligence Officer who served in a succession of National Security positions in the Pentagon, including the National Military Intelligence Center and the Defense Intelligence Agency/Worldwide Estimates Directorate (Deputy Director), following assignments on the staff of the U.S. Middle East Force Command (based in Bahrain with responsibility for the Persian Gulf/Red Sea/Indian Ocean area), and the Geopolitical Briefing & Analysis Division, Supreme Allied Commander NATO/Atlantic. He received numerous commendations for his contributions to Defense Dept. crisis teams and special reports, including a series of briefings to Members of Congress on the findings of "Project Provodnik" which he directed, a comprehensive re-thinking of Soviet conventional and strategic military capabilities as well as the effectiveness of their projection of 'soft' power throughout the Developing World. He was recently appointed Sr. Advisor, Global Partnerships Development for the Dwight D. Eisenhower Memorial Commission, mandated by the U.S. Congress, which is developing conflict resolution and regional stabilization and security initiatives based on Eisenhower's legacy as NATO's first Supreme Allied Commander.

Mr. Sills also has extensive experience planning and directing international industrial, infrastructure, environmental and energy initiatives, having served as a member of the Danube Task Force, the governing council that ran the Danube Basin Environmental Restoration Program led by the World Bank, the European Bank for Reconstruction & Development and the UN Development Program, involving 13 countries from Austria to Moldova. He also served on the Japan-U.S. Joint Fund for Social & Economic Development in Central/Eastern Europe; the Helsinki Commission focused on the environmental clean-up of the Baltic Sea; the Kaliningrad Defense Conversion Initiative which sought to transform Soviet weapons factories into consumer product manufacturing; and the NGO Delegation to NAFTA, where he helped draft the Environmental Supplements. And he was responsible for securing major funding support for the Smithsonian Institute's biodiversity preservation/cancer cure research program in Brazil's Amazon region; for the Sassari, Sardinia symposium on ozone depletion organized by the International Council of Scientific Unions, which led directly to the Montreal Protocol which has been successful in mitigating/reducing the 'Ozone Hole'; and for the White House Presidential Awards program sponsored by the President's Council on Sustainable Development.

Mr. Sills led the Martin Marietta Aerospace (now Lockheed Martin) team that won the contract for and installed the world's largest (at that time) solar photovoltaic energy installation, under a pilot program co-funded by the U.S. and Saudi Arabian Governments; researched and wrote a worldwide, country-by-country survey of renewable energy technologies and commercialization opportunities; and testified before Congress on the need for pro-active U.S. Government support for advanced renewable energy R&D and demonstration programs. Currently, he serves on both the Defense & Security Advisory Committee and the International Advisory Committee for the American Council on Renewable Energy (ACORE); on the International Committee of the DC Chamber of Commerce; and on the International Advisory Committee of the National Council on US-Arab Relations (NCUSAR).

He also serves as a Board Member and Advisor on International Security, Energy and Environment for the Eurasia Center/Eurasian Business Coalition, where he has planned and moderated conferences on "Doing Business with the BRICS (Brazil, Russia, India, China and South Africa)", and "Transforming a Continent: Energy and Infrastructure Investment Opportunities on the New Silk Road". In that capacity, he was designated one of only five or six U.S. delegates to the annual Moscow Conference on International Security in 2015, 2016 and 2017 – involving approx. 900 delegates and 40-plus Defense Ministers focused on implementing cooperative programs to contain and defeat worldwide terrorism.

Mr. Sills' education includes an M.A. in Defense & Foreign Policy, Fletcher School of Law and Diplomacy (Tufts and Harvard Universities); and an A.B., Princeton University, Woodrow Wilson School of Public and International Affairs. He is a graduate of Collegiate School in New York City, the U.S.'s 2nd oldest school founded in New Amsterdam in 1628.`
  },
  {
    id: "oscar-frazier",
    name: "Oscar Frazier",
    title: "Consultant",
    initials: "OF",
    imageName: "Oscar_Frazier",
    bio: "Providing expert guidance on government contracting strategies and business development.",
    fullBio: `Oscar Frazier serves as a senior consultant at KDM & Associates, providing expert guidance on government contracting strategies and business development. His extensive knowledge of federal procurement processes and requirements makes him an invaluable resource for MBE clients.

Oscar specializes in helping businesses develop competitive strategies, identify teaming opportunities, and navigate the complexities of government contracting. His hands-on approach and deep understanding of the federal marketplace enable clients to position themselves effectively for contract wins.

With a track record of successful client engagements, Oscar is committed to delivering practical, actionable advice that translates into measurable results for minority-owned businesses seeking to grow their government contracting portfolios.`
  },
  {
    id: "pamela-ramos-brown",
    name: "Pamela Ramos-Brown",
    title: "KDM Consultant",
    initials: "PR",
    imageName: "Pamela_Ramos_Brown",
    bio: "Supporting MBE clients with strategic consulting and capacity building initiatives.",
    fullBio: `Pamela Ramos-Brown is a dedicated consultant at KDM & Associates, specializing in strategic consulting and capacity building for minority-owned businesses. Her work focuses on helping MBEs develop the capabilities and infrastructure needed to compete successfully in government contracting.

Pamela's approach combines strategic planning with practical implementation support, ensuring that clients not only understand what they need to do but also have the resources and guidance to execute effectively. She works closely with businesses to assess their current capabilities, identify gaps, and develop actionable plans for growth.

Her commitment to client success is reflected in her hands-on approach and her ability to translate complex requirements into clear, achievable steps that move businesses forward in their government contracting journey.`
  },
  {
    id: "calvin-minor",
    name: "Calvin Minor",
    title: "Operations Support Manager",
    initials: "CM",
    imageName: "Calvin_Minor",
    bio: "Managing day-to-day operations and ensuring seamless client support.",
    fullBio: `Calvin Minor serves as Operations Support Manager at KDM & Associates, where he plays a crucial role in managing day-to-day operations and ensuring seamless client support. His attention to detail and commitment to service excellence make him an essential part of the team.

Calvin coordinates various operational functions, from client onboarding to ongoing support services, ensuring that every client interaction reflects the organization's commitment to quality and responsiveness. He works behind the scenes to create smooth, efficient processes that enable the team to deliver exceptional results.

His dedication to operational excellence and client satisfaction ensures that KDM & Associates maintains the high standards of service that clients have come to expect and rely upon.`
  },
  {
    id: "manpreet-hundal",
    name: "Manpreet Hundal",
    title: "Compliance and Data Specialist",
    initials: "MH",
    imageName: "Manpreet_Hundal",
    bio: "Ensuring compliance excellence and data-driven insights for our clients.",
    fullBio: `Manpreet Hundal serves as the Compliance and Data Specialist at KDM & Associates, bringing expertise in regulatory compliance and data analysis to support MBE clients. Her role is critical in helping businesses navigate the complex compliance requirements of government contracting.

Manpreet's work encompasses compliance monitoring, data management, and providing insights that help clients make informed decisions. She ensures that businesses understand and meet all regulatory requirements while also leveraging data to identify opportunities and optimize performance.

Her analytical approach and attention to detail provide clients with the confidence that they are operating in full compliance while also benefiting from data-driven strategies that enhance their competitive position in the federal marketplace.`
  },
  {
    id: "timothy-webster",
    name: "Timothy Maurice Webster",
    title: "Director of International Communications",
    initials: "TW",
    imageName: "Timothy_Webster",
    bio: "Leading international outreach and communication strategies for global opportunities.",
    fullBio: `Timothy Maurice Webster serves as Director of International Communications at KDM & Associates, leading the organization's international outreach and communication strategies. His role focuses on expanding opportunities for MBEs in the global marketplace and fostering international partnerships.

Timothy brings a strategic communications background and a global perspective to his work, helping clients understand and access international opportunities in government contracting. He develops and implements communication strategies that enhance the organization's reach and impact beyond domestic markets.

His expertise in international business development and cross-cultural communication enables KDM & Associates to support clients in pursuing global opportunities and building international partnerships that complement their domestic government contracting activities.`
  },
  {
    id: "walter-cotton",
    name: "Walter Cotton III",
    title: "Veteran Business Liaison",
    initials: "WC",
    imageName: "Cotton_III_Walter",
    bio: "Connecting veteran-owned businesses with government contracting opportunities.",
    fullBio: `Walter Cotton III serves as the Veteran Business Liaison at KDM & Associates, dedicated to connecting veteran-owned businesses with government contracting opportunities. His role focuses on supporting veterans who are transitioning their military experience into successful business ventures in the federal marketplace.

Walter understands the unique challenges and opportunities that veteran-owned businesses face in government contracting. He provides specialized guidance on leveraging veteran status, accessing set-aside programs, and building competitive capabilities that align with federal procurement priorities.

His commitment to serving those who have served extends beyond business development to creating a supportive network where veteran entrepreneurs can access the resources, mentorship, and opportunities they need to build sustainable, successful government contracting businesses.`
  },
  {
    id: "jose-nino",
    name: "Jose F. Niño",
    title: "Director of Hispanic Affairs",
    initials: "JN",
    imageName: "Jose_Nino",
    bio: "Championing Hispanic business interests and expanding outreach to the Hispanic community.",
    fullBio: `Jose F. Niño serves as Director of Hispanic Affairs at KDM & Associates, championing Hispanic business interests and expanding the organization's outreach to the Hispanic business community. His role is vital in ensuring that Hispanic-owned businesses have access to the resources and support they need to succeed in government contracting.

Jose brings cultural insight and business acumen to his work, helping Hispanic entrepreneurs navigate the federal procurement landscape while honoring their unique perspectives and business approaches. He develops programs and initiatives specifically designed to address the needs and opportunities within the Hispanic business community.

His dedication to expanding economic opportunities for Hispanic-owned businesses drives his work in building partnerships, creating access to resources, and advocating for policies and programs that support Hispanic entrepreneurship in government contracting.`
  },
  {
    id: "candida-mobley",
    name: "Candida Mobley",
    title: "KDM Consultant",
    initials: "CM",
    imageName: "Candida_Mobley",
    bio: "Providing dedicated consulting support to help MBEs achieve their contracting goals.",
    fullBio: `Candida Mobley is a consultant at KDM & Associates, providing dedicated support to help minority-owned businesses achieve their government contracting goals. Her client-focused approach and comprehensive understanding of the federal procurement process make her a trusted advisor to MBEs.

Candida works closely with clients to understand their unique capabilities, challenges, and aspirations, then develops customized strategies that align with their business objectives. She provides hands-on support throughout the contracting process, from opportunity identification to proposal development and contract execution.

Her commitment to client success is evident in her responsive, personalized approach and her ability to translate complex requirements into actionable strategies that drive results. Candida is dedicated to helping each client reach their full potential in the government contracting arena.`
  }
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = teamMembers.find(m => m.id === id);
  
  if (!member) {
    return {
      title: "Team Member Not Found",
    };
  }

  return {
    title: `${member.name} - ${member.title}`,
    description: member.bio,
  };
}

export async function generateStaticParams() {
  return teamMembers.map((member) => ({
    id: member.id,
  }));
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = teamMembers.find(m => m.id === id);

  if (!member) {
    notFound();
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/team" 
              className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Link>
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              {member.title}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {member.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <TeamMemberBio member={member} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Work With Our Team</h2>
              <p className="text-muted-foreground mb-6">
                Ready to take your business to the next level? Our team is here to help you 
                succeed in government contracting.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
