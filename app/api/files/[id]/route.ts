import { NextRequest, NextResponse } from "next/server";
import { deleteFileBlob, getFileBlobMeta, readFileBlob } from "@/lib/file-store";
import { getRequester } from "@/lib/form-builder/server/context";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isInlineType(contentType: string): boolean {
  return contentType.startsWith("image/") || contentType === "application/pdf" || contentType.startsWith("text/");
}

/**
 * GET /api/files/{id}
 * Streams a file stored as base64 chunks in the fileBlobs collection.
 * Public files are served unauthenticated with long-lived cache headers;
 * private files require a session for staff or the owning user.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const meta = await getFileBlobMeta(id);
    if (!meta) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!meta.isPublic) {
      const requester = await getRequester();
      const allowed = requester && (requester.isStaff || requester.isAdmin || requester.uid === meta.ownerUid);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: requester ? 403 : 401 });
      }
    }

    const file = await readFileBlob(id);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const download = request.nextUrl.searchParams.get("download") === "1";
    const disposition = download || !isInlineType(meta.contentType) ? "attachment" : "inline";
    const body = new Uint8Array(file.buffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": meta.contentType,
        "Content-Length": String(file.buffer.length),
        "Content-Disposition": `${disposition}; filename="${meta.fileName.replace(/"/g, "")}"`,
        "X-Content-SHA256": meta.sha256,
        "Cache-Control": meta.isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
      },
    });
  } catch (error) {
    console.error("[files] GET error:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

/**
 * DELETE /api/files/{id}
 * Removes a file and its chunks. Requires staff/admin or the owning user.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const requester = await getRequester();
    if (!requester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const meta = await getFileBlobMeta(id);
    if (!meta) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const allowed = requester.isStaff || requester.isAdmin || requester.uid === meta.ownerUid;
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await deleteFileBlob(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[files] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
