/**
 * Settlement utility functions (server-side / admin use only).
 * Moved here from app/api/settlements/route.ts because Next.js route files
 * only allow HTTP method names (GET, POST, PUT, etc.) as named exports.
 */

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

/**
 * Aggregate transaction data for a settlement period.
 * Used by the settlement generation UI / admin scripts.
 */
export async function generateSettlement(periodStart: Date, periodEnd: Date) {
  if (!db) throw new Error("Database not initialized");

  const startTimestamp = Timestamp.fromDate(periodStart);
  const endTimestamp = Timestamp.fromDate(periodEnd);

  // Aggregate membership revenue
  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const membershipsQuery = query(membershipsRef, where("status", "==", "active"));
  const membershipsSnapshot = await getDocs(membershipsQuery);

  let membershipDues = 0;
  membershipsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    membershipDues += data.amount || 0;
  });

  // Aggregate ticket revenue
  const ticketsRef = collection(db, COLLECTIONS.TICKETS);
  const ticketsQuery = query(
    ticketsRef,
    where("status", "==", "paid"),
    where("createdAt", ">=", startTimestamp),
    where("createdAt", "<=", endTimestamp)
  );
  const ticketsSnapshot = await getDocs(ticketsQuery);

  let eventTickets = 0;
  ticketsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    eventTickets += data.price || 0;
  });

  // Aggregate sponsor revenue
  const sponsorsRef = collection(db, COLLECTIONS.SPONSORS);
  const sponsorsQuery = query(
    sponsorsRef,
    where("status", "==", "paid"),
    where("paidAt", ">=", startTimestamp),
    where("paidAt", "<=", endTimestamp)
  );
  const sponsorsSnapshot = await getDocs(sponsorsQuery);

  let sponsorFees = 0;
  sponsorsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    sponsorFees += data.amount || 0;
  });

  return {
    membershipDues,
    eventTickets,
    sponsorFees,
    pursuitPacks: 0,
    other: 0,
  };
}
