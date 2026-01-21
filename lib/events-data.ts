/**
 * Events Data
 * Structure for managing upcoming and past events
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

export const events: Event[] = [
  {
    id: '1',
    slug: 'iaeoz-summit-2025-puerto-rico',
    title: 'Innovation in Agriculture and Energy Opportunity Zone Summit 2025',
    description: 'Join us for the premier summit focusing on innovation, agriculture, and energy opportunities in Puerto Rico and opportunity zones.',
    fullDescription: `The Innovation in Agriculture and Energy Opportunity Zone (IAEOZ) Summit 2025 brings together industry leaders, government officials, investors, and entrepreneurs to explore cutting-edge opportunities in agriculture and energy sectors within designated opportunity zones.

This year's summit focuses on Puerto Rico's strategic position as a hub for sustainable agriculture and renewable energy innovation. Attendees will gain insights into federal funding opportunities, technological innovations, and strategic partnerships that are reshaping these critical sectors.

## What to Expect

- **Keynote Presentations** from industry leaders and government officials
- **Panel Discussions** on agriculture technology, renewable energy, and economic development
- **Networking Opportunities** with investors, contractors, and business leaders
- **Exhibition Hall** featuring the latest innovations in agtech and clean energy
- **One-on-One Consultations** with federal contracting experts

## Who Should Attend

- MBE/WBE/SDVOSB business owners
- Agriculture and energy sector professionals
- Federal contractors and subcontractors
- Investors and venture capitalists
- Economic development professionals
- Government procurement officials`,
    eventDate: new Date('2025-11-15'),
    endDate: new Date('2025-11-17'),
    time: '8:00 AM - 6:00 PM',
    location: {
      venue: 'Puerto Rico Convention Center',
      address: '100 Convention Boulevard',
      city: 'San Juan',
      state: 'PR',
      zipCode: '00907',
      country: 'Puerto Rico',
      coordinates: {
        lat: 18.4655,
        lng: -66.1057
      }
    },
    category: 'Summit',
    registrationUrl: 'https://iaeozsummit.com',
    registrationDeadline: new Date('2025-11-01'),
    capacity: 500,
    registered: 287,
    isFree: false,
    price: 299,
    featuredImage: '/images/events/iaeoz-summit-2025.jpg',
    organizer: 'KDM & Associates',
    contactEmail: 'info@kdm-assoc.com',
    contactPhone: '(202) 555-0100',
    tags: ['Agriculture', 'Energy', 'Opportunity Zones', 'Puerto Rico', 'Innovation', 'Federal Contracting'],
    agenda: [
      {
        time: '8:00 AM - 9:00 AM',
        title: 'Registration & Continental Breakfast',
        description: 'Check-in and networking breakfast'
      },
      {
        time: '9:00 AM - 9:30 AM',
        title: 'Opening Keynote',
        description: 'The Future of Agriculture and Energy in Opportunity Zones',
        speaker: 'Keith Moore, CEO, KDM & Associates'
      },
      {
        time: '9:30 AM - 11:00 AM',
        title: 'Panel: Agricultural Innovation in Puerto Rico',
        description: 'Exploring sustainable farming practices and technology adoption'
      },
      {
        time: '11:00 AM - 11:15 AM',
        title: 'Networking Break'
      },
      {
        time: '11:15 AM - 12:45 PM',
        title: 'Panel: Renewable Energy Opportunities',
        description: 'Federal funding, tax incentives, and project development'
      },
      {
        time: '12:45 PM - 2:00 PM',
        title: 'Lunch & Exhibition Hall',
        description: 'Networking lunch with exhibitor showcase'
      },
      {
        time: '2:00 PM - 3:30 PM',
        title: 'Federal Contracting Workshop',
        description: 'Navigating opportunities in agriculture and energy sectors'
      },
      {
        time: '3:30 PM - 5:00 PM',
        title: 'Investor Roundtable',
        description: 'Connecting entrepreneurs with capital sources'
      },
      {
        time: '5:00 PM - 6:00 PM',
        title: 'Reception & Networking',
        description: 'Evening reception with hors d\'oeuvres'
      }
    ],
    speakers: [
      {
        name: 'Keith Moore',
        title: 'CEO, KDM & Associates',
        bio: 'Leading KDM & Associates with a vision to empower minority-owned businesses in government contracting.'
      },
      {
        name: 'Josué Rivera Castro',
        title: 'Secretary, Puerto Rico Department of Agriculture'
      },
      {
        name: 'Charles Sills',
        title: 'COO, KDM & Associates',
        bio: 'Recognized authority on U.S. Government Contracting and advocate for Small Business access to Federal opportunities.'
      }
    ]
  },
  {
    id: '2',
    slug: 'federal-contracting-101-webinar',
    title: 'Federal Contracting 101: Getting Started with Government Opportunities',
    description: 'Free webinar for small businesses new to federal contracting. Learn the basics of SAM registration, certifications, and finding opportunities.',
    fullDescription: `Join us for this comprehensive introductory webinar designed specifically for small businesses looking to enter the federal contracting marketplace. Our experts will guide you through the essential steps to get started and position your business for success.

## Topics Covered

- Understanding the federal procurement process
- SAM.gov registration and maintenance
- Small business certifications (8(a), HUBZone, WOSB, SDVOSB)
- Finding contract opportunities
- Understanding solicitations and RFPs
- Building capability statements
- Teaming and subcontracting strategies

## What You'll Learn

By the end of this webinar, you'll understand:
- The fundamental steps to become a federal contractor
- Which certifications are right for your business
- How to search for relevant opportunities
- Best practices for responding to solicitations
- Common mistakes to avoid

This is a live, interactive session with Q&A time built in. Bring your questions!`,
    eventDate: new Date('2025-10-15'),
    time: '2:00 PM - 3:30 PM EST',
    location: {
      venue: 'Virtual Event',
      address: 'Online',
      city: 'Virtual',
      state: 'N/A',
      country: 'United States'
    },
    category: 'Webinar',
    registrationUrl: 'https://kdm-assoc.com/events/register/federal-contracting-101',
    registrationDeadline: new Date('2025-10-14'),
    capacity: 1000,
    registered: 542,
    isFree: true,
    featuredImage: '/images/events/federal-contracting-webinar.jpg',
    organizer: 'KDM & Associates',
    contactEmail: 'training@kdm-assoc.com',
    tags: ['Federal Contracting', 'Training', 'Small Business', 'Webinar', 'Education'],
    speakers: [
      {
        name: 'Oscar Frazier',
        title: 'Consultant, KDM & Associates',
        bio: 'International consultant with over two decades of leadership and team-building experience.'
      }
    ]
  },
  {
    id: '3',
    slug: 'mbe-networking-mixer-dc',
    title: 'MBE Networking Mixer - Washington DC',
    description: 'Connect with fellow minority business owners, prime contractors, and federal procurement officials at our quarterly networking event.',
    fullDescription: `Our quarterly MBE Networking Mixer brings together minority business enterprises, prime contractors, federal procurement officials, and industry partners for an evening of meaningful connections and business development opportunities.

## Event Highlights

- **Speed Networking Sessions**: Structured 5-minute meetings with potential partners
- **Prime Contractor Showcase**: Meet major federal contractors actively seeking MBE partners
- **Federal Agency Representatives**: Connect with procurement officials from key agencies
- **Success Stories**: Hear from MBEs who have successfully grown their federal contracting business
- **Open Networking**: Casual networking with appetizers and refreshments

## Who Attends

- MBE/WBE/SDVOSB business owners
- Prime contractors seeking subcontractors
- Federal procurement officials
- Economic development professionals
- Industry association representatives

## Dress Code

Business casual

## Registration

Space is limited to ensure quality networking opportunities. Register early to secure your spot!`,
    eventDate: new Date('2025-10-28'),
    time: '5:30 PM - 8:00 PM',
    location: {
      venue: 'The Hamilton',
      address: '600 14th Street NW',
      city: 'Washington',
      state: 'DC',
      zipCode: '20005',
      country: 'United States',
      coordinates: {
        lat: 38.8977,
        lng: -77.0319
      }
    },
    category: 'Networking',
    registrationUrl: 'https://kdm-assoc.com/events/register/mbe-mixer-dc',
    registrationDeadline: new Date('2025-10-25'),
    capacity: 150,
    registered: 98,
    isFree: false,
    price: 50,
    featuredImage: '/images/events/networking-mixer.jpg',
    organizer: 'KDM & Associates',
    contactEmail: 'events@kdm-assoc.com',
    contactPhone: '(202) 555-0100',
    tags: ['Networking', 'MBE', 'Federal Contracting', 'Washington DC', 'Business Development']
  }
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
