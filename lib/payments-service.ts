import { db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { COLLECTIONS, type PaymentPlanDoc } from "./schema";
import { sendTemplatedEmail } from "./email";

/**
 * Check all active payment plans and send reminders for remaining balances
 */
export async function checkPaymentReminders() {
  if (!db) return { success: false, error: "Database not initialized" };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Find active payment plans with remaining balance
  const plansRef = collection(db, COLLECTIONS.PAYMENT_PLANS);
  const q = query(
    plansRef, 
    where("status", "==", "active"),
    where("remainingBalance", ">", 0)
  );

  const snapshot = await getDocs(q);
  const results = {
    processed: 0,
    remindersSent: 0,
    errors: [] as string[]
  };

  for (const planDoc of snapshot.docs) {
    const plan = { id: planDoc.id, ...planDoc.data() } as PaymentPlanDoc;
    results.processed++;

    try {
      // Logic for reminder timing:
      // 1. If event date is approaching (e.g., 30, 14, 7, 3, 1 day before)
      // 2. Based on reminderFrequency (weekly, biweekly, monthly)
      
      const eventDate = plan.dueDate.toDate();
      const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let shouldRemind = false;
      
      // Automatic reminders based on event proximity
      if ([30, 14, 7, 3, 1].includes(daysUntilEvent)) {
        shouldRemind = true;
      }
      
      // Frequency based reminders
      if (!shouldRemind && plan.nextReminderDate) {
        const nextRemind = plan.nextReminderDate.toDate();
        if (nextRemind <= now) {
          shouldRemind = true;
        }
      }

      if (shouldRemind) {
        // Fetch user email if not in plan (usually we should store it in plan for efficiency)
        // For now, assume we have it or need to fetch it
        const usersRef = collection(db, COLLECTIONS.USERS);
        const userQ = query(usersRef, where("id", "==", plan.userId));
        const userSnap = await getDocs(userQ);
        const userEmail = userSnap.docs[0]?.data()?.email;

        if (userEmail) {
          await sendTemplatedEmail("paymentReminder" as any, userEmail, {
            name: userSnap.docs[0]?.data()?.name || "Member",
            entityName: plan.entityName,
            remainingBalance: plan.remainingBalance,
            dueDate: eventDate.toLocaleDateString(),
            paymentUrl: `${process.env.NEXT_PUBLIC_PLATFORM_URL}/portal/payments/pay?planId=${plan.id}`
          });

          // Update next reminder date based on frequency
          let nextDate = new Date(now);
          if (plan.reminderFrequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
          else if (plan.reminderFrequency === "biweekly") nextDate.setDate(nextDate.getDate() + 14);
          else if (plan.reminderFrequency === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
          
          await updateDoc(doc(db, COLLECTIONS.PAYMENT_PLANS, plan.id), {
            nextReminderDate: Timestamp.fromDate(nextDate),
            updatedAt: Timestamp.now()
          });

          results.remindersSent++;
        }
      }
    } catch (err: any) {
      results.errors.push(`Error processing plan ${plan.id}: ${err.message}`);
    }
  }

  return results;
}
