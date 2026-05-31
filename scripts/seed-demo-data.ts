import { db } from '../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Demo data for testing the complete pipeline
const demoData = {
  users: [
    {
      email: 'demo-contractor@kdm-assoc.com',
      tempPassword: 'demo1234567890',
      isTempPassword: true,
      profileComplete: false,
      onboardingStep: 0,
      subscription: {
        customerId: 'demo-customer-1',
        subscriptionId: 'demo-subscription-1',
        planId: 'demo-consortium',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: Timestamp.now(),
        isDemo: true
      },
      stripeCustomerId: 'demo-customer-1',
      isDemo: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ],

  businessProfiles: [
    {
      userId: 'demo-user-1', // Will be updated with actual user ID
      businessType: 'contractor',
      companyName: 'Demo Government Solutions LLC',
      samUEI: 'DEMO1234567890',
      naicsCodes: [
        {
          code: '541330',
          description: 'Engineering Services',
          relevance: 'primary' as const,
          experience: 8
        },
        {
          code: '541519',
          description: 'Other Computer Related Services',
          relevance: 'primary' as const,
          experience: 6
        },
        {
          code: '561210',
          description: 'Facilities Support Services',
          relevance: 'secondary' as const,
          experience: 4
        }
      ],
      certifications: [
        {
          type: 'CMMC' as const,
          level: 'Level 2',
          issuedBy: 'CMMC-AB',
          issuedDate: '2023-01-15',
          expiresDate: '2026-01-15'
        },
        {
          type: '8(a)' as const,
          issuedBy: 'SBA',
          issuedDate: '2021-03-01',
          expiresDate: '2026-03-01'
        },
        {
          type: 'HUBZone' as const,
          issuedBy: 'SBA',
          issuedDate: '2022-06-01',
          expiresDate: '2027-06-01'
        }
      ],
      capabilities: [
        'Systems Engineering',
        'Cybersecurity Services',
        'IT Infrastructure Management',
        'Project Management',
        'Compliance Consulting',
        'Cloud Migration'
      ],
      companyDescription: 'Demo Government Solutions LLC is a leading provider of engineering and IT services to federal agencies, specializing in cybersecurity and systems integration.',
      contactInfo: {
        firstName: 'John',
        lastName: 'Demo',
        title: 'CEO',
        email: 'john.demo@demogovsolutions.com',
        phone: '(555) 123-4567'
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ],

  opportunities: [
    {
      title: 'Cybersecurity Modernization Program',
      description: 'The Department of Defense requires comprehensive cybersecurity modernization including network security, endpoint protection, and security operations center enhancement. This includes implementation of zero-trust architecture and continuous monitoring capabilities.',
      agency: 'Department of Defense',
      postedDate: Timestamp.fromDate(new Date('2026-05-20')),
      deadline: Timestamp.fromDate(new Date('2026-06-30')),
      budget: '$5,000,000 - $10,000,000',
      naicsCodes: ['541330', '541519', '511210'],
      status: 'active' as const,
      documentUrl: 'https://example.com/rfp-cybersecurity-mod.pdf',
      requirements: [
        'Zero-trust architecture implementation',
        'Advanced endpoint protection',
        '24/7 security operations center',
        'Continuous monitoring and threat detection',
        'Compliance with FedRAMP and CMMC Level 2'
      ],
      deliverables: [
        'Security architecture design',
        'Implementation plan and timeline',
        'Staff training program',
        'Ongoing support and maintenance'
      ],
      evaluationCriteria: [
        'Technical approach (40%)',
        'Past performance (30%)',
        'Cost (20%)',
        'Small business participation (10%)'
      ]
    },
    {
      title: 'IT Infrastructure Refresh',
      description: 'GSA requires complete IT infrastructure modernization including hardware replacement, cloud migration, and network optimization. This project includes upgrading data center equipment and implementing hybrid cloud solutions.',
      agency: 'General Services Administration',
      postedDate: Timestamp.fromDate(new Date('2026-05-18')),
      deadline: Timestamp.fromDate(new Date('2026-07-15')),
      budget: '$2,000,000 - $4,000,000',
      naicsCodes: ['541519', '511210', '541512'],
      status: 'active' as const,
      documentUrl: 'https://example.com/rfp-it-infrastructure.pdf',
      requirements: [
        'Hardware replacement and upgrade',
        'Cloud migration strategy',
        'Network optimization',
        'Disaster recovery implementation',
        'Staff training and knowledge transfer'
      ],
      deliverables: [
        'Infrastructure assessment report',
        'Migration plan and schedule',
        'New hardware and software',
        'Training materials and sessions'
      ],
      evaluationCriteria: [
        'Technical solution (35%)',
        'Project management (25%)',
        'Cost realism (25%)',
        'Past performance (15%)'
      ]
    },
    {
      title: 'Systems Engineering Support',
      description: 'NASA requires ongoing systems engineering support for satellite communication systems. This includes requirements analysis, system design, integration support, and testing services.',
      agency: 'National Aeronautics and Space Administration',
      postedDate: Timestamp.fromDate(new Date('2026-05-22')),
      deadline: Timestamp.fromDate(new Date('2026-08-01')),
      budget: '$1,500,000 - $3,000,000',
      naicsCodes: ['541330', '541715', '511210'],
      status: 'active' as const,
      documentUrl: 'https://example.com/rfp-systems-engineering.pdf',
      requirements: [
        'Systems engineering lifecycle support',
        'Requirements analysis and documentation',
        'System integration and testing',
        'Technical documentation',
        'Stakeholder coordination'
      ],
      deliverables: [
        'System requirements specifications',
        'Design documentation',
        'Integration test plans and results',
        'Technical reports and briefings'
      ],
      evaluationCriteria: [
        'Technical expertise (40%)',
        'Methodology (30%)',
        'Staff qualifications (20%)',
        'Cost (10%)'
      ]
    }
  ],

  // Additional demo users for teaming recommendations
  additionalBusinessProfiles: [
    {
      userId: 'demo-user-2',
      businessType: 'contractor',
      companyName: 'CyberShield Technologies Inc.',
      samUEI: 'DEMO0987654321',
      naicsCodes: [
        {
          code: '541512',
          description: 'Computer Systems Design Services',
          relevance: 'primary' as const,
          experience: 10
        },
        {
          code: '541519',
          description: 'Other Computer Related Services',
          relevance: 'secondary' as const,
          experience: 8
        }
      ],
      certifications: [
        {
          type: 'CMMC' as const,
          level: 'Level 3',
          issuedBy: 'CMMC-AB',
          issuedDate: '2022-11-01',
          expiresDate: '2025-11-01'
        }
      ],
      capabilities: [
        'Advanced Cybersecurity',
        'Penetration Testing',
        'Security Architecture',
        'Threat Intelligence',
        'Incident Response'
      ],
      companyDescription: 'CyberShield Technologies specializes in advanced cybersecurity solutions for federal agencies.',
      contactInfo: {
        firstName: 'Sarah',
        lastName: 'Chen',
        title: 'CTO',
        email: 'sarah.chen@cybershield.com',
        phone: '(555) 987-6543'
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      userId: 'demo-user-3',
      businessType: 'supplier',
      companyName: 'Federal Hardware Solutions',
      samUEI: 'DEMO1122334455',
      naicsCodes: [
        {
          code: '332994',
          description: 'Small Arms Ammunition Manufacturing',
          relevance: 'primary' as const,
          experience: 15
        },
        {
          code: '332991',
          description: 'Small Arms Manufacturing',
          relevance: 'secondary' as const,
          experience: 12
        }
      ],
      certifications: [
        {
          type: 'ISO' as const,
          level: 'ISO 9001:2015',
          issuedBy: 'SGS',
          issuedDate: '2020-05-01',
          expiresDate: '2025-05-01'
        }
      ],
      capabilities: [
        'Hardware Manufacturing',
        'Quality Assurance',
        'Supply Chain Management',
        'Logistics and Distribution',
        'Custom Fabrication'
      ],
      companyDescription: 'Federal Hardware Solutions provides specialized equipment and manufacturing services to government agencies.',
      contactInfo: {
        firstName: 'Mike',
        lastName: 'Rodriguez',
        title: 'Operations Manager',
        email: 'mike.rodriguez@federalhardware.com',
        phone: '(555) 456-7890'
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ]
};

export async function seedDemoData() {
  try {
    console.log('Seeding demo data...');

    // Create demo users
    const userRefs = [];
    for (const userData of demoData.users) {
      const userRef = await db.collection('users').add(userData);
      userRefs.push(userRef);
      console.log(`Created demo user: ${userData.email} with ID: ${userRef.id}`);
    }

    // Create business profiles (link to actual user IDs)
    const mainUserId = userRefs[0].id;
    const mainProfile = { ...demoData.businessProfiles[0], userId: mainUserId };
    const profileRef = await db.collection('businessProfiles').add(mainProfile);
    console.log(`Created business profile for: ${mainProfile.companyName}`);

    // Create additional demo users and profiles for teaming
    const additionalUserRefs = [];
    const additionalProfileRefs = [];

    for (const i in demoData.additionalBusinessProfiles) {
      const profileData = demoData.additionalBusinessProfiles[i];
      
      // Create user for this profile
      const userData = {
        email: `demo-user-${parseInt(i) + 2}@kdm-assoc.com`,
        tempPassword: `demo123456789${parseInt(i) + 2}`,
        isTempPassword: true,
        profileComplete: true,
        onboardingStep: 5,
        subscription: {
          customerId: `demo-customer-${parseInt(i) + 2}`,
          subscriptionId: `demo-subscription-${parseInt(i) + 2}`,
          planId: 'demo-consortium',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: Timestamp.now(),
          isDemo: true
        },
        stripeCustomerId: `demo-customer-${parseInt(i) + 2}`,
        isDemo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const userRef = await db.collection('users').add(userData);
      additionalUserRefs.push(userRef);

      // Create business profile
      const profileWithUser = { ...profileData, userId: userRef.id };
      const profileRef = await db.collection('businessProfiles').add(profileWithUser);
      additionalProfileRefs.push(profileRef);
      
      console.log(`Created additional demo user and profile: ${profileData.companyName}`);
    }

    // Create opportunities
    const opportunityRefs = [];
    for (const opportunityData of demoData.opportunities) {
      const oppRef = await db.collection('opportunities').add(opportunityData);
      opportunityRefs.push(oppRef);
      console.log(`Created opportunity: ${opportunityData.title}`);
    }

    // Create opportunity matches for the main demo user
    for (const oppRef of opportunityRefs) {
      const matchData = {
        userId: mainUserId,
        opportunityId: oppRef.id,
        matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        matchReasons: [
          'Primary expertise in Engineering Services',
          'Strong CMMC Level 2 certification',
          '8+ years experience in relevant NAICS codes'
        ],
        status: 'new' as const,
        matchedAt: Timestamp.now()
      };

      await db.collection('opportunityMatches').add(matchData);
      console.log(`Created opportunity match for user: ${oppRef.id}`);
    }

    // Create some past performance data for teaming partners
    const pastPerformanceData = [
      {
        userId: additionalUserRefs[0]?.id,
        contractTitle: 'DoD Cybersecurity Assessment',
        agency: 'Department of Defense',
        value: '$2.5M',
        completedDate: '2025-12-15',
        rating: 5
      },
      {
        userId: additionalUserRefs[0]?.id,
        contractTitle: 'Federal Network Security',
        agency: 'Department of Homeland Security',
        value: '$1.8M',
        completedDate: '2025-09-30',
        rating: 4
      },
      {
        userId: additionalUserRefs[1]?.id,
        contractTitle: 'Military Hardware Supply',
        agency: 'Department of Defense',
        value: '$3.2M',
        completedDate: '2025-11-20',
        rating: 5
      },
      {
        userId: additionalUserRefs[1]?.id,
        contractTitle: 'Federal Equipment Manufacturing',
        agency: 'General Services Administration',
        value: '$1.5M',
        completedDate: '2025-08-10',
        rating: 4
      }
    ];

    for (const perf of pastPerformanceData) {
      if (perf.userId) {
        await db.collection('pastPerformance').add(perf);
        console.log(`Created past performance record for user: ${perf.userId}`);
      }
    }

    console.log('Demo data seeding completed successfully!');
    console.log(`Main demo user email: demo-contractor@kdm-assoc.com`);
    console.log(`Main demo user password: demo1234567890`);
    console.log(`Demo signup page: /demo-signup`);

    return {
      mainUserId,
      mainProfileId: profileRef.id,
      opportunityIds: opportunityRefs.map(ref => ref.id),
      additionalUserIds: additionalUserRefs.map(ref => ref.id)
    };

  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
