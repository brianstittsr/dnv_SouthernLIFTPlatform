import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import type { 
  SubscriptionLead, 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  LeadListItem,
  LeadFilterOptions,
  LeadEmailData 
} from "./types";
import { pushLeadToSVP } from "./svp-api";

const LEADS_COLLECTION = "subscriptionLeads";

/**
 * Create a new subscription lead and push to SVP
 */
export async function createSubscriptionLead(
  request: CreateLeadRequest & { 
    email: string;
    companyName: string;
    industry: string;
    userType: "sme" | "buyer";
    roleTag: string;
  }
): Promise<SubscriptionLead> {
  const now = new Date().toISOString();
  
  const tierNames: Record<string, string> = {
    diy: "DIY (Do It Yourself)",
    dwy: "DWY (Done With You)",
    dfy: "DFY (Done For You)",
  };

  const tierPrices: Record<string, number> = {
    diy: 99,
    dwy: 299,
    dfy: 599,
  };

  const lead: Omit<SubscriptionLead, "id"> = {
    userId: request.userId,
    email: request.email,
    companyName: request.companyName,
    industry: request.industry,
    userType: request.userType,
    roleTag: request.roleTag,
    tier: request.tier,
    tierName: tierNames[request.tier],
    price: tierPrices[request.tier],
    subscriptionStatus: "pending",
    contactInfo: {},
    status: "new",
    source: request.source || "subscription_checkout",
    priority: request.tier === "dfy" ? "high" : request.tier === "dwy" ? "medium" : "low",
    proofPackContext: request.proofPackContext,
    svpSync: {
      syncStatus: "pending",
    },
    followUp: {
      emailsSent: 0,
      notes: [],
    },
    createdAt: now,
    updatedAt: now,
  };

  // Save to Firestore
  const docRef = await db.collection(LEADS_COLLECTION).add(lead);
  const leadWithId: SubscriptionLead = { ...lead, id: docRef.id };

  // Push to SVP
  const svpResult = await pushLeadToSVP(leadWithId);
  
  // Update sync status
  await docRef.update({
    "svpSync.pushedAt": svpResult.success ? now : null,
    "svpSync.svpLeadId": svpResult.leadId || null,
    "svpSync.syncStatus": svpResult.success ? "synced" : "failed",
    "svpSync.errorMessage": svpResult.error || null,
    updatedAt: now,
  });

  // Send notification email to nel@strategicvalueplus.com
  await sendLeadNotificationEmail(leadWithId);

  return {
    ...leadWithId,
    svpSync: {
      ...leadWithId.svpSync,
      pushedAt: svpResult.success ? now : undefined,
      svpLeadId: svpResult.leadId,
      syncStatus: svpResult.success ? "synced" : "failed",
      errorMessage: svpResult.error,
    },
  };
}

/**
 * Send lead notification email to Strategic Value Plus
 */
