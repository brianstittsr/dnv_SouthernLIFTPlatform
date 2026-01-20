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
