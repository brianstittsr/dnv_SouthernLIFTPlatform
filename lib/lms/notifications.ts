/**
 * Course Notification Templates and Utilities
 * Handles email and push notification generation for course events
 */

import {
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  emailSubject?: string;
  emailBody?: string;
}

/**
 * Notification templates for course lifecycle events
 */
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  enrollment_confirmation: {
    type: "enrollment",
    title: "Welcome to {{courseTitle}}!",
    message: "Your enrollment has been confirmed. The course starts on {{startDate}}.",
    emailSubject: "Enrollment Confirmed - {{courseTitle}}",
    emailBody: `
      <h2>Welcome to {{courseTitle}}!</h2>
      <p>Your enrollment has been confirmed.</p>
      <p><strong>Start Date:</strong> {{startDate}}</p>
      <p><strong>Duration:</strong> {{duration}} weeks</p>
      <p><strong>Facilitator:</strong> {{facilitatorName}}</p>
      <p>You will receive notifications when new content is released.</p>
      <p><a href="{{courseUrl}}">Access Course Dashboard</a></p>
    `,
  },
  
  content_release: {
    type: "content_release",
    title: "New Content Available - Week {{weeknumber}}",
    message: "Week {{weeknumber}} materials for {{courseTitle}} are now available.",
    emailSubject: "New Content Released - {{courseTitle}}",
    emailBody: `
      <h2>New Content Available!</h2>
      <p>Week {{weeknumber}} materials for {{courseTitle}} are now available.</p>
      <p><strong>Module:</strong> {{moduleTitle}}</p>
      <p><strong>Sessions:</strong> {{sessionCount}}</p>
      <p><a href="{{courseUrl}}">Access Content Now</a></p>
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
  
  course_started: {
    type: "course_started",
    title: "{{courseTitle}} Has Started!",
    message: "Your course has officially started. Access your first module now!",
    emailSubject: "{{courseTitle}} Has Started!",
    emailBody: `
      <h2>Your Course Has Started!</h2>
      <p>{{courseTitle}} has officially begun.</p>
      <p>Your first module is now available. Log in to get started!</p>
      <p><a href="{{courseUrl}}">Start Learning</a></p>
    `,
  },
  
  course_completed: {
    type: "completion",
    title: "Congratulations on Completing {{courseTitle}}!",
    message: "You've completed the course! Your certificate is being generated.",
    emailSubject: "Course Completed - Certificate Available",
    emailBody: `
      <h2>Congratulations!</h2>
      <p>You've successfully completed {{courseTitle}}!</p>
      <p>Your certificate is being generated and will be available shortly.</p>
      <p><strong>Completion Date:</strong> {{completionDate}}</p>
      <p><a href="{{certificateUrl}}">Download Certificate</a></p>
    `,
  },
  
  certificate_issued: {
    type: "certificate",
    title: "Your Certificate is Ready!",
    message: "Your certificate for {{courseTitle}} is now available to download.",
    emailSubject: "Certificate Ready - {{courseTitle}}",
    emailBody: `
      <h2>Your Certificate is Ready!</h2>
      <p>Congratulations on completing {{courseTitle}}!</p>
      <p><strong>Certificate number:</strong> {{certificatenumber}}</p>
      <p><strong>Issued Date:</strong> {{issuedDate}}</p>
      <p><a href="{{certificateUrl}}">Download Certificate</a></p>
      <p><a href="{{verifyUrl}}">Verify Certificate</a></p>
    `,
  },
  
  waitlist_spot_available: {
    type: "waitlist_spot_available",
    title: "Spot Available in {{courseTitle}}!",
    message: "A spot has opened up in your waitlisted course. Enroll now!",
    emailSubject: "Spot Available - {{courseTitle}}",
    emailBody: `
      <h2>Great News!</h2>
      <p>A spot has opened up in {{courseTitle}}!</p>
      <p>You have 48 hours to claim your spot before we notify the next person on the waitlist.</p>
      <p><a href="{{enrollUrl}}">Enroll Now</a></p>
    `,
  },
  
  course_cancelled: {
    type: "course_cancelled",
    title: "{{courseTitle}} Has Been Cancelled",
    message: "This course has been cancelled. You will receive a full refund if applicable.",
    emailSubject: "Course Cancelled - {{courseTitle}}",
    emailBody: `
      <h2>Course Cancellation Notice</h2>
      <p>We regret to inform you that {{courseTitle}} has been cancelled.</p>
      <p><strong>Reason:</strong> {{cancellationReason}}</p>
      <p>If you paid for this course, you will receive a full refund within 5-7 business days.</p>
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
  courseId: string,
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
    courseId,
    userId,
    type: template.type,
    title: replaceTemplateVars(template.title, vars),
    message: replaceTemplateVars(template.message, vars),
    emailSent: false,
    pushSent: false,
    createdAt: Timestamp.now(),
  };
  
  await addDoc(collection(db, "course_notifications"), notification);
  
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
  courseId: string,
  courseData: any
): Promise<void> {
  await sendNotification(courseId, userId, "enrollment_confirmation", {
    courseTitle: courseData.title,
    startDate: courseData.courseStartDate?.toDate().toLocaleDateString(),
    duration: courseData.estimatedDurationWeeks,
    facilitatorName: courseData.facilitatorName,
    courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/courses/${courseId}`,
  });
}

/**
 * Send content release notification
 */
export async function sendContentReleaseNotification(
  courseId: string,
  moduleData: any,
  sessionCount: number
): Promise<void> {
  await sendNotification(courseId, null, "content_release", {
    courseTitle: moduleData.courseTitle,
    weeknumber: moduleData.weeknumber,
    moduleTitle: moduleData.title,
    sessionCount,
    courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/courses/${courseId}`,
  });
}

/**
 * Send certificate issued notification
 */
export async function sendCertificateNotification(
  userId: string,
  courseId: string,
  certificateData: any
): Promise<void> {
  await sendNotification(courseId, userId, "certificate_issued", {
    courseTitle: certificateData.courseTitle,
    certificatenumber: certificateData.certificatenumber,
    issuedDate: certificateData.issuedAt?.toDate().toLocaleDateString(),
    certificateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/certificates/${certificateData.id}`,
    verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/${certificateData.certificatenumber}`,
  });
}

/**
 * Send waitlist notification
 */
export async function sendWaitlistNotification(
  userId: string,
  courseId: string,
  courseTitle: string
): Promise<void> {
  await sendNotification(courseId, userId, "waitlist_spot_available", {
    courseTitle,
    enrollUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/enroll`,
  });
}

/**
 * Send live training reminder
 */
export async function sendLiveTrainingReminder(
  userId: string,
  courseId: string,
  trainingData: any
): Promise<void> {
  await sendNotification(courseId, userId, "live_training_reminder", {
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
  courseId: string,
  badgeData: any
): Promise<void> {
  await sendNotification(courseId, userId, "achievement_unlocked", {
    badgeName: badgeData.name,
    badgeDescription: badgeData.description,
    points: badgeData.points,
    profileUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/profile`,
  });
}
