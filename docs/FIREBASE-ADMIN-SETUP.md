# Firebase Admin SDK Setup

## Issue
The `/api/profile` endpoint returns 500 errors because Firebase Admin SDK credentials are not configured.

## Solution: Add Firebase Admin Credentials

### Step 1: Get Service Account Key from Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: `kdm-svp-platform`
3. Click the **gear icon** (⚙️) next to "Project Overview"
4. Select **"Project settings"**
5. Go to the **"Service accounts"** tab
6. Click **"Generate new private key"**
7. Click **"Generate key"** to download the JSON file
8. Save the file securely (it contains sensitive credentials)

### Step 2: Add Credentials to .env.local

Open or create `.env.local` in your project root and add these variables from the downloaded JSON file:

```bash
# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=kdm-svp-platform
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kdm-svp-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must be wrapped in double quotes
- Keep the `\n` characters in the private key (they represent line breaks)
- The entire key should be on one line in the `.env.local` file
- Never commit this file to Git (it's already in `.gitignore`)

### Step 3: Restart Your Dev Server

After adding the credentials:

```bash
# Kill the current dev server (Ctrl+C or taskkill)
taskkill /F /IM node.exe

# Start it again
npm run dev
```

### Step 4: Verify

1. Refresh your browser at `http://localhost:3000/portal/subscription`
2. The `/api/profile` endpoint should now return 200 instead of 500
3. The subscription page should load properly

## What This Fixes

Adding Firebase Admin credentials will:
- ✅ Fix `/api/profile` 500 errors
- ✅ Enable server-side Firestore access
- ✅ Allow subscription tier updates
- ✅ Enable Stripe checkout integration
- ✅ Support all API routes that need Firebase Admin

## Security Notes

- **Never** commit the service account JSON file to Git
- **Never** commit `.env.local` to Git
- Keep the private key secure
- Rotate the key if it's ever exposed
- Use different service accounts for dev/staging/production

## Alternative: Use Emulator for Development

If you don't want to use production Firebase credentials in development:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start
```

Then update your `.env.local`:
```bash
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

## Troubleshooting

### Error: "Service account object must contain a string 'project_id' property"
- Make sure `FIREBASE_PROJECT_ID` is set in `.env.local`
- Restart your dev server after adding variables

### Error: "Invalid service account certificate"
- Check that the private key is properly formatted with `\n` characters
- Ensure the entire key is wrapped in double quotes
- Verify you copied the complete key from the JSON file

### Still getting 500 errors?
- Check the terminal/console for specific error messages
- Verify the service account has the correct permissions in Firebase Console
- Make sure you're using the correct project ID
