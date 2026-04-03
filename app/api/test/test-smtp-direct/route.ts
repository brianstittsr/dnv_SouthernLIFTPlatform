import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Try to import and test nodemailer directly
    const nodemailer = require("nodemailer");

    const smtpHost = process.env.AZURE_SMTP_HOST;
    const smtpPort = parseInt(process.env.AZURE_SMTP_PORT || "587", 10);
    const smtpUsername = process.env.AZURE_SMTP_USERNAME;
    const smtpPassword = process.env.AZURE_SMTP_PASSWORD;
    const smtpSecure = process.env.AZURE_SMTP_SECURE === "true";

    console.log("=== SMTP Configuration ===");
    console.log(`Host: ${smtpHost}`);
    console.log(`Port: ${smtpPort}`);
    console.log(`Secure: ${smtpSecure}`);
    console.log(`Username: ${smtpUsername ? "SET" : "NOT SET"}`);
    console.log(`Password: ${smtpPassword ? "SET" : "NOT SET"}`);

    if (!smtpHost || !smtpUsername || !smtpPassword) {
      return NextResponse.json({
        success: false,
        error: "Missing SMTP configuration",
        config: {
          host: smtpHost ? "SET" : "NOT SET",
          username: smtpUsername ? "SET" : "NOT SET",
          password: smtpPassword ? "SET" : "NOT SET",
        },
      });
    }

    // Create transporter with minimal config
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      logger: true,
      debug: true,
    });

    console.log("=== Testing SMTP Connection ===");
    const verified = await transporter.verify();
    console.log(`Connection verified: ${verified}`);

    // Try to send a test email
    console.log("=== Sending Test Email ===");
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || "admin@kdm-assoc.com",
      to: "brianestittsr@outlook.com",
      subject: "Test Email from KDM Consortium",
      text: "This is a test email to verify SMTP configuration.",
      html: "<p>This is a test email to verify SMTP configuration.</p>",
    });

    console.log(`Email sent successfully. Message ID: ${info.messageId}`);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error: any) {
    console.error("=== SMTP Error ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        response: error.response,
        details: {
          message: error.message,
          code: error.code,
          command: error.command,
        },
      },
      { status: 500 }
    );
  }
}
