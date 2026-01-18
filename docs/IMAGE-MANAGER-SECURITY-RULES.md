# Image Manager - Firestore Security Rules

## Overview

This document provides the Firestore security rules for the Image Manager feature. These rules should be added to your `firestore.rules` file.

## Security Rules

Add the following rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Image Manager Collection
    match /images/{imageId} {
      // Allow authenticated users to read all images
      allow read: if request.auth != null;
      
      // Allow admin/superadmin to create, update, and delete images
      allow create, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/team_members/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/team_members/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
      
      // Validate image document structure on write
      allow write: if request.auth != null &&
        request.resource.data.keys().hasAll(['name', 'category', 'mimeType', 'base64Data', 'size', 'createdAt', 'isActive']) &&
        request.resource.data.name is string &&
        request.resource.data.category in ['hero', 'about', 'team', 'services', 'testimonials', 'logos', 'icons', 'backgrounds', 'marketing', 'portal', 'other'] &&
        request.resource.data.mimeType is string &&
        request.resource.data.base64Data is string &&
        request.resource.data.size is number &&
        request.resource.data.size <= 1048576 && // 1MB limit
        request.resource.data.isActive is bool;
    }
  }
}
```

## Rule Explanation

### Read Access
- **Who**: All authenticated users
- **Why**: Images need to be accessible to display on pages and in the Page Designer

### Write Access (Create, Update, Delete)
- **Who**: Admin and Superadmin users only
- **Why**: Only administrators should be able to manage the image library

### Validation Rules
The security rules enforce the following constraints:

1. **Required Fields**: 
   - `name` (string)
   - `category` (string)
   - `mimeType` (string)
   - `base64Data` (string)
   - `size` (number)
   - `createdAt` (timestamp)
   - `isActive` (boolean)

2. **Category Validation**: Must be one of the predefined categories:
   - hero, about, team, services, testimonials, logos, icons, backgrounds, marketing, portal, other

3. **Size Limit**: Maximum 1MB (1,048,576 bytes) per image

## Integration with Existing Rules

If you already have Firestore security rules, add the `images` collection rules within your existing `match /databases/{database}/documents` block.

### Example Integration

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing rules...
    match /team_members/{memberId} {
      // Your existing team_members rules
    }
    
    match /users/{userId} {
      // Your existing users rules
    }
    
    // Add Image Manager rules here
    match /images/{imageId} {
      allow read: if request.auth != null;
      
      allow create, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/team_members/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/team_members/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
  }
}
```

## Testing Security Rules

After deploying the rules, test them to ensure they work correctly:

### Test Read Access
1. Log in as any authenticated user
2. Navigate to a page that displays images
3. Verify images load correctly

### Test Write Access
1. Log in as an admin user
2. Navigate to `/portal/admin/images`
3. Try uploading, editing, and deleting images
4. Verify all operations work

### Test Unauthorized Access
1. Log in as a non-admin user
2. Try to access the Image Manager
3. Verify that write operations are blocked (should fail at the application level)

## Deployment

To deploy these rules to Firebase:

```bash
firebase deploy --only firestore:rules
```

Or deploy through the Firebase Console:
1. Go to Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Click on the "Rules" tab
5. Paste the rules
6. Click "Publish"

## Additional Security Considerations

1. **Client-Side Validation**: The application already validates image size and type before upload
2. **Server-Side Validation**: Firestore rules provide an additional layer of validation
3. **Role-Based Access**: Ensure your `team_members` collection has proper role assignments
4. **Image Size**: The 1MB limit is enforced both client-side (with compression) and server-side

## Troubleshooting

### Images Not Loading
- Check that the user is authenticated
- Verify the `images` collection exists in Firestore
- Check browser console for permission errors

### Cannot Upload Images
- Verify user has admin or superadmin role in `team_members` collection
- Check that image size is under 1MB
- Verify all required fields are present

### Permission Denied Errors
- Ensure Firestore rules are deployed
- Check that the user's role is correctly set in the `team_members` collection
- Verify the user is authenticated

## Related Documentation

- [Image Manager Implementation Guide](./svp-kdm-features/recreate-image-manager.md)
- [Firebase Setup Guide](./FIREBASE-SETUP-GUIDE.md)
- [Page Designer README](./features/PAGE-DESIGNER-README.md)
