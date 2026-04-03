# Email Configuration Setup

The payment confirmation emails require an email service provider to be configured. The system supports three providers with the following priority:

1. **Microsoft Graph API** (Office 365) - Recommended for enterprise
2. **SendGrid** - Simple cloud-based email service
3. **Resend** - Modern email API

## Option 1: Microsoft Graph API (Office 365)

This is the recommended option if you have an Office 365 account.

### Setup Steps:

1. **Create an Azure AD Application**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "KDM Consortium Email Service"
   - Click "Register"

2. **Configure API Permissions**
   - In the app registration, go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Application permissions"
   - Search for and select "Mail.Send"
   - Click "Add permissions"
   - Click "Grant admin consent"

3. **Create Client Secret**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Set expiration (e.g., 24 months)
   - Copy the secret value

4. **Add to .env.local**
   ```
   AZURE_CLIENT_ID=<your-client-id>
   AZURE_CLIENT_SECRET=<your-client-secret>
   AZURE_TENANT_ID=<your-tenant-id>
   SMTP_FROM_EMAIL=admin@kdm-assoc.com
   SMTP_FROM_NAME=KDM & Associates
   ```

   Get these values from:
   - `AZURE_CLIENT_ID`: "Application (client) ID" in app registration overview
   - `AZURE_TENANT_ID`: "Directory (tenant) ID" in app registration overview
   - `AZURE_CLIENT_SECRET`: The secret you just created

## Option 2: SendGrid

### Setup Steps:

1. **Create SendGrid Account**
   - Go to [SendGrid](https://sendgrid.com)
   - Sign up for a free account

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "KDM Consortium"
   - Copy the API key

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Add your sender email (e.g., noreply@kdmassociates.com)
   - Verify the email

4. **Add to .env.local**
   ```
   SENDGRID_API_KEY=<your-api-key>
   SENDGRID_FROM_EMAIL=noreply@kdmassociates.com
   SENDGRID_FROM_NAME=KDM Consortium
   ```

## Option 3: Resend

### Setup Steps:

1. **Create Resend Account**
   - Go to [Resend](https://resend.com)
   - Sign up for a free account

2. **Create API Key**
   - Go to API Keys
   - Click "Create API Key"
   - Copy the API key

3. **Add Domain**
   - Go to Domains
   - Add your domain (e.g., kdmassociates.com)
   - Follow DNS verification steps

4. **Add to .env.local**
   ```
   RESEND_API_KEY=<your-api-key>
   RESEND_FROM_EMAIL=noreply@kdmassociates.com
   RESEND_FROM_NAME=KDM Consortium
   ```

## Testing Email Sending

After configuring an email provider, test the email sending by:

1. Complete a payment on the checkout page
2. Check the server logs for any email sending errors
3. Verify the confirmation email arrives in the recipient's inbox

## Troubleshooting

### "No email service configured" Error
- Ensure you've set the required environment variables for at least one provider
- Restart the development server after adding environment variables

### Email Not Arriving
- Check spam/junk folder
- Verify the sender email is properly configured in your email provider
- Check server logs for error messages
- Ensure the email address is valid

### Authentication Errors
- Verify API keys/credentials are correct
- For Microsoft Graph: Ensure admin consent was granted for Mail.Send permission
- For SendGrid: Verify the API key is active and not expired
- For Resend: Verify the domain is verified

## Current Status

The email sending endpoint is now configured to send confirmation emails immediately upon successful payment. The system will attempt to use the first available email provider based on the priority order above.
