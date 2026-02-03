"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, RefreshCw, Wand2 } from "lucide-react";
import {
  ArticleTone,
  ArticleLength,
  ARTICLE_TONES,
  ARTICLE_LENGTHS,
  DEFAULT_ARTICLE_PROMPT,
  GeneratedContent,
} from "../types";

interface ArticleGeneratorProps {
  onGenerate: (content: GeneratedContent) => void;
  isGenerating: boolean;
  onGenerateClick: (
    topic: string,
    tone: ArticleTone,
    length: ArticleLength,
    prompt: string
  ) => void;
}

export function ArticleGenerator({
  onGenerate,
  isGenerating,
  onGenerateClick,
}: ArticleGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ArticleTone>("professional");
  const [length, setLength] = useState<ArticleLength>("medium");
  const [prompt, setPrompt] = useState(DEFAULT_ARTICLE_PROMPT);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    onGenerateClick(topic, tone, length, prompt);
  };

  const handleResetPrompt = () => {
    setPrompt(DEFAULT_ARTICLE_PROMPT);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          AI Article Generator
        </CardTitle>
        <CardDescription>
          Enter a topic and let AI generate a professional LinkedIn article for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Article Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., The Future of U.S. Manufacturing in 2026"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              value={tone}
              onValueChange={(value) => setTone(value as ArticleTone)}
              disabled={isGenerating}
            >
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_TONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Length</Label>
            <Select
              value={length}
              onValueChange={(value) => setLength(value as ArticleLength)}
              disabled={isGenerating}
            >
              <SelectTrigger id="length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_LENGTHS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    <div className="flex items-center gap-2">
                      <span>{l.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({l.words})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompt">Generation Prompt</Label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrompt(!showPrompt)}
              >
                {showPrompt ? "Hide" : "Customize"}
              </Button>
              {showPrompt && (
                <Button variant="ghost" size="sm" onClick={handleResetPrompt}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          {showPrompt && (
            <Textarea
              id="prompt"
              placeholder="Enter your custom prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={8}
              className="font-mono text-sm"
            />
          )}
          {showPrompt && (
            <p className="text-xs text-muted-foreground">
              Use [TOPIC] as a placeholder for the article topic
            </p>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Article...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Article
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
