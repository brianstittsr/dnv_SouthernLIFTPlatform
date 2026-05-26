import { NextRequest, NextResponse } from "next/server";
import {
  PARKED_WEBSITE_COOKIE,
  PARKED_WEBSITE_PASSWORD,
} from "@/lib/parked-website";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (password !== PARKED_WEBSITE_PASSWORD) {
      return NextResponse.json(
        { error: "Incorrect password. Please contact the owner for access." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(PARKED_WEBSITE_COOKIE, "granted", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Error granting parked website access:", error);
    return NextResponse.json(
      { error: "Unable to process the password right now." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PARKED_WEBSITE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
