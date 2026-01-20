import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const INSTRUCTOR_ID = "instructor-cmmc-001"; // Replace with actual instructor ID
const INSTRUCTOR_NAME = "CMMC Expert Team";

// CMMC Level 1 Course Data
const cmmcLevel1 = {
  title: "CMMC Level 1 Foundations",
  slug: "cmmc-level-1-foundations",
  description: "Master the fundamentals of CMMC Level 1 compliance. Learn to implement basic cybersecurity hygiene practices required for protecting Federal Contract Information (FCI).",
  facilitatorId: INSTRUCTOR_ID,
  facilitatorName: INSTRUCTOR_NAME,
  facilitatorBio: "Certified CMMC professionals with extensive experience in defense contractor compliance",
  cohortStartDate: Timestamp.fromDate(new Date('2026-02-01')),
  cohortEndDate: Timestamp.fromDate(new Date('2026-04-30')),
  maxParticipants: 50,
  currentParticipants: 0,
  estimatedDurationWeeks: 8,
  status: "published",
  difficultyLevel: "beginner",
  priceInCents: 149900, // $1,499.00
  compareAtPriceInCents: 199900,
  isFree: false,
  tags: ["CMMC", "Level 1", "Cybersecurity", "Compliance", "FCI"],
  learningOutcomes: [
    "Understand CMMC Level 1 requirements and scope",
    "Implement 17 basic security practices",
    "Protect Federal Contract Information (FCI)",
    "Establish access control procedures",
    "Implement identification and authentication",
    "Conduct media protection",
    "Establish physical protection measures",
    "Implement system and communications protection",
    "Prepare for CMMC Level 1 assessment"
  ],
  prerequisites: [
    "Basic understanding of cybersecurity concepts",
    "Access to company IT systems",
    "Management support for implementation"
  ],
  thumbnailUrl: "/images/cmmc-level-1.jpg",
  isPublished: true,
};

