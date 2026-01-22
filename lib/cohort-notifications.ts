/**
 * Cohort Notification Templates and Utilities
 * Handles email and push notification generation for cohort events
 */

import {
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  emailSubject?: string;
  emailBody?: string;
}

/**
 * Notification templates for cohort lifecycle events
 */
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  enrollment_confirmation: {
    type: "enrollment",
    title: "Welcome to {{cohortTitle}}!",
    message: "Your enrollment has been confirmed. The cohort starts on {{startDate}}.",
    emailSubject: "Enrollment Confirmed - {{cohortTitle}}",
    emailBody: `
      <h2>Welcome to {{cohortTitle}}!</h2>
      <p>Your enrollment has been confirmed.</p>
      <p><strong>Start Date:</strong> {{startDate}}</p>
      <p><strong>Duration:</strong> {{duration}} weeks</p>
      <p><strong>Facilitator:</strong> {{facilitatorName}}</p>
      <p>You will receive notifications when new content is released.</p>
      <p><a href="{{cohortUrl}}">Access Cohort Dashboard</a></p>
    `,
  },
  
  content_release: {
    type: "content_release",
    title: "New Content Available - Week {{weekNumber}}",
    message: "Week {{weekNumber}} materials for {{cohortTitle}} are now available.",
    emailSubject: "New Content Released - {{cohortTitle}}",
    emailBody: `
      <h2>New Content Available!</h2>
      <p>Week {{weekNumber}} materials for {{cohortTitle}} are now available.</p>
      <p><strong>Module:</strong> {{moduleTitle}}</p>
      <p><strong>Sessions:</strong> {{sessionCount}}</p>
      <p><a href="{{cohortUrl}}">Access Content Now</a></p>
    `,
  },
  
  session_reminder: {
    type: "session_reminder",
    title: "Upcoming Session Tomorrow",
    message: "Don't forget: {{sessionTitle}} is scheduled for tomorrow at {{sessionTime}}.",
    emailSubject: "Reminder: {{sessionTitle}} Tomorrow",
    emailBody: `
      <h2>Session Reminder</h2>
      <p>Don't forget about your upcoming session!</p>
      <p><strong>Session:</strong> {{sessionTitle}}</p>
      <p><strong>Date:</strong> {{sessionDate}}</p>
      <p><strong>Time:</strong> {{sessionTime}}</p>
      <p><a href="{{sessionUrl}}">Join Session</a></p>
    `,
  },
  
  cohort_started: {
    type: "cohort_started",
    title: "{{cohortTitle}} Has Started!",
    message: "Your cohort has officially started. Access your first module now!",
    emailSubject: "{{cohortTitle}} Has Started!",
    emailBody: `
      <h2>Your Cohort Has Started!</h2>
      <p>{{cohortTitle}} has officially begun.</p>
      <p>Your first module is now available. Log in to get started!</p>
      <p><a href="{{cohortUrl}}">Start Learning</a></p>
    `,
  },
  
  cohort_completed: {
    type: "completion",
    title: "Congratulations on Completing {{cohortTitle}}!",
    message: "You've completed the cohort! Your certificate is being generated.",
    emailSubject: "Cohort Completed - Certificate Available",
    emailBody: `
      <h2>Congratulations!</h2>
      <p>You've successfully completed {{cohortTitle}}!</p>
      <p>Your certificate is being generated and will be available shortly.</p>
      <p><strong>Completion Date:</strong> {{completionDate}}</p>
      <p><a href="{{certificateUrl}}">Download Certificate</a></p>
    `,
  },
  
  certificate_issued: {
    type: "certificate",
    title: "Your Certificate is Ready!",
    message: "Your certificate for {{cohortTitle}} is now available to download.",
    emailSubject: "Certificate Ready - {{cohortTitle}}",
    emailBody: `
      <h2>Your Certificate is Ready!</h2>
      <p>Congratulations on completing {{cohortTitle}}!</p>
      <p><strong>Certificate Number:</strong> {{certificateNumber}}</p>
      <p><strong>Issued Date:</strong> {{issuedDate}}</p>
      <p><a href="{{certificateUrl}}">Download Certificate</a></p>
      <p><a href="{{verifyUrl}}">Verify Certificate</a></p>
    `,
  },
  
  waitlist_spot_available: {
    type: "waitlist_spot_available",
    title: "Spot Available in {{cohortTitle}}!",
    message: "A spot has opened up in your waitlisted cohort. Enroll now!",
    emailSubject: "Spot Available - {{cohortTitle}}",
    emailBody: `
      <h2>Great News!</h2>
      <p>A spot has opened up in {{cohortTitle}}!</p>
      <p>You have 48 hours to claim your spot before we notify the next person on the waitlist.</p>
      <p><a href="{{enrollUrl}}">Enroll Now</a></p>
    `,
  },
  
  cohort_cancelled: {
    type: "cohort_cancelled",
    title: "{{cohortTitle}} Has Been Cancelled",
    message: "This cohort has been cancelled. You will receive a full refund if applicable.",
    emailSubject: "Cohort Cancelled - {{cohortTitle}}",
    emailBody: `
      <h2>Cohort Cancellation Notice</h2>
      <p>We regret to inform you that {{cohortTitle}} has been cancelled.</p>
      <p><strong>Reason:</strong> {{cancellationReason}}</p>
      <p>If you paid for this cohort, you will receive a full refund within 5-7 business days.</p>
      <p>We apologize for any inconvenience.</p>
    `,
  },
  
  live_training_reminder: {
    type: "session_reminder",
    title: "Live Training Starting Soon",
    message: "{{trainingTitle}} starts in 1 hour. Join link: {{meetingUrl}}",
    emailSubject: "Live Training Starting Soon - {{trainingTitle}}",
    emailBody: `
      <h2>Live Training Reminder</h2>
      <p>Your live training session starts in 1 hour!</p>
      <p><strong>Training:</strong> {{trainingTitle}}</p>
      <p><strong>Time:</strong> {{trainingTime}}</p>
      <p><strong>Duration:</strong> {{duration}} minutes</p>
      <p><a href="{{meetingUrl}}">Join Training</a></p>
    `,
  },
  
  achievement_unlocked: {
    type: "achievement",
    title: "Achievement Unlocked: {{badgeName}}!",
    message: "Congratulations! You've earned the {{badgeName}} badge.",
    emailSubject: "New Achievement - {{badgeName}}",
    emailBody: `
      <h2>Achievement Unlocked!</h2>
      <p>Congratulations! You've earned a new badge.</p>
      <p><strong>Badge:</strong> {{badgeName}}</p>
      <p><strong>Description:</strong> {{badgeDescription}}</p>
      <p><strong>Points Earned:</strong> {{points}}</p>
      <p><a href="{{profileUrl}}">View Your Profile</a></p>
    `,
  },
};

