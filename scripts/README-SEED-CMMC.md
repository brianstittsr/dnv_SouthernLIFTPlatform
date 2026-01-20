# Seeding CMMC Courses

There are two ways to seed the CMMC courses into your database:

## Option 1: Using the API Route (Recommended)

1. Make sure your `.env.local` file has `ADMIN_SEED_TOKEN` set:
   ```
   ADMIN_SEED_TOKEN=your-secret-token-here
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

3. Make a POST request to the seed endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/seed-cmmc-courses \
     -H "Authorization: Bearer your-secret-token-here"
   ```

   Or use PowerShell:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3000/api/seed-cmmc-courses" `
     -Method POST `
     -Headers @{"Authorization"="Bearer your-secret-token-here"}
   ```

## Option 2: Using Node with tsx

1. Install tsx globally (if not already installed):
   ```bash
   npm install -g tsx
   ```

2. Make sure your Firebase Admin environment variables are set in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. Run the seed script:
   ```bash
   npx tsx seed-cmmc-courses.ts
   ```

## What Gets Created

The seed script creates 3 CMMC courses:

### CMMC Level 1 - Foundations ($1,499)
- 8 weeks, Beginner level
- 8 modules, 24 sessions
- 17 basic security practices
- Focus: Federal Contract Information (FCI)

### CMMC Level 2 - Advanced ($3,499)
- 12 weeks, Intermediate level
- 12 modules, 36 sessions
- 110 security requirements (NIST 800-171)
- Focus: Controlled Unclassified Information (CUI)

### CMMC Level 3 - Expert ($5,999)
- 16 weeks, Advanced level
- 16 modules, 48 sessions
- 130+ expert-level practices
- Focus: Advanced Persistent Threat (APT) protection

## Troubleshooting

### "ts-node is not recognized"
- Use `npx tsx` instead of `ts-node`
- Or use the API route method (Option 1)

### "Service account object must contain a string 'project_id' property"
- Check that your `.env.local` file has all required Firebase Admin variables
- Make sure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set
- Ensure `FIREBASE_PRIVATE_KEY` is properly formatted with escaped newlines

### "Unauthorized"
- Set `ADMIN_SEED_TOKEN` in your `.env.local`
- Use the same token in your Authorization header

## After Seeding

Once seeded, you can:
1. View courses at: `http://localhost:3000/cohorts`
2. View individual course: `http://localhost:3000/cohorts/cmmc-level-1-foundations`
3. Manage courses in instructor dashboard: `http://localhost:3000/portal/instructor/cohorts`
