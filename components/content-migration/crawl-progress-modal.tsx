"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  Globe,
  Image as ImageIcon,
  Video,
  FileText,
  Save,
  AlertTriangle,
} from "lucide-react";
import { CrawlProgress } from "@/lib/types/content-migration";

export interface CrawlStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  detail?: string;
  count?: number;
}

interface CrawlProgressModalProps {
  open: boolean;
  onClose: () => void;
  crawlProgress: CrawlProgress | null;
  steps: CrawlStep[];
  currentUrl?: string;
  recentPages?: string[];
  onCancel?: () => void;
}

export function CrawlProgressModal({
  open,
  onClose,
  crawlProgress,
  steps,
  currentUrl,
  recentPages = [],
  onCancel,
}: CrawlProgressModalProps) {
  const getStepIcon = (step: CrawlStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepTypeIcon = (stepId: string) => {
    switch (stepId) {
      case "crawling":
        return <Globe className="h-4 w-4" />;
      case "images":
        return <ImageIcon className="h-4 w-4" />;
      case "videos":
        return <Video className="h-4 w-4" />;
      case "documents":
        return <FileText className="h-4 w-4" />;
      case "saving":
        return <Save className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const overallProgress = crawlProgress
    ? crawlProgress.totalPagesDiscovered > 0
      ? Math.round((crawlProgress.pagesCrawled / crawlProgress.totalPagesDiscovered) * 100)
      : 0
    : 0;

  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const totalSteps = steps.length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Crawl Progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
            <Progress value={(completedSteps / totalSteps) * 100} className="h-2" />
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  step.status === "in_progress"
                    ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
                    : step.status === "completed"
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : step.status === "error"
                    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                    : "border-muted"
                }`}
              >
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStepTypeIcon(step.id)}
                    <span className="font-medium">{step.label}</span>
                    {step.count !== undefined && (
                      <Badge variant="secondary" className="ml-auto">
                        {step.count}
                      </Badge>
                    )}
                  </div>
                  {step.detail && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {step.detail}
                    </p>
                  )}
                  {step.id === "crawling" && step.status === "in_progress" && crawlProgress && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {crawlProgress.pagesCrawled} / {crawlProgress.totalPagesDiscovered} pages
                        </span>
                        <span>{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current URL */}
          {currentUrl && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Currently crawling:</p>
              <p className="text-sm font-mono truncate">{currentUrl}</p>
            </div>
          )}

          {/* Recent Pages */}
          {recentPages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Pages</p>
              <ScrollArea className="h-[120px] rounded-md border p-2">
                <div className="space-y-1">
                  {recentPages.map((url, index) => (
                    <div
                      key={index}
                      className="text-xs font-mono text-muted-foreground truncate"
                    >
                      {url}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Errors */}
          {crawlProgress && crawlProgress.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                {crawlProgress.errors.length} Errors
              </div>
              <ScrollArea className="h-[80px] rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-2">
                <div className="space-y-1">
                  {crawlProgress.errors.slice(-5).map((error, index) => (
                    <div key={index} className="text-xs text-amber-700 dark:text-amber-300">
                      {error.url}: {error.message}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {onCancel && crawlProgress?.status === "running" && (
              <Button variant="destructive" onClick={onCancel}>
                Cancel Crawl
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              disabled={crawlProgress?.status === "running"}
            >
              {crawlProgress?.status === "running" ? "Crawling..." : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
