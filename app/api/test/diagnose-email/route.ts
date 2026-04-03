import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      azureSmtpHost: process.env.AZURE_SMTP_HOST || "NOT SET",
      azureSmtpPort: process.env.AZURE_SMTP_PORT || "NOT SET",
      azureSmtpUsername: process.env.AZURE_SMTP_USERNAME ? "SET" : "NOT SET",
      azureSmtpPassword: process.env.AZURE_SMTP_PASSWORD ? "SET" : "NOT SET",
      smtpFromEmail: process.env.SMTP_FROM_EMAIL || "NOT SET",
      smtpFromName: process.env.SMTP_FROM_NAME || "NOT SET",
    },
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
  };

  // Try to import nodemailer
  let nodemailerStatus = "NOT AVAILABLE";
  try {
    const nodemailer = require("nodemailer");
    nodemailerStatus = "AVAILABLE";
  } catch (error: any) {
    nodemailerStatus = `ERROR: ${error.message}`;
  }

  return NextResponse.json({
    ...diagnostics,
    nodemailer: nodemailerStatus,
    message: "Diagnostic information for email configuration",
  });
}
