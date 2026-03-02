/**
 * Word Count Utilities
 */

import { WordCountStats } from "../types";

export function calculateWordCount(text: string): WordCountStats {
  if (!text || text.trim() === "") {
    return {
      words: 0,
      charactersNoSpaces: 0,
      charactersWithSpaces: 0,
      paragraphs: 0,
      lines: 0,
      sentences: 0,
    };
  }

  const trimmedText = text.trim();
  
  // Word count - split by whitespace and filter empty strings
  const words = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Characters without spaces
  const charactersNoSpaces = trimmedText.replace(/\s/g, "").length;
  
  // Characters with spaces
  const charactersWithSpaces = trimmedText.length;
  
  // Paragraphs - split by double newlines or more
  const paragraphs = trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1;
  
  // Lines - split by single newlines
  const lines = trimmedText.split(/\n/).filter(l => l.trim().length > 0).length;
  
  // Sentences - split by sentence-ending punctuation
  const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  return {
    words,
    charactersNoSpaces,
    charactersWithSpaces,
    paragraphs,
    lines,
    sentences,
  };
}

export function formatnumber(num: number): string {
  return num.toLocaleString();
}
