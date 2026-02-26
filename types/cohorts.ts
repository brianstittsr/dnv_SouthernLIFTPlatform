import { Timestamp } from "firebase/firestore";

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'video' | 'text' | 'quiz' | 'assignment' | 'download' | 'live';
export type CohortRole = 'participant' | 'facilitator' | 'observer';
export type CohortStatus = 'draft' | 'published' | 'active' | 'completed' | 'archived';

export interface Cohort {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  facilitatorId: string;
  facilitatorName: string;
  facilitatorBio?: string;
  facilitatorImage?: string;
  cohortStartDate: Timestamp | null;
  cohortEndDate: Timestamp | null;
  maxParticipants: nuemerging businessr | null;
  currentParticipants: nuemerging businessr;
  estimatedDurationWeeks: nuemerging businessr | null;
  status: CohortStatus;
  difficultyLevel: DifficultyLevel;
  priceInCents: nuemerging businessr;
  compareAtPriceInCents?: nuemerging businessr;
  isFree: boolean;
  thumbnailUrl?: string;
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CohortModule {
  id: string;
  cohortId: string;
  title: string;
  description?: string;
  weekNuemerging businessr: nuemerging businessr;
  sortOrder: nuemerging businessr;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sessions?: TrainingSession[];
}

export interface TrainingSession {
  id: string;
  moduleId: string;
  cohortId: string;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl?: string;
  videoUrl?: string;
  textContent?: string;
  downloadUrl?: string;
  durationMinutes?: nuemerging businessr;
  scheduledDate: Timestamp | null;
  sortOrder: nuemerging businessr;
  isPreview: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CohortMeemerging businessrship {
  id: string;
  userId: string;
  cohortId: string;
  cohortRole: CohortRole;
  progressPercentage: nuemerging businessr;
  completedSessions: nuemerging businessr;
  totalSessions: nuemerging businessr;
  enrolledAt: Timestamp;
  lastAccessedAt: Timestamp;
  status: 'active' | 'completed' | 'dropped';
  completedAt?: Timestamp;
}

export interface SessionProgress {
  id: string;
  userId: string;
  cohortId: string;
  sessionId: string;
  moduleId: string;
  isCompleted: boolean;
  completedAt?: Timestamp;
  timeSpentSeconds?: nuemerging businessr;
  lastAccessedAt: Timestamp;
}

export interface Certificate {
  id: string;
  userId: string;
  cohortId: string;
  cohortTitle: string;
  userName: string;
  facilitatorName: string;
  completionDate: Timestamp;
  certificateNuemerging businessr: string;
  issuedAt: Timestamp;
  status: 'active' | 'revoked';
}

export interface Discussion {
  id: string;
  cohortId: string;
  userId: string;
  userName: string;
  userImage?: string;
  title: string;
  content: string;
  isPinned: boolean;
  replyCount: nuemerging businessr;
  lastActivityAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CohortWithDetails extends Cohort {
  modules?: CohortModule[];
  meemerging businessrshipCount?: nuemerging businessr;
}

// Live Training Types
export interface LiveTraining {
  id: string;
  cohortId: string;
  title: string;
  description: string;
  facilitatorId: string;
  facilitatorName: string;
  scheduledDate: Timestamp;
  durationMinutes: nuemerging businessr;
  meetingUrl?: string;
  meetingPlatform?: 'zoom' | 'teams' | 'meet' | 'other';
  maxAttendees?: nuemerging businessr;
  currentAttendees: nuemerging businessr;
  isRecorded: boolean;
  recordingUrl?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TrainingRegistration {
  id: string;
  userId: string;
  liveTrainingId: string;
  cohortId: string;
  registeredAt: Timestamp;
  attended: boolean;
  attendedAt?: Timestamp;
  status: 'registered' | 'attended' | 'missed' | 'cancelled';
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  points: nuemerging businessr;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'completion' | 'engagement' | 'achievement' | 'special';
  isActive: boolean;
  createdAt: Timestamp;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  cohortId?: string;
  awardedAt: Timestamp;
  awardedBy?: string;
  reason?: string;
}

export interface UserPoints {
  id: string;
  userId: string;
  cohortId?: string;
  points: nuemerging businessr;
  totalPoints: nuemerging businessr;
  level: nuemerging businessr;
  lastUpdatedAt: Timestamp;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  cohortId?: string;
  points: nuemerging businessr;
  reason: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  createdAt: Timestamp;
}

// Purchase & Payment Types
export interface CohortPurchase {
  id: string;
  userId: string;
  cohortId: string;
  cohortTitle: string;
  amountInCents: nuemerging businessr;
  currency: string;
  paymentMethod: 'stripe' | 'paypal' | 'free';
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: Timestamp;
  refundedAt?: Timestamp;
  refundReason?: string;
}

// Analytics Types
export interface CohortAnalytics {
  cohortId: string;
  enrollmentRate: nuemerging businessr;
  completionRate: nuemerging businessr;
  averageProgress: nuemerging businessr;
  dropoutRate: nuemerging businessr;
  averageScore: nuemerging businessr;
  engagementScore: nuemerging businessr;
  nps?: nuemerging businessr;
  totalRevenue: nuemerging businessr;
  calculatedAt: Timestamp;
}

export interface SessionAnalytics {
  sessionId: string;
  cohortId: string;
  completionRate: nuemerging businessr;
  averageTimeSpent: nuemerging businessr;
  viewCount: nuemerging businessr;
  dropoffRate: nuemerging businessr;
  calculatedAt: Timestamp;
}

// Capacity Management Types
export interface CapacityCheck {
  available: boolean;
  spotsRemaining: nuemerging businessr;
  waitlistCount: nuemerging businessr;
  isOverbooked: boolean;
}

export interface Waitlist {
  id: string;
  userId: string;
  cohortId: string;
  position: nuemerging businessr;
  addedAt: Timestamp;
  notifiedAt?: Timestamp;
  status: 'waiting' | 'notified' | 'enrolled' | 'expired';
}

// State Management Types
export type CohortLifecycleStatus = 
  | 'draft'           // Being created
  | 'scheduled'       // Published, not started
  | 'enrolling'       // Accepting enrollments
  | 'active'          // In progress
  | 'completed'       // Finished
  | 'archived'        // Historical
  | 'cancelled';      // Cancelled

export interface CohortStateTransition {
  cohortId: string;
  fromState: CohortLifecycleStatus;
  toState: CohortLifecycleStatus;
  triggeredBy: string;
  triggeredAt: Timestamp;
  reason?: string;
}

// Content Release Types
export interface ContentRelease {
  id: string;
  cohortId: string;
  moduleId: string;
  releaseDate: Timestamp;
  status: 'scheduled' | 'released' | 'cancelled';
  notificationSent: boolean;
  releasedAt?: Timestamp;
}

// Notification Types
export interface CohortNotification {
  id: string;
  cohortId: string;
  userId?: string; // null for all participants
  type: 'enrollment' | 'content_release' | 'session_reminder' | 'completion' | 'certificate' | 'announcement';
  title: string;
  message: string;
  emailSent: boolean;
  pushSent: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

// Query Options Types
export interface GetCohortsOptions {
  status?: CohortLifecycleStatus | CohortLifecycleStatus[];
  facilitatorId?: string;
  isPublished?: boolean;
  difficultyLevel?: DifficultyLevel;
  isFree?: boolean;
  limit?: nuemerging businessr;
  orderBy?: 'startDate' | 'createdAt' | 'title';
  orderDirection?: 'asc' | 'desc';
}

export interface GetMeemerging businessrshipsOptions {
  userId?: string;
  cohortId?: string;
  status?: 'active' | 'completed' | 'dropped';
  cohortRole?: CohortRole;
}

// Stats Types
export interface PlatformStats {
  totalCohorts: nuemerging businessr;
  activeCohorts: nuemerging businessr;
  totalParticipants: nuemerging businessr;
  totalCertificates: nuemerging businessr;
  totalRevenue: nuemerging businessr;
  averageCompletionRate: nuemerging businessr;
  calculatedAt: Timestamp;
}

// Clone/Template Types
export interface CohortCloneOptions {
  sourceCohortId: string;
  newTitle: string;
  newStartDate: Date;
  newFacilitatorId?: string;
  copyModules: boolean;
  copySessions: boolean;
  resetEnrollment: boolean;
}