/**
 * Replace template variables with actual values
 */
function replaceTemplateVars(template: string, vars: Record<string, any>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  
  return result;
}

/**
 * Send notification to user(s)
 */
export async function sendNotification(
  cohortId: string,
  userId: string | null, // null = all participants
  templateKey: string,
  vars: Record<string, any>
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const template = NOTIFICATION_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unknown notification template: ${templateKey}`);
  }
  
  const notification = {
    cohortId,
    userId,
    type: template.type,
    title: replaceTemplateVars(template.title, vars),
    message: replaceTemplateVars(template.message, vars),
    emailSent: false,
    pushSent: false,
    createdAt: Timestamp.now(),
  };
  
  await addDoc(collection(db, "cohort_notifications"), notification);
  
  // Queue email if template has email content
  if (template.emailSubject && template.emailBody) {
    await queueEmail(userId, template, vars);
  }
}

/**
 * Queue email for sending
 */
async function queueEmail(
  userId: string | null,
  template: NotificationTemplate,
  vars: Record<string, any>
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const emailData = {
    to: userId ? [userId] : null, // null will be processed to get all participants
    subject: replaceTemplateVars(template.emailSubject!, vars),
    html: replaceTemplateVars(template.emailBody!, vars),
    status: "pending",
    createdAt: Timestamp.now(),
  };
  
  await addDoc(collection(db, "emailQueue"), emailData);
}

/**
 * Send enrollment confirmation
 */
export async function sendEnrollmentConfirmation(
  userId: string,
  cohortId: string,
  cohortData: any
): Promise<void> {
  await sendNotification(cohortId, userId, "enrollment_confirmation", {
    cohortTitle: cohortData.title,
    startDate: cohortData.cohortStartDate?.toDate().toLocaleDateString(),
    duration: cohortData.estimatedDurationWeeks,
    facilitatorName: cohortData.facilitatorName,
    cohortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/cohorts/${cohortId}`,
  });
}

/**
 * Send content release notification
 */
export async function sendContentReleaseNotification(
  cohortId: string,
  moduleData: any,
  sessionCount: number
): Promise<void> {
  await sendNotification(cohortId, null, "content_release", {
    cohortTitle: moduleData.cohortTitle,
    weekNumber: moduleData.weekNumber,
    moduleTitle: moduleData.title,
    sessionCount,
    cohortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/cohorts/${cohortId}`,
  });
}

/**
 * Send certificate issued notification
 */
export async function sendCertificateNotification(
  userId: string,
  cohortId: string,
  certificateData: any
): Promise<void> {
  await sendNotification(cohortId, userId, "certificate_issued", {
    cohortTitle: certificateData.cohortTitle,
    certificateNumber: certificateData.certificateNumber,
    issuedDate: certificateData.issuedAt?.toDate().toLocaleDateString(),
    certificateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/certificates/${certificateData.id}`,
    verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/${certificateData.certificateNumber}`,
  });
}

/**
 * Send waitlist notification
 */
export async function sendWaitlistNotification(
  userId: string,
  cohortId: string,
  cohortTitle: string
): Promise<void> {
  await sendNotification(cohortId, userId, "waitlist_spot_available", {
    cohortTitle,
    enrollUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cohorts/${cohortId}/enroll`,
  });
}

/**
 * Send live training reminder
 */
export async function sendLiveTrainingReminder(
  userId: string,
  cohortId: string,
  trainingData: any
): Promise<void> {
  await sendNotification(cohortId, userId, "live_training_reminder", {
    trainingTitle: trainingData.title,
    trainingTime: trainingData.scheduledDate?.toDate().toLocaleTimeString(),
    duration: trainingData.durationMinutes,
    meetingUrl: trainingData.meetingUrl,
  });
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  userId: string,
  cohortId: string,
  badgeData: any
): Promise<void> {
  await sendNotification(cohortId, userId, "achievement_unlocked", {
    badgeName: badgeData.name,
    badgeDescription: badgeData.description,
    points: badgeData.points,
    profileUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/profile`,
  });
}
