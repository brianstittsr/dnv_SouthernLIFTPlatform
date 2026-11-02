/**
 * Events Data
 * LIFT Center workshops, training, and community events.
 */

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  eventDate: Date;
  endDate?: Date;
  time: string;
  location: {
    venue: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category: 'Conference' | 'Workshop' | 'Webinar' | 'Networking' | 'Training' | 'Summit' | 'Other';
  registrationUrl?: string;
  registrationDeadline?: Date;
  capacity?: number;
  registered?: number;
  isFree: boolean;
  price?: number;
  featuredImage?: string;
  organizer: string;
  contactEmail?: string;
  contactPhone?: string;
  tags: string[];
  agenda?: {
    time: string;
    title: string;
    description?: string;
    speaker?: string;
  }[];
  speakers?: {
    name: string;
    title: string;
    bio?: string;
    photo?: string;
  }[];
}

const LIFT_ORGANIZER = 'Southern University MBDA LIFT Rural Business Center';
const LIFT_EMAIL = 'liftcenter@sus.edu';
const LIFT_PHONE = '(225) 771-0000';

export const events: Event[] = [
  {
    id: 'lift-orientation',
    slug: 'lift-orientation-intake-session',
    title: 'LIFT Program Orientation & Intake Session',
    description: 'Learn what the LIFT Center offers, confirm your rural eligibility, and get help completing the intake interview in one sitting.',
    fullDescription: `New to the LIFT Rural Business Center? This orientation walks you through everything the program offers — at no cost to you.

## What We'll Cover

- Overview of LIFT services: one-on-one advising, workshops, capital readiness, and contracting support
- Who qualifies: rural Louisiana small business eligibility explained
- Hands-on help completing the LIFT intake interview on the spot
- How advising, service plans, and outcome check-ins work
- Q&A with the LIFT Center team

## Who Should Attend

- Rural Louisiana small business owners
- Aspiring entrepreneurs in rural parishes
- Anyone curious whether the program is a fit

Bring a laptop or use ours — you can finish your intake interview during the session.`,
    eventDate: new Date('2026-04-09'),
    time: '10:00 AM - 12:00 PM CST',
    location: {
      venue: 'Southern University College of Business',
      address: 'Southern University',
      city: 'Baton Rouge',
      state: 'LA',
      country: 'United States',
    },
    category: 'Workshop',
    registrationUrl: '/sign-up',
    capacity: 40,
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    contactPhone: LIFT_PHONE,
    tags: ['Orientation', 'Intake', 'No-Cost', 'Baton Rouge', 'Rural Business'],
  },
  {
    id: 'govcon-101',
    slug: 'government-contracting-101-rural-business',
    title: 'Government Contracting 101 for Rural Businesses',
    description: 'A plain-language introduction to selling to the government — SAM.gov, certifications, and where rural businesses fit in public procurement.',
    fullDescription: `Government agencies buy everything from catering to construction — and rural small businesses can compete for that work. This beginner-friendly webinar explains how.

## Topics Covered

- How public procurement works (federal, state, and local)
- SAM.gov registration — what it is, why it's free, and how to get it right
- Small business certifications: 8(a), HUBZone, WOSB, SDVOSB, MBE, DBE
- Finding opportunities that fit your business
- What a capability statement is and why buyers ask for one
- Common first-timer mistakes

## What You'll Leave With

A concrete checklist of next steps and a clear picture of whether contracting makes sense for your business. Live Q&A included.`,
    eventDate: new Date('2026-04-16'),
    time: '2:00 PM - 3:30 PM CST',
    location: {
      venue: 'Virtual Event',
      address: 'Online',
      city: 'Virtual',
      state: 'N/A',
      country: 'United States',
    },
    category: 'Webinar',
    registrationUrl: '/sign-up',
    capacity: 200,
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    tags: ['Government Contracting', 'SAM.gov', 'Webinar', 'No-Cost', 'Certifications'],
  },
  {
    id: 'capital-readiness',
    slug: 'capital-readiness-loan-ready-workshop',
    title: 'Capital Readiness Workshop: Getting Loan-Ready',
    description: 'What lenders actually look for — financial statements, loan packaging, and how to prepare before you apply for business financing.',
    fullDescription: `Most loan denials happen before the application is even read — because the package wasn't ready. This hands-on workshop shows you what lenders want to see and how to prepare it.

## Topics Covered

- The documents lenders always ask for (and why)
- Reading your own financial statements like a lender does
- Loan packaging basics: telling your business story on paper
- CDFIs, SBA-backed loans, and other capital sources for rural businesses
- Common mistakes that stall or sink applications
- How LIFT advisors support your capital readiness one-on-one

## Who Should Attend

- Business owners planning to seek financing in the next 12 months
- Owners who've been denied and want to understand why
- Anyone unsure where to start with business credit`,
    eventDate: new Date('2026-04-23'),
    time: '9:00 AM - 12:00 PM CST',
    location: {
      venue: 'Southern University College of Business',
      address: 'Southern University',
      city: 'Baton Rouge',
      state: 'LA',
      country: 'United States',
    },
    category: 'Workshop',
    registrationUrl: '/sign-up',
    capacity: 35,
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    contactPhone: LIFT_PHONE,
    tags: ['Capital Readiness', 'Financing', 'Workshop', 'No-Cost', 'Loans'],
  },
  {
    id: 'capability-statement',
    slug: 'capability-statement-writing-workshop',
    title: 'Write Your Capability Statement',
    description: 'A working session — leave with a first draft of your one-page capability statement, reviewed by a LIFT advisor.',
    fullDescription: `Buyers and prime contractors ask for capability statements before they'll talk contracts. In this working session, you'll build yours.

## What You'll Do

- Learn the anatomy of an effective one-page capability statement
- Draft your core competencies, differentiators, and past performance sections
- Get real-time feedback from LIFT advisors
- Leave with a working draft and a plan to finish it

## What to Bring

- Your business basics: NAICS codes, certifications, UEI (if you have one)
- A few sentences about what makes your business different
- A laptop if you have one (lab computers available)

Already uploaded a capability statement during onboarding? Bring it and we'll help you sharpen it.`,
    eventDate: new Date('2026-05-07'),
    time: '1:00 PM - 4:00 PM CST',
    location: {
      venue: 'Southern University College of Business',
      address: 'Southern University',
      city: 'Baton Rouge',
      state: 'LA',
      country: 'United States',
    },
    category: 'Workshop',
    registrationUrl: '/sign-up',
    capacity: 25,
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    tags: ['Capability Statement', 'Proposal Ready', 'Workshop', 'No-Cost'],
  },
  {
    id: 'mfg-lab-open-house',
    slug: 'advanced-manufacturing-lab-open-house',
    title: 'Advanced Manufacturing Lab Open House',
    description: 'Tour the LIFT metal additive manufacturing lab and learn how the hands-on program supports rural manufacturers.',
    fullDescription: `The LIFT Center's advanced manufacturing initiative gives rural manufacturers hands-on access to metal additive manufacturing — making, repairing, and testing parts for agriculture, energy, and defense supply chains.

## What You'll See

- Tour of the metal additive manufacturing lab
- Live demonstration of part production and repair
- How manufacturers join the program and what participation involves
- Which supply chains the program targets (agriculture, energy, defense)
- Meet the lab team and LIFT advisors

## Who Should Attend

- Rural manufacturers and machine shops
- Businesses exploring additive manufacturing
- Suppliers to agriculture, energy, or defense primes
- Students and workforce partners interested in advanced manufacturing`,
    eventDate: new Date('2026-05-14'),
    time: '10:00 AM - 1:00 PM CST',
    location: {
      venue: 'Southern University',
      address: 'Southern University',
      city: 'Baton Rouge',
      state: 'LA',
      country: 'United States',
    },
    category: 'Other',
    registrationUrl: '/sign-up',
    capacity: 50,
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    contactPhone: LIFT_PHONE,
    tags: ['Advanced Manufacturing', 'Open House', 'Additive Manufacturing', 'No-Cost'],
  },
  {
    id: 'digital-ai',
    slug: 'digital-tools-ai-small-business',
    title: 'Digital Tools & AI for the Busy Business Owner',
    description: 'Practical, low-cost digital tools — and where AI actually helps a small business — without the hype.',
    fullDescription: `You don't need a big budget to work smarter. This webinar covers practical digital tools and realistic AI uses for rural small businesses.

## Topics Covered

- Free and low-cost tools for invoicing, scheduling, and customer follow-up
- Where AI genuinely saves time (drafting, summarizing, organizing) — and where it doesn't
- Online presence basics: being findable when customers search
- Cybersecurity hygiene every small business needs
- How LIFT advisors can help you adopt tools one at a time

## Who Should Attend

- Business owners who feel behind on technology
- Anyone tired of software hype who wants practical answers
- LIFT clients working on their service plan technology goals`,
    eventDate: new Date('2026-05-21'),
    time: '12:00 PM - 1:30 PM CST',
    location: {
      venue: 'Virtual Event',
      address: 'Online',
      city: 'Virtual',
      state: 'N/A',
      country: 'United States',
    },
    category: 'Webinar',
    registrationUrl: '/sign-up',
    capacity: 150,
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    tags: ['Digital Tools', 'AI', 'Webinar', 'No-Cost', 'Technology'],
  },
  {
    id: 'lift-kickoff',
    slug: 'lift-center-kickoff-baton-rouge',
    title: 'LIFT Center Kickoff & Community Meet-and-Greet',
    description: 'The Southern University MBDA LIFT Rural Business Center opened its doors to rural Louisiana small businesses at this community launch event.',
    fullDescription: `The Southern University MBDA LIFT Rural Business Center marked the start of its 2026–2029 program period with a community kickoff event in Baton Rouge.

## Event Highlights

- Introduction of the LIFT Center team and advisory model
- Overview of the three service areas: technical assistance, training, and capital & contracting readiness
- First look at the advanced manufacturing lab initiative
- Networking with rural business owners, lenders, and resource partners
- On-site intake interviews for the first program course

Funded in part by a $1.275M cooperative agreement with the U.S. Department of Commerce, Minority Business Development Agency — one of three HBCU Rural Business Center awards nationwide.`,
    eventDate: new Date('2026-02-12'),
    time: '9:00 AM - 12:00 PM CST',
    location: {
      venue: 'Southern University',
      address: 'Southern University',
      city: 'Baton Rouge',
      state: 'LA',
      country: 'United States',
    },
    category: 'Networking',
    isFree: true,
    featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    organizer: LIFT_ORGANIZER,
    contactEmail: LIFT_EMAIL,
    tags: ['Kickoff', 'Community', 'Baton Rouge', 'LIFT'],
  },
];

export function getEventBySlug(slug: string): Event | undefined {
  return events.find(event => event.slug === slug);
}

export function getUpcomingEvents(): Event[] {
  const now = new Date();
  return events
    .filter(event => event.eventDate >= now)
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}

export function getPastEvents(): Event[] {
  const now = new Date();
  return events
    .filter(event => event.eventDate < now)
    .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
}

export function getEventsByCategory(category: Event['category']): Event[] {
  return events.filter(event => event.category === category);
}

export function getAllEventCategories(): Event['category'][] {
  return ['Conference', 'Workshop', 'Webinar', 'Networking', 'Training', 'Summit', 'Other'];
}
