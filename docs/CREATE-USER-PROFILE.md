# Create User Profile in Firestore

## Issue
The error "No Team Member found for email: bstitt@strategicvalueplus.com" occurs because there's no user document in the Firestore `users` collection for the authenticated user.

## Solution: Create User Document in Firebase Console

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: `kdm-svp-platform`
3. Navigate to **Firestore Database** in the left sidebar

### Step 2: Create User Document
1. Click on the `users` collection (or create it if it doesn't exist)
2. Click **"Add document"**
3. Use the following document ID: `FXTwwFSKJGerShxWa4WppneGkxU2`
4. Add the following fields:

```
Field Name          | Type      | Value
--------------------|-----------|----------------------------------
email               | string    | bstitt@strategicvalueplus.com
firstName           | string    | Brian
lastName            | string    | Stitt
displayName         | string    | Brian Stitt
svpRole             | string    | platform_admin
role                | string    | admin
subscriptionTier    | string    | diy
isActive            | boolean   | true
emailVerified       | boolean   | true
createdAt           | timestamp | (current timestamp)
updatedAt           | timestamp | (current timestamp)
lastLoginAt         | timestamp | (current timestamp)
```

### Step 3: Verify
After creating the document:
1. Refresh your browser at `http://localhost:3000/portal/subscription`
2. The page should now load without errors
3. You should see your subscription tier as "DIY"

## Alternative: Use Firebase CLI

If you have Firebase CLI installed and configured:

```bash
# Navigate to project directory
cd c:\Users\Buyer\Documents\CascadeProjects\KDMAssociates\svp-platform

# Run the Firebase shell
firebase firestore:shell

# In the Firebase shell, run:
db.collection('users').doc('FXTwwFSKJGerShxWa4WppneGkxU2').set({
  email: 'bstitt@strategicvalueplus.com',
  firstName: 'Brian',
  lastName: 'Stitt',
  displayName: 'Brian Stitt',
  svpRole: 'platform_admin',
  role: 'admin',
  subscriptionTier: 'diy',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date()
})
```

## What This Fixes

Creating this user document will:
- ✅ Fix the `/api/profile` 500 error
- ✅ Allow the subscription page to load properly
- ✅ Display the correct subscription tier (DIY)
- ✅ Show "Platform Admin" role in the sidebar
- ✅ Enable all platform features for this user

## User Document Structure

The `users` collection stores core user profile data:

- **email**: User's email address (from Firebase Auth)
- **firstName/lastName**: User's full name
- **displayName**: Combined name for display
- **svpRole**: SVP platform role (platform_admin, sme_user, partner_user, etc.)
- **role**: General role (admin, member, etc.)
- **subscriptionTier**: Current subscription (free, diy, dwy, dfy)
- **isActive**: Whether the user account is active
- **emailVerified**: Whether email is verified
- **Timestamps**: Track creation, updates, and last login

## Related Documentation

- See `docs/MEMBER-STORAGE-SYSTEM.md` for details on the user storage architecture
- See `docs/FIREBASE-SETUP-GUIDE.md` for Firebase configuration
