/**
 * LinkedIn Content Feature - TypeScript Interfaces
 */

export interface ReferenceLink {
  id: string;
  url: string;
  title: string;
  status: "pending" | "valid" | "invalid" | "checking";
  description?: string;
}

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  glossary: GlossaryItem[];
  references: ReferenceLink[];
}

export interface ArticleDraft {
  id: string;
  userId?: string;
  title: string;
  content: string;
  hashtags: string;
  glossary: GlossaryItem[];
  references: ReferenceLink[];
  images: string[]; // base64 or URLs
  status: "draft" | "scheduled" | "published";
  tone: ArticleTone;
  length: ArticleLength;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  publishedAt?: Date;
  linkedinPostId?: string;
  engagement?: ArticleEngagement;
}

export interface ArticleEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export type ArticleTone = "professional" | "casual" | "thought-leader" | "storytelling";

export type ArticleLength = "short" | "medium" | "long" | "extended";

export interface ArticleLengthOption {
  value: ArticleLength;
  label: string;
  words: string;
}

export interface ArticleToneOption {
  value: ArticleTone;
  label: string;
  description: string;
}

export interface WordCountStats {
  words: number;
  charactersNoSpaces: number;
  charactersWithSpaces: number;
  paragraphs: number;
  lines: number;
  sentences: number;
}

export const ARTICLE_TONES: ArticleToneOption[] = [
  { value: "professional", label: "Professional", description: "Formal and business-focused" },
  { value: "casual", label: "Casual & Friendly", description: "Approachable and conversational" },
  { value: "thought-leader", label: "Thought Leader", description: "Authoritative and insightful" },
  { value: "storytelling", label: "Storytelling", description: "Narrative and engaging" },
];

export const ARTICLE_LENGTHS: ArticleLengthOption[] = [
  { value: "short", label: "Short", words: "~300 words" },
  { value: "medium", label: "Medium", words: "~600 words" },
  { value: "long", label: "Long", words: "~1000 words" },
  { value: "extended", label: "Extended", words: "~1500 words" },
];

export const DEFAULT_ARTICLE_PROMPT = `Please write a friendly, detailed, comprehensive, thoughtful, balanced, engaging, compelling, fact-checked, conversational, long-form SEO-optimized article for U.S. manufacturing executives about [TOPIC]. 

Do not use favicons or emoticons. Include verifiable examples, data, and statistics. 

At end of the article, cite true references with clean links that support the points made and include only clean links (no tracking). Expand paragraphs.

Appropriately promote KDM & Associates and its services. The call to action is to schedule an introductory session.

At the end, provide:
1. A glossary of unfamiliar words and acronyms
2. A list of resources with clean links for further research
3. Hash-tagged keywords in a row`;
