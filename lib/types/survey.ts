import { Timestamp } from "firebase/firestore";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "rating"
  | "scale"
  | "matrix"
  | "file_upload"
  | "date"
  | "time"
  | "slider"
  | "ranking"
  | "signature";

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern" | "email" | "phone" | "url";
  value?: any;
  message?: string;
}

export interface ConditionalLogic {
  questionId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: any;
  action: "show" | "hide" | "skip_to";
  targetQuestionId?: string;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: ValidationRule[];
  conditionalLogic?: ConditionalLogic[];
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  allowMultiple?: boolean;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  order: number;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  order: number;
}

export interface SurveySettings {
  allowAnonymous: boolean;
  allowSaveProgress: boolean;
  showProgressBar: boolean;
  oneResponsePerUser: boolean;
  shuffleQuestions: boolean;
  showQuestionNumbers: boolean;
  requireAllQuestions: boolean;
  customTheme?: {
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  status: "draft" | "active" | "paused" | "closed" | "archived";
  sections: SurveySection[];
  settings: SurveySettings;
  templateId?: string;
  templateName?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  maxResponses?: number;
  currentResponses: number;
  completionRate: number;
  averageTimeToComplete?: number;
  shareUrl?: string;
  embedCode?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId?: string;
  respondentEmail?: string;
  isAnonymous: boolean;
  answers: Record<string, any>;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  timeToComplete?: number;
  ipAddress?: string;
  userAgent?: string;
  status: "in_progress" | "completed" | "abandoned";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  sections: SurveySection[];
  settings: SurveySettings;
  usageCount: number;
  createdAt: Timestamp;
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  abandonedResponses: number;
  completionRate: number;
  averageTimeToComplete: number;
  responsesByDate: Record<string, number>;
  questionAnalytics: Record<string, QuestionAnalytics>;
  lastUpdated: Timestamp;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  totalResponses: number;
  skipRate: number;
  averageValue?: number;
  distribution?: Record<string, number>;
  textResponses?: string[];
}
