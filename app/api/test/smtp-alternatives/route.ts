import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const nodemailer = require("nodemailer");

    const username = process.env.AZURE_SMTP_USERNAME;
    const password = process.env.AZURE_SMTP_PASSWORD;
    const fromEmail = process.env.SMTP_FROM_EMAIL;

    const results: any = {
      currentConfig: {
        host: process.env.AZURE_SMTP_HOST,
        port: process.env.AZURE_SMTP_PORT,
        username: username ? `${username.substring(0, 5)}...` : "NOT SET",
        fromEmail: fromEmail,
      },
      tests: {},
    };

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: "Missing SMTP credentials",
        results,
      });
    }

    // Test 1: Current Azure Communication Services config
    console.log("=== Test 1: Azure Communication Services (smtp.azurecomm.net) ===");
    try {
      const t1 = nodemailer.createTransport({
        host: "smtp.azurecomm.net",
        port: 587,
        secure: false,
        auth: { user: username, pass: password },
        tls: { rejectUnauthorized: false },
      });
      await t1.verify();
      results.tests.azureComm = { success: true, host: "smtp.azurecomm.net" };
      console.log("✓ Azure Communication Services works");
    } catch (err: any) {
      results.tests.azureComm = { success: false, error: err.message };
      console.log(`✗ Azure Communication Services failed: ${err.message}`);
    }

    // Test 2: Office 365 SMTP
    console.log("\n=== Test 2: Office 365 (smtp.office365.com) ===");
    try {
      const t2 = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: { user: username, pass: password },
        tls: { rejectUnauthorized: false },
      });
      await t2.verify();
      results.tests.office365 = { success: true, host: "smtp.office365.com" };
      console.log("✓ Office 365 works");
    } catch (err: any) {
      results.tests.office365 = { success: false, error: err.message };
      console.log(`✗ Office 365 failed: ${err.message}`);
    }

    // Test 3: Gmail SMTP (for reference)
    console.log("\n=== Test 3: Gmail (smtp.gmail.com) ===");
    try {
      const t3 = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: username, pass: password },
        tls: { rejectUnauthorized: false },
      });
      await t3.verify();
      results.tests.gmail = { success: true, host: "smtp.gmail.com" };
      console.log("✓ Gmail works");
    } catch (err: any) {
      results.tests.gmail = { success: false, error: err.message };
      console.log(`✗ Gmail failed: ${err.message}`);
    }

    // Test 4: Try with port 25 (unencrypted)
    console.log("\n=== Test 4: Azure Communication Services Port 25 ===");
    try {
      const t4 = nodemailer.createTransport({
        host: "smtp.azurecomm.net",
        port: 25,
        secure: false,
        auth: { user: username, pass: password },
      });
      await t4.verify();
      results.tests.azureCommPort25 = { success: true, host: "smtp.azurecomm.net:25" };
      console.log("✓ Azure Communication Services Port 25 works");
    } catch (err: any) {
      results.tests.azureCommPort25 = { success: false, error: err.message };
      console.log(`✗ Azure Communication Services Port 25 failed: ${err.message}`);
    }

    // Test 5: Try with port 465 (SSL)
    console.log("\n=== Test 5: Azure Communication Services Port 465 (SSL) ===");
    try {
      const t5 = nodemailer.createTransport({
        host: "smtp.azurecomm.net",
        port: 465,
        secure: true,
        auth: { user: username, pass: password },
        tls: { rejectUnauthorized: false },
      });
      await t5.verify();
      results.tests.azureCommPort465 = { success: true, host: "smtp.azurecomm.net:465" };
      console.log("✓ Azure Communication Services Port 465 works");
    } catch (err: any) {
      results.tests.azureCommPort465 = { success: false, error: err.message };
      console.log(`✗ Azure Communication Services Port 465 failed: ${err.message}`);
    }

    // Check if any test passed
    const anyPassed = Object.values(results.tests).some((t: any) => t.success);

    if (anyPassed) {
      const passedTests = Object.entries(results.tests)
        .filter(([_, t]: any) => t.success)
        .map(([name, t]: any) => `${name} (${t.host})`);

      return NextResponse.json({
        success: true,
        message: "SMTP configuration works!",
        workingConfigs: passedTests,
        results,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No SMTP configuration worked",
          message: "All SMTP tests failed. Please verify credentials and SMTP server settings.",
          results,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
