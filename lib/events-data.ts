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

- Diverse/WBE/SDVOSB business owners
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
    contactEmail: "kmoore@kdm-assoc.com",
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
        bio: 'Leading KDM & Associates with a vision to empower diverse businesses in government contracting.'
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
    slug: 'diverse-business-networking-mixer-dc',
    title: 'Diverse Business Networking Mixer - Washington DC',
    description: 'Connect with fellow diverse business owners, prime contractors, and federal procurement officials at our quarterly networking event.',
    fullDescription: `Our quarterly Diverse Business Networking Mixer brings together diverse business enterprises, prime contractors, federal procurement officials, and industry partners for an evening of meaningful connections and business development opportunities.

## Event Highlights

- **Speed Networking Sessions**: Structured 5-minute meetings with potential partners
- **Prime Contractor Showcase**: Meet major federal contractors actively seeking diverse business partners
- **Federal Agency Representatives**: Connect with procurement officials from key agencies
- **Success Stories**: Hear from businesses who have successfully grown their federal contracting business
- **Open Networking**: Casual networking with appetizers and refreshments

## Who Attends

- Diverse/WBE/SDVOSB business owners
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
    registrationUrl: 'https://kdm-assoc.com/events/register/diverse-business-mixer-dc',
    registrationDeadline: new Date('2025-10-25'),
    capacity: 150,
    registered: 98,
    isFree: false,
    price: 50,
    featuredImage: '/images/events/networking-mixer.jpg',
    organizer: 'KDM & Associates',
    contactEmail: 'events@kdm-assoc.com',
    contactPhone: '(202) 555-0100',
    tags: ['Networking', 'Diverse Business', 'Federal Contracting', 'Washington DC', 'Business Development']
  },
  {
    id: '4',
    slug: 'innovation-in-agriculture-energy-summit-2024',
    title: 'Innovation in Agriculture and Energy Opportunity Zone Summit 2024',
    description: 'Premier summit focusing on innovation, agriculture, and energy opportunities in Puerto Rico and opportunity zones.',
    fullDescription: `The 2024 Innovation in Agriculture and Energy Opportunity Zone (IAEOZ) Summit brought together over 400 industry leaders, government officials, investors, and entrepreneurs to explore cutting-edge opportunities in agriculture and energy sectors within designated opportunity zones.

## Event Summary

This year's summit focused on Puerto Rico's strategic position as a hub for sustainable agriculture and renewable energy innovation. Attendees gained insights into federal funding opportunities, technological innovations, and strategic partnerships that are reshaping these critical sectors.

## Highlights

- **Keynote Presentations** from industry leaders and government officials
- **Panel Discussions** on agriculture technology, renewable energy, and economic development
- **Networking Opportunities** with investors, contractors, and business leaders
- **Exhibition Hall** featuring the latest innovations in agtech and clean energy
- **One-on-One Consultations** with federal contracting experts

## Key Takeaways

Attendees learned about:
- Federal funding mechanisms for agriculture and energy projects
- Tax incentives and opportunity zone benefits
- Emerging technologies in sustainable farming and renewable energy
- Strategic partnerships and joint venture opportunities
- Government contracting pathways for diverse businesses

## Attendee Feedback

"This summit exceeded my expectations. The networking opportunities alone were worth the trip to Puerto Rico. I've already connected with three potential partners." - Maria Rodriguez, AgTech Solutions

"The federal contracting workshop was incredibly valuable. We now have a clear roadmap for pursuing government contracts." - James Chen, Renewable Energy Innovations`,
    eventDate: new Date('2024-11-12'),
    endDate: new Date('2024-11-14'),
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
    capacity: 500,
    registered: 437,
    isFree: false,
    price: 299,
    featuredImage: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop',
    organizer: 'KDM & Associates',
    contactEmail: "kmoore@kdm-assoc.com",
    contactPhone: '(202) 555-0100',
    tags: ['Agriculture', 'Energy', 'Opportunity Zones', 'Puerto Rico', 'Innovation', 'Federal Contracting'],
    speakers: [
      {
        name: 'Keith Moore',
        title: 'CEO, KDM & Associates',
        bio: 'Leading KDM & Associates with a vision to empower diverse businesses in government contracting.'
      },
      {
        name: 'Josué Rivera Castro',
        title: 'Secretary, Puerto Rico Department of Agriculture'
      }
    ]
  },
  {
    id: '5',
    slug: 'federal-contracting-101-webinar-march-2024',
    title: 'Federal Contracting 101: Getting Started with Government Opportunities',
    description: 'Comprehensive webinar for small businesses new to federal contracting covering SAM registration, certifications, and finding opportunities.',
    fullDescription: `This popular webinar brought together over 800 small business owners looking to enter the federal contracting marketplace. Our experts guided participants through the essential steps to get started and position their businesses for success.

