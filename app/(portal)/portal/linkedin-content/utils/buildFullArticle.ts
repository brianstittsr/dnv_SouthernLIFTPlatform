/**
 * Build Full Article Utility
 * Combines all article sections into a single formatted string
 */

import { GlossaryItem, ReferenceLink } from "../types";

interface BuildArticleParams {
  title: string;
  content: string;
  hashtags: string;
  glossary: GlossaryItem[];
  references: ReferenceLink[];
}

export function buildFullArticle({
  title,
  content,
  hashtags,
  glossary,
  references,
}: BuildArticleParams): string {
  const parts: string[] = [];

  // Title
  if (title.trim()) {
    parts.push(`**${title.trim()}**`);
    parts.push("");
  }

  // Main content
  if (content.trim()) {
    parts.push(content.trim());
    parts.push("");
  }

  // Glossary
  if (glossary.length > 0) {
    parts.push("---");
    parts.push("");
    parts.push("**Glossary:**");
    parts.push("");
    glossary.forEach((item) => {
      if (item.term.trim() && item.definition.trim()) {
        parts.push(`• **${item.term.trim()}**: ${item.definition.trim()}`);
      }
    });
    parts.push("");
  }

  // References
  const validReferences = references.filter(
    (ref) => ref.url.trim() && ref.title.trim()
  );
  if (validReferences.length > 0) {
    parts.push("---");
    parts.push("");
    parts.push("**References:**");
    parts.push("");
    validReferences.forEach((ref) => {
      parts.push(`• ${ref.title.trim()}: ${ref.url.trim()}`);
    });
    parts.push("");
  }

  // Hashtags
  if (hashtags.trim()) {
    parts.push("---");
    parts.push("");
    parts.push(hashtags.trim());
  }

  return parts.join("\n");
}

export function buildPlainTextArticle({
  title,
  content,
  hashtags,
  glossary,
  references,
}: BuildArticleParams): string {
  const parts: string[] = [];

  // Title
  if (title.trim()) {
    parts.push(title.trim());
    parts.push("");
  }

  // Main content
  if (content.trim()) {
    parts.push(content.trim());
    parts.push("");
  }

  // Glossary
  if (glossary.length > 0) {
    parts.push("");
    parts.push("Glossary:");
    parts.push("");
    glossary.forEach((item) => {
      if (item.term.trim() && item.definition.trim()) {
        parts.push(`${item.term.trim()}: ${item.definition.trim()}`);
      }
    });
    parts.push("");
  }

  // References
  const validReferences = references.filter(
    (ref) => ref.url.trim() && ref.title.trim()
  );
  if (validReferences.length > 0) {
    parts.push("");
    parts.push("References:");
    parts.push("");
    validReferences.forEach((ref) => {
      parts.push(`${ref.title.trim()}: ${ref.url.trim()}`);
    });
    parts.push("");
  }

  // Hashtags
  if (hashtags.trim()) {
    parts.push("");
    parts.push(hashtags.trim());
  }

  return parts.join("\n");
}
