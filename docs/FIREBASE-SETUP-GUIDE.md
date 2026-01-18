# Firebase Setup Guide - SVP Platform

## Current Permission Errors

You're seeing these errors because:
1. ✅ Firestore security rules haven't been deployed yet
2. ✅ Some collections don't exist in the database
3. ✅ User document may be missing SVP role fields

## Step-by-Step Setup

### 1. Deploy Firestore Security Rules

The updated `firestore.rules` file includes all SVP role-based permissions.

**Deploy the rules:**

```bash
firebase deploy --only firestore:rules
```

**Or deploy everything:**

```bash
firebase deploy
```

### 2. Initialize Your User Document

Your user is authenticated as: `bstitt@strategicvalueplus.com`

You need to add the SVP role to your user document in Firestore.

**Option A: Using Firebase Console (Easiest)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Find your user document (ID: `FXTwwFSKJGerShxWa4WppneGkxU2`)
6. Click **Edit** and add these fields:

```json
{
  "svpRole": "platform_admin",
  "svpRoleUpdatedAt": [Current Timestamp],
  "svpRoleUpdatedBy": "manual_setup"
}
```

**Option B: Using the API Endpoint**

Once the rules are deployed, you can call:

```bash
POST /api/admin/setup-svp-admin
Authorization: Bearer [YOUR_FIREBASE_ID_TOKEN]
```

This will automatically set you up as platform_admin.

### 3. Fix Missing Collections

The following collections are being queried but may not exist:

- `platformSettings` - Navigation settings
- `teamMembers` - Team member data
- `memberships` - User memberships

**Create placeholder documents:**

Go to Firestore Console and create these collections with initial documents:

#### `platformSettings/global`
```json
{
  "navigationSettings": {
    "hiddenItems": [],
    "roleVisibility": {}
  },
  "createdAt": [Current Timestamp],
  "updatedAt": [Current Timestamp]
}
```

#### `teamMembers` collection
Create an empty collection (add a dummy doc and delete it to create the collection)

#### `memberships` collection
Create an empty collection (add a dummy doc and delete it to create the collection)

### 4. Update Firestore Rules for Missing Collections

I'll add rules for the collections that are causing permission errors.

## Expected Warnings (Non-Critical)

These warnings are informational and don't affect functionality:

1. **UserWay account ID not configured**
   - Set `NEXT_PUBLIC_USERWAY_ACCOUNT_ID` in `.env.local` if you want accessibility widget
   - Or ignore - it's optional

2. **Image loading warnings**
   - Add `loading="eager"` to `/kdm-logo.png` image
   - Add `width: "auto"` or `height: "auto"` to maintain aspect ratio

## Verification Steps

After deploying rules and initializing data:

1. **Refresh the browser** (hard refresh: Ctrl+Shift+R)
2. **Check console** - permission errors should be gone
3. **Check sidebar** - SVP sections should be visible
4. **Test navigation** - Click on SVP menu items

## Quick Command Reference

```bash
# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# Check current Firebase project
firebase projects:list

# Switch Firebase project
firebase use [project-id]
```

## Troubleshooting

### Still seeing permission errors?

1. **Verify rules deployed:**
   - Check Firebase Console → Firestore → Rules tab
   - Confirm the rules include SVP role functions

2. **Check user document:**
   - Firestore → users → [your-uid]
   - Verify `svpRole: "platform_admin"` exists

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or clear all site data

### Collections still missing?

1. Create them manually in Firebase Console
2. Or wait for first write operation to create them
3. Use the initialization script (if provided)

### Sign out not working?

The Sign Out button has been fixed and should:
- Sign you out of Firebase Auth
- Redirect to home page (`/`)

## Security Notes

- ✅ All SVP collections have role-based access control
- ✅ Platform admins have full access to all features
- ✅ Regular admins see all SVP sections
- ✅ Role-specific users only see their sections
- ✅ Audit logs track all changes

## Next Steps

1. Deploy Firestore rules
2. Initialize your user as platform_admin
3. Create placeholder collections
4. Refresh browser
5. Start using the SVP platform features!

## Support

If you continue to see errors after following these steps:
1. Check browser console for specific error messages
2. Verify Firebase project configuration
3. Check that all environment variables are set
4. Review Firestore rules in Firebase Console
