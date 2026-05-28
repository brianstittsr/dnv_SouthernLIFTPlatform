import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const slug = "kdm-consortium-hubzone-council-digital-ecosystem";

    // Delete any existing docs with this slug from both collections
    const existingInPressReleases = await db.collection('pressReleases')
      .where('slug', '==', slug)
      .get();
    for (const doc of existingInPressReleases.docs) {
      await doc.ref.delete();
    }

    const existingInWrongCollection = await db.collection('press_releases')
      .where('slug', '==', slug)
      .get();
    for (const doc of existingInWrongCollection.docs) {
      await doc.ref.delete();
    }

    const pressReleaseData = {
      title: "KDM Consortium and HUBZone Contractors National Council Launch A Whole of Government Team Approach to Build National HUBZone Digital Ecosystem To Accelerate Small Business Success, Strengthen the 2026 National HUBZone Conference, and Drive Long-Term Manufacturing Modernization and Federal Contracting Opportunities",
      subtitle: "Major strategic collaboration establishes centralized digital ecosystem platform to consolidate capabilities, resources, and partnerships across the HUBZone community",
      location: "ALEXANDRIA, Va.",
      releaseDate: Timestamp.fromDate(new Date('2026-05-26')),
      content: `ALEXANDRIA, Va., May 26, 2026 — The KDM Consortium and the HUBZone Contractors National Council today announced a major strategic collaboration to launch A Whole of Government Team Approach. The initiative establishes a centralized digital ecosystem platform designed to consolidate capabilities, resources, and partnerships across the HUBZone community — significantly enhancing small business competitiveness in federal contracting while supporting national manufacturing and supply chain resilience priorities.

This new platform will serve as a single, secure hub for company capabilities and past performance data, executive profiles, technology demonstrations, matchmaking and teaming requests, needs assessments, and barrier identification. By replacing fragmented processes with a scalable infrastructure, the ecosystem platform will directly support immediate priorities while laying the foundation for a robust, sustainable national ecosystem.

"The launch of the 5 Pillar focused digital platform and collaboration strategy" said Keith Moore, CEO of KDM & Associates and Chair of the KDM Consortium creates the infrastructure to bring every relevant stakeholder to the table — manufacturers, technology providers, educational institutions, workforce organizations, and strategic partners — empowering HUBZone businesses to thrive and contribute to America's industrial base modernization."

The collaboration is focused on two critical near-term objectives:

• Producing a compelling campaign to grow American small businesses focused on U.S. Manufacturing, Critical Minerals, Defense Contracting, CMMC compliance, Access to Capital, and Opportunity Zones.

• Delivering an impactful 2026 National HUBZone Conference, scheduled for July 21–22 in Chantilly, Virginia, through enhanced matchmaking, industry working groups, technology showcases, and sponsorship opportunities.

Future Vision

Once fully operational, the platform will evolve into the core digital backbone for the integrated KDM Consortium and HUBZone Council ecosystem. It will enable advanced business intelligence, ongoing training and webinar programs, dynamic company directories, and expanded public-private collaboration opportunities.

HUBZone-certified businesses, manufacturers, primes, nonprofits, educational institutions, and community partners are invited to participate in this initiative. Broad engagement will directly strengthen the nation's small business supply chain and elevate the upcoming national conference while accelerating the development of long-term infrastructure to drive job creation and economic growth in historically underutilized areas.`,
      boilerplate: `About the KDM Consortium and KDM & Associates

Led by Keith Moore, KDM & Associates is a leader in government affairs, small business advocacy, and federal contracting support. The KDM Consortium functions as a dynamic teaming ecosystem that connects HUBZone and small manufacturers with federal agencies, prime contractors, and critical supply chain opportunities. To become a member of the KDM Consortium, visit www.kdm-assoc.com to sign up.

About the HUBZone Contractors National Council

Founded in 2000, the HUBZone Contractors National Council is a 501(c)(6) nonprofit trade association serving as the unified voice for 4,500 HUBZone-certified small businesses. The Council advocates for policies that expand market access, creates networking and training opportunities, and hosts the annual National HUBZone Conference to drive economic revitalization in historically underutilized communities. To sign up for the HUBZone conference and receive a 15% discount on conference admission, visit www.kdm-assoc.com

Media Contact:

Keith Moore
CEO, KDM & Associates | Chair, KDM Consortium
kmoore@kdm-assoc.com | (609) 206-1440`,
      contactInfo: {
        name: "Keith Moore",
        email: "kmoore@kdm-assoc.com",
        phone: "(609) 206-1440",
        title: "CEO, KDM & Associates | Chair, KDM Consortium"
      },
      logos: [],
      attachments: [],
      tags: ["HUBZone", "Digital Ecosystem", "Small Business", "Federal Contracting", "Manufacturing", "Partnership"],
      category: "Partnership",
      status: "published",
      seoTitle: "KDM Consortium and HUBZone Council Launch Digital Ecosystem for Small Business Success",
      seoDescription: "Major strategic collaboration establishes centralized digital ecosystem platform to consolidate capabilities across the HUBZone community and enhance federal contracting competitiveness.",
      slug: slug,
      createdBy: "admin",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: Timestamp.now(),
      featured: true
    };

    const docRef = await db.collection('pressReleases').add(pressReleaseData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Press release force-added successfully',
      deletedFromPressReleases: existingInPressReleases.size,
      deletedFromPress_releases: existingInWrongCollection.size,
    });
  } catch (error) {
    console.error('Error force-adding press release:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add press release' },
      { status: 500 }
    );
  }
}
