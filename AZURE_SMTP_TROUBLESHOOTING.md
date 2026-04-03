# Azure SMTP Authentication Troubleshooting

## Current Status
- **Email Account:** `noreply@kdm-assoc.com`
- **Current SMTP Host:** `smtp.azurecomm.net` (INCORRECT)
- **Issue:** Authentication failing with error `535 5.7.3 Authentication unsuccessful`

## Root Cause
The credentials are configured for an **Office 365 account** but the SMTP host is set to `smtp.azurecomm.net` (Azure Communication Services), which requires different credentials.

## Solution

### Step 1: Update AZURE_SMTP_HOST in .env.local
Change from:
```
AZURE_SMTP_HOST=smtp.azurecomm.net
```

To:
```
AZURE_SMTP_HOST=smtp.office365.com
```

### Step 2: Verify Password Requirements
Office 365 SMTP may require:
1. **App-Specific Password** - If 2FA is enabled on the account
   - Go to https://account.microsoft.com/security
   - Create an app-specific password
   - Use this password in `AZURE_SMTP_PASSWORD`

2. **Account Permissions** - Ensure the account allows SMTP relay
   - Check if the account is licensed for Exchange Online
   - Verify SMTP AUTH is enabled

3. **Security Settings** - Check for:
   - Two-factor authentication (may require app password)
   - Conditional access policies
   - Legacy authentication restrictions

### Step 3: Test the Configuration
After updating `.env.local`:
1. Restart the dev server: `npm run dev`
2. Test the email endpoint: `GET /api/test/test-office365`
3. Check if test email is sent to `brianestittsr@outlook.com`

## If Office 365 Still Fails

### Option A: Use App-Specific Password
1. Enable 2FA on the Office 365 account
2. Generate app-specific password at https://account.microsoft.com/security
3. Update `AZURE_SMTP_PASSWORD` with the app-specific password

### Option B: Switch to SendGrid (Recommended Alternative)
If Office 365 continues to fail:

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env.local`:
```
SENDGRID_API_KEY=your-api-key-here
SENDGRID_FROM_EMAIL=noreply@kdm-assoc.com
SENDGRID_FROM_NAME=KDM & Associates
```
4. Remove or comment out Azure SMTP settings

### Option C: Switch to Resend
1. Sign up at https://resend.com
2. Create an API key
3. Update `.env.local`:
```
RESEND_API_KEY=your-api-key-here
RESEND_FROM_EMAIL=noreply@kdm-assoc.com
RESEND_FROM_NAME=KDM & Associates
```

## Testing Endpoints

### Check Current Configuration
```
GET /api/test/check-credentials
```
Shows current SMTP settings and credential format

### Test Office 365 SMTP
```
GET /api/test/test-office365
```
Tests connection to Office 365 SMTP server

### Test All SMTP Alternatives
```
GET /api/test/smtp-alternatives
```
Tests multiple SMTP servers to find working configuration

### Send Test Email
```
POST /api/test/send-test-email
Body: { "email": "brianestittsr@outlook.com" }
```
Sends a test KDM Consortium registration email

## Common Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| `535 5.7.3` | Invalid credentials | Verify password, check for 2FA requirement |
| `EAUTH` | Authentication failed | Check username format and password |
| `ETIMEDOUT` | Connection timeout | Verify host and port are correct |
| `ECONNREFUSED` | Connection refused | Check SMTP server is reachable |

## Verification Checklist

- [ ] Updated `AZURE_SMTP_HOST` to `smtp.office365.com`
- [ ] Verified `AZURE_SMTP_USERNAME` is correct email address
- [ ] Verified `AZURE_SMTP_PASSWORD` is correct (or app-specific password if 2FA enabled)
- [ ] Restarted dev server after changes
- [ ] Tested `/api/test/test-office365` endpoint
- [ ] Received test email at `brianestittsr@outlook.com`
- [ ] Confirmed payment confirmation emails are sending

## Next Steps

1. Update `.env.local` with correct SMTP host
2. If still failing, generate app-specific password
3. Test using `/api/test/test-office365` endpoint
4. Once working, test full checkout flow with payment confirmation email
