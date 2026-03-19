import { Globe, Cpu, FileText, Megaphone, BarChart3, Briefcase, LucideIcon } from "lucide-react";

export interface ServiceOffering {
  name: string;
  description: string;
  details?: string[];
}

export interface Service {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  fullDescription: string;
  color: string;
  bgColor: string;
  offerings: ServiceOffering[];
  benefits: string[];
  caseStudyHighlight?: string;
}

export const services: Service[] = [
  {
    id: "digital-solutions",
    title: "Digital Solutions",
    icon: Globe,
    description: "Comprehensive digital transformation services to modernize your business presence and operations.",
    fullDescription: "In today's digital-first world, having a strong online presence is essential for government contractors. Our Digital Solutions team helps emerging small businesses establish, enhance, and optimize their digital footprint to compete effectively in the federal marketplace. We understand the unique requirements of government contracting and build solutions that meet compliance standards while showcasing your capabilities.",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    offerings: [
      {
        name: "Websites",
        description: "Professional website design and development tailored for government contractors",
        details: [
          "Custom responsive design optimized for all devices",
          "Section 508 accessibility compliance",
          "SEO optimization for government buyer searches",
          "Capability statement integration",
          "Past performance showcase",
          "Secure hosting with SSL certificates"
        ]
      },
      {
        name: "Digital Ecosystems",
        description: "Integrated digital platforms connecting your business operations",
        details: [
          "Customer portal development",
          "Vendor management systems",
          "Document management solutions",
          "Workflow automation",
          "API integrations with existing systems",
          "Real-time analytics dashboards"
        ]
      },
      {
        name: "E-commerce",
        description: "Online commerce solutions for B2B and B2G transactions",
        details: [
          "GSA Advantage integration",
          "Punch-out catalog development",
          "Government purchase card acceptance",
          "Automated invoicing systems",
          "Inventory management integration",
          "Multi-channel sales platforms"
        ]
      }
    ],
    benefits: [
      "Increased visibility to government buyers",
      "Streamlined operations and reduced manual processes",
      "Enhanced credibility with professional online presence",
      "Compliance with federal accessibility requirements",
      "24/7 availability for customer engagement"
    ],
    caseStudyHighlight: "Helped a small business increase their government contract leads by 340% within 6 months of launching their new digital presence."
  },
  {
    id: "technology-solutions",
    title: "Technology Solutions",
    icon: Cpu,
    description: "Cutting-edge technology implementations to give your business a competitive edge.",
    fullDescription: "Technology is transforming how government contracts are won and executed. Our Technology Solutions practice helps emerging small businesses leverage the latest innovations to improve efficiency, security, and competitiveness. From blockchain to AI, we implement solutions that position your business at the forefront of federal contracting.",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    offerings: [
      {
        name: "Blockchain",
        description: "Secure, transparent blockchain solutions for supply chain and contracts",
        details: [
          "Supply chain traceability",
          "Smart contract implementation",
          "Secure document verification",
          "Tamper-proof audit trails",
          "Decentralized identity management",
          "Cryptocurrency payment integration"
        ]
      },
      {
        name: "CRM & AI Integration",
        description: "Customer relationship management enhanced with artificial intelligence",
        details: [
          "Salesforce and HubSpot implementation",
          "AI-powered lead scoring",
          "Automated follow-up sequences",
          "Predictive analytics for opportunities",
          "Chatbot and virtual assistant deployment",
          "Natural language processing for RFP analysis"
        ]
      },
      {
        name: "Cybersecurity",
        description: "Comprehensive security solutions meeting federal compliance requirements",
        details: [
          "CMMC assessment and preparation",
          "NIST 800-171 compliance",
          "FedRAMP readiness consulting",
          "Penetration testing and vulnerability assessments",
          "Security awareness training",
          "Incident response planning"
        ]
      }
    ],
    benefits: [
      "Meet federal cybersecurity requirements",
      "Automate repetitive tasks and increase productivity",
      "Gain competitive advantage with emerging technologies",
      "Improve data security and reduce risk",
      "Better decision-making through AI-powered insights"
    ],
    caseStudyHighlight: "Guided a defense contractor through CMMC Level 2 certification, enabling them to bid on $50M+ in previously inaccessible contracts."
  },
  {
    id: "grants-nofo-rfps",
    title: "Grants-NOFO-RFPs",
    icon: FileText,
    description: "Expert assistance navigating the complex world of government funding opportunities.",
    fullDescription: "Winning government contracts and grants requires more than just capability—it requires expertise in navigating complex procurement processes. Our Grants-NOFO-RFPs team brings decades of combined experience in federal acquisition to help you identify, pursue, and win the opportunities that align with your business goals.",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    offerings: [
      {
        name: "Quick Bid/No Bid",
        description: "Rapid assessment of opportunity fit and win probability",
        details: [
          "Opportunity screening and analysis",
          "Competitive landscape assessment",
          "Win probability scoring",
          "Resource requirement evaluation",
          "Risk assessment",
          "Go/no-go decision framework"
        ]
      },
      {
        name: "Proposal Management",
        description: "End-to-end proposal development and submission management",
        details: [
          "Proposal planning and scheduling",
          "Compliance matrix development",
          "Writer coordination and management",
          "Review cycles (Pink, Red, Gold Team)",
          "Production and submission",
          "Post-submission support"
        ]
      },
      {
        name: "Proposal & Grant Writing",
        description: "Professional writing services for winning proposals and grant applications",
        details: [
          "Technical approach development",
          "Management approach writing",
          "Past performance narratives",
          "Executive summaries",
          "Grant application writing",
          "Budget narrative development"
        ]
      }
    ],
    benefits: [
      "Higher win rates through professional proposal development",
      "Reduced internal resource burden",
      "Access to proven proposal methodologies",
      "Faster response times to opportunities",
      "Improved compliance and reduced risk of disqualification"
    ],
    caseStudyHighlight: "Achieved a 67% win rate on proposals submitted in 2024, compared to the industry average of 25%."
  },
  {
    id: "marketing-solutions",
    title: "Marketing Solutions",
    icon: Megaphone,
    description: "Strategic marketing services to increase your visibility and market reach.",
    fullDescription: "In the government contracting space, visibility and reputation are everything. Our Marketing Solutions team helps emerging small businesses build their brand, expand their reach, and establish thought leadership in their target markets. We understand the unique dynamics of B2G marketing and create strategies that resonate with government decision-makers.",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    offerings: [
      {
        name: "Import & Export",
        description: "International trade marketing and market entry strategies",
        details: [
          "Export readiness assessment",
          "International market research",
          "Trade show representation",
          "Foreign buyer identification",
          "Export documentation support",
          "International partnership development"
        ]
      },
      {
        name: "Content Creation",
        description: "Professional content development for all marketing channels",
        details: [
          "Capability statement design",
          "Case study development",
          "White paper writing",
          "Blog and article creation",
          "Video production",
          "Infographic design"
        ]
      },
      {
        name: "PR/News Distribution",
        description: "Public relations and media outreach services",
        details: [
          "Press release writing and distribution",
          "Media relations management",
          "Award submission support",
          "Speaking opportunity placement",
          "Crisis communications planning",
          "Social media management"
        ]
      }
    ],
    benefits: [
      "Increased brand awareness among government buyers",
      "Established thought leadership in your industry",
      "Expanded market reach domestically and internationally",
      "Professional marketing materials that win business",
      "Consistent messaging across all channels"
    ],
    caseStudyHighlight: "Helped a technology firm gain coverage in Federal News Network and GovExec, resulting in 15 new prime contractor inquiries."
  },
  {
    id: "operations-performance",
    title: "Operations/Performance",
    icon: BarChart3,
    description: "Optimize your business operations for peak performance and growth.",
    fullDescription: "Operational excellence is the foundation of successful government contracting. Our Operations/Performance team helps emerging small businesses assess their current capabilities, identify gaps, and implement improvements that position them for sustainable growth. We focus on building the infrastructure and processes needed to win and execute government contracts successfully.",
    color: "text-teal-600",
    bgColor: "bg-teal-600/10",
    offerings: [
      {
        name: "Business Assessments",
        description: "Comprehensive evaluation of your business capabilities and readiness",
        details: [
          "Government contracting readiness assessment",
          "Capability gap analysis",
          "Process maturity evaluation",
          "Organizational structure review",
          "Technology infrastructure assessment",
          "Compliance readiness check"
        ]
      },
      {
        name: "Capital Readiness",
        description: "Financial preparation and access to capital resources",
        details: [
          "Financial statement preparation",
          "Banking relationship development",
          "SBA loan application support",
          "Bonding capacity building",
          "Line of credit establishment",
          "Invoice factoring setup"
        ]
      },
      {
        name: "Strategic Business Plans",
        description: "Development of actionable strategic plans for growth",
        details: [
          "Market analysis and positioning",
          "Growth strategy development",
          "Operational roadmap creation",
          "Resource planning",
          "Risk mitigation strategies",
          "Performance metrics and KPIs"
        ]
      }
    ],
    benefits: [
      "Clear understanding of current capabilities and gaps",
      "Improved financial position and access to capital",
      "Actionable roadmap for growth",
      "Better prepared for contract execution",
      "Reduced operational risk"
    ],
    caseStudyHighlight: "Helped a construction firm increase their bonding capacity from $500K to $5M, opening doors to larger federal projects."
  },
  {
    id: "contracting-vehicles",
    title: "Contracting Vehicles",
    icon: Briefcase,
    description: "Navigate government contracting pathways and certification requirements.",
    fullDescription: "Government contracting vehicles and certifications can open doors to billions of dollars in set-aside contracts. Our Contracting Vehicles team guides emerging small businesses through the complex landscape of certifications, mentor-protégé programs, and SBA initiatives to maximize their competitive advantage in the federal marketplace.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
    offerings: [
      {
        name: "Certifications",
        description: "Guidance on obtaining 8(a), WOSB, SDVOSB, HUBZone and other certifications",
        details: [
          "8(a) Business Development Program application",
          "Women-Owned Small Business (WOSB) certification",
          "Service-Disabled Veteran-Owned (SDVOSB) verification",
          "HUBZone certification",
          "Emerging Business Enterprise (EBE) certification",
          "State and local certifications"
        ]
      },
      {
        name: "Mentor-Protégé & JVs",
        description: "Strategic partnership development and joint venture formation",
        details: [
          "Mentor identification and matching",
          "Mentor-Protégé Agreement development",
          "Joint venture structuring",
          "Teaming agreement negotiation",
          "Partnership due diligence",
          "Ongoing relationship management"
        ]
      },
      {
        name: "SBA Programs",
        description: "Navigation of Small Business Administration programs and benefits",
        details: [
          "SBA program eligibility assessment",
          "7(j) Management and Technical Assistance",
          "Surety Bond Guarantee Program",
          "Small Business Innovation Research (SBIR)",
          "Small Business Technology Transfer (STTR)",
          "Disaster loan programs"
        ]
      }
    ],
    benefits: [
      "Access to set-aside contracts worth billions annually",
      "Competitive advantage in federal procurement",
      "Strategic partnerships with established contractors",
      "Accelerated business development through mentorship",
      "Expanded bonding and financing options"
    ],
    caseStudyHighlight: "Guided 47 businesses through successful 8(a) certification in 2024, with an average time-to-certification of 90 days."
  }
];

export function getServiceById(id: string): Service | undefined {
  return services.find(service => service.id === id);
}

export function getServiceIds(): string[] {
  return services.map(service => service.id);
}
