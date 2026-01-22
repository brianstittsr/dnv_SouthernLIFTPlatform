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
  maxParticipants: number | null;
  currentParticipants: number;
  estimatedDurationWeeks: number | null;
  status: CohortStatus;
  difficultyLevel: DifficultyLevel;
  priceInCents: number;
  compareAtPriceInCents?: number;
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
  weekNumber: number;
  sortOrder: number;
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
  durationMinutes?: number;
  scheduledDate: Timestamp | null;
  sortOrder: number;
  isPreview: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CohortMembership {
  id: string;
  userId: string;
  cohortId: string;
  cohortRole: CohortRole;
  progressPercentage: number;
  completedSessions: number;
  totalSessions: number;
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
  timeSpentSeconds?: number;
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
  certificateNumber: string;
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
  replyCount: number;
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
  membershipCount?: number;
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
  durationMinutes: number;
  meetingUrl?: string;
  meetingPlatform?: 'zoom' | 'teams' | 'meet' | 'other';
  maxAttendees?: number;
  currentAttendees: number;
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
  points: number;
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
  points: number;
  totalPoints: number;
  level: number;
  lastUpdatedAt: Timestamp;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  cohortId?: string;
  points: number;
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
  amountInCents: number;
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
  enrollmentRate: number;
  completionRate: number;
  averageProgress: number;
  dropoutRate: number;
  averageScore: number;
  engagementScore: number;
  nps?: number;
  totalRevenue: number;
  calculatedAt: Timestamp;
}

export interface SessionAnalytics {
  sessionId: string;
  cohortId: string;
  completionRate: number;
  averageTimeSpent: number;
  viewCount: number;
  dropoffRate: number;
  calculatedAt: Timestamp;
}

// Capacity Management Types
export interface CapacityCheck {
  available: boolean;
  spotsRemaining: number;
  waitlistCount: number;
  isOverbooked: boolean;
}

export interface Waitlist {
  id: string;
  userId: string;
  cohortId: string;
  position: number;
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
  limit?: number;
  orderBy?: 'startDate' | 'createdAt' | 'title';
  orderDirection?: 'asc' | 'desc';
}

export interface GetMembershipsOptions {
  userId?: string;
  cohortId?: string;
  status?: 'active' | 'completed' | 'dropped';
  cohortRole?: CohortRole;
}

// Stats Types
export interface PlatformStats {
  totalCohorts: number;
  activeCohorts: number;
  totalParticipants: number;
  totalCertificates: number;
  totalRevenue: number;
  averageCompletionRate: number;
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
