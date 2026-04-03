import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const username = process.env.AZURE_SMTP_USERNAME || "";
  const password = process.env.AZURE_SMTP_PASSWORD || "";

  return NextResponse.json({
    username: {
      full: username,
      masked: username ? username.substring(0, 3) + "***" + username.substring(username.length - 3) : "NOT SET",
      length: username.length,
      contains: {
        atSign: username.includes("@"),
        spaces: username.includes(" "),
        specialChars: /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(username),
      },
    },
    password: {
      length: password.length,
      masked: password ? "***" + password.substring(password.length - 3) : "NOT SET",
      contains: {
        spaces: password.includes(" "),
        specialChars: /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
    },
    environment: {
      AZURE_SMTP_HOST: process.env.AZURE_SMTP_HOST,
      AZURE_SMTP_PORT: process.env.AZURE_SMTP_PORT,
      AZURE_SMTP_SECURE: process.env.AZURE_SMTP_SECURE,
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    },
  });
}
