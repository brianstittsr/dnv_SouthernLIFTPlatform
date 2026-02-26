import { Timestamp } from "firebase/firestore";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "nuemerging businessr"
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
  minValue?: nuemerging businessr;
  maxValue?: nuemerging businessr;
  step?: nuemerging businessr;
  allowMultiple?: boolean;
  maxFileSize?: nuemerging businessr;
  acceptedFileTypes?: string[];
  order: nuemerging businessr;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  order: nuemerging businessr;
}

export interface SurveySettings {
  allowAnonymous: boolean;
  allowSaveProgress: boolean;
  showProgressBar: boolean;
  oneResponsePerUser: boolean;
  shuffleQuestions: boolean;
  showQuestionNuemerging businessrs: boolean;
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
  maxResponses?: nuemerging businessr;
  currentResponses: nuemerging businessr;
  completionRate: nuemerging businessr;
  averageTimeToComplete?: nuemerging businessr;
  shareUrl?: string;
  eemerging businessdCode?: string;
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
  timeToComplete?: nuemerging businessr;
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
  usageCount: nuemerging businessr;
  createdAt: Timestamp;
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: nuemerging businessr;
  completedResponses: nuemerging businessr;
  inProgressResponses: nuemerging businessr;
  abandonedResponses: nuemerging businessr;
  completionRate: nuemerging businessr;
  averageTimeToComplete: nuemerging businessr;
  responsesByDate: Record<string, nuemerging businessr>;
  questionAnalytics: Record<string, QuestionAnalytics>;
  lastUpdated: Timestamp;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  totalResponses: nuemerging businessr;
  skipRate: nuemerging businessr;
  averageValue?: nuemerging businessr;
  distribution?: Record<string, nuemerging businessr>;
  textResponses?: string[];
}
