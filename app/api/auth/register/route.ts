import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { assignUserRole } from "@/lib/rbac";

/**
 * POST /api/auth/register
 * Register a new SME user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, companyName, industry, userType } = body;

    // Validate required fields
    if (!email || !password || !companyName || !industry || !userType) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, companyName, industry, userType" },
        { status: 400 }
      );
    }

    // Validate userType
    if (!["sme", "buyer"].includes(userType)) {
      return NextResponse.json(
        { error: "Invalid userType. Must be 'sme' or 'buyer'" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: companyName,
      emailVerified: false,
    });

    // Determine role and user type based on selection
    const role: "sme_user" | "buyer" = userType === "sme" ? "sme_user" : "buyer";
    const roleTag = userType === "sme" ? "SVP SME User (Supplier)" : "SVP Buyer / Buyer (Government)";
    const userTypeLabel = userType === "sme" ? "SME / Supplier" : "Buyer / Government";

    // Generate tenant and user IDs
    const tenantId = `tenant_${userRecord.uid}`;
    const entityId = userType === "sme" ? `sme_${userRecord.uid}` : `buyer_${userRecord.uid}`;

    // Create user record in Firestore
    const userData = {
      id: entityId,
      tenantId,
      userId: userRecord.uid,
      email,
      companyName,
      industry,
      userType,
      role,
      roleTag,
      
      // Profile information
      description: "",
      website: "",
      logo: "",
      
      // Certifications
      certifications: [],
      
      // Capabilities
      capabilities: [],
      serviceOfferings: [],
      
      // Subscription
      subscriptionTier: "free",
      subscriptionStatus: "active",
      
      // Profile completeness
      profileCompleteness: 20, // Basic info only
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection("users").doc(userRecord.uid).set(userData);

    // Assign role via custom claims
    await assignUserRole(userRecord.uid, role, tenantId);

    // Queue welcome email
    await db.collection("emailQueue").add({
      to: [email],
      subject: "Welcome to the SVP Platform!",
      body: `
        <h2>Welcome to the SVP Platform, ${companyName}!</h2>
        <p>Thank you for registering as a <strong>${userTypeLabel}</strong>. Your account has been created successfully.</p>
        <p><strong>Getting Started:</strong></p>
        <ul>
          ${userType === "sme" ? `
          <li>Complete your company profile</li>
          <li>Add certifications and capabilities</li>
          <li>Browse opportunities and submit proposals</li>
          ` : `
          <li>Complete your organization profile</li>
          <li>Post opportunities and find suppliers</li>
          <li>Manage procurement processes</li>
          `}
          <li>Explore subscription tiers for additional features</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/dashboard">Go to Dashboard</a></p>
        <p>If you have any questions, please contact our support team.</p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: userRecord.uid,
      action: "user_registered",
      resource: "user",
      resourceId: userRecord.uid,
      details: {
        email,
        companyName,
        industry,
        userType,
        role,
        roleTag,
        subscriptionTier: "free",
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // Generate custom token for auto-login
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      userId: userRecord.uid,
      customToken,
      redirectTo: "/portal/dashboard",
    });
  } catch (error: any) {
    console.error("Error registering user:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
