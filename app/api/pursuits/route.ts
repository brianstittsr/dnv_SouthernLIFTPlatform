/**
 * Pursuit Briefs API Route
 * 
 * Handles CRUD operations for KDM Consortium pursuit briefs (opportunity matching)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS, PursuitBriefDoc } from '@/lib/schema';
import { sendTemplatedEmail } from '@/lib/email';

/**
 * GET /api/pursuits
 * Retrieve pursuit briefs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const agency = searchParams.get('agency');
    const capability = searchParams.get('capability');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const pursuitsRef = collection(db, COLLECTIONS.PURSUIT_BRIEFS);
    let constraints: any[] = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (agency) {
      constraints.push(where('agency', '==', agency));
    }

    constraints.push(orderBy('publishedAt', 'desc'));

    const q = query(pursuitsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let pursuits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by capability if specified (array-contains doesn't work with other where clauses)
    if (capability) {
      pursuits = pursuits.filter((p: any) => 
        p.requiredCapabilities?.includes(capability)
      );
    }

    return NextResponse.json({ pursuits });
  } catch (error: any) {
    console.error('Error fetching pursuits:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pursuits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pursuits
 * Create a new pursuit brief
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      opportunityId,
      title,
      description,
      agency,
      naicsCode,
      setAside,
      estimatedValue,
      dueDate,
      requiredCapabilities = [],
      requiredCompliance = [],
      geographicPreference,
      solicitation,
      publishedBy,
      notifyMembers = false
    } = body;

    if (!title || !agency || !dueDate || estimatedValue === undefined) {
      return NextResponse.json(
        { error: 'title, agency, dueDate, and estimatedValue are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const pursuitData: Omit<PursuitBriefDoc, 'id'> = {
      opportunityId,
      title,
      description: description || '',
      agency,
      naicsCode: naicsCode || '',
      setAside,
      estimatedValue,
      dueDate: Timestamp.fromDate(new Date(dueDate)),
      requiredCapabilities,
      requiredCompliance,
      geographicPreference,
      status: 'published',
      teamMembers: [],
      interestedMembers: [],
      publishedAt: Timestamp.now(),
      publishedBy: publishedBy || 'system',
      solicitation,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const pursuitsRef = collection(db, COLLECTIONS.PURSUIT_BRIEFS);
    const docRef = await addDoc(pursuitsRef, pursuitData);

    // Notify members if requested
    if (notifyMembers) {
      try {
        // Get active members with matching capabilities
        const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
        const membersQuery = query(
          membershipsRef,
          where('status', '==', 'active')
        );
        const membersSnapshot = await getDocs(membersQuery);

        const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
        
        // Send notifications (in production, this should be queued)
        for (const memberDoc of membersSnapshot.docs) {
          const memberData = memberDoc.data();
          // Get user email from users collection
          const userRef = doc(db, COLLECTIONS.USERS, memberData.userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            await sendTemplatedEmail('newPursuitBrief', userData.email, {
              name: userData.name || 'Member',
              pursuitTitle: title,
              agency,
              dueDate: new Date(dueDate).toLocaleDateString(),
              estimatedValue,
              pursuitUrl: `${baseUrl}/portal/pursuits/${docRef.id}`,
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending pursuit notifications:', emailError);
        // Don't fail the request if notifications fail
      }
    }

    return NextResponse.json({
      pursuitId: docRef.id,
      message: 'Pursuit brief created successfully'
    });
  } catch (error: any) {
    console.error('Error creating pursuit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pursuit' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pursuits
 * Update a pursuit brief
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pursuitId, ...updates } = body;

    if (!pursuitId) {
      return NextResponse.json(
        { error: 'pursuitId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const pursuitRef = doc(db, COLLECTIONS.PURSUIT_BRIEFS, pursuitId);
    const pursuitSnap = await getDoc(pursuitRef);

    if (!pursuitSnap.exists()) {
      return NextResponse.json(
        { error: 'Pursuit not found' },
        { status: 404 }
      );
    }

    // Convert date strings to Timestamps
    const processedUpdates: any = { ...updates };
    if (updates.dueDate) {
      processedUpdates.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
    }
    if (updates.publishedAt) {
      processedUpdates.publishedAt = Timestamp.fromDate(new Date(updates.publishedAt));
    }

    await updateDoc(pursuitRef, {
      ...processedUpdates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      pursuitId 
    });
  } catch (error: any) {
    console.error('Error updating pursuit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update pursuit' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pursuits
 * Express interest or join team for a pursuit
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pursuitId, action, userId } = body;

    if (!pursuitId || !action || !userId) {
      return NextResponse.json(
        { error: 'pursuitId, action, and userId are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const pursuitRef = doc(db, COLLECTIONS.PURSUIT_BRIEFS, pursuitId);
    const pursuitSnap = await getDoc(pursuitRef);

    if (!pursuitSnap.exists()) {
      return NextResponse.json(
        { error: 'Pursuit not found' },
        { status: 404 }
      );
    }

    const pursuitData = pursuitSnap.data();

    switch (action) {
      case 'express-interest':
        if (pursuitData.interestedMembers?.includes(userId)) {
          return NextResponse.json(
            { error: 'Already expressed interest' },
            { status: 400 }
          );
        }
        await updateDoc(pursuitRef, {
          interestedMembers: [...(pursuitData.interestedMembers || []), userId],
          updatedAt: Timestamp.now(),
        });
        break;

      case 'withdraw-interest':
        await updateDoc(pursuitRef, {
          interestedMembers: (pursuitData.interestedMembers || []).filter((id: string) => id !== userId),
          updatedAt: Timestamp.now(),
        });
        break;

      case 'add-to-team':
        if (pursuitData.teamMembers?.includes(userId)) {
          return NextResponse.json(
            { error: 'Already on team' },
            { status: 400 }
          );
        }
        await updateDoc(pursuitRef, {
          teamMembers: [...(pursuitData.teamMembers || []), userId],
          status: pursuitData.status === 'published' ? 'team-forming' : pursuitData.status,
          updatedAt: Timestamp.now(),
        });
        break;

      case 'remove-from-team':
        await updateDoc(pursuitRef, {
          teamMembers: (pursuitData.teamMembers || []).filter((id: string) => id !== userId),
          updatedAt: Timestamp.now(),
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "express-interest", "withdraw-interest", "add-to-team", or "remove-from-team"' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true,
      pursuitId,
      action 
    });
  } catch (error: any) {
    console.error('Error updating pursuit membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update pursuit' },
      { status: 500 }
    );
  }
}
