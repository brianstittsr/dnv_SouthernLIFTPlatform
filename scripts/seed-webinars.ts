import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
const result = dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
if (result.error) {
  console.warn("⚠️ Could not find .env.local file or it is empty");
}

console.log("Checking environment variables:");
console.log("- NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Found" : "Missing");
console.log("- NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Found" : "Missing");

async function seedWebinars() {
  const { db } = await import("../lib/firebase-admin");
  const admin = await import("firebase-admin");
  const { COLLECTIONS } = await import("../lib/schema");

  if (!db) {
    console.error("❌ Database not initialized. Check your .env.local file.");
    return;
  }

  console.log("🌱 Seeding sample webinars...");

  const webinars = [
    {
      title: "Mastering Government Contracting in 2024",
      slug: "mastering-govcon-2024",
      description: "Learn the latest strategies and best practices for winning federal contracts in the current landscape.",
      status: "published",
      startTime: new Date("2024-06-15T14:00:00Z").toISOString(),
      duration: 60,
      timezone: "America/New_York",
      hero: {
        headline: "Scale Your Federal Business with Confidence",
        subheadline: "An exclusive masterclass for small business owners and government contractors.",
        ctaText: "Register for Free",
        backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
      },
      about: {
        title: "Why You Should Attend",
        content: "This webinar will cover everything from finding the right opportunities to submitting winning proposals. Our experts will share insights gained from over 20 years in the industry.",
      },
      benefits: [
        { id: "b1", title: "Winning Strategies", description: "Discover the specific tactics used by successful primes." },
        { id: "b2", title: "Compliance Insights", description: "Stay ahead of changing federal regulations and requirements." },
        { id: "b3", title: "Networking Opportunities", description: "Connect with other business leaders in the GovCon space." }
      ],
      speakers: [
        { id: "s1", name: "Keith Moore", title: "CEO, KDM & Associates", bio: "Keith has helped hundreds of businesses secure billions in federal contracts.", imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" }
      ],
      registration: {
        type: "internal",
        buttonText: "Claim Your Spot",
      },
      confirmation: {
        title: "You're Registered!",
        message: "Thank you for joining our masterclass. We've sent a confirmation email with your unique joining link.",
        nextStepsTitle: "Before the Event",
        nextSteps: [
          "Check your inbox for the confirmation email",
          "Add the event to your calendar using the links below",
          "Prepare your top 3 questions for the Q&A session"
        ]
      },
      seo: {
        title: "Mastering GovCon Webinar | KDM & Associates",
        description: "Join Keith Moore for an exclusive webinar on mastering government contracting.",
        keywords: ["government contracting", "webinar", "business growth", "KDM"],
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      publishedAt: admin.firestore.Timestamp.now(),
    },
    {
      title: "CMMC 2.0 Compliance for Small Manufacturers",
      slug: "cmmc-compliance-manufacturers",
      description: "Everything small manufacturing firms need to know about the new cybersecurity requirements.",
      status: "draft",
      startTime: new Date("2024-07-10T11:00:00Z").toISOString(),
      duration: 90,
      timezone: "America/New_York",
      hero: {
        headline: "Secure Your Defense Contracts",
        subheadline: "A practical guide to achieving CMMC 2.0 compliance without breaking the bank.",
        ctaText: "Save My Seat",
        backgroundImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
      },
      about: {
        title: "Protect Your Business",
        content: "Cybersecurity is no longer optional for defense contractors. Learn how to implement the required controls and prepare for assessment.",
      },
      benefits: [
        { id: "b1", title: "Gap Analysis", description: "Learn how to identify where your security falls short." },
        { id: "b2", title: "Control Implementation", description: "Step-by-step guidance on the most challenging requirements." }
      ],
      speakers: [
        { id: "s2", name: "Miranda Bouldin", title: "President, LogiCore", bio: "Miranda is a leading expert in defense logistics and cybersecurity compliance.", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" }
      ],
      registration: {
        type: "internal",
        buttonText: "Register Now",
      },
      confirmation: {
        title: "Registration Confirmed",
        message: "We look forward to seeing you at the CMMC masterclass.",
        nextSteps: ["Review the pre-webinar security checklist", "Join our LinkedIn group for updates"]
      },
      seo: {
        title: "CMMC 2.0 Webinar for Manufacturers",
        description: "Achieve CMMC compliance with our expert-led webinar.",
        keywords: ["CMMC", "cybersecurity", "manufacturing", "defense"],
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    }
  ];

  const webinarsRef = db.collection(COLLECTIONS.WEBINARS);
  
  for (const webinar of webinars) {
    const docRef = await webinarsRef.add(webinar);
    console.log(`✅ Created webinar: ${webinar.title} (${docRef.id})`);
  }

  console.log("✨ Seeding complete!");
}

seedWebinars().catch(console.error);
