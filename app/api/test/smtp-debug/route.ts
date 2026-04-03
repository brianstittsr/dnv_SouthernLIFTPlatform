import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const nodemailer = require("nodemailer");

    const config = {
      host: process.env.AZURE_SMTP_HOST,
      port: parseInt(process.env.AZURE_SMTP_PORT || "587", 10),
      username: process.env.AZURE_SMTP_USERNAME,
      password: process.env.AZURE_SMTP_PASSWORD,
      secure: process.env.AZURE_SMTP_SECURE === "true",
      fromEmail: process.env.SMTP_FROM_EMAIL,
    };

    console.log("=== SMTP Configuration Details ===");
    console.log(`Host: ${config.host}`);
    console.log(`Port: ${config.port}`);
    console.log(`Secure: ${config.secure}`);
    console.log(`Username length: ${config.username?.length || 0}`);
    console.log(`Password length: ${config.password?.length || 0}`);
    console.log(`From Email: ${config.fromEmail}`);

    // Test 1: Try with explicit TLS settings
    console.log("\n=== Test 1: Standard TLS Configuration ===");
    const transporter1 = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
      },
    });

    try {
      const verified1 = await transporter1.verify();
      console.log(`Test 1 - Connection verified: ${verified1}`);
      return NextResponse.json({
        success: true,
        test: "Test 1 passed",
        config: {
          host: config.host,
          port: config.port,
          secure: config.secure,
        },
      });
    } catch (err: any) {
      console.error(`Test 1 failed: ${err.message}`);
      console.error(`Error code: ${err.code}`);
      console.error(`Error command: ${err.command}`);
    }

    // Test 2: Try with connectionTimeout
    console.log("\n=== Test 2: With Connection Timeout ===");
    const transporter2 = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      const verified2 = await transporter2.verify();
      console.log(`Test 2 - Connection verified: ${verified2}`);
      return NextResponse.json({
        success: true,
        test: "Test 2 passed",
      });
    } catch (err: any) {
      console.error(`Test 2 failed: ${err.message}`);
    }

    // Test 3: Try without TLS verification
    console.log("\n=== Test 3: Minimal Configuration ===");
    const transporter3 = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    try {
      const verified3 = await transporter3.verify();
      console.log(`Test 3 - Connection verified: ${verified3}`);
      return NextResponse.json({
        success: true,
        test: "Test 3 passed",
      });
    } catch (err: any) {
      console.error(`Test 3 failed: ${err.message}`);
      console.error(`Full error:`, err);

      return NextResponse.json(
        {
          success: false,
          error: err.message,
          code: err.code,
          command: err.command,
          response: err.response,
          tests: {
            test1: "Failed",
            test2: "Failed",
            test3: "Failed",
          },
          diagnostics: {
            hostSet: !!config.host,
            portSet: !!config.port,
            usernameSet: !!config.username,
            passwordSet: !!config.password,
            usernameLength: config.username?.length || 0,
            passwordLength: config.password?.length || 0,
            hostValue: config.host,
            portValue: config.port,
          },
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
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
