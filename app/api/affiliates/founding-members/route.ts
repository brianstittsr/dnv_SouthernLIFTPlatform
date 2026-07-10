import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";

interface FoundingMemberAffiliateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName: string;
  jobTitle?: string;
  expertise: string[];
  valueProposition?: string;
  acknowledgesCommitments: boolean;
}

function generateTempPassword(length = 12): string {
  return randomBytes(length).toString("base64").slice(0, length);
}

export async function POST(request: NextRequest) {
  try {
    const body: FoundingMemberAffiliateFormData = await request.json();

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.companyName ||
      !body.expertise ||
      body.expertise.length === 0 ||
      !body.acknowledgesCommitments
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!auth || !db) {
      return NextResponse.json(
        { error: "Server authentication services are unavailable" },
        { status: 500 }
      );
    }

    const normalizedEmail = body.email.toLowerCase().trim();
    const tempPassword = generateTempPassword();

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: normalizedEmail,
        password: tempPassword,
        displayName: `${body.firstName} ${body.lastName}`,
        emailVerified: false,
      });
    } catch (authError: any) {
      console.error("Failed to create Firebase Auth user:", authError);
      if (authError.code === "auth/email-already-exists") {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create user document
    const userData = {
      id: userRecord.uid,
      userId: userRecord.uid,
      email: normalizedEmail,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || "",
      company: body.companyName,
      jobTitle: body.jobTitle || "",
      role: "affiliate",
      svpRole: "consortium_member",
      membershipType: "kdm-consortium",
      membershipStatus: "active",
      membershipTier: "founder",
      isFoundingMember: true,
      isAffiliate: true,
      affiliateOnboardingComplete: false,
      hasChangedPassword: false,
      isTempPassword: true,
      tempPassword,
      tags: ["Founding Member", "KDM Affiliate"],
      subscriptionTier: "consortium",
      subscriptionStatus: "active",
      profileCompleteness: 20,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set(userData);

    // Create team member document
    const teamMemberRef = db.collection(COLLECTIONS.TEAM_MEMBERS).doc(userRecord.uid);
    const teamMemberData = {
      firebaseUid: userRecord.uid,
      firstName: body.firstName,
      lastName: body.lastName,
      emailPrimary: normalizedEmail,
      emailSecondary: "",
      mobile: body.phone || "",
      expertise: body.expertise.join(", "),
      title: body.jobTitle || "",
      company: body.companyName,
      location: "",
      bio: body.valueProposition || "",
      avatar: "",
      linkedIn: "",
      website: "",
      role: "affiliate" as const,
      status: "active" as const,
      teamTag: "affiliate" as const,
      isFoundingMember: true,
      membershipTier: "founder" as const,
      membershipStatus: "active" as const,
      affiliateOnboardingComplete: false,
      affiliateAgreementSigned: true,
      affiliateAgreementDate: new Date().toISOString(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await teamMemberRef.set(teamMemberData);

    // Save affiliate application record
    let applicationId = "";
    try {
      const applicationRef = await db.collection(COLLECTIONS.AFFILIATE_APPLICATIONS).add({
        firstName: body.firstName,
        lastName: body.lastName,
        email: normalizedEmail,
        phone: body.phone || null,
        companyName: body.companyName,
        jobTitle: body.jobTitle || null,
        expertise: body.expertise,
        valueProposition: body.valueProposition || null,
        source: "founding-member-affiliate-page",
        isFoundingMember: true,
        firebaseUid: userRecord.uid,
        status: "approved",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      applicationId = applicationRef.id;
    } catch (applicationError) {
      console.error("Failed to save affiliate application record:", applicationError);
    }

    // Send admin notification email
    try {
      await sendEmail({
        to: "kmoore@kdm-assoc.com",
        subject: `New Founding Member Affiliate — ${body.firstName} ${body.lastName}`,
        html: `
          <h1>New Founding Member Affiliate</h1>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <ul>
            <li><strong>Name:</strong> ${body.firstName} ${body.lastName}</li>
            <li><strong>Email:</strong> ${normalizedEmail}</li>
            <li><strong>Phone:</strong> ${body.phone || "N/A"}</li>
            <li><strong>Company:</strong> ${body.companyName}</li>
            <li><strong>Job Title:</strong> ${body.jobTitle || "N/A"}</li>
            <li><strong>Expertise:</strong> ${body.expertise.join(", ")}</li>
            <li><strong>Firebase UID:</strong> ${userRecord.uid}</li>
          </ul>
          <p><strong>Value Proposition:</strong></p>
          <p>${body.valueProposition || "N/A"}</p>
          <p>A team member record and Firebase Auth account have been created automatically.</p>
        `,
        text: `New Founding Member Affiliate: ${body.firstName} ${body.lastName} (${normalizedEmail}) at ${body.companyName}. Expertise: ${body.expertise.join(", ")}.`,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    // Send credentials email to applicant
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.kdm-assoc.com";
      const signInUrl = `${appUrl}/sign-in`;

      await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to the KDM Consortium — Your Founding Member Access",
        html: `
          <h1>Welcome, ${body.firstName}!</h1>
          <p>Congratulations! You have been registered as a <strong>Founding Member of the KDM Consortium</strong> and as a KDM Affiliate. Your account is ready to use.</p>

          <h2>Your Login Credentials</h2>
          <ul>
            <li><strong>Username (email):</strong> ${normalizedEmail}</li>
            <li><strong>Temporary password:</strong> ${tempPassword}</li>
          </ul>
          <p><a href="${signInUrl}" style="font-weight:bold;">Sign In to Your Account</a></p>

          <h2>Important: Change Your Password</h2>
          <p>For security, you will be asked to create your own password the first time you sign in. You can also update your password anytime from your account settings after signing in.</p>

          <h2>Next Steps to Unlock SAM.gov Resources</h2>
          <ol>
            <li><strong>Sign in and change your password</strong> using the link above.</li>
            <li><strong>Complete your Affiliate Onboarding</strong> — the popup will guide you through your expertise, referral preferences, and networking profile.</li>
            <li><strong>Complete your Consortium Member Onboarding</strong> at <a href="${appUrl}/portal/consortium/onboarding">${appUrl}/portal/consortium/onboarding</a>. This includes:
              <ul>
                <li>Company profile and capabilities</li>
                <li>NAICS codes and certifications</li>
                <li>Government contracting readiness documents (SAM registration, CAGE code, capability statement, etc.)</li>
              </ul>
            </li>
            <li><strong>Once your readiness is validated</strong>, you will be able to explore SAM.gov opportunities and participate in curated contract pursuit teams.</li>
          </ol>

          <p>Need help? Contact us at <a href="mailto:kmoore@kdm-assoc.com">kmoore@kdm-assoc.com</a>.</p>
          <p>Best regards,<br>The KDM & Associates Team</p>
        `,
        text: `Welcome, ${body.firstName}! You have been registered as a Founding Member of the KDM Consortium and as a KDM Affiliate. Username: ${normalizedEmail} Temporary password: ${tempPassword} Sign in at ${signInUrl}. You will be asked to change your password on first sign in. Next: complete affiliate onboarding, then consortium onboarding at ${appUrl}/portal/consortium/onboarding to unlock SAM.gov resources.`,
      });
    } catch (emailError) {
      console.error("Failed to send applicant credentials email:", emailError);
    }

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      applicationId,
      message: "Application submitted and account created successfully",
    });
  } catch (error) {
    console.error("Founding member affiliate application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
