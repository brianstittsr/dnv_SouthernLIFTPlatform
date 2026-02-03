"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Image as ImageIcon, Link2, Calendar } from "lucide-react";
import { ArticleDraft } from "../types";

interface DraftsListProps {
  drafts: ArticleDraft[];
  onEdit: (draft: ArticleDraft) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function DraftsList({
  drafts,
  onEdit,
  onDelete,
  emptyMessage = "No drafts yet",
  emptyDescription = "Create an article and save it as a draft",
}: DraftsListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: ArticleDraft["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Scheduled</Badge>;
      case "published":
        return <Badge variant="outline" className="text-green-600 border-green-600">Published</Badge>;
      default:
        return null;
    }
  };

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">{emptyMessage}</p>
        <p className="text-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(draft.status)}
                  {draft.scheduledFor && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(draft.scheduledFor)}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg truncate">
                  {draft.title || "Untitled Article"}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {draft.content.substring(0, 150)}
                  {draft.content.length > 150 ? "..." : ""}
                </CardDescription>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(draft)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(draft.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Created: {formatDate(draft.createdAt)}</span>
              {draft.images.length > 0 && (
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {draft.images.length} image{draft.images.length !== 1 ? "s" : ""}
                </span>
              )}
              {draft.references.length > 0 && (
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  {draft.references.length} link{draft.references.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
