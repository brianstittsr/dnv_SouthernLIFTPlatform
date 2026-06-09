import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

// GET /api/client-registrations/[id] - Get a specific registration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = db.collection(COLLECTIONS.CLIENT_REGISTRATIONS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Client registration not found" },
        { status: 404 }
      );
    }

    const data = doc.data();
    return NextResponse.json({
      id: doc.id,
      ...data,
      submissionDate: data?.submissionDate?.toDate?.()?.toISOString(),
      lastUpdateDate: data?.lastUpdateDate?.toDate?.()?.toISOString(),
      createdAt: data?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString(),
      reviewedAt: data?.reviewedAt?.toDate?.()?.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching client registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch client registration" },
      { status: 500 }
    );
  }
}

// PUT /api/client-registrations/[id] - Update a registration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const docRef = db.collection(COLLECTIONS.CLIENT_REGISTRATIONS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Client registration not found" },
        { status: 404 }
      );
    }

    const now = Timestamp.now();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      lastUpdateDate: now,
      updatedAt: now,
    };

    // Map all possible fields
    const fieldMappings: Record<string, string> = {
      prefix: "prefix",
      firstName: "firstName",
      middleName: "middleName",
      lastName: "lastName",
      professionalHeadshotUrl: "professionalHeadshotUrl",
      temporaryHeadshotTaken: "temporaryHeadshotTaken",
      title: "title",
      companyOwnerEthnicity: "companyOwnerEthnicity",
      minorityBusinessCertification: "minorityBusinessCertification",
      linkedInUrl: "linkedInUrl",
      companyName: "companyName",
      streetAddress: "streetAddress",
      streetAddress2: "streetAddress2",
      city: "city",
      state: "state",
      zipCode: "zipCode",
      mobilePhone: "mobilePhone",
      companyPhone: "companyPhone",
      companyEmail: "companyEmail",
      websiteUrl: "websiteUrl",
      samRegistration: "samRegistration",
      cageCodes: "cageCodes",
      dunsNumber: "dunsNumber",
      naicsCodes: "naicsCodes",
      approximateAnnualRevenue: "approximateAnnualRevenue",
      applyingAs: "applyingAs",
      ableToWorkOutOfState: "ableToWorkOutOfState",
      hasInHouseBDTeam: "hasInHouseBDTeam",
      currentBusinessAcquisitionMethod: "currentBusinessAcquisitionMethod",
      referredBy: "referredBy",
      howFoundKDMAssociates: "howFoundKDMAssociates",
      capabilityStatementUrl: "capabilityStatementUrl",
      openToTeamingArrangement: "openToTeamingArrangement",
      hasResourcesToInvest: "hasResourcesToInvest",
      helpNeededFromKDM: "helpNeededFromKDM",
      servicesInterestedIn: "servicesInterestedIn",
      topCompanyNeed: "topCompanyNeed",
      interestedInCertifications: "interestedInCertifications",
      interestedInLoans: "interestedInLoans",
      targetAgencies: "targetAgencies",
      oemManufacturers: "oemManufacturers",
      kdmRepAssigned: "kdmRepAssigned",
      notes: "notes",
      status: "status",
      assignedTo: "assignedTo",
      reviewedBy: "reviewedBy",
    };

    Object.entries(fieldMappings).forEach(([key, firestoreKey]) => {
      if (body[key] !== undefined) {
        updateData[firestoreKey] = body[key];
      }
    });

    // Handle reviewedAt timestamp if reviewedBy is provided
    if (body.reviewedBy && !body.reviewedAt) {
      updateData.reviewedAt = now;
    }

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Client registration updated successfully",
    });
  } catch (error) {
    console.error("Error updating client registration:", error);
    return NextResponse.json(
      { error: "Failed to update client registration" },
      { status: 500 }
    );
  }
}

// DELETE /api/client-registrations/[id] - Delete a registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = db.collection(COLLECTIONS.CLIENT_REGISTRATIONS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Client registration not found" },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: "Client registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client registration:", error);
    return NextResponse.json(
      { error: "Failed to delete client registration" },
      { status: 500 }
    );
  }
}
