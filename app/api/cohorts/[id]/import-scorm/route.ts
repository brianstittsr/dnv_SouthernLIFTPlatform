import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import JSZip from "jszip";
import { parseStringPromise } from "xml2js";

/**
 * POST /api/cohorts/[id]/import-scorm
 * Import a SCORM package and create curriculum from it
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { id: cohortId } = await params;

    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user has instructor or admin role
    const claims = decodedToken as any;
    if (!["instructor", "platform_admin"].includes(claims.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify cohort exists
    const cohortDoc = await db.collection("cohorts").doc(cohortId).get();
    if (!cohortDoc.exists) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No SCORM file provided" },
        { status: 400 }
      );
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse SCORM package
    const zip = await JSZip.loadAsync(buffer);
    
    // Find and parse manifest file (imsmanifest.xml)
    const manifestFile = zip.file("imsmanifest.xml");
    if (!manifestFile) {
      return NextResponse.json(
        { error: "Invalid SCORM package: imsmanifest.xml not found" },
        { status: 400 }
      );
    }

    const manifestXml = await manifestFile.async("text");
    const manifest = await parseStringPromise(manifestXml);

    // Extract course metadata
    const metadata = manifest.manifest?.metadata?.[0] || {};
    const organizations = manifest.manifest?.organizations?.[0]?.organization?.[0] || {};
    const resources = manifest.manifest?.resources?.[0]?.resource || [];

    const courseTitle = organizations.title?.[0] || "Imported SCORM Course";
    const courseDescription = metadata["lom:general"]?.[0]?.["lom:description"]?.[0]?.["lom:string"]?.[0] || "";

    // Compress and encode the entire SCORM package
    const compressedScorm = buffer.toString("base64");

    // Store SCORM package in Firestore
    const scormPackageRef = await db.collection("scorm_packages").add({
      cohortId,
      title: courseTitle,
      description: courseDescription,
      fileName: file.name,
      fileSize: buffer.length,
      compressedData: compressedScorm,
      manifest: JSON.stringify(manifest),
      uploadedBy: decodedToken.uid,
      uploadedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Parse organization structure and create modules
    const items = organizations.item || [];
    const modules: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const moduleTitle = item.title?.[0] || `Module ${i + 1}`;
      const moduleDescription = item.description?.[0] || "";
      
      // Create module
      const moduleRef = await db.collection("modules").add({
        cohortId,
        scormPackageId: scormPackageRef.id,
        title: moduleTitle,
        description: moduleDescription,
        orderIndex: i,
        isPublished: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Parse sessions (sub-items) within the module
      const subItems = item.item || [];
      const sessions: any[] = [];

      for (let j = 0; j < subItems.length; j++) {
        const subItem = subItems[j];
        const sessionTitle = subItem.title?.[0] || `Session ${j + 1}`;
        const resourceRef = subItem.$?.identifierref;

        // Find the resource
        const resource = resources.find((r: any) => r.$?.identifier === resourceRef);
        const resourceHref = resource?.$?.href || "";

        // Extract resource content from ZIP
        let contentHtml = "";
        if (resourceHref && zip.file(resourceHref)) {
          const resourceFile = zip.file(resourceHref);
          if (resourceFile) {
            contentHtml = await resourceFile.async("text");
          }
        }

        // Create session
        const sessionRef = await db.collection("sessions").add({
          moduleId: moduleRef.id,
          cohortId,
          scormPackageId: scormPackageRef.id,
          title: sessionTitle,
          description: "",
          contentHtml,
          resourceHref,
          orderIndex: j,
          durationMinutes: 30, // Default duration
          isPublished: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        sessions.push({
          id: sessionRef.id,
          title: sessionTitle,
          orderIndex: j,
        });
      }

      modules.push({
        id: moduleRef.id,
        title: moduleTitle,
        orderIndex: i,
        sessions,
      });
    }

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "scorm_imported",
      resource: "cohort",
      resourceId: cohortId,
      details: {
        scormPackageId: scormPackageRef.id,
        fileName: file.name,
        modulesCreated: modules.length,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "SCORM package imported successfully",
      scormPackageId: scormPackageRef.id,
      courseTitle,
      modules,
    });
  } catch (error: any) {
    console.error("Error importing SCORM package:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import SCORM package" },
      { status: 500 }
    );
  }
}
