import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Verify user authentication
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's business profile
    const profileSnapshot = await db.collection('businessProfiles').where('userId', '==', userId).get();
    if (profileSnapshot.empty) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
    }

    const profile = profileSnapshot.docs[0].data();
    const userNAICSCodes = profile.naicsCodes || [];

    // Get opportunities matching user's NAICS codes
    const opportunitiesRef = db.collection('opportunities');
    const matchedOpportunities: any[] = [];

    for (const naics of userNAICSCodes) {
      const snapshot = await opportunitiesRef
        .where('naicsCodes', 'array-contains', naics.code)
        .where('status', '==', 'active')
        .orderBy('postedDate', 'desc')
        .limit(20)
        .get();

      snapshot.docs.forEach(doc => {
        const opportunity = doc.data();
        const existingIndex = matchedOpportunities.findIndex(o => o.id === doc.id);
        
        if (existingIndex === -1) {
          // Calculate match score based on NAICS alignment
          const matchScore = calculateMatchScore(userNAICSCodes, opportunity.naicsCodes || []);
          
          matchedOpportunities.push({
            id: doc.id,
            ...opportunity,
            matchScore,
            matchReasons: getMatchReasons(userNAICSCodes, opportunity.naicsCodes || []),
            status: 'new'
          });
        }
      });
    }

    // Sort by match score and posted date
    matchedOpportunities.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.postedDate.toDate() - a.postedDate.toDate();
    });

    // Update or create opportunity matches
    for (const opportunity of matchedOpportunities) {
      const matchRef = db.collection('opportunityMatches')
        .where('userId', '==', userId)
        .where('opportunityId', '==', opportunity.id)
        .limit(1);

      const existingMatch = await matchRef.get();
      
      if (existingMatch.empty) {
        await db.collection('opportunityMatches').add({
          userId,
          opportunityId: opportunity.id,
          matchScore: opportunity.matchScore,
          matchReasons: opportunity.matchReasons,
          status: 'new',
          matchedAt: new Date()
        });
      }
    }

    return NextResponse.json({
      opportunities: matchedOpportunities.slice(0, 50), // Limit to 50 most relevant
      totalMatches: matchedOpportunities.length
    });

  } catch (error) {
    console.error('Error fetching matched opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

function calculateMatchScore(userNAICS: any[], opportunityNAICS: string[]): number {
  let score = 0;
  const userPrimaryCodes = userNAICS.filter(n => n.relevance === 'primary').map(n => n.code);
  const userSecondaryCodes = userNAICS.filter(n => n.relevance === 'secondary').map(n => n.code);

  // Primary NAICS matches get higher score
  opportunityNAICS.forEach(code => {
    if (userPrimaryCodes.includes(code)) {
      score += 100;
    } else if (userSecondaryCodes.includes(code)) {
      score += 50;
    }
  });

  // Bonus for experience
  const experienceBonus = userNAICS.reduce((bonus, naics) => {
    if (opportunityNAICS.includes(naics.code)) {
      return bonus + Math.min(naics.experience * 5, 25); // Max 25 points per NAICS
    }
    return bonus;
  }, 0);

  return Math.min(score + experienceBonus, 100); // Cap at 100
}

function getMatchReasons(userNAICS: any[], opportunityNAICS: string[]): string[] {
  const reasons: string[] = [];
  const userPrimaryCodes = userNAICS.filter(n => n.relevance === 'primary').map(n => n.code);
  const userSecondaryCodes = userNAICS.filter(n => n.relevance === 'secondary').map(n => n.code);

  opportunityNAICS.forEach(code => {
    const userCode = userNAICS.find(n => n.code === code);
    if (userCode) {
      if (userPrimaryCodes.includes(code)) {
        reasons.push(`Primary expertise in ${userCode.description}`);
      } else {
        reasons.push(`Secondary capability in ${userCode.description}`);
      }
      
      if (userCode.experience > 5) {
        reasons.push(`${userCode.experience} years experience in ${userCode.description}`);
      }
    }
  });

  return reasons.slice(0, 3); // Limit to top 3 reasons
}
