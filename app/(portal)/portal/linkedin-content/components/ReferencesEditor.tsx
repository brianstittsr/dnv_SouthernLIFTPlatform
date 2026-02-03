"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ReferenceLink } from "../types";

interface ReferencesEditorProps {
  references: ReferenceLink[];
  onReferencesChange: (references: ReferenceLink[]) => void;
  onVerifyAll: () => void;
  isVerifying: boolean;
}

export function ReferencesEditor({
  references,
  onReferencesChange,
  onVerifyAll,
  isVerifying,
}: ReferencesEditorProps) {
  const addReference = () => {
    const newRef: ReferenceLink = {
      id: `ref-${Date.now()}`,
      url: "",
      title: "",
      status: "pending",
    };
    onReferencesChange([...references, newRef]);
  };

  const updateReference = (
    id: string,
    field: "url" | "title",
    value: string
  ) => {
    onReferencesChange(
      references.map((ref) =>
        ref.id === id ? { ...ref, [field]: value, status: "pending" as const } : ref
      )
    );
  };

  const removeReference = (id: string) => {
    onReferencesChange(references.filter((ref) => ref.id !== id));
  };

  const getStatusIcon = (status: ReferenceLink["status"]) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "checking":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ReferenceLink["status"]) => {
    switch (status) {
      case "valid":
        return <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>;
      case "invalid":
        return <Badge variant="outline" className="text-red-600 border-red-600">Invalid</Badge>;
      case "checking":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Checking...</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              References
            </CardTitle>
            <CardDescription>
              Add reference links to support your article
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {references.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onVerifyAll}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Verify All
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={addReference}>
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {references.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No references yet</p>
            <p className="text-sm">Click "Add Link" to add reference sources</p>
          </div>
        ) : (
          <div className="space-y-4">
            {references.map((ref, index) => (
              <div
                key={ref.id}
                className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-3 items-start"
              >
                <div className="space-y-1">
                  <Label htmlFor={`ref-title-${ref.id}`} className="text-xs">
                    Title {index + 1}
                  </Label>
                  <Input
                    id={`ref-title-${ref.id}`}
                    placeholder="e.g., Industry Report"
                    value={ref.title}
                    onChange={(e) =>
                      updateReference(ref.id, "title", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`ref-url-${ref.id}`} className="text-xs">
                    URL
                  </Label>
                  <Input
                    id={`ref-url-${ref.id}`}
                    placeholder="https://example.com/article"
                    value={ref.url}
                    onChange={(e) =>
                      updateReference(ref.id, "url", e.target.value)
                    }
                  />
                </div>
                <div className="mt-6">
                  {getStatusBadge(ref.status)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  onClick={() => ref.url && window.open(ref.url, "_blank")}
                  disabled={!ref.url}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6 text-destructive hover:text-destructive"
                  onClick={() => removeReference(ref.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
