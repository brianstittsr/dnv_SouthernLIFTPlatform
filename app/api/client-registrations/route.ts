import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

// GET /api/client-registrations - List all client registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query: any = db.collection(COLLECTIONS.CLIENT_REGISTRATIONS);

    // Apply filters
    if (status) {
      query = query.where("status", "==", status);
    }
    if (assignedTo) {
      query = query.where("assignedTo", "==", assignedTo);
    }

    // Order by submission date (newest first)
    query = query.orderBy("submissionDate", "desc");

    // Apply pagination
    const snapshot = await query.limit(limit).offset(offset).get();

    const registrations = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
      submissionDate: doc.data().submissionDate?.toDate?.()?.toISOString(),
      lastUpdateDate: doc.data().lastUpdateDate?.toDate?.()?.toISOString(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
      reviewedAt: doc.data().reviewedAt?.toDate?.()?.toISOString(),
    }));

    // Get total count for pagination
    const countSnapshot = await db.collection(COLLECTIONS.CLIENT_REGISTRATIONS).count().get();
    const total = countSnapshot.data().count;

    return NextResponse.json({
      data: registrations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + registrations.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching client registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch client registrations" },
      { status: 500 }
    );
  }
}

// POST /api/client-registrations - Create new client registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Required field validation
    const requiredFields = [
      "prefix", "firstName", "lastName",
      "title", "companyOwnerEthnicity",
      "companyName", "streetAddress", "city", "state", "zipCode",
      "mobilePhone", "companyEmail",
      "helpNeededFromKDM", "topCompanyNeed", "howFoundKDMAssociates"
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate naicsCodes array
    if (!body.naicsCodes || !Array.isArray(body.naicsCodes) || body.naicsCodes.length === 0) {
      return NextResponse.json(
        { error: "At least one NAICS code is required" },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    
    const registrationData = {
      // Submission Metadata
      category: body.category || "KDM & Associates Client",
      fieldLabel: body.fieldLabel || "Client Registration",
      submissionDate: now,
      lastUpdateDate: now,
      status: "pending",

      // Ownership Information
      prefix: body.prefix,
      firstName: body.firstName,
      middleName: body.middleName || "",
      lastName: body.lastName,
      professionalHeadshotUrl: body.professionalHeadshotUrl || "",
      temporaryHeadshotTaken: body.temporaryHeadshotTaken || false,

      // Professional Identity
      title: body.title,
      companyOwnerEthnicity: body.companyOwnerEthnicity,
      minorityBusinessCertification: body.minorityBusinessCertification || "",
      linkedInUrl: body.linkedInUrl || "",

      // Company Basics
      companyName: body.companyName,
      streetAddress: body.streetAddress,
      streetAddress2: body.streetAddress2 || "",
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,

      // Contact Details
      mobilePhone: body.mobilePhone,
      companyPhone: body.companyPhone || "",
      companyEmail: body.companyEmail,
      websiteUrl: body.websiteUrl || "",

      // Business Identifiers
      samRegistration: body.samRegistration || "",
      cageCodes: body.cageCodes || [],
      dunsNumber: body.dunsNumber || "",
      naicsCodes: body.naicsCodes || [],

      // Financials & Capacity
      approximateAnnualRevenue: body.approximateAnnualRevenue || "",
      applyingAs: body.applyingAs || "prime_contractor",
      ableToWorkOutOfState: body.ableToWorkOutOfState || false,

      // Business Development
      hasInHouseBDTeam: body.hasInHouseBDTeam || false,
      currentBusinessAcquisitionMethod: body.currentBusinessAcquisitionMethod || "",
      referredBy: body.referredBy || "",
      howFoundKDMAssociates: body.howFoundKDMAssociates,

      // Strategy & Assets
      capabilityStatementUrl: body.capabilityStatementUrl || "",
      openToTeamingArrangement: body.openToTeamingArrangement || false,
      hasResourcesToInvest: body.hasResourcesToInvest || false,

      // Needs & Interests
      helpNeededFromKDM: body.helpNeededFromKDM,
      servicesInterestedIn: body.servicesInterestedIn || [],
      topCompanyNeed: body.topCompanyNeed,
      interestedInCertifications: body.interestedInCertifications || [],
      interestedInLoans: body.interestedInLoans || false,

      // Targeting
      targetAgencies: body.targetAgencies || [],
      oemManufacturers: body.oemManufacturers || [],

      // Administrative
      kdmRepAssigned: body.kdmRepAssigned || "",
      notes: body.notes || "",

      // Tracking
      assignedTo: null,
      reviewedBy: null,
      reviewedAt: null,

      // Timestamps
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.CLIENT_REGISTRATIONS).add(registrationData);

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        message: "Client registration submitted successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client registration:", error);
    return NextResponse.json(
      { error: "Failed to create client registration" },
      { status: 500 }
    );
  }
}
