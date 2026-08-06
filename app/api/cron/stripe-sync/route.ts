import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db, auth } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import type Stripe from "stripe";

/**
 * GET /api/cron/stripe-sync
 * Nightly cron job that syncs Stripe customer emails with Firebase.
 *
 * Logic:
 * 1. List all Stripe customers (paginated).
 * 2. For each Stripe customer email:
 *    a. Not in Firebase Auth or consortium_members → create consortium_members
 *       doc with membershipStatus "pending", onboardingStatus "not_started",
 *       source "stripe", stripeSyncStatus "not_started".
 *    b. In Firebase Auth but not in consortium_members → create consortium_members
 *       doc linked via firebaseUid, stripeSyncStatus "registered".
 *    c. In both → update membershipStatus to "active" if Stripe subscription
 *       is active, stripeSyncStatus "active".
 * 3. For Firebase Auth users not in Stripe (manually added):
 *    Set stripeSyncStatus "linked" and link to existing company.
 * 4. Upsert into team_members for matched users.
 *
 * Protected by CRON_SECRET environment variable.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
  }

  const stripe = getStripe();
  const syncTimestamp = Timestamp.now();
  const results = {
    stripeCustomers: 0,
    newMembers: 0,
    registeredMembers: 0,
    activeMembers: 0,
    linkedMembers: 0,
    teamMembersAdded: 0,
    errors: [] as string[],
  };

  try {
    // ─── 1. Fetch all Stripe customers (paginated) ───────────────────────
    const stripeEmails = new Map<string, { customerId: string; name: string | null; subscriptionActive: boolean }>();
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const listParams: Stripe.CustomerListParams = { limit: 100 };
      if (startingAfter) (listParams as any).starting_after = startingAfter;

      const customers = await stripe.customers.list(listParams);

      for (const customer of customers.data) {
        if (customer.email && !customer.deleted) {
          // Check if customer has active subscriptions
          let subscriptionActive = false;
          try {
            const subs = await stripe.subscriptions.list({
              customer: customer.id,
              status: "active",
              limit: 1,
            });
            subscriptionActive = subs.data.length > 0;
          } catch {
            // Non-critical: default to false
          }

          stripeEmails.set(customer.email.toLowerCase(), {
            customerId: customer.id,
            name: customer.name ?? null,
            subscriptionActive,
          });
        }
      }

      hasMore = customers.has_more;
      if (customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    results.stripeCustomers = stripeEmails.size;

    // ─── 2. Fetch existing consortium members by email ──────────────────
    const membersSnapshot = await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).get();
    const membersByEmail = new Map<string, { id: string; data: Record<string, unknown> }>();

    membersSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const email = (data.emailPrimary || "").toLowerCase();
      if (email) {
        membersByEmail.set(email, { id: docSnap.id, data });
      }
    });

    // ─── 3. Fetch all Firebase Auth users ────────────────────────────────
    const authUsersByEmail = new Map<string, string>(); // email → uid
    try {
      if (auth) {
        let pageToken: string | undefined;
        do {
          const listUsersResult = await auth.listUsers(1000, pageToken);
          for (const userRecord of listUsersResult.users) {
            if (userRecord.email) {
              authUsersByEmail.set(userRecord.email.toLowerCase(), userRecord.uid);
            }
          }
          pageToken = listUsersResult.pageToken;
        } while (pageToken);
      }
    } catch (authError) {
      console.error("Error listing Auth users:", authError);
      results.errors.push("Failed to list Firebase Auth users");
    }

    // ─── 4. Fetch existing team members by email ────────────────────────
    const teamMembersSnapshot = await db.collection(COLLECTIONS.TEAM_MEMBERS).get();
    const teamMembersByEmail = new Set<string>();
    teamMembersSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const email = (data.emailPrimary || "").toLowerCase();
      if (email) teamMembersByEmail.add(email);
    });

    // ─── 5. Process each Stripe customer ────────────────────────────────
    for (const [emailLower, stripeInfo] of stripeEmails) {
      try {
        const existingMember = membersByEmail.get(emailLower);
        const authUid = authUsersByEmail.get(emailLower);

        if (existingMember) {
          // Case C: In both Stripe and consortium_members → update
          const updates: Record<string, unknown> = {
            source: "stripe",
            stripeCustomerId: stripeInfo.customerId,
            lastStripeSyncAt: syncTimestamp,
            updatedAt: syncTimestamp,
          };

          if (stripeInfo.subscriptionActive) {
            updates.stripeSyncStatus = "active";
            updates.membershipStatus = "active";
          } else {
            updates.stripeSyncStatus = "registered";
          }

          await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).doc(existingMember.id).update(updates);
          results.activeMembers++;
        } else if (authUid) {
          // Case B: In Firebase Auth but not in consortium_members → create
          const userDoc = await db.collection(COLLECTIONS.USERS).doc(authUid).get();
          const userData = userDoc.data() || {};

          const firstName = userData.firstName || (stripeInfo.name ? stripeInfo.name.split(" ")[0] : "");
          const lastName = userData.lastName || (stripeInfo.name ? stripeInfo.name.split(" ").slice(1).join(" ") : "");

          await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).add({
            firebaseUid: authUid,
            firstName,
            lastName,
            emailPrimary: emailLower,
            company: userData.company || userData.companyName || "",
            membershipTier: "core-capture",
            membershipStatus: stripeInfo.subscriptionActive ? "active" : "pending",
            onboardingStage: "profile",
            source: "stripe",
            stripeSyncStatus: "registered",
            stripeCustomerId: stripeInfo.customerId,
            lastStripeSyncAt: syncTimestamp,
            createdAt: syncTimestamp,
            updatedAt: syncTimestamp,
          });
          results.registeredMembers++;
        } else {
          // Case A: Not in Firebase Auth or consortium_members → create as not_started
          const firstName = stripeInfo.name ? stripeInfo.name.split(" ")[0] : "";
          const lastName = stripeInfo.name ? stripeInfo.name.split(" ").slice(1).join(" ") : "";

          await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).add({
            firstName,
            lastName,
            emailPrimary: emailLower,
            membershipTier: "core-capture",
            membershipStatus: "pending",
            onboardingStage: "profile",
            source: "stripe",
            stripeSyncStatus: "not_started",
            stripeCustomerId: stripeInfo.customerId,
            lastStripeSyncAt: syncTimestamp,
            createdAt: syncTimestamp,
            updatedAt: syncTimestamp,
          });
          results.newMembers++;
        }

        // Upsert into team_members if not already there
        if (!teamMembersByEmail.has(emailLower)) {
          const firstName = existingMember?.data.firstName || (stripeInfo.name ? stripeInfo.name.split(" ")[0] : "");
          const lastName = existingMember?.data.lastName || (stripeInfo.name ? stripeInfo.name.split(" ").slice(1).join(" ") : "");

          await db.collection(COLLECTIONS.TEAM_MEMBERS).add({
            firstName,
            lastName,
            emailPrimary: emailLower,
            expertise: "",
            role: "sme_user",
            status: "active",
            firebaseUid: authUid || null,
            createdAt: syncTimestamp,
            updatedAt: syncTimestamp,
          });
          results.teamMembersAdded++;
        }
      } catch (err) {
        const msg = `Error processing Stripe customer ${emailLower}: ${err instanceof Error ? err.message : "Unknown"}`;
        results.errors.push(msg);
        console.error(msg);
      }
    }

    // ─── 6. Process Firebase-only users (manually added) ────────────────
    for (const [emailLower, uid] of authUsersByEmail) {
      if (stripeEmails.has(emailLower)) continue; // Skip if in Stripe

      const existingMember = membersByEmail.get(emailLower);
      if (!existingMember) continue;

      // This user was added manually — link to existing company
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
      const userData = userDoc.data() || {};
      const companyName = userData.company || userData.companyName || "";

      if (companyName) {
        // Find company in companies collection
        const companiesSnapshot = await db
          .collection(COLLECTIONS.COMPANIES)
          .where("name", "==", companyName)
          .limit(1)
          .get();

        let companyId: string | undefined;
        if (!companiesSnapshot.empty) {
          companyId = companiesSnapshot.docs[0].id;
        }

        await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).doc(existingMember.id).update({
          source: "manual",
          stripeSyncStatus: "linked",
          linkedCompanyId: companyId || null,
          company: companyName,
          lastStripeSyncAt: syncTimestamp,
          updatedAt: syncTimestamp,
        });
        results.linkedMembers++;
      }
    }

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Stripe sync error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed",
        results,
      },
      { status: 500 }
    );
  }
}
