# Add Team Member Record for Brian Stitt

## Issue
Console warning: "No Team Member found for email: bstitt@strategicvalueplus.com"

## Solution
Add a team member record in Firebase to link the user account to the team members directory.

## Firebase Collection: `team_members`

Add the following document:

```json
{
  "email": "bstitt@strategicvalueplus.com",
  "firstName": "Brian",
  "lastName": "Stitt",
  "title": "Platform Administrator",
  "role": "platform_admin",
  "department": "Technology",
  "bio": "Platform administrator and technical lead for Strategic Value Plus.",
  "phone": "",
  "location": "",
  "linkedUserId": "FXTwwFSKJGerShxWa4WppneGkxU2",
  "isActive": true,
  "joinedDate": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-22T00:00:00.000Z"
}
```

## Steps to Add via Firebase Console:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `kdm-svp-platform`
3. Navigate to Firestore Database
4. Find or create collection: `team_members`
5. Click "Add Document"
6. Use auto-generated ID or custom ID: `brian-stitt`
7. Add all fields from the JSON above
8. Save the document

## Alternative: Add via Admin Script

If you have admin access, you can add this via a script or the admin panel once the team members management interface is built.

## Verification

After adding the record:
1. Refresh the application
2. Check browser console - the warning should be gone
3. User profile should now link to team member record
4. Team member features should be accessible

## Notes
- The `linkedUserId` field connects the user account to the team member record
- This allows the user to appear in team directories and have team member features
- The warning is non-critical but linking improves functionality
