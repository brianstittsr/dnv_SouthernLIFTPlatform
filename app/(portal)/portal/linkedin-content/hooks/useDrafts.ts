"use client";

import { useState, useCallback, useEffect } from "react";
import { ArticleDraft, GlossaryItem, ReferenceLink, ArticleTone, ArticleLength } from "../types";

interface UseDraftsOptions {
  userId?: string;
  persistToDatabase?: boolean;
}

export function useDrafts(options?: UseDraftsOptions) {
  const [drafts, setDrafts] = useState<ArticleDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const savedDrafts = localStorage.getItem("linkedin-drafts");
      if (savedDrafts) {
        const parsed = JSON.parse(savedDrafts);
        setDrafts(
          parsed.map((draft: ArticleDraft) => ({
            ...draft,
            createdAt: new Date(draft.createdAt),
            updatedAt: new Date(draft.updatedAt),
            scheduledFor: draft.scheduledFor ? new Date(draft.scheduledFor) : undefined,
            publishedAt: draft.publishedAt ? new Date(draft.publishedAt) : undefined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load drafts from localStorage:", err);
    }
  }, []);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("linkedin-drafts", JSON.stringify(drafts));
    } catch (err) {
      console.error("Failed to save drafts to localStorage:", err);
    }
  }, [drafts]);

  const createDraft = useCallback(
    (params: {
      title: string;
      content: string;
      hashtags: string;
      glossary: GlossaryItem[];
      references: ReferenceLink[];
      images: string[];
      tone: ArticleTone;
      length: ArticleLength;
      prompt: string;
    }): ArticleDraft => {
      const now = new Date();
      const newDraft: ArticleDraft = {
        id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: options?.userId,
        title: params.title,
        content: params.content,
        hashtags: params.hashtags,
        glossary: params.glossary,
        references: params.references,
        images: params.images,
        status: "draft",
        tone: params.tone,
        length: params.length,
        prompt: params.prompt,
        createdAt: now,
        updatedAt: now,
      };

      setDrafts((prev) => [newDraft, ...prev]);
      return newDraft;
    },
    [options?.userId]
  );

  const updateDraft = useCallback(
    (id: string, updates: Partial<ArticleDraft>): ArticleDraft | null => {
      let updatedDraft: ArticleDraft | null = null;

      setDrafts((prev) =>
        prev.map((draft) => {
          if (draft.id === id) {
            updatedDraft = {
              ...draft,
              ...updates,
              updatedAt: new Date(),
            };
            return updatedDraft;
          }
          return draft;
        })
      );

      return updatedDraft;
    },
    []
  );

  const deleteDraft = useCallback((id: string): boolean => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    return true;
  }, []);

  const getDraft = useCallback(
    (id: string): ArticleDraft | undefined => {
      return drafts.find((draft) => draft.id === id);
    },
    [drafts]
  );

  const getDraftsByStatus = useCallback(
    (status: ArticleDraft["status"]): ArticleDraft[] => {
      return drafts.filter((draft) => draft.status === status);
    },
    [drafts]
  );

  const scheduleDraft = useCallback(
    (id: string, scheduledFor: Date): ArticleDraft | null => {
      return updateDraft(id, {
        status: "scheduled",
        scheduledFor,
      });
    },
    [updateDraft]
  );

  const publishDraft = useCallback(
    (id: string, linkedinPostId?: string): ArticleDraft | null => {
      return updateDraft(id, {
        status: "published",
        publishedAt: new Date(),
        linkedinPostId,
      });
    },
    [updateDraft]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    drafts,
    isLoading,
    error,
    createDraft,
    updateDraft,
    deleteDraft,
    getDraft,
    getDraftsByStatus,
    scheduleDraft,
    publishDraft,
    clearError,
  };
}
