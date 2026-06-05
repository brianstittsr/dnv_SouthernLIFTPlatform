import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { 
  SendTeamingInvitationRequest, 
  SendTeamingInvitationResponse,
  TeamingPartnership,
  TeamingRequest 
} from '@/lib/teaming-schema';

export async function POST(req: NextRequest) {
  try {
    const body: SendTeamingInvitationRequest = await req.json();
    
    // Validate required fields
    if (!body.recipientId || !body.recipientCompanyId || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, recipientCompanyId, message' },
        { status: 400 }
      );
    }
    
    // Generate partnership ID
    const partnershipId = `partnership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create partnership record
    const partnership: Omit<TeamingPartnership, 'id'> = {
      partnershipId,
      status: 'invitation_sent',
      initiatorId: 'current_user_id', // Would come from auth
      initiatorCompanyId: 'current_company_id', // Would come from auth
      partnerId: body.recipientId,
      partnerCompanyId: body.recipientCompanyId,
      opportunityId: body.opportunityId,
      opportunityTitle: body.opportunityId ? 'Mock Opportunity Title' : undefined,
      naicsCodes: ['541512', '541513'], // Would come from opportunity
      matchScore: 85,
      role: body.role,
      agreementType: body.agreementType,
      proposedSplit: body.proposedSplit,
      messages: [],
      lastActivityAt: Timestamp.now(),
      initiatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'current_user_id',
    };
    
    // Create request record
    const request: Omit<TeamingRequest, 'id'> = {
      partnershipId,
      requesterId: 'current_user_id',
      requesterCompanyId: 'current_company_id',
      recipientId: body.recipientId,
      recipientCompanyId: body.recipientCompanyId,
      opportunityId: body.opportunityId,
      opportunityTitle: body.opportunityId ? 'Mock Opportunity Title' : undefined,
      role: body.role,
      proposedAgreement: body.agreementType,
      message: body.message,
      proposedSplit: body.proposedSplit,
      status: 'invitation_sent',
      sentAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // In production, save to Firestore
    // const partnershipRef = await addDoc(collection(db, 'teaming_partnerships'), partnership);
    // const requestRef = await addDoc(collection(db, 'teaming_requests'), request);
    
    const response: SendTeamingInvitationResponse = {
      partnershipId,
      requestId,
      status: 'invitation_sent',
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending teaming invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send teaming invitation' },
      { status: 500 }
    );
  }
}