const cmmcLevel1Modules = [
  {
    title: "Introduction to CMMC Level 1",
    description: "Overview of CMMC framework and Level 1 requirements",
    weekNumber: 1,
    sortOrder: 0,
    sessions: [
      {
        title: "CMMC Framework Overview",
        description: "Understanding the CMMC model and its importance",
        contentType: "video",
        videoUrl: "https://example.com/cmmc-overview",
        durationMinutes: 45,
        sortOrder: 0,
        isPreview: true,
      },
      {
        title: "Level 1 Requirements Deep Dive",
        description: "Detailed breakdown of all 17 practices",
        contentType: "video",
        videoUrl: "https://example.com/level-1-requirements",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Assessment Process",
        description: "What to expect during a CMMC Level 1 assessment",
        contentType: "text",
        durationMinutes: 30,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Access Control (AC)",
    description: "Implementing access control practices",
    weekNumber: 2,
    sortOrder: 1,
    sessions: [
      {
        title: "AC.L1-3.1.1: Authorized Access Control",
        description: "Limit system access to authorized users",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "AC.L1-3.1.2: Transaction & Function Control",
        description: "Control access to transactions and functions",
        contentType: "video",
        durationMinutes: 35,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Hands-on: Implementing Access Controls",
        description: "Practical exercises for access control setup",
        contentType: "assignment",
        durationMinutes: 90,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Identification & Authentication (IA)",
    description: "User identification and authentication requirements",
    weekNumber: 3,
    sortOrder: 2,
    sessions: [
      {
        title: "IA.L1-3.5.1: User Identification",
        description: "Identify system users and processes",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "IA.L1-3.5.2: User Authentication",
        description: "Authenticate user identities",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Password Policy Implementation",
        description: "Creating and enforcing password policies",
        contentType: "text",
        durationMinutes: 30,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Media Protection (MP)",
    description: "Protecting and sanitizing media",
    weekNumber: 4,
    sortOrder: 3,
    sessions: [
      {
        title: "MP.L1-3.8.3: Media Disposal",
        description: "Sanitize or destroy media before disposal",
        contentType: "video",
        durationMinutes: 35,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Media Handling Procedures",
        description: "Best practices for media protection",
        contentType: "text",
        durationMinutes: 25,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Physical Protection (PE)",
    description: "Physical security controls",
    weekNumber: 5,
    sortOrder: 4,
    sessions: [
      {
        title: "PE.L1-3.10.1: Physical Access Limits",
        description: "Limit physical access to systems",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "PE.L1-3.10.3 & 3.10.4: Escort & Access Logs",
        description: "Visitor escort and access logging",
        contentType: "video",
        durationMinutes: 35,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "PE.L1-3.10.5: Physical Access Devices",
        description: "Managing keys, locks, and access cards",
        contentType: "text",
        durationMinutes: 25,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "System & Communications Protection (SC)",
    description: "Protecting systems and communications",
    weekNumber: 6,
    sortOrder: 5,
    sessions: [
      {
        title: "SC.L1-3.13.1: Boundary Protection",
        description: "Monitor and control communications at boundaries",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Firewall Configuration",
        description: "Setting up and managing firewalls",
        contentType: "assignment",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "System & Information Integrity (SI)",
    description: "Maintaining system integrity",
    weekNumber: 7,
    sortOrder: 6,
    sessions: [
      {
        title: "SI.L1-3.14.1: Flaw Remediation",
        description: "Identify and correct system flaws",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "SI.L1-3.14.2 & 3.14.4: Malicious Code Protection",
        description: "Protect against and update malware defenses",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "SI.L1-3.14.5: Network & System Monitoring",
        description: "Monitor systems for security alerts",
        contentType: "video",
        durationMinutes: 35,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Implementation & Assessment Prep",
    description: "Final implementation and assessment preparation",
    weekNumber: 8,
    sortOrder: 7,
    sessions: [
      {
        title: "Documentation Requirements",
        description: "Creating required documentation",
        contentType: "text",
        durationMinutes: 45,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Self-Assessment Guide",
        description: "Conducting internal assessments",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Final Assessment Preparation",
        description: "Preparing for official CMMC assessment",
        contentType: "live",
        durationMinutes: 90,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  }
];

// CMMC Level 2 Course Data
const cmmcLevel2 = {
  title: "CMMC Level 2 Advanced Implementation",
  slug: "cmmc-level-2-advanced",
  description: "Comprehensive training for CMMC Level 2 compliance. Implement advanced security practices to protect Controlled Unclassified Information (CUI) and meet DoD requirements.",
  facilitatorId: INSTRUCTOR_ID,
  facilitatorName: INSTRUCTOR_NAME,
  facilitatorBio: "Certified CMMC professionals with extensive experience in defense contractor compliance",
  cohortStartDate: Timestamp.fromDate(new Date('2026-03-01')),
  cohortEndDate: Timestamp.fromDate(new Date('2026-06-30')),
  maxParticipants: 40,
  currentParticipants: 0,
  estimatedDurationWeeks: 12,
  status: "published",
  difficultyLevel: "intermediate",
  priceInCents: 349900, // $3,499.00
  compareAtPriceInCents: 449900,
  isFree: false,
  tags: ["CMMC", "Level 2", "CUI", "NIST 800-171", "Advanced Security"],
  learningOutcomes: [
    "Master all 110 CMMC Level 2 security requirements",
    "Implement NIST SP 800-171 controls",
    "Protect Controlled Unclassified Information (CUI)",
    "Establish comprehensive security program",
    "Implement incident response procedures",
    "Conduct risk assessments",
    "Manage security configurations",
    "Establish continuous monitoring",
    "Prepare for CMMC Level 2 certification"
  ],
  prerequisites: [
    "CMMC Level 1 knowledge or equivalent",
    "IT security experience recommended",
    "Access to organizational systems",
    "Executive sponsorship for implementation"
  ],
  thumbnailUrl: "/images/cmmc-level-2.jpg",
  isPublished: true,
};

const cmmcLevel2Modules = [
  {
    title: "CMMC Level 2 Overview & Planning",
    description: "Understanding Level 2 requirements and planning implementation",
    weekNumber: 1,
    sortOrder: 0,
    sessions: [
      {
        title: "Level 2 Requirements Overview",
        description: "Complete breakdown of 110 practices across 14 domains",
        contentType: "video",
        videoUrl: "https://example.com/level-2-overview",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: true,
      },
      {
        title: "Gap Analysis Methodology",
        description: "Assessing current state vs. requirements",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Implementation Roadmap",
        description: "Planning your Level 2 implementation",
        contentType: "text",
        durationMinutes: 30,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Access Control (AC) - Advanced",
    description: "Advanced access control implementation",
    weekNumber: 2,
    sortOrder: 1,
    sessions: [
      {
        title: "Least Privilege & Separation of Duties",
        description: "AC.L2-3.1.3 through 3.1.5 implementation",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Privileged Account Management",
        description: "Managing and monitoring privileged access",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Remote Access Security",
        description: "Securing remote access connections",
        contentType: "assignment",
        durationMinutes: 75,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Awareness & Training (AT)",
    description: "Security awareness and training programs",
    weekNumber: 3,
    sortOrder: 2,
    sessions: [
      {
        title: "Security Awareness Program",
        description: "Building comprehensive awareness training",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Role-Based Training",
        description: "Specialized training for different roles",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Audit & Accountability (AU)",
    description: "Logging, monitoring, and audit requirements",
    weekNumber: 4,
    sortOrder: 3,
    sessions: [
      {
        title: "Audit Logging Requirements",
        description: "What to log and how to log it",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Log Review & Analysis",
        description: "Reviewing and responding to audit logs",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "SIEM Implementation",
        description: "Security Information and Event Management",
        contentType: "assignment",
        durationMinutes: 90,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Configuration Management (CM)",
    description: "Managing system configurations securely",
    weekNumber: 5,
    sortOrder: 4,
    sessions: [
      {
        title: "Baseline Configurations",
        description: "Establishing and maintaining baselines",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Change Control Process",
        description: "Managing configuration changes",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Software Inventory Management",
        description: "Tracking authorized and unauthorized software",
        contentType: "text",
        durationMinutes: 35,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Identification & Authentication (IA) - Advanced",
    description: "Advanced authentication mechanisms",
    weekNumber: 6,
    sortOrder: 5,
    sessions: [
      {
        title: "Multi-Factor Authentication",
        description: "Implementing MFA across systems",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Cryptographic Authentication",
        description: "Using certificates and cryptographic methods",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Incident Response (IR)",
    description: "Detecting and responding to incidents",
    weekNumber: 7,
    sortOrder: 6,
    sessions: [
      {
        title: "Incident Response Plan",
        description: "Creating an effective IR plan",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Incident Detection & Analysis",
        description: "Identifying and analyzing security incidents",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Incident Response Exercise",
        description: "Tabletop exercise for incident response",
        contentType: "live",
        durationMinutes: 120,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Maintenance (MA) & Media Protection (MP)",
    description: "System maintenance and media protection",
    weekNumber: 8,
    sortOrder: 7,
    sessions: [
      {
        title: "Controlled Maintenance",
        description: "Managing system maintenance securely",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Media Protection & Marking",
        description: "Protecting and marking CUI media",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Personnel Security (PS) & Physical Protection (PE)",
    description: "Personnel and physical security controls",
    weekNumber: 9,
    sortOrder: 8,
    sessions: [
      {
        title: "Personnel Screening",
        description: "Background checks and screening procedures",
        contentType: "video",
        durationMinutes: 35,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Physical Security Enhancements",
        description: "Advanced physical protection measures",
        contentType: "video",
        durationMinutes: 40,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Risk Assessment (RA) & Security Assessment (CA)",
    description: "Risk and security assessments",
    weekNumber: 10,
    sortOrder: 9,
    sessions: [
      {
        title: "Risk Assessment Methodology",
        description: "Conducting comprehensive risk assessments",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Vulnerability Scanning",
        description: "Implementing vulnerability management",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Security Assessment Planning",
        description: "Planning security control assessments",
        contentType: "text",
        durationMinutes: 40,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "System & Communications Protection (SC) - Advanced",
    description: "Advanced system and network protection",
    weekNumber: 11,
    sortOrder: 10,
    sessions: [
      {
        title: "Network Segmentation",
        description: "Implementing network separation",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Cryptographic Protection",
        description: "Implementing encryption for CUI",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Secure Communications",
        description: "Protecting data in transit",
        contentType: "assignment",
        durationMinutes: 75,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "System & Information Integrity (SI) & Final Prep",
    description: "System integrity and certification preparation",
    weekNumber: 12,
    sortOrder: 11,
    sessions: [
      {
        title: "Security Monitoring & Alerting",
        description: "Continuous monitoring implementation",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Documentation Package",
        description: "Preparing Level 2 documentation",
        contentType: "text",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Level 2 Certification Readiness",
        description: "Final preparation for C3PAO assessment",
        contentType: "live",
        durationMinutes: 120,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  }
];

// CMMC Level 3 Course Data
const cmmcLevel3 = {
  title: "CMMC Level 3 Expert Certification",
  slug: "cmmc-level-3-expert",
  description: "Advanced training for CMMC Level 3 compliance. Master expert-level security practices for protecting highly sensitive CUI and critical national security information.",
  facilitatorId: INSTRUCTOR_ID,
  facilitatorName: INSTRUCTOR_NAME,
  facilitatorBio: "Certified CMMC professionals with extensive experience in defense contractor compliance",
  cohortStartDate: Timestamp.fromDate(new Date('2026-04-01')),
  cohortEndDate: Timestamp.fromDate(new Date('2026-08-31')),
  maxParticipants: 25,
  currentParticipants: 0,
  estimatedDurationWeeks: 16,
  status: "published",
  difficultyLevel: "advanced",
  priceInCents: 599900, // $5,999.00
  compareAtPriceInCents: 799900,
  isFree: false,
  tags: ["CMMC", "Level 3", "Advanced Security", "APT Protection", "Expert"],
  learningOutcomes: [
    "Master all CMMC Level 3 requirements (130+ practices)",
    "Implement advanced threat protection",
    "Establish proactive security posture",
    "Implement advanced persistent threat (APT) defenses",
    "Conduct advanced threat hunting",
    "Implement security orchestration and automation",
    "Establish threat intelligence program",
    "Conduct red team exercises",
    "Prepare for CMMC Level 3 certification"
  ],
  prerequisites: [
    "CMMC Level 2 certification or equivalent",
    "Advanced IT security experience required",
    "Security architecture knowledge",
    "Executive and board-level sponsorship"
  ],
  thumbnailUrl: "/images/cmmc-level-3.jpg",
  isPublished: true,
};

const cmmcLevel3Modules = [
  {
    title: "CMMC Level 3 Strategic Overview",
    description: "Understanding Level 3 requirements and strategic planning",
    weekNumber: 1,
    sortOrder: 0,
    sessions: [
      {
        title: "Level 3 Requirements & Scope",
        description: "Complete overview of 130+ advanced practices",
        contentType: "video",
        videoUrl: "https://example.com/level-3-overview",
        durationMinutes: 75,
        sortOrder: 0,
        isPreview: true,
      },
      {
        title: "APT Threat Landscape",
        description: "Understanding advanced persistent threats",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Strategic Implementation Planning",
        description: "Building a Level 3 implementation strategy",
        contentType: "text",
        durationMinutes: 45,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Advanced Access Control",
    description: "Expert-level access control mechanisms",
    weekNumber: 2,
    sortOrder: 1,
    sessions: [
      {
        title: "Attribute-Based Access Control",
        description: "Implementing ABAC for dynamic access",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Zero Trust Architecture",
        description: "Implementing zero trust principles",
        contentType: "video",
        durationMinutes: 70,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Advanced Privilege Management",
        description: "Just-in-time and just-enough access",
        contentType: "assignment",
        durationMinutes: 90,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Advanced Threat Detection",
    description: "Detecting and analyzing advanced threats",
    weekNumber: 3,
    sortOrder: 2,
    sessions: [
      {
        title: "Behavioral Analytics",
        description: "User and entity behavior analytics (UEBA)",
        contentType: "video",
        durationMinutes: 65,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Threat Intelligence Integration",
        description: "Leveraging threat intelligence feeds",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Advanced Threat Hunting",
        description: "Proactive threat hunting techniques",
        contentType: "live",
        durationMinutes: 120,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Security Orchestration & Automation",
    description: "Automating security operations",
    weekNumber: 4,
    sortOrder: 3,
    sessions: [
      {
        title: "SOAR Platform Implementation",
        description: "Security orchestration, automation, and response",
        contentType: "video",
        durationMinutes: 70,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Automated Incident Response",
        description: "Building automated response playbooks",
        contentType: "video",
        durationMinutes: 65,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "SOAR Playbook Development",
        description: "Creating custom automation playbooks",
        contentType: "assignment",
        durationMinutes: 100,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Advanced Cryptography",
    description: "Expert cryptographic implementations",
    weekNumber: 5,
    sortOrder: 4,
    sessions: [
      {
        title: "Quantum-Resistant Cryptography",
        description: "Preparing for post-quantum cryptography",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Key Management at Scale",
        description: "Enterprise key management systems",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Hardware Security Modules",
        description: "Implementing HSM for critical operations",
        contentType: "text",
        durationMinutes: 40,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Advanced Incident Response",
    description: "Expert-level incident response capabilities",
    weekNumber: 6,
    sortOrder: 5,
    sessions: [
      {
        title: "Advanced Forensics",
        description: "Digital forensics for APT investigations",
        contentType: "video",
        durationMinutes: 75,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Malware Analysis",
        description: "Analyzing sophisticated malware",
        contentType: "video",
        durationMinutes: 70,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Incident Response Simulation",
        description: "Advanced IR tabletop exercise",
        contentType: "live",
        durationMinutes: 180,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Security Architecture",
    description: "Designing secure architectures",
    weekNumber: 7,
    sortOrder: 6,
    sessions: [
      {
        title: "Secure Architecture Principles",
        description: "Defense in depth and secure by design",
        contentType: "video",
        durationMinutes: 65,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Micro-Segmentation",
        description: "Advanced network segmentation strategies",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Cloud Security Architecture",
        description: "Securing multi-cloud environments",
        contentType: "assignment",
        durationMinutes: 90,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Supply Chain Risk Management",
    description: "Managing supply chain security risks",
    weekNumber: 8,
    sortOrder: 7,
    sessions: [
      {
        title: "Supply Chain Risk Assessment",
        description: "Evaluating supplier security",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Third-Party Risk Management",
        description: "Managing vendor security risks",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Advanced Monitoring & Analytics",
    description: "Expert-level security monitoring",
    weekNumber: 9,
    sortOrder: 8,
    sessions: [
      {
        title: "Advanced SIEM Configuration",
        description: "Optimizing SIEM for APT detection",
        contentType: "video",
        durationMinutes: 70,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Machine Learning for Security",
        description: "Applying ML to security operations",
        contentType: "video",
        durationMinutes: 65,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Custom Detection Rules",
        description: "Building advanced detection logic",
        contentType: "assignment",
        durationMinutes: 95,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Red Team Operations",
    description: "Offensive security testing",
    weekNumber: 10,
    sortOrder: 9,
    sessions: [
      {
        title: "Red Team Methodology",
        description: "Planning and executing red team exercises",
        contentType: "video",
        durationMinutes: 75,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Purple Team Collaboration",
        description: "Integrating offensive and defensive teams",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Red Team Exercise",
        description: "Hands-on red team simulation",
        contentType: "live",
        durationMinutes: 240,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Continuous Monitoring & Improvement",
    description: "Establishing continuous security improvement",
    weekNumber: 11,
    sortOrder: 10,
    sessions: [
      {
        title: "Continuous Monitoring Program",
        description: "Building a comprehensive monitoring program",
        contentType: "video",
        durationMinutes: 65,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Security Metrics & KPIs",
        description: "Measuring security program effectiveness",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Continuous Improvement Process",
        description: "Implementing security improvement cycles",
        contentType: "text",
        durationMinutes: 45,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Governance & Compliance",
    description: "Security governance and compliance management",
    weekNumber: 12,
    sortOrder: 11,
    sessions: [
      {
        title: "Security Governance Framework",
        description: "Establishing security governance",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Compliance Automation",
        description: "Automating compliance monitoring",
        contentType: "video",
        durationMinutes: 55,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Advanced Documentation",
    description: "Creating comprehensive security documentation",
    weekNumber: 13,
    sortOrder: 12,
    sessions: [
      {
        title: "System Security Plan (SSP)",
        description: "Developing comprehensive SSP",
        contentType: "video",
        durationMinutes: 70,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Plan of Action & Milestones (POA&M)",
        description: "Managing security remediation",
        contentType: "text",
        durationMinutes: 50,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Security Assessment Report",
        description: "Documenting security assessments",
        contentType: "assignment",
        durationMinutes: 80,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Assessment Preparation",
    description: "Preparing for Level 3 certification",
    weekNumber: 14,
    sortOrder: 13,
    sessions: [
      {
        title: "C3PAO Assessment Process",
        description: "Understanding the Level 3 assessment",
        contentType: "video",
        durationMinutes: 65,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Evidence Collection",
        description: "Gathering and organizing evidence",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Mock Assessment",
        description: "Practice assessment with feedback",
        contentType: "live",
        durationMinutes: 180,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  },
  {
    title: "Final Preparation & Review",
    description: "Final preparation for certification",
    weekNumber: 15,
    sortOrder: 14,
    sessions: [
      {
        title: "Gap Remediation",
        description: "Addressing remaining gaps",
        contentType: "video",
        durationMinutes: 60,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Assessment Readiness Review",
        description: "Final readiness assessment",
        contentType: "live",
        durationMinutes: 120,
        sortOrder: 1,
        isPreview: false,
      }
    ]
  },
  {
    title: "Certification & Beyond",
    description: "Maintaining Level 3 compliance",
    weekNumber: 16,
    sortOrder: 15,
    sessions: [
      {
        title: "Maintaining Certification",
        description: "Ongoing compliance requirements",
        contentType: "video",
        durationMinutes: 50,
        sortOrder: 0,
        isPreview: false,
      },
      {
        title: "Future of CMMC",
        description: "Staying ahead of evolving requirements",
        contentType: "video",
        durationMinutes: 45,
        sortOrder: 1,
        isPreview: false,
      },
      {
        title: "Graduation & Next Steps",
        description: "Course completion and certification guidance",
        contentType: "live",
        durationMinutes: 90,
        sortOrder: 2,
        isPreview: false,
      }
    ]
  }
];

async function seedCMMCCourses() {
  console.log('Starting CMMC courses seed...');
  
  try {
    // Create CMMC Level 1
    console.log('\n📚 Creating CMMC Level 1 course...');
    const level1Ref = await db.collection('cohorts').add({
      ...cmmcLevel1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Created Level 1 cohort: ${level1Ref.id}`);
    
    // Add Level 1 modules and sessions
    for (const moduleData of cmmcLevel1Modules) {
      const { sessions, ...module} = moduleData;
      const moduleRef = await db.collection('cohort_modules').add({
        ...module,
        cohortId: level1Ref.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Created module: ${module.title}`);
      
      // Add sessions for this module
      if (sessions) {
        for (const session of sessions) {
          await db.collection('cohort_sessions').add({
            ...session,
            moduleId: moduleRef.id,
            cohortId: level1Ref.id,
            scheduledDate: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
        console.log(`    ✅ Added ${sessions.length} sessions`);
      }
    }
    
    // Create CMMC Level 2
    console.log('\n📚 Creating CMMC Level 2 course...');
    const level2Ref = await db.collection('cohorts').add({
      ...cmmcLevel2,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Created Level 2 cohort: ${level2Ref.id}`);
    
    // Add Level 2 modules and sessions
    for (const moduleData of cmmcLevel2Modules) {
      const { sessions, ...module } = moduleData;
      const moduleRef = await db.collection('cohort_modules').add({
        ...module,
        cohortId: level2Ref.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Created module: ${module.title}`);
      
      if (sessions) {
        for (const session of sessions) {
          await db.collection('cohort_sessions').add({
            ...session,
            moduleId: moduleRef.id,
            cohortId: level2Ref.id,
            scheduledDate: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
        console.log(`    ✅ Added ${sessions.length} sessions`);
      }
    }
    
    // Create CMMC Level 3
    console.log('\n📚 Creating CMMC Level 3 course...');
    const level3Ref = await db.collection('cohorts').add({
      ...cmmcLevel3,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Created Level 3 cohort: ${level3Ref.id}`);
    
    // Add Level 3 modules and sessions
    for (const moduleData of cmmcLevel3Modules) {
      const { sessions, ...module } = moduleData;
      const moduleRef = await db.collection('cohort_modules').add({
        ...module,
        cohortId: level3Ref.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ Created module: ${module.title}`);
      
      if (sessions) {
        for (const session of sessions) {
          await db.collection('cohort_sessions').add({
            ...session,
            moduleId: moduleRef.id,
            cohortId: level3Ref.id,
            scheduledDate: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
        console.log(`    ✅ Added ${sessions.length} sessions`);
      }
    }
    
    console.log('\n🎉 Successfully seeded all CMMC courses!');
    console.log('\nCourse IDs:');
    console.log(`  Level 1: ${level1Ref.id}`);
    console.log(`  Level 2: ${level2Ref.id}`);
    console.log(`  Level 3: ${level3Ref.id}`);
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}

// Run the seed function
seedCMMCCourses()
  .then(() => {
    console.log('\n✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
