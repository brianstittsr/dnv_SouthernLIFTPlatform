import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // For now, we'll use the Firestore REST API to create collections
    // This bypasses the security rules for initial setup
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Firebase project ID not configured' },
        { status: 500 }
      );
    }

    const collections = [
      { name: 'platformSettings', docId: 'global', data: { navigationSettings: { hiddenItems: [], roleVisibility: {} } } },
      { name: 'teamMembers', docId: '_placeholder', data: { _placeholder: true, note: 'Delete after adding real team members' } },
      { name: 'memberships', docId: '_placeholder', data: { _placeholder: true, note: 'Delete after adding real memberships' } },
      { name: 'proofPacks', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'smeSubscriptions', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'partnerLeads', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'partnerIntroductions', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'partnerRevenue', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'buyerRequests', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'qaReviews', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'cmmcCohorts', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'cohortEnrollments', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'curriculumMaterials', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'page_designs', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'page_design_history', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'page_layout_templates', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'page_ai_conversations', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'page_ux_reviews', docId: '_placeholder', data: { _placeholder: true } },
      { name: 'platformAuditLogs', docId: '_placeholder', data: { _placeholder: true } },
    ];

    const results = [];
    const token = authorization.replace('Bearer ', '');

    for (const col of collections) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col.name}?documentId=${col.docId}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              ...Object.entries(col.data).reduce((acc, [key, value]) => {
                acc[key] = typeof value === 'string' 
                  ? { stringValue: value }
                  : typeof value === 'boolean'
                  ? { booleanValue: value }
                  : { mapValue: { fields: {} } };
                return acc;
              }, {} as any),
              createdAt: { timestampValue: new Date().toISOString() },
              updatedAt: { timestampValue: new Date().toISOString() },
            }
          }),
        });

        if (response.ok) {
          results.push({ collection: col.name, status: 'success' });
        } else {
          const error = await response.text();
          results.push({ collection: col.name, status: 'error', error });
        }
      } catch (error: any) {
        results.push({ collection: col.name, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
