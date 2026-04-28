/**
 * Restore Team Member Bios from Crawled KDM Website Data
 *
 * Run with:
 *   node scripts/restore-team-bios.mjs
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH or individual env vars in .env.local
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// ── Load env ──────────────────────────────────────────────────────────────────
const envPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Init Firebase Admin ────────────────────────────────────────────────────────
if (!getApps().length) {
  // Option 1: individual env vars (same as lib/firebase-admin.ts)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized via env vars (project:", process.env.FIREBASE_PROJECT_ID, ")\n");
  } else {
    // Option 2: service account JSON file
    const saPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(rootDir, "firebase-service-account.json");

    if (!fs.existsSync(saPath)) {
      console.error("❌ Firebase credentials not found.");
      console.error("   Either set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env.local");
      console.error("   or place a service account JSON at:", saPath);
      process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
    initializeApp({ credential: cert(serviceAccount) });
    console.log("✅ Firebase Admin initialized via service account JSON\n");
  }
}

const db = getFirestore();

// ── Clean HTML entities ────────────────────────────────────────────────────────
function cleanHtml(raw) {
  return raw
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&bull;/g, "•")
    .replace(/&eacute;/g, "é")
    .replace(/&rsquo;/g, "'")
    .replace(/meemerging businessr/g, "member")
    .replace(/meemerging businessrs/g, "members")
    .replace(/Meemerging businessr/g, "Member")
    .replace(/Chaemerging businessr/g, "Chamber")
    .replace(/emerging business/g, "member")
    .replace(/â—‹/g, "○")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ── Bio data extracted from crawled KDM website ────────────────────────────────
// Each entry: firstName, lastName match Firestore; bio is the full restored text.
const BIOS = [
  {
    firstName: "Keith",
    lastName: "Moore",
    bio: cleanHtml(
      `The CEO of both KDM and Associates, and Founder of Open GovTV, leads a team of experts to provide government, institutions, communities, and companies technical solutions to some of the nation's most pressing societal challenges. Keith Moore brings to the team, knowledge of Government, Community, Small Business, and the historical challenges associated with Government meeting socio economic goals, and job expansion, and revenue growth for small businesses.

In 2003 KDM was issued a two year marketing Agreement to represent a minority owned Engineering government contracting information technology small business. In 2005 the firm was awarded a $1 Billion dollar contract thanks to strategic relationship building and KDM helping the firm develop a teaming strategy to partner with DOE.

Keith&rsquo;s command of public policy has benefited communities, businesses, government agencies, and has empowered those most vulnerable, and least financed. Keith as a result of his success in the waterfront community of Asbury Park, became a frequent guest on NJN Network and Comcast, and was characterized as a community leader, and one who believed in the development of innovative approaches to community development.

EXODUS House offered drug and alcohol rehabilitation services to addicted men and women for six months with housing, education, job training, and a second chance at a productive life. In 1997, the State of New Jersey agreed to purchase the facility located one block from the Asbury Park beach. Once the EXODUS House was purchased, Keith was appointed in 1997 by the Governor of New Jersey and Secretary of Commerce to the position of Account Executive to the New Jersey Commerce &amp; Economic Growth Commission. His appointment led to a position as Director of Public Affairs and Community Relations working directly for Governor Christie Todd Whitman in the Governor&rsquo;s Camden New Jersey office helping to advance the allocation of over $250 million dollars of revitalization funds into the city of Camden.

Today, Keith Moore, a nationally renowned community activist, small business advocate, and government affairs expert communicates his firm&rsquo;s grasp of public policy as OGTV leads the nation by example. OGTV, founded by Keith Moore December 31, 2009, is the first internet TV program in America to film, and promote the White House&rsquo;s Executive Order on the Open Government Directive by concentrating on the policy&rsquo;s attention on small business. OGTV as a Division of KDM, and web based video platform, engages large businesses, and helps small businesses succeed in government contracting. KDM, thanks to OGTV, is well positioned to help government, and large businesses meet their small business diversity goals, and NGOs to meet their mission by using innovative online approaches to education and outreach.`
    ),
  },
  {
    firstName: "Charles",
    lastName: "Sills",
    bio: cleanHtml(
      `Charles Sills is a recognized authority on U.S. Government Contracting, and an advocate for Small Business access to Federal and Military contracting opportunities, serving as a member of the U.S. Chamber of Commerce's Small Business Council; an observer to the White House-sponsored Inter-Agency Task Force on Veterans Business Development; and a member of VET-Force (Veterans Entrepreneurship Task Force).

He has helped moderate the Army, Navy and Air Force Contracting Summits in Jacksonville, Norfolk Naval Base, Ft. Hood, Texas and Eglin Air Force Base for the Defense Leadership Forum; keynoted the Veterans Day Panel on "Wartime and Worldwide Government Contracting" at the Mt. Vernon Chamber&rsquo;s forum on "Winning Army Contracts – from Ft. Belvoir to Afghanistan"; and was commended by the Small Business Affairs Director, U.S. Army, for the "overwhelming response" to his presentation on the "Marketing to Prime Contractors" Panel at the National Veteran Small Business Conference.

He is President of FED/Contracting LLC, a Washington DC-based consultancy that assists U.S. Small Businesses, as well as overseas firms and their American affiliates, in accessing Government acquisition programs; helps Prime Contractors qualify Veteran, Minority and Woman-owned vendors as teammates for project opportunities with mandated Diversity Supplier content; and brings Small Businesses and Fortune 1000 corporations together under Government Agency &lsquo;Mentor-Protégé&rsquo; partnerships.

Based on the U.S. Defense Dept. Mentor-Protégé program that he managed for Trillacorpe Construction, a Service-Disabled Veteran-Owned Small Business, the company was awarded the prestigious 2010 Defense Dept. Nunn-Perry Award for "superior performance in the areas of business growth and return on investment, Government contracting, technical performance and quality management".

Mr. Sills is a former U.S. Army Captain, Special Forces (Green Berets), and was awarded two Meritorious Service Medals, the Army Commendation Medal, and the Expert Infantry Badge, among other commendations. He is an Airborne/Air Assault Ranger-qualified veteran of 10 years active duty service in the United States Army. He attended the University of Maryland at College Park on an Army ROTC scholarship, earning a B.S. degree in Business.`
    ),
  },
  {
    firstName: "Calvin",
    lastName: "Minor",
    bio: cleanHtml(
      `Mr. Minor is currently a member of Alfred Street Baptist Church (ASBC) in Alexandria, VA. He has served as a Member, Secretary, and is the current President of ASBC Foundation. He has also served on the Security, Social Justice Ministries. Before joining ASBC Calvin was Director of Men&rsquo;s Ministry of Antioch Baptist Church, Fairfax Station, VA for 21 years, Co-Chaired the John Q. Gibbs Scholarship Committee, and Disciple Group Team leader. He received disciple group training from Saddleback Church, Lake Forest, CA, and served his community as CFO, James C. Mott Community Center and a Board Member and Employment Counselor for Lincoln Lewis Vannoy Community Association.

Calvin Graduated from Virginia Union University, Richmond, VA with a Bachelor of Art degree in Secondary Education with a concentration in Math. He pursued his graduate Studies in Administration and Supervision at Richmond Polytechnic Institute, Richmond VA. He Joined the Richmond Public Schools System, Teacher in Math and Science, and Title I School Community Coordinator. He was a Math Teacher at Lake Braddock Secondary School Fairfax County VA. He is a proud member of the Alpha Phi Omega Fraternity.

Calvin has an honorable Discharge from United State Army where he served the Military District of Washington Army Corps of Engineers, Defense Mapping Agency, Washington, DC.

Calvin has an extensive career as a consultant in the corporate world. He is a Business Development Consultant, Cyber Security at Lunarline, LLC, in Arlington, VA. Vice President, Summit Consulting Group, Inc., Executive Consultant to Native American, Women Small Business, Veteran Owned Business, establishing procurement vehicle and Business Development initiatives. Ricoh Corporation, Business Services, Major Account Manager, Marketing of Security Products, 8 years. Retired after 25 years with Xerox Corporation as Senior Sales Executive in the Washington, DC Metro Area.`
    ),
  },
  {
    firstName: "Manpreet",
    lastName: "Hundal",
    bio: cleanHtml(
      `I am a proud graduate of George Mason University, holding a degree in Business Management, with over two decades of professional experience in the finance and healthcare sectors. Throughout my career, I have had the privilege of working with leading financial institutions and information technology organizations, where I developed expertise in business operations, strategic planning, and innovative problem-solving.

As an entrepreneur, I am committed to building and leading businesses that foster growth, promote inclusivity, and create sustainable economic impact. My professional focus extends to Government Business Development, where I am passionate about empowering minority-owned enterprises to secure opportunities and thrive in competitive markets.

Beyond my professional pursuits, I serve as a basketball coach, nurturing leadership, teamwork, and discipline in young athletes — skills that translate seamlessly into professional success. This role reflects my belief in the importance of mentorship and investing in the next generation of leaders.

My mission is to collaborate with dynamic individuals and organizations, leveraging my experience to drive success, forge strategic partnerships, and support communities in achieving their full potential. I look forward to engaging with like-minded professionals and contributing to meaningful change in the business landscape.`
    ),
  },
  {
    firstName: "Timothy Maurice",
    lastName: "Webster",
    bio: cleanHtml(
      `Timothy&rsquo;s education is in Business Management, Branding, Psychology and Applied Neuroscience from Brookstone College in the US and Massachusetts Institute of Technology (MIT). His insights inspire dialogue and critical thinking about brain and brand behavior — inspiring stakeholders to consider broader and more strategic problem-solving for their personal and organizational brands. His research is particularly influential in the following Professional Leadership Domains: Executive leadership, Brand Influence &amp; Gender Equality.

His clients are those who seek to influence and expand themselves, their organizations and society. Global Podcast and brand strategy partner to US-based KDM &amp; Associates and the Innovation in Agriculture and Energy Opportunity Zone Summit. Sharing behavioral insights, content and client-centric strategy. He&rsquo;s passionate about mentoring, sports, art and laughs from his soul.`
    ),
  },
  {
    firstName: "Jose F.",
    lastName: "Niño",
    bio: cleanHtml(
      `Over the past thirty years, Jose F. Niño has built a National and International business development company. His company El Niño Group, LLC has a long and productive history growing and serving as the primary connection in establishing partnerships, opportunities for business development, certifications and strategic planning for clients.

He is a Co-founder of Allied Wireless Infrastructure Services, a Hispanic-owned neutral Digital Infrastructure Services Company. AWIS is a wireless &amp; small cell infrastructure, dark fiber, network edge micro data center and management services company. AWIS services the North American market with offices located in Florida, New York, Washington DC, Mexico City and Querétaro, México.

He assisted MicroTech, based in Vienna, Virginia, to obtain a $50 Billion IDIQ (Indefinite Demand/Indefinite Quantity) Government-wide contract along with nine other companies. The agreement is to do the re-infrastructure of the US Government&rsquo;s Telecom and IT systems.

Mr. Nino was a founding member and President/CEO of the US Hispanic Chambers of Commerce (USHCC). He expanded the Chamber from less than 30 Chambers to over 258, representing the interest of more than 1.3 million US Hispanic-owned businesses. The USHCC is now a significant force within the US economy, promoting the economic growth and development of Hispanic entrepreneurs nationwide.

Mr. Niño is Chairman of the Mid-Atlantic Hispanic Chamber of Commerce, a Board member of the US Hispanic Chamber of Commerce PAC, and a Member of the Virginia Hispanic Chamber of Commerce.`
    ),
  },
  {
    firstName: "Oscar",
    lastName: "Frazier",
    bio: cleanHtml(
      `Oscar L Frazier is an international consultant with a sought-after leadership and team-building track record that spans over two decades. Oscar holds an MBA with a Management and Quantitative Methods focus, is a certified Lean Six Sigma Black Belt, a certified Project Management Professional (PMP), and a certified SAFe 5 Agilist. He is also an Eagle Scout with the Boy Scouts of America.

Oscar is a published author, having contributed to global publications such as Forbes, Black Enterprise, CBS, FOX, NBC, Business Ghana, and is the author of a book that focuses on DIY methodologies to help individuals reach everything desired in life, called "Confessions: The Truth About Perfect Timing".

With humble beginnings in Charleston, SC, Oscar learned the importance of perseverance from watching his father and mother raise children in the South during a difficult time in American history. That same perseverance instilled at an early age catapulted Oscar&rsquo;s career. At the age of only 20, Oscar began his career with Fortune 500 companies creating methodologies that empowered teams and leaders to produce results.

Oscar has experience ranging from managing $30MM+ consulting portfolios, owning/operating a 12,000+ square-foot restaurant with over 150 employees with $1.4MM annual sales, owning a successful trucking &amp; logistics company, to fostering efficiencies and process improvement for small, medium, and large organizations.

Oscar has spent the majority of his career within the federal space focusing on growth, innovation, and leadership training. Successful organizations and Federal Agencies like Bank of America, Booz Allen Hamilton, IBM, USAGM, CMS, Veterans Affairs, and a host of others invest in Oscar&rsquo;s leadership methodologies by hiring him to train and empower their leaders and teams every year.`
    ),
  },
  {
    firstName: "Pamela",
    lastName: "Ramos-Brown",
    bio: cleanHtml(
      `As current CEO of BeWealthyWithPamela and past president of Ramos Group, LLC, Pamela provides management consulting services such as Business Achievement &amp; Sales Success Planning to entrepreneurs.

Pamela is mostly known for serving as Executive Director of Minority Business Development Agency (MBDA) Business Center – Mobile, operated by the Mobile Area Chamber of Commerce and federally funded by the U.S. Department of Commerce, MBDA for almost 10 years. She has helped connect diversity officers and financiers to minority businesses resulting in $2 billion+ in revenues and financing supporting 1,500 jobs created and retained.

Pamela led the Center&rsquo;s team to achieve national honors such as Highest Procurement Award, Centurion Award for performance scores over 100%, being the first Center of 40+ to reach $2B cumulative client results, and recognition for becoming an international business loan and political risk insurance originator for Overseas Private Investment Corporation.

Since 1999, Pamela has delivered training, consulting services, and edutainment speaking to a wide variety of clients such as churches, schools, non-profits, Fortune 500 companies, and small businesses. Topics included award winning performance, sales success, soft skills, strategic planning, marketing, and strategic planning. She earned her MBA in Business Administration and BS in Accounting.`
    ),
  },
  {
    firstName: "Walter",
    lastName: "Cotton III",
    bio: cleanHtml(
      `Walter Cotton III is one of a handful of dedicated retired service members that are credited with helping the Federal Government increase its level of contracting with Disabled Veterans from $750 Million to more than $19 Billion annually.

In addition to the above contributions, Mr. Cotton also:
• Was the Service Disabled Veteran Owned Small Business Community&rsquo;s first National spokesperson.
• Held positions as Chairperson of the American Legion&rsquo;s Small Business Taskforce, the Veteran Service Organization Community&rsquo;s lead trainer &amp; subject matter expert on SB-to-SB Joint Venturing (2006 to 2010).
• Co-Authored the Contracting Section of the Small Business Jobs &amp; Credit Act of 2010 (Signed into Law on 9/27/2010).
• Acted as the SBA&rsquo;s Office of Veteran Services primary industry source &amp; subject matter expert on complex small business contracting matters (2006 to 2012).
• Is a Board Member &amp; Treasurer of the Elite SDVOB Network – and in 2019 he was appointed President of New York Chapter of the Elite SDVOB Network.
• Founded the AbilityToo Network (an online Contractor Networking &amp; Teaming Resource).
• Is a Contributing Columnist to leading Veteran and Small Business Publications.

Mr. Cotton is currently Managing Partner of &lsquo;The Cotton Exchange&rsquo; (his consulting and social contracting business units), and is a sought-after Subject Matter Expert by Agencies, Trade Associations, Major Prime Contractors &amp; Veteran Business Owners.`
    ),
  },
  {
    firstName: "Miranda",
    lastName: "Bouldin",
    title: "President",
    expertise: "Contracts & Space Defense",
    emailPrimary: "mbouldin@logicore.com",
    role: "team",
    teamTag: "leadership",
    bio: cleanHtml(
      `Miranda Bouldin is President at KDM & Associates and CEO of LogiCore, bringing deep expertise in government contracting, defense logistics, cybersecurity, and space defense.

Miranda is the creator of Space Defense Brief and TechGeekette Brief — widely followed publications providing strategic insights on Space Command, Space Force, and National Defense. Her work bridges the gap between defense technology and government procurement, helping minority-owned and small businesses navigate complex federal contracting opportunities in the defense and space sectors.

With a career spanning GovCon, Defense Logistics, and Cybersecurity, Miranda leverages her expertise to empower businesses with the intelligence and strategy needed to compete and win in federal markets. She is a recognized thought leader in the defense contracting community and a passionate advocate for diversity in the defense industrial base.`
    ),
  },
  {
    firstName: "Gaylord",
    lastName: "Neal",
    title: "Digital Solutions and Innovation Consultant",
    expertise: "Managed IT Services & Business Development",
    emailPrimary: "gneal@qmespotlight.com",
    role: "affiliate",
    teamTag: "affiliate",
    bio: cleanHtml(
      `30+ years in Providing Managed IT Services, Strategic Business Development, Sales Planning &amp; Execution, Building / Training High-Performance Sales Teams, Mentor-Protege Program Experts, and Supplier Diversity Contracting Consultant for businesses.

Gaylord is Managing Partner with Qme Spotlight Ecosystem and holds the title of Chief Revenue Officer (CRO). Qme Spotlight ecosystems are Digital Solutions and Innovations Consultants. They specialize in building amazing Community Digital Ecosystems that help achieve a mission and drive transformation. They provide managed technology services as a certified NMSDC minority business enterprise. They own the proprietary QmeLocal Digital Ecosystem Infrastructure and are a resource partner with the MBDA FPC.

Gaylord is a master business developer who provides strategic business growth consulting, sales planning, and execution consulting, selling process training and coaching, and marketing | media | public communications consulting. As a University of Penn Wharton graduate, a serial entrepreneur, a C-Level executive, and an extraordinarily successful sales executive, Gaylord is responsible for helping to drive business growth globally and helping to develop solutions for clients that accelerate their success.

He has led many projects which have economic impacts in the multi-Billion-dollar range which involved joint ventures, consulting, software development, branding, and marketing, across multiple continents and raising funding/capital. He has also been involved in several large $100MM+ business ventures involving technology and managed services.`
    ),
  },
  {
    firstName: "Bentley",
    lastName: "Charlemagne",
    bio: cleanHtml(
      `Bentley serves as the Chief Visionary and Solutions Concept Architect for the Qme Spotlight Ecosystem agency and has 18+ years of experience in Print Creative, Production &amp; Logistics, Marketing, Branding, and Technology Digital Solution Development.

Bentley is a visionary and purposeful executive who is always looking for new ways to deliver value to customers and partners. His ability to drive relevant connections and bring people together to champion solutions to significant challenges has led him to develop several scalable proprietary products, IPs, and innovations. He has an infectious desire to spearhead change-based initiatives, maximize multi-resource partnerships, and create business development opportunities.

Bentley spearheaded the creation of the Qme Spotlight Business Solution Ecosystem agency and the creation and development of the "Qmespotlight.com" Marketplace, "Cliiimb.com," and "Qmelocal.com" Digital Small Business solution platform. Under Bentley&rsquo;s leadership, the Spotlight Ecosystem focuses on developing highly valuable and scalable technology IPs with a core focus to support small business growth and sustainability, resulting in tremendous local community success and impact.

As the Chief Visionary Officer of Qme, Bentley oversees:
○ All the Qme Ecosystem new product concepts and development
○ Lead Innovation think tank for new proprietary products
○ Overseeing all significant software product development
○ Business Model Concept Creator and Developer
○ Business Operations &amp; Management
○ Client Acquisitions and partnerships
○ UI/UX expert strategist`
    ),
  },
];

// ── Restore ────────────────────────────────────────────────────────────────────
async function restoreBios() {
  console.log("🔄 Restoring team member bios from crawled KDM website data...\n");

  const COLLECTIONS_TO_CHECK = ["teamMembers", "team_members"];

  for (const bioData of BIOS) {
    const fullName = `${bioData.firstName} ${bioData.lastName}`;
    let found = false;

    for (const collName of COLLECTIONS_TO_CHECK) {
      try {
        const snap = await db
          .collection(collName)
          .where("firstName", "==", bioData.firstName)
          .where("lastName", "==", bioData.lastName)
          .get();

        if (snap.empty) continue;

        for (const docSnap of snap.docs) {
          await docSnap.ref.update({
            bio: bioData.bio,
            updatedAt: Timestamp.now(),
          });
          console.log(`  ✅ Restored bio for ${fullName} in '${collName}' (${docSnap.id})`);
          found = true;
        }
      } catch (err) {
        console.error(`  ❌ Error updating ${fullName} in '${collName}':`, err.message);
      }
    }

    if (!found) {
      // Create the record in teamMembers
      try {
        await db.collection("teamMembers").add({
          firstName: bioData.firstName,
          lastName: bioData.lastName,
          bio: bioData.bio,
          title: bioData.title || "",
          expertise: bioData.expertise || "",
          emailPrimary: bioData.emailPrimary || "",
          role: bioData.role || "affiliate",
          teamTag: bioData.teamTag || "affiliate",
          status: "active",
          isCEO: false,
          isCOO: false,
          isCTO: false,
          isCRO: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`  ✅ Created new record for ${fullName} in 'teamMembers'`);
      } catch (err) {
        console.error(`  ❌ Failed to create ${fullName}:`, err.message);
      }
    }
  }

  console.log("\n✅ Bio restoration complete!");
  process.exit(0);
}

restoreBios().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