## Topics Covered

- Understanding the federal procurement process
- SAM.gov registration and maintenance
- Small business certifications (8(a), HUBZone, WOSB, SDVOSB)
- Finding contract opportunities
- Understanding solicitations and RFPs
- Building capability statements
- Teaming and subcontracting strategies

## What Participants Learned

By the end of this webinar, participants understood:
- The fundamental steps to become a federal contractor
- Which certifications are right for their business
- How to search for relevant opportunities
- Best practices for responding to solicitations
- Common mistakes to avoid

## Event Impact

- **800+ Attendees** from across the United States
- **92% Satisfaction Rating** from participant surveys
- **500+ Follow-up Inquiries** for one-on-one consulting
- **150+ New SAM.gov Registrations** within 30 days

## Participant Testimonials

"This webinar was exactly what I needed to get started. The instructors were knowledgeable and answered all my questions." - Sarah Johnson, Tech Services LLC

"I've already found three RFPs that match my business capabilities. This is a game-changer!" - Michael Torres, Construction Solutions Inc.`,
    eventDate: new Date('2024-03-20'),
    time: '2:00 PM - 3:30 PM EST',
    location: {
      venue: 'Virtual Event',
      address: 'Online',
      city: 'Virtual',
      state: 'N/A',
      country: 'United States'
    },
    category: 'Webinar',
    capacity: 1000,
    registered: 847,
    isFree: true,
    featuredImage: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop',
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
    id: '6',
    slug: 'diverse-business-networking-mixer-dc-september-2024',
    title: 'Diverse Business Networking Mixer - Washington DC',
    description: 'Quarterly networking event connecting diverse business owners, prime contractors, and federal procurement officials.',
    fullDescription: `Our September 2024 Diverse Business Networking Mixer brought together 140 diverse business enterprises, prime contractors, federal procurement officials, and industry partners for an evening of meaningful connections and business development opportunities.

## Event Highlights

- **Speed Networking Sessions**: Structured 5-minute meetings with potential partners
- **Prime Contractor Showcase**: Major federal contractors actively seeking diverse business partners
- **Federal Agency Representatives**: Procurement officials from GSA, DoD, and other key agencies
- **Success Stories**: Businesses who have successfully grown their federal contracting business
- **Open Networking**: Casual networking with appetizers and refreshments

## Attendee Breakdown

- 45% Diverse Business Owners
- 35% Prime Contractors & Subcontractors
- 15% Federal Procurement Officials
- 5% Economic Development Professionals

## Networking Results

- **280+ Meaningful Connections** made during the event
- **45 Follow-up Meetings** scheduled
- **12 Potential Partnerships** identified
- **8 RFQ Opportunities** shared

## Attendee Feedback

"This event was well-organized and provided excellent opportunities to meet potential partners. I've already had three follow-up meetings." - Jennifer Lee, Consulting Group

"The prime contractor showcase was invaluable. We found three companies actively seeking our services." - David Martinez, IT Solutions`,
    eventDate: new Date('2024-09-24'),
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
    capacity: 150,
    registered: 140,
    isFree: false,
    price: 50,
    featuredImage: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop',
    organizer: 'KDM & Associates',
    contactEmail: 'events@kdm-assoc.com',
    contactPhone: '(202) 555-0100',
    tags: ['Networking', 'Diverse Business', 'Federal Contracting', 'Washington DC', 'Business Development']
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