async function sendLeadNotificationEmail(lead: SubscriptionLead): Promise<void> {
  try {
    const emailData: LeadEmailData = {
      leadId: lead.id,
      companyName: lead.companyName,
      contactEmail: lead.email,
      tier: lead.tier,
      tierName: lead.tierName,
      price: lead.price,
      industry: lead.industry,
      userType: lead.userType === "sme" ? "SME / Supplier" : "Buyer / Government",
      proofPackHealth: lead.proofPackContext?.packHealth,
      capabilities: lead.proofPackContext?.capabilities,
      certifications: lead.proofPackContext?.certifications,
      createdAt: lead.createdAt,
    };

    const htmlBody = generateLeadEmailHTML(emailData);
    const textBody = generateLeadEmailText(emailData);

    await db.collection("emailQueue").add({
      to: ["nel@strategicvalueplus.com"],
      cc: ["kmoore@kdm-assoc.com"],
      subject: `New ${lead.tierName} Subscription Lead - ${lead.companyName}`,
      body: htmlBody,
      textBody: textBody,
      metadata: {
        leadId: lead.id,
        tier: lead.tier,
        source: "subscription_lead_notification",
      },
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Update follow-up tracking
    await db.collection(LEADS_COLLECTION).doc(lead.id).update({
      "followUp.emailsSent": 1,
      "followUp.lastContactedAt": new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error sending lead notification email:", error);
    // Don't throw - email failure shouldn't break lead creation
  }
}

/**
 * Generate HTML email body for lead notification
 */
function generateLeadEmailHTML(data: LeadEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 12px; }
    .label { font-weight: bold; color: #6b7280; }
    .value { color: #111827; }
    .highlight { background: #dbeafe; padding: 12px; border-radius: 6px; margin: 16px 0; }
    .cta-button { 
      display: inline-block; 
      background: #2563eb; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin-top: 16px;
    }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Subscription Lead</h1>
      <p>${data.tierName} - ${data.companyName}</p>
    </div>
    <div class="content">
      <div class="highlight">
        <strong>Tier:</strong> ${data.tierName}<br>
        <strong>Monthly Value:</strong> $${data.price}
      </div>
      
      <div class="field">
        <span class="label">Company:</span>
        <span class="value">${data.companyName}</span>
      </div>
      
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">${data.contactEmail}</span>
      </div>
      
      <div class="field">
        <span class="label">Industry:</span>
        <span class="value">${data.industry}</span>
      </div>
      
      <div class="field">
        <span class="label">User Type:</span>
        <span class="value">${data.userType}</span>
      </div>
      
      ${data.proofPackHealth ? `
      <div class="field">
        <span class="label">Proof Pack Health:</span>
        <span class="value">${data.proofPackHealth}%</span>
      </div>
      ` : ""}
      
      ${data.capabilities?.length ? `
      <div class="field">
        <span class="label">Capabilities:</span>
        <span class="value">${data.capabilities.join(", ")}</span>
      </div>
      ` : ""}
      
      ${data.certifications?.length ? `
      <div class="field">
        <span class="label">Certifications:</span>
        <span class="value">${data.certifications.join(", ")}</span>
      </div>
      ` : ""}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/admin/leads/${data.leadId}" class="cta-button">
        View Lead Details
      </a>
      
      <div class="footer">
        <p>Lead ID: ${data.leadId}</p>
        <p>Received: ${new Date(data.createdAt).toLocaleString()}</p>
        <p>This lead has been automatically pushed to the SVP CRM.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email body for lead notification
 */
function generateLeadEmailText(data: LeadEmailData): string {
  let text = `
NEW SUBSCRIPTION LEAD
====================

Tier: ${data.tierName}
Monthly Value: $${data.price}

Company: ${data.companyName}
Email: ${data.contactEmail}
Industry: ${data.industry}
User Type: ${data.userType}

`;

  if (data.proofPackHealth) {
    text += `Proof Pack Health: ${data.proofPackHealth}%\n`;
  }

  if (data.capabilities?.length) {
    text += `Capabilities: ${data.capabilities.join(", ")}\n`;
  }

  if (data.certifications?.length) {
    text += `Certifications: ${data.certifications.join(", ")}\n`;
  }

  text += `
View lead details: ${process.env.NEXT_PUBLIC_APP_URL}/portal/admin/leads/${data.leadId}

Lead ID: ${data.leadId}
Received: ${new Date(data.createdAt).toLocaleString()}
This lead has been automatically pushed to the SVP CRM.
`;

  return text;
}

/**
 * Get leads with filtering and pagination
 */
export async function getLeads(
  options: LeadFilterOptions & { limit?: number; offset?: number } = {}
): Promise<{ leads: LeadListItem[]; total: number }> {
  let query: FirebaseFirestore.Query = db.collection(LEADS_COLLECTION);

  // Apply filters
  if (options.status) {
    if (Array.isArray(options.status)) {
      query = query.where("status", "in", options.status);
    } else {
      query = query.where("status", "==", options.status);
    }
  }

  if (options.tier) {
    if (Array.isArray(options.tier)) {
      query = query.where("tier", "in", options.tier);
    } else {
      query = query.where("tier", "==", options.tier);
    }
  }

  if (options.assignedTo) {
    query = query.where("assignedTo", "==", options.assignedTo);
  }

  if (options.priority) {
    query = query.where("priority", "==", options.priority);
  }

  // Date range filter
  if (options.dateFrom) {
    query = query.where("createdAt", ">=", options.dateFrom);
  }

  if (options.dateTo) {
    query = query.where("createdAt", "<=", options.dateTo);
  }

  // Order by creation date (newest first)
  query = query.orderBy("createdAt", "desc");

  // Get total count
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Apply pagination
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  
  query = query.limit(limit);
  if (offset > 0) {
    query = query.offset(offset);
  }

  const snapshot = await query.get();
  
  const leads: LeadListItem[] = snapshot.docs.map((doc) => {
    const data = doc.data() as SubscriptionLead;
    return {
      id: doc.id,
      companyName: data.companyName,
      email: data.email,
      tier: data.tier,
      tierName: data.tierName,
      status: data.status,
      priority: data.priority,
      createdAt: data.createdAt,
      assignedTo: data.assignedTo,
      lastContactedAt: data.followUp?.lastContactedAt,
      nextFollowUpAt: data.followUp?.nextFollowUpAt,
      syncStatus: data.svpSync?.syncStatus || "pending",
      userType: data.userType,
    };
  });

  return { leads, total };
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: string): Promise<SubscriptionLead | null> {
  const doc = await db.collection(LEADS_COLLECTION).doc(id).get();
  
  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() } as SubscriptionLead;
}

/**
 * Update a lead
 */
export async function updateLead(
  id: string, 
  updates: UpdateLeadRequest
): Promise<SubscriptionLead | null> {
  const now = new Date().toISOString();
  const updateData: Record<string, any> = {
    updatedAt: now,
  };

  if (updates.status) {
    updateData.status = updates.status;
    if (updates.status === "converted") {
      updateData.convertedAt = now;
    }
  }

  if (updates.assignedTo !== undefined) {
    updateData.assignedTo = updates.assignedTo;
  }

  if (updates.priority) {
    updateData.priority = updates.priority;
  }

  if (updates.contactInfo) {
    updateData.contactInfo = updates.contactInfo;
  }

  if (updates.addNote) {
    const note = {
      id: `note_${Date.now()}`,
      ...updates.addNote,
      createdAt: now,
    };
    updateData["followUp.notes"] = FieldValue.arrayUnion(note);
  }

  await db.collection(LEADS_COLLECTION).doc(id).update(updateData);

  // Re-sync with SVP if status changed
  if (updates.status) {
    const lead = await getLeadById(id);
    if (lead && lead.svpSync?.svpLeadId) {
      const { updateLeadInSVP } = await import("./svp-api");
      await updateLeadInSVP(lead.svpSync.svpLeadId, { status: updates.status });
    }
  }

  return getLeadById(id);
}

/**
 * Re-sync a lead to SVP
 */
export async function resyncLeadToSVP(id: string): Promise<{ success: boolean; message: string }> {
  const lead = await getLeadById(id);
  
  if (!lead) {
    return { success: false, message: "Lead not found" };
  }

  const result = await pushLeadToSVP(lead);
  
  if (result.success) {
    await db.collection(LEADS_COLLECTION).doc(id).update({
      "svpSync.pushedAt": new Date().toISOString(),
      "svpSync.svpLeadId": result.leadId,
      "svpSync.syncStatus": "synced",
      "svpSync.errorMessage": null,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, message: "Lead synced successfully" };
  } else {
    await db.collection(LEADS_COLLECTION).doc(id).update({
      "svpSync.syncStatus": "failed",
      "svpSync.errorMessage": result.error,
      updatedAt: new Date().toISOString(),
    });
    return { success: false, message: result.error || "Failed to sync" };
  }
}

// Import FieldValue for array operations
import { FieldValue } from "firebase-admin/firestore";
