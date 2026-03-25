# Team Members Setup Guide

## Overview

Team members are stored in Firestore and displayed on the `/team` page. For team members to appear on the website, they must have specific fields configured correctly.

## Required Fields

Each team member document in the `team_members` collection must have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | Team member's first name |
| `lastName` | string | Yes | Team member's last name |
| `status` | string | Yes | Must be `"active"` to display on team page |
| `title` | string | Yes* | Job title or role (*or `expertise` field) |
| `expertise` | string | Yes* | Area of expertise (*or `title` field) |
| `bio` | string | Yes | Biography/description (displayed on detail page) |
| `teamTag` | string | No | Category: `"leadership"`, `"staff"`, or `"affiliate"` (default: `"affiliate"`) |
| `avatar` | string | No | URL to team member's photo |
| `linkedIn` | string | No | LinkedIn profile URL |
| `displayOrder` | number | No | Sort order within team tag (lower numbers appear first) |

## Checking Team Member Data

### Using the Script

Run the verification script to check all team members:

```bash
node scripts/check-team-members.js
```

This will:
- List all team members in Firestore
- Check for missing required fields
- Report any issues
- Provide a summary

### Manual Check in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Open the **`team_members`** collection
5. Review each document for required fields

## Fixing Team Member Data

### Via Firebase Console (Recommended)

1. Open Firebase Console > Firestore Database
2. Click on the **`team_members`** collection
3. For each team member that needs fixing:
   - Click the document to open it
   - Add/update these fields:
     - `status`: Set to `"active"`
     - `title`: Add their job title
     - `bio`: Add their biography
     - `teamTag`: Set to `"leadership"`, `"staff"`, or `"affiliate"`
     - `avatar`: (Optional) Add photo URL
     - `linkedIn`: (Optional) Add LinkedIn profile URL
   - Click **Save**

### Example Team Member Document

```json
{
  "firstName": "Deon",
  "lastName": "Norals",
  "status": "active",
  "title": "Chief Technology Officer",
  "expertise": "Zero Trust Architecture & Cyber Resilience Engineering",
  "bio": "With more than three decades of executive experience, Mr. Norals brings deep technical command aligned with strategic foresight...",
  "teamTag": "leadership",
  "avatar": "https://example.com/deon-norals.jpg",
  "linkedIn": "https://linkedin.com/in/deonmorals",
  "displayOrder": 1
}
```

## Team Page Display Logic

### Filtering
- Only team members with `status: "active"` appear on the `/team` page
- Team members are grouped by `teamTag`:
  - **KDM Leadership** (teamTag: `"leadership"`)
  - **KDM Staff** (teamTag: `"staff"`)
  - **KDM Affiliates** (teamTag: `"affiliate"`)

### Sorting
Within each group, members are sorted by:
1. `displayOrder` (ascending)
2. `name` (alphabetical)

## Detail Pages

When a team member is clicked on the `/team` page, they're taken to `/team/{memberId}` which displays:
- Team member's photo (from `avatar` field)
- Full name and title
- Complete biography (from `bio` field)
- LinkedIn link (if provided)

## Troubleshooting

### Team members not showing on `/team` page
- **Check**: Is `status` set to `"active"`?
- **Check**: Do they have `firstName` and `lastName`?
- **Check**: Do they have `title` or `expertise`?

### Detail page shows "Team Member Not Found"
- **Check**: Does the team member exist in Firestore?
- **Check**: Is their `status` set to `"active"`?
- **Check**: Do they have a valid `id` (document ID)?

### Photos not loading on team page
- **Check**: Is `avatar` field set to a valid image URL?
- **Check**: Is the image URL publicly accessible?
- **Fallback**: If no avatar, the page shows initials instead

### Bio not displaying on detail page
- **Check**: Is the `bio` field populated?
- **Check**: Is the text formatted correctly (use `\n\n` for paragraphs)?

## Adding New Team Members

1. Go to Firebase Console > Firestore Database
2. Click **`team_members`** collection
3. Click **Add document**
4. Enter a document ID (can be auto-generated)
5. Add all required fields:
   ```
   firstName: [First Name]
   lastName: [Last Name]
   status: active
   title: [Job Title]
   bio: [Biography]
   teamTag: [leadership/staff/affiliate]
   ```
6. Click **Save**
7. Team member will appear on `/team` page within seconds

## Removing Team Members

To remove a team member from the website without deleting their record:
1. Open the team member's document in Firebase Console
2. Change `status` from `"active"` to `"inactive"`
3. Click **Save**
4. Team member will no longer appear on `/team` page

## API Schema

The TypeScript interface for team members:

```typescript
interface TeamMemberDoc {
  firstName: string;
  lastName: string;
  status: "active" | "inactive";
  title?: string;
  expertise?: string;
  bio: string;
  teamTag?: "leadership" | "staff" | "affiliate";
  avatar?: string;
  linkedIn?: string;
  displayOrder?: number;
}
```

See `@/lib/schema.ts` for the complete schema definition.
