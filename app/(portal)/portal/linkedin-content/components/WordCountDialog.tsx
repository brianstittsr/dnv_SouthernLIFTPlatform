"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3 } from "lucide-react";
import { WordCountStats } from "../types";
import { formatNumber } from "../utils/wordCount";

interface WordCountDialogProps {
  stats: WordCountStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordCountDialog({
  stats,
  open,
  onOpenChange,
}: WordCountDialogProps) {
  const statItems = [
    { label: "Words", value: stats.words },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Characters (with spaces)", value: stats.charactersWithSpaces },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Sentences", value: stats.sentences },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Word Count Statistics
          </DialogTitle>
          <DialogDescription>
            Detailed statistics for your article content
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="bg-muted/50 rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-bold text-primary">
                {formatNumber(item.value)}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          LinkedIn recommends articles between 1,300-2,000 words for optimal engagement
        </div>
      </DialogContent>
    </Dialog>
  );
}
