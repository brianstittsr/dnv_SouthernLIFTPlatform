# Member Storage System Documentation

## Overview

The SVP Platform uses **two separate collections** to manage member data:

1. **`users`** collection - Firebase Authentication profiles
2. **`teamMembers`** collection - Detailed team member information

These collections are **linked** but serve different purposes.

---

## Collection Details

### 1. `users` Collection (Firebase Auth Profiles)

**Location:** `firestore/users/{userId}`

**Purpose:** Stores Firebase Authentication user data and SVP role assignments

**Key Fields:**
```typescript
{
  id: string;                    // Firebase Auth UID
  email: string;
  firstName?: string;            // Optional - often empty
  lastName?: string;             // Optional - often empty
  role: "admin" | "affiliate" | "customer" | "team_member";
  svpRole?: "platform_admin" | "sme_user" | "partner_user" | "buyer" | "qa_reviewer" | "cmmc_instructor";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Current Issue:** Your user document has:
- ✅ `email: "bstitt@strategicvalueplus.com"`
- ✅ `svpRole: "platform_admin"`
- ❌ `firstName` and `lastName` are **missing** (causing "bstitt" display)

---

### 2. `teamMembers` Collection (Detailed Member Profiles)

**Location:** `firestore/teamMembers/{memberId}`

**Purpose:** Stores comprehensive team member information with rich profile data

**Key Fields:**
```typescript
{
  id: string;
  firebaseUid?: string;          // Links to users collection
  firstName: string;
  lastName: string;
  emailPrimary: string;
  emailSecondary?: string;
  mobile?: string;
  expertise: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  linkedIn?: string;
  website?: string;
  role: "admin" | "team" | "affiliate" | "consultant";
  status: "active" | "inactive" | "pending";
  
  // Leadership flags
  isCEO?: boolean;
  isCOO?: boolean;
  isCTO?: boolean;
  isCRO?: boolean;
  
  // Client relationship
  isClient?: boolean;
  clientSince?: Timestamp;
  clientNotes?: string;
  
  // Integrations
  mattermostUserId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Current Issue:** No `teamMembers` document exists for `bstitt@strategicvalueplus.com`

---

## How They Connect

### Linking Mechanism

The connection between `users` and `teamMembers` is established through:

1. **`firebaseUid` field** in `teamMembers` document
2. **Email matching** as fallback

### Connection Flow

```
Firebase Auth User (users collection)
         ↓
    firebaseUid
         ↓
Team Member (teamMembers collection)
```

### Code Implementation

Located in `lib/auth-team-member-link.ts`:

```typescript
// 1. Try to find by Firebase UID
const teamMember = await getTeamMemberByAuthUid(firebaseUid);

// 2. If not found, try to find by email and link
if (!teamMember) {
  const teamMember = await findAndLinkTeamMember(email, firebaseUid);
}
```

### User Profile Context

Located in `contexts/user-profile-context.tsx`:

```typescript
// Loads user data on authentication
1. Fetch user document from users collection (gets svpRole)
2. Try to find linked team member by firebaseUid
3. If not found, try to find by email
4. If found, merge team member data into profile
5. If not found, use basic Firebase Auth data
```

---

## Current State Analysis

### Your Account Status

**Firebase Auth (`users` collection):**
- ✅ Document exists: `FXTwwFSKJGerShxWa4WppneGkxU2`
- ✅ Email: `bstitt@strategicvalueplus.com`
- ✅ `svpRole: "platform_admin"` (correctly set)
- ❌ `firstName` and `lastName` missing

**Team Members (`teamMembers` collection):**
- ❌ No document found for your email
- Console shows: "No Team Member found for email: bstitt@strategicvalueplus.com"

### Why You See "bstitt" Instead of Full Name

The `getDisplayName()` function in `user-profile-context.tsx`:

```typescript
const getDisplayName = () => {
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  return profile.email.split('@')[0]; // Falls back to "bstitt"
};
```

Since neither `users` nor `teamMembers` has your name, it falls back to the email prefix.

---

## Solution Options

### Option 1: Add Name to `users` Document (Quick Fix)

**Steps:**
1. Go to Firebase Console: https://console.firebase.google.com/project/kdm-svp-platform/firestore/databases/-default-/data/~2Fusers/FXTwwFSKJGerShxWa4WppneGkxU2
2. Add fields:
   ```
   firstName: "Brian"
   lastName: "Stitt"
   ```
3. Refresh browser

**Pros:** Quick, immediate fix
**Cons:** Doesn't create full team member profile

---

### Option 2: Create `teamMembers` Document (Recommended)

**Steps:**
1. Go to Firebase Console: https://console.firebase.google.com/project/kdm-svp-platform/firestore/databases/-default-/data/~2FteamMembers
2. Click "Add document"
3. Document ID: (auto-generate or use custom)
4. Add fields:
   ```
   firebaseUid: "FXTwwFSKJGerShxWa4WppneGkxU2"
   firstName: "Brian"
   lastName: "Stitt"
   emailPrimary: "bstitt@strategicvalueplus.com"
   expertise: "Platform Administration"
   title: "Platform Administrator"
   role: "admin"
   status: "active"
   isCEO: true  (if applicable)
   createdAt: [timestamp]
   updatedAt: [timestamp]
   ```
5. Refresh browser

**Pros:** 
- Full profile with all fields
- Appears in team member lists
- Can be used for leadership pages
- Supports additional metadata

**Cons:** More fields to fill out

---

### Option 3: Automated Profile Creation (Future Enhancement)

Create an API endpoint or admin tool to automatically create linked `teamMembers` documents when users are created.

**Implementation location:** `app/api/admin/users/route.ts`

```typescript
// When creating a new user, also create teamMembers document
await setDoc(doc(db, "teamMembers", teamMemberId), {
  firebaseUid: userId,
  firstName,
  lastName,
  emailPrimary: email,
  role: "admin",
  status: "active",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});
```

---

## Best Practices

### When to Use Each Collection

**Use `users` collection for:**
- Authentication and authorization
- SVP role assignments (`svpRole`)
- Quick role checks
- Firebase Auth integration

**Use `teamMembers` collection for:**
- Detailed profile information
- Team member listings
- Leadership pages
- Rich metadata (expertise, bio, social links)
- Client relationship tracking
- Integration IDs (Mattermost, etc.)

### Linking Requirements

**Always ensure:**
1. `teamMembers.firebaseUid` matches `users.id`
2. `teamMembers.emailPrimary` matches `users.email`
3. Both documents are created for platform admins
4. Updates to one collection consider the other

---

## Related Files

- **Schema:** `lib/schema.ts` (lines 572-603)
- **Linking Logic:** `lib/auth-team-member-link.ts`
- **Profile Context:** `contexts/user-profile-context.tsx`
- **User Profile Interface:** `contexts/user-profile-context.tsx` (lines 10-58)
- **Firestore Rules:** `firestore.rules`

---

## Recommendation

**For your account (bstitt@strategicvalueplus.com):**

1. **Immediate:** Add `firstName` and `lastName` to your `users` document
2. **Complete:** Create a full `teamMembers` document with all profile fields
3. **Future:** Implement automated linking when creating new admin users

This will ensure:
- ✅ Full name displays correctly
- ✅ Complete profile information
- ✅ Appears in team member lists
- ✅ Can be featured on leadership pages
- ✅ All platform features work correctly
