"use client";

import { useState } from "react";
import { Webinar } from "@/lib/types/webinar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Rocket, AlertTriangle, CheckCircle2, Globe, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { WebinarPreview } from "@/app/(portal)/portal/admin/webinar-creator/components/WebinarPreview";

interface PreviewPublishStepProps {
  data: Partial<Webinar>;
  updateData: (updates: Partial<Webinar>) => void;
  onSave: () => Promise<any>;
}

export function PreviewPublishStep({ data, updateData, onSave }: PreviewPublishStepProps) {
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      updateData({ 
        status: "published",
        publishedAt: new Date().toISOString()
      });
      
      // We need to wait for state update or pass it directly to save
      const result = await onSave();
      if (result) {
        toast.success("Webinar published successfully!");
      }
    } catch (error) {
      console.error("Error publishing webinar:", error);
      toast.error("Failed to publish webinar");
    } finally {
      setPublishing(false);
    }
  };

  const isComplete = !!(data.title && data.slug && data.startTime && data.hero?.headline);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Quick Summary
              </CardTitle>
              <CardDescription>
                Review your webinar details before taking it live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                  <div>
                    <Badge variant={data.status === "published" ? "default" : "secondary"}>
                      {data.status?.toUpperCase() || "DRAFT"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Slug</span>
                  <div className="flex items-center text-sm font-mono bg-muted p-1 rounded">
                    /webinars/{data.slug || "not-set"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Scheduled For</span>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {data.startTime ? format(new Date(data.startTime), "PPP") : "Not set"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Time</span>
                  <div className="flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {data.startTime ? format(new Date(data.startTime), "p") : "Not set"} ({data.timezone})
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowFullPreview(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Interactive Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {showFullPreview && (
            <div className="fixed inset-0 z-50 bg-background overflow-auto p-4 md:p-10 animate-in fade-in zoom-in duration-300">
              <div className="container max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm py-4 z-10 border-b">
                  <h2 className="text-2xl font-bold">Webinar Page Preview</h2>
                  <Button variant="ghost" onClick={() => setShowFullPreview(false)}>
                    Close Preview
                  </Button>
                </div>
                <div className="border rounded-xl shadow-2xl overflow-hidden bg-white">
                  <WebinarPreview data={data} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className={isComplete ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
                Readiness Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CheckItem label="Title & Slug" complete={!!(data.title && data.slug)} />
              <CheckItem label="Schedule Info" complete={!!(data.startTime && data.duration)} />
              <CheckItem label="Hero Content" complete={!!(data.hero?.headline && data.hero?.subheadline)} />
              <CheckItem label="About Content" complete={!!data.about?.content} />
              <CheckItem label="Speakers" complete={(data.speakers?.length || 0) > 0} />
              <CheckItem label="Integration" complete={!!(data.ghlIntegration?.enabled ? data.ghlIntegration.apiKey : true)} />
              
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  disabled={!isComplete || publishing || data.status === "published"}
                  onClick={handlePublish}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {data.status === "published" ? "Already Published" : "Publish Live"}
                </Button>
                {!isComplete && (
                  <p className="text-[10px] text-center text-amber-700 mt-2">
                    Complete all required fields to publish.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={complete ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      {complete ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <div className="h-2 w-2 rounded-full bg-amber-400" />
      )}
    </div>
  );
}
