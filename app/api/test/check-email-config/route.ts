import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const config = {
    azureSmtp: {
      host: process.env.AZURE_SMTP_HOST ? "✓ Set" : "✗ Not set",
      port: process.env.AZURE_SMTP_PORT ? "✓ Set" : "✗ Not set",
      username: process.env.AZURE_SMTP_USERNAME ? "✓ Set" : "✗ Not set",
      password: process.env.AZURE_SMTP_PASSWORD ? "✓ Set" : "✗ Not set",
      secure: process.env.AZURE_SMTP_SECURE ? "✓ Set" : "✗ Not set",
      fromEmail: process.env.SMTP_FROM_EMAIL ? "✓ Set" : "✗ Not set",
      fromName: process.env.SMTP_FROM_NAME ? "✓ Set" : "✗ Not set",
    },
    microsoftGraph: {
      clientId: process.env.AZURE_CLIENT_ID ? "✓ Set" : "✗ Not set",
      clientSecret: process.env.AZURE_CLIENT_SECRET ? "✓ Set" : "✗ Not set",
      tenantId: process.env.AZURE_TENANT_ID ? "✓ Set" : "✗ Not set",
    },
    sendGrid: {
      apiKey: process.env.SENDGRID_API_KEY ? "✓ Set" : "✗ Not set",
      fromEmail: process.env.SENDGRID_FROM_EMAIL ? "✓ Set" : "✗ Not set",
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY ? "✓ Set" : "✗ Not set",
      fromEmail: process.env.RESEND_FROM_EMAIL ? "✓ Set" : "✗ Not set",
    },
  };

  // Determine which provider would be used
  let activeProvider = "None configured";
  if (process.env.AZURE_SMTP_HOST || process.env.AZURE_SMTP_USERNAME) {
    activeProvider = "Azure SMTP";
  } else if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    activeProvider = "Microsoft Graph API";
  } else if (process.env.SENDGRID_API_KEY) {
    activeProvider = "SendGrid";
  } else if (process.env.RESEND_API_KEY) {
    activeProvider = "Resend";
  }

  return NextResponse.json({
    activeProvider,
    configuration: config,
    message: activeProvider === "None configured" 
      ? "No email provider is configured. Please add email configuration to .env.local"
      : `Email provider configured: ${activeProvider}`,
  });
}
