import type { SVPLeadPayload, SVPApiResponse, SubscriptionLead } from "./types";

const SVP_API_BASE_URL = process.env.SVP_API_BASE_URL || "https://api.strategicvalueplus.com/v1";
const SVP_API_KEY = process.env.SVP_API_KEY || "";

/**
 * Push a subscription lead to Strategic Value Plus CRM
 */
export async function pushLeadToSVP(lead: SubscriptionLead): Promise<SVPApiResponse> {
  try {
    if (!SVP_API_KEY) {
      console.warn("SVP_API_KEY not configured, skipping SVP push");
      return { success: false, error: "API key not configured" };
    }

    const payload: SVPLeadPayload = {
      externalId: lead.id,
      companyName: lead.companyName,
      contactEmail: lead.email,
      contactPhone: lead.contactInfo?.phone,
      contactFirstName: lead.contactInfo?.firstName,
      contactLastName: lead.contactInfo?.lastName,
      jobTitle: lead.contactInfo?.jobTitle,
      website: lead.contactInfo?.website,
      industry: lead.industry,
      source: "KDM SVP Platform",
      tier: lead.tier,
      monthlyValue: lead.price,
      status: mapLeadStatusToSVP(lead.status),
      notes: generateLeadNotes(lead),
      capabilities: lead.proofPackContext?.capabilities,
      certifications: lead.proofPackContext?.certifications,
      userType: lead.userType,
      createdAt: lead.createdAt,
    };

    const response = await fetch(`${SVP_API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SVP_API_KEY}`,
        "X-Source": "kdm-svp-platform",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `SVP API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      leadId: data.leadId || data.id,
    };
  } catch (error: any) {
    console.error("Error pushing lead to SVP:", error);
    return {
      success: false,
      error: error.message || "Failed to push lead to SVP",
    };
  }
}

/**
 * Update an existing lead in SVP CRM
 */
export async function updateLeadInSVP(
  svpLeadId: string, 
  updates: Partial<SubscriptionLead>
): Promise<SVPApiResponse> {
  try {
    if (!SVP_API_KEY) {
      return { success: false, error: "API key not configured" };
    }

    const response = await fetch(`${SVP_API_BASE_URL}/leads/${svpLeadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SVP_API_KEY}`,
        "X-Source": "kdm-svp-platform",
      },
      body: JSON.stringify({
        status: updates.status ? mapLeadStatusToSVP(updates.status) : undefined,
        tier: updates.tier,
        monthlyValue: updates.price,
        notes: updates.proofPackContext ? generateLeadNotes(updates as SubscriptionLead) : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `SVP API error: ${response.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating lead in SVP:", error);
    return {
      success: false,
      error: error.message || "Failed to update lead in SVP",
    };
  }
}

/**
 * Get lead details from SVP CRM
 */
export async function getLeadFromSVP(svpLeadId: string): Promise<SVPApiResponse & { data?: any }> {
  try {
    if (!SVP_API_KEY) {
      return { success: false, error: "API key not configured" };
    }

    const response = await fetch(`${SVP_API_BASE_URL}/leads/${svpLeadId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SVP_API_KEY}`,
        "X-Source": "kdm-svp-platform",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `SVP API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching lead from SVP:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch lead from SVP",
    };
  }
}

/**
 * Map internal lead status to SVP CRM status
 */
function mapLeadStatusToSVP(status: string): string {
  const statusMap: Record<string, string> = {
    new: "NEW",
    contacted: "CONTACTED",
    qualified: "QUALIFIED",
    converted: "CONVERTED",
    lost: "LOST",
  };
  return statusMap[status] || "NEW";
}

/**
 * Generate notes text from lead context
 */
function generateLeadNotes(lead: SubscriptionLead): string {
  const parts: string[] = [
    `Subscription Lead from KDM SVP Platform`,
    `Tier: ${lead.tierName} ($${lead.price}/month)`,
    `User Type: ${lead.userType === "sme" ? "SME / Supplier" : "Buyer / Government"}`,
    `Role: ${lead.roleTag}`,
  ];

  if (lead.proofPackContext?.packName) {
    parts.push(`Proof Pack: ${lead.proofPackContext.packName}`);
  }

  if (lead.proofPackContext?.packHealth) {
    parts.push(`Pack Health Score: ${lead.proofPackContext.packHealth}%`);
  }

  if (lead.proofPackContext?.capabilities?.length) {
    parts.push(`Capabilities: ${lead.proofPackContext.capabilities.join(", ")}`);
  }

  if (lead.proofPackContext?.certifications?.length) {
    parts.push(`Certifications: ${lead.proofPackContext.certifications.join(", ")}`);
  }

  parts.push(`Industry: ${lead.industry}`);
  parts.push(`Lead ID: ${lead.id}`);

  return parts.join("\n");
}

/**
 * Test SVP API connectivity
 */
export async function testSVPConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!SVP_API_KEY) {
      return { success: false, message: "SVP_API_KEY not configured" };
    }

    const response = await fetch(`${SVP_API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SVP_API_KEY}`,
        "X-Source": "kdm-svp-platform",
      },
    });

    if (response.ok) {
      return { success: true, message: "Connected to SVP API" };
    } else {
      return { success: false, message: `SVP API returned status ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, message: `Connection failed: ${error.message}` };
  }
}
