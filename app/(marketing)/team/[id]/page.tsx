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
    imageUrl: "/about/NewImages/Moore_Keith2_files/Keith_Moore3.png",
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
    fullBio: `Oscar L Frazier is an international consultant with a sought-after leadership and team-building track record that spans over two decades. Oscar holds an MBA with a Management and Quantitative Methods focus, is a certified Lean Six Sigma Black, a certified Project Management Professional (PMP), and a certified SAFe 5 Agilist. He is also an Eagle Scout with the Boy Scouts of America.

Oscar is a published author, having contributed to global publications such as Forbes, Black Enterprise, CBS, FOX, NBC, Business Ghana, and is the author of a book that focuses on DIY methodologies to help individuals reach everything desired in life, called "Confessions: The Truth About Perfect Timing".

With humble beginnings in Charleston, SC, Oscar learned the importance of perseverance from watching his father and mother raise children in the South during a difficult time in American history. That same perseverance instilled at an early age catapulted Oscar's career. At the age of only 20, Oscar began his career with Fortune 500 companies creating methodologies that empowered teams and leaders to produce results.

Oscar has experience ranging from managing $30MM+ consulting portfolios, owning/operating a 12,000+ square-foot restaurant with over 150 employees with $1.4MM annual sales, owning a successful trucking & logistics company, to fostering efficiencies and process improvement for small, medium, and large organizations. Oscar has spent the majority of his career within the federal space focusing on growth, innovation, and leadership training.

Oscar L Frazier has an unorthodox way of reaching all levels (i.e., top down or bottom up of an organizational chart) of the participants that attend his trainings and seminars. Leaders and teams that attend Oscar's engagements can expect to learn Leadership Methodologies that Produce Results, with primary focuses on Agility-based Leadership, Tactical-based Leadership, Human-Centered Leadership (aka "HCL"), and Technology-based Leadership.

Since 2018, Oscar has successfully led mission-critical trainings globally that have spanned the USA, Europe (i.e., Kosovo and Albania), and Africa (i.e., Luanda (Angola), Huambo (Angola), Djibouti City (Djibouti), Nairobi (Kenya), Mogadishu (Somalia), Addis Ababa (Ethiopia), and Goma North Kivu (The Democratic Republic of the Congo), Nigeria, and Ghana). As a result of this extensive training repertoire, one of Oscar's first published articles in Forbes focused on his experiences with global crisis management and world leadership observations.

Successful organizations and Federal Agencies like Bank of America, Booz Allen Hamilton, IBM, USAGM, CMS, Veterans Affairs, and a host of others invest in Oscar's leadership methodologies by hiring him to train and empower their leaders and teams every year.

In addition to the global publications outlined above of which Oscar has appeared, he has also been featured in global magazines, podcasts, small business expos, and newspapers including Gut + Science (global podcast), Vroom Vroom Veer (podcast), Influential Entrepreneurs with Mike Saunders, School for Startups Radio, Prestige Magazine, Corporate Vision Magazine, and several others.`
  },
  {
    id: "pamela-ramos-brown",
    name: "Pamela Ramos-Brown",
    title: "KDM Consultant",
    initials: "PR",
    imageName: "Pamela_Ramos_Brown",
    bio: "Supporting MBE clients with strategic consulting and capacity building initiatives.",
    fullBio: `As current CEO of BeWealthyWithPamela and past president of Ramos Group, LLC, Pamela provides management consulting services such as Business Achievement & Sales Success Planning to entrepreneurs. Pamela is mostly known for serving as Executive Director of Minority Business Development Agency (MBDA) Business Center – Mobile, operated by the Mobile Area Chamber of Commerce and federally funded by the U.S. Department of Commerce, MBDA for almost 10 years.

Concurrently, since Jan. 2020, Pamela helps companies deliver timely communication to target customers on-air and online through Cumulus Media. Brand new to the industry, Pamela used her own Sales Success Plan and mentorship and achieved 250% of her 1st quarter sales goal.

Pamela Brown's service with the MBDA Business Center began in 2006 as a business consultant employee. She was promoted to Project Director in 2008 and transitioned to independent contractor in 2012. She has helped connect diversity officers and financiers to minority businesses resulting in $2 billion+ in revenues and financing supporting 1,500 jobs created and retained. Also, she helped companies achieve 2 of 3 top business plan awards out of 80+ applicants statewide.

Pamela led the Center's team to help the Chamber's program achieve national honors such as Highest Procurement Award, Centurion Award for performance scores over 100%, being the first Center of 40+ to reach $2B cumulative client results, and recognition for becoming an international business loan and political risk insurance originator for Overseas Private Investment Corporation.

Since 1999, Pamela has delivered training, consulting services, and edutainment speaking to a wide variety of clients such as churches, schools, non-profits, Fortune 500 companies, and small businesses. Topics included award winning performance, sales success, soft skills, strategic planning, leadership, change management, financial literacy, green business, and more.

She brings a balanced blend of entrepreneurial skills such as financial, management, marketing, and strategic planning. She earned her MBA in Business Administration and BS in Accounting. Experience as a college instructor, financial manager of budgets – one exceeding $15m, financial advisor, and auditor, has contributed to her business knowledge of "do's" from good practices and "don'ts" from many teachable past mistakes that she shares with business professionals.

Personal interests include: Healing and Deliverance ministry, youth entrepreneurship, Africatown CHESS, volleyball, healthy lifestyles, caregiver respite, and precious family moments.`
  },
  {
    id: "calvin-minor",
    name: "Calvin Minor",
    title: "Operations Support Manager",
    initials: "CM",
    imageName: "Calvin_Minor",
    bio: "Managing day-to-day operations and ensuring seamless client support.",
    fullBio: `Mr. Minor is currently a member of Alfred Street Baptist Church (ASBC) in Alexandria, VA. He has served as a Member, Secretary, and is the current President of ASBC Foundation. He has also served on the Security, Social Justice Ministries. Before joining ASBC Calvin was Director of Men's Ministry of Antioch Baptist Church, Fairfax Station, VA for 21 years, Co-Chaired the John Q. Gibbs Scholarship Committee, and Disciple Group Team leader. He received disciple group training from Saddleback Church, Lake Forest, CA, and served his community as CFO, James C. Mott Community Center and a Board Member and Employment Counselor for Lincoln Lewis Vannoy Community Association.

Calvin Graduated from Virginia Union University, Richmond, VA with a Bachelor of Art degree in Secondary Education with a concentration in Math. He pursued his graduate Studies in Administration and Supervision at Richmond Polytechnic Institute, Richmond VA. He Joined the Richmond Public Schools System, Teacher in Math and Science, and Title I School Community Coordinator. He was a Math Teacher at Lake Braddock Secondary School Fairfax County VA. He is a proud member of the Alpha Phi Omega Fraternity.

Calvin has an honorable Discharge from United State Army where he served the Military District of Washington Army Corps of Engineers, Defense Mapping Agency, Washington, DC.

Calvin has an extensive career as a consultant in the corporate world. He is a Business Development Consultant, Cyber Security at Lunarline, LLC, in Arlington, VA. Vice President, Summit Consulting Group, Inc., Executive Consultant to Native American, Women Small Business, Veteran Owned Business, establishing procurement vehicle and Business Development initiatives. Ricoh Corporation, Business Services, Major Account Manager, Marketing of Security Products, 8 years. Retired after 25 years with Xerox Corporation as Senior Sales Executive, other jobs were: Major Account Manager, Marketing Manager, Manager of Regional Hiring Center, Corporate Recruiter, and Major Account Manager, Xerox Business Services.`
  },
  {
    id: "manpreet-hundal",
    name: "Manpreet Hundal",
    title: "Compliance and Data Specialist",
    initials: "MH",
    imageName: "Manpreet_Hundal",
    bio: "Ensuring compliance excellence and data-driven insights for our clients.",
    fullBio: `I am a proud graduate of George Mason University, holding a degree in Business Management, with over two decades of professional experience in the finance and healthcare sectors. Throughout my career, I have had the privilege of working with leading financial institutions and information technology organizations, where I developed expertise in business operations, strategic planning, and innovative problem-solving.

As an entrepreneur, I am committed to building and leading businesses that foster growth, promote inclusivity, and create sustainable economic impact. My professional focus extends to Government Business Development, where I am passionate about empowering minority-owned enterprises to secure opportunities and thrive in competitive markets.

Beyond my professional pursuits, I serve as a basketball coach, nurturing leadership, teamwork, and discipline in young athletes—skills that translate seamlessly into professional success. This role reflects my belief in the importance of mentorship and investing in the next generation of leaders.

My mission is to collaborate with dynamic individuals and organizations, leveraging my experience to drive success, forge strategic partnerships, and support communities in achieving their full potential. I look forward to engaging with like-minded professionals and contributing to meaningful change in the business landscape.`
  },
  {
    id: "timothy-webster",
    name: "Timothy Maurice Webster",
    title: "Director of International Communications",
    initials: "TW",
    imageName: "Timothy_Webster",
    bio: "Leading international outreach and communication strategies for global opportunities.",
    fullBio: `Timothy's education is in Business Management, Branding, Psychology and Applied Neuroscience from Brookstone College in the US and Massachusetts Institute of Technology- MIT. His insights inspire dialogue and critical thinking about brain and brand behavior- inspiring stakeholders to consider broader and more strategic problem-solving for their personal and organizational brands. His research is particularly influential in the following Professional Leadership Domains- Executive leadership, Brand Influence & Gender Equality. His clients are those who seek to influence and expand themselves, their organizations and society.

Global Podcast and brand strategy partner to US-based KDM & Associates and the Innovation in Agriculture and Energy Opportunity Zone Summit. Sharing behavioral insights, content and client-centric strategy, for more. He's passionate about mentoring, sports, art and laughs from his soul.`
  },
  {
    id: "walter-cotton",
    name: "Walter Cotton III",
    title: "Veteran Business Liaison",
    initials: "WC",
    imageName: "Cotton_III_Walter",
    bio: "Connecting veteran-owned businesses with government contracting opportunities.",
    fullBio: `Walter Cotton III is one of a hand full of dedicated retired services members that are credited with helping the Federal Government increase its level of contracting with Disabled Veteran from $750 Million to more than $19 Billion annually.

In addition to the above contributions, Mr. Cotton also:
• Was the Service Disabled Veteran Owned Small Business Community's first National spokesperson.
• Held positions as Chairperson of the American Legion's Small Business Taskforce, the Veteran Service Organization Community's lead trainer & subject matter expert on SB-to-SB Joint Venturing (i.e., from 2006 to 2010)
• Co-Authored the Contracting Section of the Small Business Jobs & Credit Act of 2010 (Signed into Law on 9/27/2010)
• Acted as the SBA's Office of Veteran Services primary industry source & subject matter expert on complex small business contracting matters (i.e., from 2006 to 2012)
• Is a Board Member & Treasure of the Elite SDVOB Network – and in 2019 he was appointed President of New York Chapter of the Elite SDVOB Network.
• Founded the AbilityToo Network (i.e., an online Contractor Networking & Teaming Resource), and
• Is a Contributing Columnist to leading Veteran and Small Business Publications.

Mr. Cotton is currently Managing Partner of 'The Cotton Exchange' (i.e., his consulting and social contracting business units), and is a sought-after Subject Matter Expert by Agencies, Trade Associations, Major Prime Contractors & Veteran Business Owners.`
  },
  {
    id: "jose-nino",
    name: "Jose F. Niño",
    title: "Director of Hispanic Affairs",
    initials: "JN",
    imageName: "Jose_Nino",
    bio: "Championing Hispanic business interests and expanding outreach to the Hispanic community.",
    fullBio: `Over the past thirty years, Jose F. Niño has built a National and International business development company. His company El Niño Group, LLC has a long and productive history growing and serving as the primary connection in establishing partnerships, opportunities for business development, certifications and strategic planning for clients. He is a Co-founder of Allied Wireless Infrastructure Services, a Hispanic-owned neutral Digital Infrastructure Services Company. AWIS is a wireless & small cell infrastructure, dark fiber, network edge micro data center and management services company. AWIS services the North American market with offices located in Florida, New York, Washington DC, Mexico City and Querétaro, México.

Last year, he assisted MicroTech, based in Vienna, Virginia, to obtain a $50 Billion IDIQ (Indefinite Demand/Indefinite Quantity) Government-wide contract along with nine other companies. The agreement is to do the re-infrastructure of the US Government's Telecom and IT systems. Mr. Nino has many years of experience working with entrepreneurs, federal government, and corporations in the US with Hispanic and other ethnic communities, as well as in Latin America. Mr. Nino was a founding member and President/CEO of the US Hispanic Chambers of Commerce (USHCC). He expanded the Chamber from less than 30 Chambers to over 258, representing the interest of more than 1.3 million US Hispanic-owned businesses. The USHCC provided the climate to foster more businesses and more customers by building the brand and advancing programs for scalable sustained growth. The USHCC is now a significant force within the US economy, promoting the economic growth and development of Hispanic entrepreneurs nationwide.

Mr. Niño is Chairman of the Mid-Atlantic Hispanic Chamber of Commerce, a Board member of the US-Mexico Chamber of Commerce, an Advisory Member for Hispanics in Energy and serves on the National Executive Committee of the Boy Scouts of America, Vol. Executive Director for One World Literacy Foundation. He's also a University of Maryland graduate and a former Small Business Advisory Board Member of the Chicago Federal Reserve Bank.`
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
