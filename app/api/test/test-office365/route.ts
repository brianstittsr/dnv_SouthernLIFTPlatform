import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const nodemailer = require("nodemailer");

    const username = process.env.AZURE_SMTP_USERNAME;
    const password = process.env.AZURE_SMTP_PASSWORD;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: "Missing SMTP credentials",
      });
    }

    console.log("=== Testing Office 365 SMTP ===");
    console.log(`Username: ${username}`);
    console.log(`Host: smtp.office365.com`);
    console.log(`Port: 587`);

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
      },
    });

    console.log("Verifying connection...");
    const verified = await transporter.verify();
    console.log(`Connection verified: ${verified}`);

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: `"KDM & Associates" <${username}>`,
      to: "brianestittsr@outlook.com",
      subject: "Test Email - KDM Consortium Registration",
      text: "This is a test email to verify Office 365 SMTP configuration.",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Test Email - KDM Consortium</h2>
          <p>This is a test email to verify Office 365 SMTP configuration is working correctly.</p>
          <p>If you received this email, the SMTP configuration is now properly set up.</p>
        </div>
      `,
    });

    console.log(`Email sent successfully. Message ID: ${info.messageId}`);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully via Office 365 SMTP",
      messageId: info.messageId,
      configuration: {
        host: "smtp.office365.com",
        port: 587,
        username: username,
        note: "Update AZURE_SMTP_HOST in .env.local to: smtp.office365.com",
      },
    });
  } catch (error: any) {
    console.error("Office 365 SMTP Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        solution: "Update AZURE_SMTP_HOST in .env.local from 'smtp.azurecomm.net' to 'smtp.office365.com'",
      },
      { status: 500 }
    );
  }
}
