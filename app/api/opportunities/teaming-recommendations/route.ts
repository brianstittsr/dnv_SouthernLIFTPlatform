import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { 
  GetTeamingRecommendationsRequest, 
  GetTeamingRecommendationsResponse,
  TeamingRecommendation 
} from '@/lib/teaming-schema';

// Mock data for demonstration
const mockRecommendations: TeamingRecommendation[] = [
  {
    id: 'rec_1',
    userId: 'user_1',
    companyId: 'comp_1',
    companyName: 'TechSolutions Inc.',
    matchScore: 92,
    matchReasons: [
      { type: 'naics_alignment', description: 'Primary NAICS codes match exactly', weight: 0.4 },
      { type: 'capability_complement', description: 'Complementary cybersecurity capabilities', weight: 0.3 },
      { type: 'past_performance', description: 'Strong past performance with DoD', weight: 0.2 },
      { type: 'certification', description: 'CMMC Level 2 certified', weight: 0.1 },
    ],
    sharedCapabilities: ['Cybersecurity', 'Network Security', 'Risk Assessment'],
    complementaryCapabilities: ['Cloud Security', 'Penetration Testing', 'Compliance Auditing'],
    missingCapabilities: [],
    naicsAlignment: {
      primaryMatches: ['541512', '541513'],
      secondaryMatches: ['541519'],
      alignmentScore: 95,
    },
    pastPerformance: [
      {
        contractId: 'ctr_1',
        contractTitle: 'DoD Network Security Enhancement',
        agency: 'Department of Defense',
        contractValue: 2500000,
        completedDate: Timestamp.fromDate(new Date('2024-03-15')),
        rating: 5,
        naicsCodes: ['541512', '541513'],
      },
      {
        contractId: 'ctr_2',
        contractTitle: 'Federal Agency Cyber Audit',
        agency: 'Department of Homeland Security',
        contractValue: 875000,
        completedDate: Timestamp.fromDate(new Date('2024-01-20')),
        rating: 4,
        naicsCodes: ['541512'],
      },
    ],
    averageRating: 4.5,
    contactInfo: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'CEO',
      email: 'sarah.johnson@techsolutions.com',
      phone: '(555) 123-4567',
      location: 'Arlington, VA',
      linkedIn: 'linkedin.com/in/sarahjohnson',
    },
    certifications: [
      {
        id: 'cert_1',
        type: 'CMMC',
        level: 'Level 2',
        issuedBy: 'C3PAO',
        issuedDate: Timestamp.fromDate(new Date('2023-06-01')),
        expiryDate: Timestamp.fromDate(new Date('2026-06-01')),
      },
      {
        id: 'cert_2',
        type: 'ISO 27001',
        issuedBy: 'ISO',
        issuedDate: Timestamp.fromDate(new Date('2022-09-15')),
        expiryDate: Timestamp.fromDate(new Date('2025-09-15')),
      },
    ],
    teamingPreferences: {
      willingToPrime: true,
      willingToSub: true,
      seekingPartners: true,
      preferredContractTypes: ['Firm Fixed Price', 'Cost Plus'],
      preferredRegions: ['National', 'Mid-Atlantic'],
      preferredContractSizes: ['medium', 'large'],
      setAsidePreferences: ['8(a)', 'SDVOSB'],
    },
    isAvailable: true,
    currentPartnerships: 2,
    maxPartnerships: 5,
    recommendedAt: Timestamp.now(),
    opportunityId: 'opp_1',
  },
  {
    id: 'rec_2',
    userId: 'user_2',
    companyId: 'comp_2',
    companyName: 'Defense Contractors LLC',
    matchScore: 85,
    matchReasons: [
      { type: 'naics_alignment', description: 'Secondary NAICS codes align', weight: 0.35 },
      { type: 'capability_complement', description: 'Strong project management capabilities', weight: 0.35 },
      { type: 'past_performance', description: 'Experience with federal contracts', weight: 0.2 },
      { type: 'location', description: 'Located in target region', weight: 0.1 },
    ],
    sharedCapabilities: ['Project Management', 'Quality Assurance'],
    complementaryCapabilities: ['Systems Engineering', 'Logistics Support', 'Training'],
    missingCapabilities: ['Cybersecurity'],
    naicsAlignment: {
      primaryMatches: ['541513'],
      secondaryMatches: ['541512', '541519'],
      alignmentScore: 80,
    },
    pastPerformance: [
      {
        contractId: 'ctr_3',
        contractTitle: 'Army Systems Integration',
        agency: 'Department of the Army',
        contractValue: 1800000,
        completedDate: Timestamp.fromDate(new Date('2024-02-28')),
        rating: 4,
        naicsCodes: ['541513'],
      },
    ],
    averageRating: 4.0,
    contactInfo: {
      firstName: 'Michael',
      lastName: 'Chen',
      title: 'VP of Operations',
      email: 'michael.chen@defensecontractors.com',
      phone: '(555) 234-5678',
      location: 'Washington, DC',
    },
    certifications: [
      {
        id: 'cert_3',
        type: 'PMP',
        issuedBy: 'PMI',
        issuedDate: Timestamp.fromDate(new Date('2021-04-10')),
      },
    ],
    teamingPreferences: {
      willingToPrime: false,
      willingToSub: true,
      seekingPartners: true,
      preferredContractTypes: ['Time & Materials'],
      preferredRegions: ['National'],
      preferredContractSizes: ['medium'],
      setAsidePreferences: ['HUBZone'],
    },
    isAvailable: true,
    currentPartnerships: 3,
    maxPartnerships: 4,
    recommendedAt: Timestamp.now(),
    opportunityId: 'opp_1',
  },
  {
    id: 'rec_3',
    userId: 'user_3',
    companyId: 'comp_3',
    companyName: 'Innovative Solutions Group',
    matchScore: 78,
    matchReasons: [
      { type: 'naics_alignment', description: 'Partial NAICS alignment', weight: 0.3 },
      { type: 'capability_complement', description: 'Complementary software development', weight: 0.4 },
      { type: 'certification', description: '8(a) certified', weight: 0.2 },
      { type: 'past_performance', description: 'Growing federal portfolio', weight: 0.1 },
    ],
    sharedCapabilities: ['Software Development', 'Data Analytics'],
    complementaryCapabilities: ['Mobile Development', 'AI/ML', 'Cloud Architecture'],
    missingCapabilities: ['Network Security'],
    naicsAlignment: {
      primaryMatches: ['541519'],
      secondaryMatches: ['541512'],
      alignmentScore: 70,
    },
    pastPerformance: [
      {
        contractId: 'ctr_4',
        contractTitle: 'VA Data Analytics Platform',
        agency: 'Department of Veterans Affairs',
        contractValue: 650000,
        completedDate: Timestamp.fromDate(new Date('2024-04-10')),
        rating: 5,
        naicsCodes: ['541519'],
      },
    ],
    averageRating: 5.0,
    contactInfo: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      title: 'Founder & CEO',
      email: 'emily.rodriguez@innovativesolutions.com',
      phone: '(555) 345-6789',
      location: 'Bethesda, MD',
    },
    certifications: [
      {
        id: 'cert_4',
        type: '8(a)',
        issuedBy: 'SBA',
        issuedDate: Timestamp.fromDate(new Date('2020-08-01')),
        expiryDate: Timestamp.fromDate(new Date('2030-08-01')),
      },
      {
        id: 'cert_5',
        type: 'WOSB',
        issuedBy: 'SBA',
        issuedDate: Timestamp.fromDate(new Date('2020-08-01')),
      },
    ],
    teamingPreferences: {
      willingToPrime: true,
      willingToSub: true,
      seekingPartners: true,
      preferredContractTypes: ['Firm Fixed Price'],
      preferredRegions: ['Mid-Atlantic', 'Northeast'],
      preferredContractSizes: ['small', 'medium'],
      setAsidePreferences: ['8(a)', 'WOSB'],
    },
    isAvailable: true,
    currentPartnerships: 1,
    maxPartnerships: 3,
    recommendedAt: Timestamp.now(),
    opportunityId: 'opp_1',
  },
];

