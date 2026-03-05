"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Webinar } from "@/lib/types/webinar";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, CheckCircle, Video, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationPageStepProps {
  data: Partial<Webinar>;
  updateData: (updates: Partial<Webinar>) => void;
}

export function ConfirmationPageStep({ data, updateData }: ConfirmationPageStepProps) {
  const updateConfirmation = (updates: any) => {
    updateData({
      confirmation: { ...(data.confirmation || { title: "Registration Confirmed!", message: "", nextSteps: [] }), ...updates }
    });
  };

  const addNextStep = () => {
    const nextSteps = [...(data.confirmation?.nextSteps || []), ""];
    updateConfirmation({ nextSteps });
  };

  const updateNextStep = (index: number, value: string) => {
    const nextSteps = [...(data.confirmation?.nextSteps || [])];
    nextSteps[index] = value;
    updateConfirmation({ nextSteps });
  };

  const removeNextStep = (index: number) => {
    const nextSteps = data.confirmation?.nextSteps?.filter((_, i) => i !== index) || [];
    updateConfirmation({ nextSteps });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Confirmation Message
        </h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confTitle">Success Title</Label>
              <Input
                id="confTitle"
                placeholder="e.g., You're in! Registration Confirmed"
                value={data.confirmation?.title || ""}
                onChange={(e) => updateConfirmation({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confMessage">Confirmation Message</Label>
              <Textarea
                id="confMessage"
                placeholder="e.g., Thank you for registering. Check your email for the joining link."
                value={data.confirmation?.message || ""}
                onChange={(e) => updateConfirmation({ message: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confVideo">Confirmation Video URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="confVideo"
                  placeholder="https://youtube.com/..."
                  value={data.confirmation?.videoUrl || ""}
                  onChange={(e) => updateConfirmation({ videoUrl: e.target.value })}
                />
                <Button variant="outline" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Show a personalized "thank you" video after registration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Next Steps
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addNextStep}>
            <Plus className="h-4 w-4 mr-2" /> Add Step
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nextStepsTitle">Section Title</Label>
              <Input
                id="nextStepsTitle"
                placeholder="What happens next?"
                value={data.confirmation?.nextStepsTitle || ""}
                onChange={(e) => updateConfirmation({ nextStepsTitle: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              {data.confirmation?.nextSteps?.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Step ${index + 1}...`}
                      value={step}
                      onChange={(e) => updateNextStep(index, e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeNextStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!data.confirmation?.nextSteps || data.confirmation.nextSteps.length === 0) && (
                <p className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-lg">
                  No next steps added yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
