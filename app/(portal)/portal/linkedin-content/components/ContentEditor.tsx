"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Hash } from "lucide-react";

interface ContentEditorProps {
  title: string;
  content: string;
  hashtags: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onHashtagsChange: (hashtags: string) => void;
}

export function ContentEditor({
  title,
  content,
  hashtags,
  onTitleChange,
  onContentChange,
  onHashtagsChange,
}: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Article Content
          </CardTitle>
          <CardDescription>
            Edit your article title and main content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter article title..."
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your article content here... (Markdown supported)"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown formatting: **bold**, *italic*, ## headings, - lists
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Hashtags
          </CardTitle>
          <CardDescription>
            Add relevant hashtags for better visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="#USManufacturing #Reshoring #SupplyChain #MadeInAmerica"
            value={hashtags}
            onChange={(e) => onHashtagsChange(e.target.value)}
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Separate hashtags with spaces. LinkedIn recommends 3-5 hashtags per post.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