export async function POST(req: NextRequest) {
  try {
    const body: GetTeamingRecommendationsRequest = await req.json();
    
    // In production, this would query Firestore and use AI for matching
    // For now, return mock data
    let filteredRecommendations = [...mockRecommendations];
    
    // Apply filters if provided
    if (body.naicsCodes && body.naicsCodes.length > 0) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.naicsAlignment.primaryMatches.some(code => 
          body.naicsCodes!.includes(code)
        )
      );
    }
    
    if (body.region) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.teamingPreferences.preferredRegions.includes(body.region!) ||
        rec.contactInfo.location?.toLowerCase().includes(body.region!.toLowerCase())
      );
    }
    
    if (body.limit) {
      filteredRecommendations = filteredRecommendations.slice(0, body.limit);
    }
    
    const response: GetTeamingRecommendationsResponse = {
      recommendedPartners: filteredRecommendations,
      opportunity: body.opportunityId ? {
        id: body.opportunityId,
        title: 'Cybersecurity Services for Federal Agency',
        agency: 'Department of Defense',
        deadline: '2024-07-15',
        naicsCodes: ['541512', '541513'],
      } : undefined,
      totalResults: filteredRecommendations.length,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching teaming recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teaming recommendations' },
      { status: 500 }
    );
  }
}
