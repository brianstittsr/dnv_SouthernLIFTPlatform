// Enhanced mock marketplace listings with detailed data
export const MOCK_LISTINGS = [
  {
    id: "1",
    type: "service",
    title: "CMMC Level 2 Assessment & Certification",
    shortDescription: "Complete CMMC Level 2 assessment preparation and certification for DoD contractors",
    description: `Full-service CMMC Level 2 assessment including gap analysis, remediation support, and certification preparation. Our certified assessors guide you through the entire process to ensure compliance with DoD requirements.

What's Included:
• Initial gap analysis and readiness assessment
• Remediation planning and implementation support
• Documentation review and preparation
• On-site assessment with certified CMMC assessors
• Post-assessment remediation support
• Certification recommendation letter

Our team has successfully guided over 200 companies through CMMC certification with a 98% first-time pass rate. We work with businesses of all sizes, from small disadvantaged businesses to large defense contractors.

Timeline: 4-6 weeks from kickoff to assessment completion
Support: 90 days of post-certification support included`,
    price: 15000,
    priceUnit: "per assessment",
    categories: ["CMMC", "Compliance", "Certification"],
    naicsCodes: ["541512", "541511"],
    seller: "KDM & Associates",
    sellerId: "kdm-001",
    rating: 4.9,
    reviews: 47,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "4-6 weeks",
    deliveryMode: "On-site Assessment",
    deliveryModeDescription: "On-site assessment at your facility with virtual follow-up support",
    geographicServiceArea: ["National"],
    certifications: ["CMMC-AB Certified", "ISO 27001", "CISSP"],
    serviceType: "consulting",
    location: "Washington, DC Metro Area",
    facilityInfo: "Our headquarters features secure assessment facilities and video conferencing capabilities for remote consultations.",
    features: [
      "Certified CMMC Registered Practitioners (RPs)",
      "Certified CMMC Assessors (CAs)",
      "98% first-time certification success rate",
      "90-day post-certification support",
      "Flexible scheduling options",
      "Remote and on-site assessment options"
    ],
    documents: [
      { name: "CMMC Assessment Process Guide", url: "#" },
      { name: "Sample Assessment Report", url: "#" },
      { name: "Client Success Stories", url: "#" }
    ],
    readinessScore: 95,
    pastPerformance: [
      { contractTitle: "DoD Contractor CMMC Certification", client: "Aerospace Defense Corp", description: "Successfully guided through Level 2 certification", value: 15000 },
      { contractTitle: "Manufacturing Facility Assessment", client: "Precision Parts Inc", description: "Gap analysis and remediation support", value: 12000 }
    ]
  },
  {
    id: "2",
    type: "service",
    title: "Government Contract Manufacturing - CNC Precision",
    shortDescription: "ISO 9001 certified CNC machining for aerospace and defense contracts",
    description: `Precision CNC machining services for government contracts with ISO 9001 and AS9100 certification. Our 50,000 sq ft facility features state-of-the-art 5-axis machining centers, turning centers, and quality inspection equipment.

Capabilities:
• 5-axis simultaneous milling up to 60" x 30" x 24"
• CNC turning up to 24" diameter and 60" length
• Tight tolerances: ±0.0005" standard, ±0.0001" precision
• Materials: Aluminum, steel, titanium, Inconel, composites
• Finishing: Anodizing, plating, powder coating, passivation

Quality Assurance:
• AS9100D and ISO 9001:2015 certified
• Full CMM inspection capabilities
• First Article Inspection Reports (FAIR)
• Material certifications and traceability
• ITAR registered and compliant

We specialize in quick-turn prototypes to full production runs for aerospace, defense, and medical device applications. Our typical lead time is 2-4 weeks depending on complexity and quantity.`,
    price: 85,
    priceUnit: "per hour",
    categories: ["Manufacturing", "CNC", "Aerospace"],
    naicsCodes: ["332710", "332720"],
    seller: "Acme Manufacturing Solutions",
    sellerId: "acme-001",
    rating: 4.8,
    reviews: 32,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1581092160607-7ad6f6d2719e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "2-4 weeks",
    deliveryMode: "Physical Manufacturing",
    deliveryModeDescription: "Parts manufactured at our facility and shipped to your location",
    geographicServiceArea: ["Northeast", "Mid-Atlantic"],
    certifications: ["ISO 9001", "AS9100", "CMMC Level 2", "ITAR Registered"],
    serviceType: "manufacturing",
    location: "Baltimore, MD",
    facilityInfo: "50,000 sq ft manufacturing facility with 5-axis CNC machines, CMM inspection, and climate-controlled quality lab",
    features: [
      "5-axis CNC machining",
      "AS9100D certified quality system",
      "ITAR registered facility",
      "Materials traceability",
      "First Article Inspection Reports",
      "DFARS compliant materials"
    ],
    documents: [
      { name: "Capability Statement", url: "#" },
      { name: "Equipment List", url: "#" },
      { name: "Quality Certifications", url: "#" }
    ],
    readinessScore: 92
  },
  {
    id: "3",
    type: "product",
    title: "AI-Powered Bid/No-Bid Analysis Tool",
    shortDescription: "Automated opportunity analysis with AI-driven win probability scoring",
    description: `Leverage AI to analyze federal contracting opportunities and predict win probability. Our proprietary machine learning algorithms evaluate over 50 data points to provide data-driven bid/no-bid recommendations.

Key Features:
• Win probability scoring (0-100%)
• Competitor analysis and positioning
• Agency relationship mapping
• Past performance matching
• Pricing intelligence and recommendations
• Technical requirements gap analysis
• Risk assessment matrix

Integration:
• SAM.gov API integration for real-time opportunity feeds
• CRM integration (Salesforce, HubSpot)
• Slack and Teams notifications
• Export to Excel/PowerPoint
• API access for enterprise customers

Our customers report a 40% increase in win rates and 60% reduction in time spent on bid/no-bid decisions.`,
    price: 499,
    priceUnit: "per month",
    categories: ["AI Tools", "Analytics", "Procurement"],
    naicsCodes: ["541512"],
    seller: "KDM Platform",
    sellerId: "kdm-platform-001",
    rating: 4.7,
    reviews: 89,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "Immediate access",
    deliveryMode: "Digital SaaS",
    deliveryModeDescription: "Cloud-based platform with instant access after subscription",
    geographicServiceArea: ["National"],
    sku: "AI-BID-001",
    unitOfMeasure: "subscription",
    featuresIncluded: [
      "Unlimited opportunity analysis",
      "Win probability scoring",
      "Competitor intelligence",
      "Agency relationship mapping",
      "Pricing recommendations",
      "SAM.gov integration",
      "API access",
      "Priority support"
    ],
    documents: [
      { name: "Product Overview", url: "#" },
      { name: "API Documentation", url: "#" },
      { name: "Case Studies", url: "#" }
    ]
  },
  {
    id: "4",
    type: "service",
    title: "8(a) Certification Application Package",
    shortDescription: "Complete 8(a) business development program application preparation",
    description: `Full-service 8(a) certification application preparation including narrative development, financial analysis, and documentation support. Our experts have a 95% success rate for first-time applicants.

Our Comprehensive 8(a) Package Includes:
• Initial eligibility assessment and consultation
• Social disadvantage narrative development
• Business history and evolution documentation
• Economic disadvantage analysis and documentation
• Financial review and reconciliation
• Ownership and control documentation
• Corporate documents preparation
• SBA application portal submission
• SBA liaison and response support
• Post-certification compliance guidance

Why Choose Us:
• 95% first-time approval rate (vs. 60% national average)
• Former SBA officials on staff
• 500+ successful 8(a) certifications
• Average processing time: 90 days
• Fixed fee - no surprises`,
    price: 7500,
    priceUnit: "flat fee",
    categories: ["Certification", "8(a)", "Business Development"],
    naicsCodes: ["541512"],
    seller: "KDM & Associates",
    sellerId: "kdm-001",
    rating: 4.9,
    reviews: 63,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "6-8 weeks",
    deliveryMode: "Hybrid Service",
    deliveryModeDescription: "Virtual consulting with optional in-person strategy sessions",
    geographicServiceArea: ["National"],
    certifications: ["SBA 8(a) Certified", "MBE", "WBE"],
    serviceType: "consulting",
    location: "Washington, DC",
    features: [
      "95% first-time approval rate",
      "Former SBA officials on staff",
      "500+ successful certifications",
      "Fixed fee pricing",
      "SBA liaison support",
      "Post-certification guidance"
    ],
    documents: [
      { name: "8(a) Program Guide", url: "#" },
      { name: "Required Documents Checklist", url: "#" },
      { name: "Success Stories", url: "#" }
    ],
    readinessScore: 94
  },
  {
    id: "5",
    type: "service",
    title: "Federal Supply Schedule (GSA) Proposal",
    shortDescription: "Complete GSA Schedule proposal preparation and submission",
    description: `End-to-end GSA Schedule proposal support including schedule selection, pricing strategy, proposal development, and submission. We handle the complex requirements to get you on the GSA Schedule.

Our GSA Services:
• Schedule suitability analysis and selection
• Pre-market research and pricing strategy
• Technical proposal development
• Pricing proposal with Commercial Sales Practices
• Past performance documentation
• Small business subcontracting plan (if required)
• eOffer/eMod submission support
• GSA contracting officer negotiation support
• Post-award contract management setup

Benefits of GSA Schedule:
• Access to $45B+ federal marketplace
• Pre-negotiated terms and conditions
• Streamlined ordering process
• Preferred vendor status`,
    price: 12000,
    priceUnit: "flat fee",
    categories: ["GSA", "Procurement", "Government Contracts"],
    naicsCodes: ["541512"],
    seller: "Federal Procurement Experts",
    sellerId: "fpe-001",
    rating: 4.6,
    reviews: 28,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "8-12 weeks",
    deliveryMode: "Virtual Consulting",
    deliveryModeDescription: "100% remote delivery via video conferencing and collaboration tools",
    geographicServiceArea: ["National"],
    certifications: ["GSA Schedule Holder", "NCMA Certified"],
    serviceType: "consulting",
    location: "Arlington, VA",
    features: [
      "Former GSA COs on staff",
      "90% first-time award success",
      "Pricing strategy expertise",
      "eOffer submission support",
      "Negotiation representation",
      "Post-award support"
    ],
    documents: [
      { name: "GSA Schedule Guide", url: "#" },
      { name: "Pricing Strategy Template", url: "#" },
      { name: "Sample Proposal", url: "#" }
    ],
    readinessScore: 88
  },
  {
    id: "6",
    type: "subscription",
    title: "Consortium Membership - Core Capture",
    shortDescription: "Full marketplace access with AI matching and teaming tools",
    description: `Core Capture membership provides full access to the KDM Consortium marketplace, AI-powered opportunity matching, teaming partner recommendations, proposal collaboration tools, and 1-to-1 networking. Perfect for active government contractors.

Membership Benefits:
• Unlimited access to KDM Consortium marketplace
• AI-powered opportunity matching (federal, state, local)
• Teaming partner recommendations based on capability gaps
• Proposal workspace with collaboration tools
• Document library with templates and guides
• Weekly opportunity digest emails
• Monthly networking events (virtual)
• Quarterly in-person networking events
• 1-on-1 business development consultations
• Member-only educational webinars
• Proposal review support
• Capture management tools

Network Access:
• Connect with 500+ consortium members
• Direct messaging with teaming partners
• Member directory with advanced filtering
• Industry sector groups`,
    price: 1250,
    priceUnit: "per month",
    categories: ["Membership", "Consortium", "Networking"],
    naicsCodes: [],
    seller: "KDM Consortium",
    sellerId: "kdm-consortium-001",
    rating: 4.8,
    reviews: 156,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "Immediate",
    deliveryMode: "Digital Platform",
    deliveryModeDescription: "Online platform with virtual networking events and collaboration tools",
    geographicServiceArea: ["National"],
    featuresIncluded: [
      "AI opportunity matching",
      "Teaming partner recommendations",
      "Proposal collaboration workspace",
      "Document library access",
      "Weekly opportunity digests",
      "Monthly networking events",
      "Quarterly in-person events",
      "1-on-1 BD consultations",
      "Educational webinars",
      "Proposal review support",
      "Capture management tools",
      "500+ member network"
    ],
    documents: [
      { name: "Membership Guide", url: "#" },
      { name: "Platform User Manual", url: "#" },
      { name: "Success Stories", url: "#" }
    ]
  },
  {
    id: "7",
    type: "subscription",
    title: "Consortium Membership - Elite",
    shortDescription: "Marketplace listings and networking for established partners",
    description: `Elite membership includes marketplace listings, opportunity search, networking events, resource access, capability promotion, and consortium directory visibility. Ideal for established partners seeking selective engagement.

Elite Benefits:
• Enhanced directory listing with company profile
• Showcase capabilities and past performance
• Receive teaming inquiries from other members
• Monthly networking events (virtual)
• Quarterly in-person networking events
• Access to member-only resources
• Educational webinar access
• Opportunity alerts (limited)
• Basic proposal templates
• Email support

Perfect For:
• Established contractors seeking teaming partners
• Companies with strong past performance
• Businesses looking to expand federal footprint`,
    price: 500,
    priceUnit: "per month",
    categories: ["Membership", "Consortium", "Networking"],
    naicsCodes: [],
    seller: "KDM Consortium",
    sellerId: "kdm-consortium-001",
    rating: 4.5,
    reviews: 94,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "Immediate",
    deliveryMode: "Digital Platform",
    deliveryModeDescription: "Online platform with in-person networking events included",
    geographicServiceArea: ["National"],
    featuresIncluded: [
      "Enhanced directory listing",
      "Capability showcase",
      "Monthly networking events",
      "Quarterly in-person events",
      "Member resources access",
      "Educational webinars",
      "Opportunity alerts",
      "Email support"
    ],
    documents: [
      { name: "Membership Overview", url: "#" },
      { name: "Directory Listing Guide", url: "#" }
    ]
  },
  {
    id: "8",
    type: "service",
    title: "DoD Contract Manufacturing - Electronics Assembly",
    shortDescription: "IPC-A-610 Class 3 electronics assembly for military applications",
    description: `Military-grade electronics assembly with IPC-A-610 Class 3 certification. Services include PCB assembly, wire harness fabrication, and box build for DoD and aerospace applications. ITAR registered facility.

Capabilities:
• Surface mount and through-hole assembly
• BGA and fine-pitch component placement
• Conformal coating and potting
• Wire harness and cable assembly
• Box build and system integration
• Environmental testing (vibration, thermal)

Quality Standards:
• IPC-A-610 Class 3 certified
• J-STD-001 certified solderers
• ITAR registered and compliant
• Electrostatic discharge (ESD) controlled
• ISO 9001:2015 quality management

Our facility features three SMT lines, automated optical inspection (AOI), X-ray inspection, and functional testing capabilities. We support prototypes through full production volumes.`,
    price: 120,
    priceUnit: "per hour",
    categories: ["Manufacturing", "Electronics", "Assembly"],
    naicsCodes: ["334210", "334412"],
    seller: "Defense Electronics Corp",
    sellerId: "dec-001",
    rating: 4.7,
    reviews: 41,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "3-5 weeks",
    deliveryMode: "Physical Manufacturing",
    deliveryModeDescription: "Manufacturing at our ITAR-registered facility with secure shipping",
    geographicServiceArea: ["Midwest", "South"],
    certifications: ["IPC-A-610 Class 3", "ITAR", "CMMC Level 2", "ISO 9001"],
    serviceType: "manufacturing",
    location: "Huntsville, AL",
    facilityInfo: "25,000 sq ft electronics manufacturing facility with 3 SMT lines, AOI, X-ray inspection, and climate-controlled assembly areas",
    features: [
      "IPC-A-610 Class 3 certified",
      "ITAR registered facility",
      "3 SMT production lines",
      "Automated Optical Inspection (AOI)",
      "X-ray inspection capability",
      "Environmental testing lab"
    ],
    documents: [
      { name: "Electronics Capability Statement", url: "#" },
      { name: "Quality Certifications", url: "#" },
      { name: "Equipment List", url: "#" }
    ],
    readinessScore: 90
  },
  {
    id: "9",
    type: "product",
    title: "Automated RFP Processing System",
    shortDescription: "AI-powered RFP analysis and response generation",
    description: `Streamline your RFP response process with AI-powered document analysis, requirement extraction, compliance checking, and draft response generation. Reduce response time by 60% while improving quality and compliance.

Core Capabilities:
• Automatic requirement extraction and matrix generation
• Compliance checklist with pass/fail scoring
• Past performance matching and insertion
• Technical approach template generation
• Pricing strategy recommendations
• Risk identification and mitigation suggestions
• Writer assignment and workflow management
• Version control and collaboration tools

AI Features:
• Natural language processing for document analysis
• Machine learning for win theme identification
• Automated compliance checking against requirements
• Smart past performance matching
• Style and tone consistency checking

Integrations:
• SAM.gov and GovWin+IQ connectors
• SharePoint and Google Drive
• Salesforce and HubSpot CRM
• Microsoft Word and Adobe Acrobat
• Slack and Microsoft Teams`,
    price: 799,
    priceUnit: "per month",
    categories: ["AI Tools", "RFP", "Automation"],
    naicsCodes: ["541512"],
    seller: "KDM Platform",
    sellerId: "kdm-platform-001",
    rating: 4.6,
    reviews: 67,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "Immediate access",
    deliveryMode: "Digital SaaS",
    deliveryModeDescription: "Cloud-based AI platform with API integration available",
    geographicServiceArea: ["National"],
    sku: "RFP-AUTO-001",
    unitOfMeasure: "subscription",
    featuresIncluded: [
      "Unlimited RFP processing",
      "AI requirement extraction",
      "Compliance checking",
      "Past performance matching",
      "Technical template generation",
      "Collaboration workspace",
      "Version control",
      "CRM integration",
      "API access",
      "Priority support"
    ],
    documents: [
      { name: "RFP System Overview", url: "#" },
      { name: "Integration Guide", url: "#" },
      { name: "ROI Calculator", url: "#" }
    ]
  },
  {
    id: "10",
    type: "service",
    title: "HUBZone Certification Application",
    shortDescription: "Complete HUBZone certification application support",
    description: `Full HUBZone certification application preparation including eligibility verification, documentation support, and SBA liaison. Our experts ensure your application meets all requirements for successful certification.

HUBZone Program Benefits:
• 10% price evaluation preference
• Sole-source opportunities up to $7M
• Set-aside contracts
• Subcontracting opportunities with prime contractors
• Access to specialized SBA resources

Our Service Includes:
• Principal office location verification
• Employee residency analysis (35% rule)
• NAICS code eligibility review
• Application documentation preparation
• SBA portal submission
• SBA liaison and response management
• Annual recertification support

Requirements:
• Principal office in HUBZone
• 35% of employees living in HUBZone
• 25% of employees residing in any HUBZone
• Small business size standards`,
    price: 4500,
    priceUnit: "flat fee",
    categories: ["Certification", "HUBZone", "Business Development"],
    naicsCodes: ["541512"],
    seller: "KDM & Associates",
    sellerId: "kdm-001",
    rating: 4.8,
    reviews: 52,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "4-6 weeks",
    deliveryMode: "Virtual Consulting",
    deliveryModeDescription: "Remote application support with document sharing portal",
    geographicServiceArea: ["National"],
    certifications: ["HUBZone Certified"],
    serviceType: "consulting",
    location: "Washington, DC",
    features: [
      "HUBZone eligibility verification",
      "Employee residency analysis",
      "Application documentation",
      "SBA liaison support",
      "Annual recertification support",
      "Map tool for HUBZone verification"
    ],
    documents: [
      { name: "HUBZone Program Guide", url: "#" },
      { name: "Eligibility Checklist", url: "#" },
      { name: "Employee Verification Template", url: "#" }
    ],
    readinessScore: 85
  },
  {
    id: "11",
    type: "service",
    title: "Past Performance Documentation Package",
    shortDescription: "Comprehensive CPARS and past performance documentation development",
    description: `Develop compelling past performance documentation including CPARS summaries, case studies, and performance metrics. Our team helps you showcase your track record to win more federal contracts.

Our Services:
• CPARS (Contractor Performance Assessment Reports) review
• Past performance narrative development
• Relevant project identification and selection
• Performance metric quantification
• Customer reference coordination
• Case study development
• Past performance matrix creation
• SF330 Section E preparation
• Proposal past performance section writing

What You Get:
• 3-5 detailed past performance write-ups
• Quantified metrics and achievements
• Customer reference verification
• Relevance mapping to target opportunities
• Editable templates for future use
• SF330 compliant formatting

Best For:
• Companies new to federal contracting
• Firms with limited written past performance
• Businesses targeting larger contracts
• Contractors seeking to improve win rates`,
    price: 3500,
    priceUnit: "flat fee",
    categories: ["Past Performance", "Marketing", "Proposals"],
    naicsCodes: ["541512"],
    seller: "Proposal Excellence Group",
    sellerId: "peg-001",
    rating: 4.5,
    reviews: 38,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "2-3 weeks",
    deliveryMode: "Virtual Consulting",
    deliveryModeDescription: "Collaborative document creation via cloud workspace",
    geographicServiceArea: ["National"],
    certifications: ["APMP Certified"],
    serviceType: "consulting",
    location: "Alexandria, VA",
    features: [
      "CPARS review and analysis",
      "Narrative development",
      "Metric quantification",
      "Customer reference coordination",
      "SF330 formatting",
      "Editable templates included"
    ],
    documents: [
      { name: "Past Performance Guide", url: "#" },
      { name: "Sample Write-ups", url: "#" },
      { name: "Template Library", url: "#" }
    ],
    readinessScore: 82
  },
  {
    id: "12",
    type: "subscription",
    title: "E2G Manufacturing Readiness Program",
    shortDescription: "Comprehensive training for manufacturers entering government contracting",
    description: `12-week intensive program covering government contracting fundamentals, CMMC compliance, proposal development, and contract management. Includes mentorship, templates, and certification preparation support.

Program Curriculum:
Week 1-2: Government Contracting Fundamentals
• Federal acquisition regulations (FAR)
• Contract types and vehicles
• SAM registration and certification
• Small business programs (8(a), HUBZone, WOSB)

Week 3-4: Market Research & Opportunity Identification
• SAM.gov and other opportunity sources
• Agency research and relationship building
• NAICS codes and size standards
• Competitive analysis

Week 5-6: Compliance & Certifications
• CMMC requirements and preparation
• ITAR and export controls
• ISO standards for government work
• Quality management systems

Week 7-8: Proposal Development
• Proposal process and best practices
• Technical approach development
• Past performance documentation
• Pricing strategy and cost buildup

Week 9-10: Contract Management
• Contract negotiation
• Performance management
• DCAA audits and compliance
• Invoice and payment processes

Week 11-12: Growth & Capture
• Teaming and subcontracting
• GWACs and IDIQ vehicles
• Recertification and compliance
• Strategic planning`,
    price: 2500,
    priceUnit: "one-time",
    categories: ["Training", "Manufacturing", "E2G"],
    naicsCodes: ["332710", "332720"],
    seller: "KDM Academy",
    sellerId: "kdm-academy-001",
    rating: 4.9,
    reviews: 124,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop"
    ],
    deliveryTimeline: "12 weeks",
    deliveryMode: "Structured Training",
    deliveryModeDescription: "Live virtual classes with recorded sessions and 1-on-1 mentorship",
    geographicServiceArea: ["National"],
    certifications: ["Continuing Education Units (CEUs)"],
    featuresIncluded: [
      "24 hours of live instruction",
      "Recorded session access",
      "1-on-1 mentorship",
      "Proposal templates",
      "Compliance checklists",
      "SAM registration guide",
      "CMMC preparation toolkit",
      "Networking with cohort",
      "Certificate of completion",
      "Alumni network access"
    ],
    documents: [
      { name: "Program Syllabus", url: "#" },
      { name: "Instructor Bios", url: "#" },
      { name: "Alumni Success Stories", url: "#" }
    ]
  }
];
