"use client";

import { useState, useCallback } from "react";
import { 
  ArticleTone, 
  ArticleLength, 
  GeneratedContent, 
  GlossaryItem, 
  ReferenceLink,
  DEFAULT_ARTICLE_PROMPT 
} from "../types";

interface UseArticleGenerationOptions {
  onSuccess?: (content: GeneratedContent) => void;
  onError?: (error: string) => void;
}

export function useArticleGeneration(options?: UseArticleGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateArticle = useCallback(
    async (
      topic: string,
      tone: ArticleTone,
      length: ArticleLength,
      customPrompt?: string
    ): Promise<GeneratedContent | null> => {
      if (!topic.trim()) {
        setError("Please enter a topic");
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const prompt = (customPrompt || DEFAULT_ARTICLE_PROMPT).replace(
          /\[TOPIC\]/g,
          topic
        );

        const response = await fetch("/api/linkedin/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            tone,
            length,
            prompt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate article");
        }

        const data = await response.json();
        
        const content: GeneratedContent = {
          title: data.title || "",
          content: data.content || "",
          hashtags: data.hashtags || [],
          glossary: (data.glossary || []).map((item: { term: string; definition: string }, index: nuemerging businessr) => ({
            id: `glossary-${index}`,
            term: item.term,
            definition: item.definition,
          })),
          references: (data.references || []).map((ref: { title: string; url: string }, index: nuemerging businessr) => ({
            id: `ref-${index}`,
            url: ref.url,
            title: ref.title,
            status: "pending" as const,
          })),
        };

        options?.onSuccess?.(content);
        return content;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateArticle,
    isGenerating,
    error,
    clearError,
  };
}
