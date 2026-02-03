"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ThumbsUp, MessageCircle, Share2, Send } from "lucide-react";
import { GlossaryItem, ReferenceLink } from "../types";

interface ArticlePreviewProps {
  title: string;
  content: string;
  hashtags: string;
  glossary: GlossaryItem[];
  references: ReferenceLink[];
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticlePreview({
  title,
  content,
  hashtags,
  glossary,
  references,
  images,
  open,
  onOpenChange,
}: ArticlePreviewProps) {
  const featuredImage = images[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Article Preview
          </DialogTitle>
          <DialogDescription>
            Preview how your article will appear on LinkedIn
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="bg-white rounded-lg border shadow-sm">
            {/* LinkedIn Post Header */}
            <div className="p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center text-white font-bold text-lg">
                KDM
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">KDM & Associates</p>
                <p className="text-xs text-gray-500">
                  Government Contracting Experts • MBDA Federal Procurement Center
                </p>
                <p className="text-xs text-gray-400">Just now • 🌐</p>
              </div>
            </div>

            {/* Featured Image */}
            {featuredImage && (
              <div className="w-full aspect-video bg-gray-100">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Title */}
              {title && (
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              )}

              {/* Body */}
              {content && (
                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </div>
              )}

              {/* Glossary */}
              {glossary.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Glossary</h3>
                  <div className="space-y-1">
                    {glossary.map((item) => (
                      <p key={item.id} className="text-sm text-gray-600">
                        <span className="font-medium">{item.term}:</span>{" "}
                        {item.definition}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {references.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">References</h3>
                  <div className="space-y-1">
                    {references.map((ref) => (
                      <p key={ref.id} className="text-sm">
                        <span className="text-gray-600">• {ref.title}: </span>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0077B5] hover:underline"
                        >
                          {ref.url}
                        </a>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {hashtags && (
                <div className="pt-2">
                  <p className="text-[#0077B5] text-sm">{hashtags}</p>
                </div>
              )}
            </div>

            {/* LinkedIn Engagement Bar */}
            <div className="border-t px-4 py-2">
              <div className="flex items-center justify-between text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <ThumbsUp className="h-2 w-2 text-white" />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">
                      ❤️
                    </div>
                  </div>
                  <span className="ml-1">0</span>
                </div>
                <span>0 comments • 0 reposts</span>
              </div>
            </div>

            {/* LinkedIn Action Bar */}
            <div className="border-t px-2 py-1 flex justify-around">
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <Share2 className="h-4 w-4 mr-2" />
                Repost
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
