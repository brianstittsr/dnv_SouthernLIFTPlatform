"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AISurveyCreatorPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "generating" | "review">("input");
  const [surveyPurpose, setSurveyPurpose] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [dataOutcomes, setDataOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("10");
  const [generatedSurvey, setGeneratedSurvey] = useState<any>(null);

  const handleGenerate = async () => {
    if (!surveyPurpose || !targetAudience || !dataOutcomes) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setStep("generating");

    try {
      // Simulate AI generation (in production, this would call an AI API)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockGeneratedSurvey = {
        title: `${surveyPurpose} Survey`,
        description: `Survey designed for ${targetAudience}`,
        sections: [
          {
            id: "section-1",
            title: "Background Information",
            questions: [
              {
                id: "q1",
                type: "short_text",
                title: "What is your organization name?",
                required: true,
                aiImprovement: "Changed from 'Company name?' to be more specific and professional",
              },
              {
                id: "q2",
                type: "dropdown",
                title: "What is your primary industry?",
                required: true,
                options: ["Manufacturing", "Technology", "Healthcare", "Defense", "Other"],
                aiImprovement: "Added dropdown for better data categorization",
              },
            ],
          },
          {
            id: "section-2",
            title: "Key Metrics",
            questions: [
              {
                id: "q3",
                type: "rating",
                title: "How would you rate your current satisfaction?",
                required: true,
                minValue: 1,
                maxValue: 5,
                aiImprovement: "Converted to rating scale for quantifiable data",
              },
            ],
          },
        ],
        improvements: [
          "Restructured questions into logical sections",
          "Changed open-ended questions to rating scales for measurability",
          "Added validation rules to ensure data quality",
          "Optimized question order for better flow",
          "Removed leading language and bias",
        ],
        reportingCapabilities: [
          "Average satisfaction score by industry",
          "Response rate tracking",
          "Demographic breakdown",
          "Time-series analysis",
        ],
      };

      setGeneratedSurvey(mockGeneratedSurvey);
      setStep("review");
      toast.success("Survey generated successfully!");
    } catch (error) {
      console.error("Error generating survey:", error);
      toast.error("Failed to generate survey");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSurvey = () => {
    toast.success("Survey saved as draft! Redirecting to editor...");
    // In production, save to database and redirect
    setTimeout(() => {
      window.location.href = "/portal/admin/surveys";
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI Survey Creator
          </h1>
          <p className="text-muted-foreground">Generate optimized surveys using artificial intelligence</p>
        </div>
        <Link href="/portal/admin/surveys">
          <Button variant="outline">Back to Surveys</Button>
        </Link>
      </div>

      {step === "input" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Survey Requirements</CardTitle>
                <CardDescription>Tell us about your survey and we'll generate an optimized version</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purpose">Survey Purpose *</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Client Intake, Customer Satisfaction, Training Needs Assessment"
                    value={surveyPurpose}
                    onChange={(e) => setSurveyPurpose(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Defense contractors, Small business owners, Training participants"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="outcomes">Data Outcomes *</Label>
                  <Textarea
                    id="outcomes"
                    placeholder="What do you want to measure or report on? (e.g., Satisfaction scores, Certification needs, Revenue ranges)"
                    value={dataOutcomes}
                    onChange={(e) => setDataOutcomes(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific about the metrics and insights you need
                  </p>
                </div>

                <div>
                  <Label htmlFor="requirements">Content/Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Paste existing questions, requirements, or any content here..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Paste existing questions or detailed requirements
                  </p>
                </div>

                <div>
                  <Label htmlFor="time">Estimated Completion Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    min="1"
                    max="60"
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Survey with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">AI Analysis</p>
                    <p className="text-muted-foreground">Analyzes your requirements and generates optimized questions</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Question Optimization</p>
                    <p className="text-muted-foreground">Removes bias, improves clarity, ensures measurability</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Data Alignment</p>
                    <p className="text-muted-foreground">Ensures questions support your reporting goals</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Smart Formatting</p>
                    <p className="text-muted-foreground">Suggests optimal question types and validation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Be specific about your data outcomes</p>
                <p>• Describe your target audience clearly</p>
                <p>• Include any compliance requirements</p>
                <p>• Mention preferred question formats</p>
                <p>• Specify any required vs. optional fields</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === "generating" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
              <h3 className="text-xl font-semibold">Generating Your Survey...</h3>
              <p className="text-muted-foreground">
                AI is analyzing your requirements and creating optimized questions
              </p>
              <div className="flex justify-center gap-2 mt-6">
                <Badge variant="outline">Analyzing requirements</Badge>
                <Badge variant="outline">Optimizing questions</Badge>
                <Badge variant="outline">Ensuring measurability</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "review" && generatedSurvey && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Survey Generated Successfully
                  </CardTitle>
                  <CardDescription>Review and customize your AI-generated survey</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("input")}>
                    Start Over
                  </Button>
                  <Button onClick={handleSaveSurvey} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Save & Continue Editing
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{generatedSurvey.title}</h3>
                <p className="text-muted-foreground">{generatedSurvey.description}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Improvements Made
                </h4>
                <div className="space-y-2">
                  {generatedSurvey.improvements.map((improvement: string, idx: number) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Survey Structure</h4>
                <div className="space-y-4">
                  {generatedSurvey.sections.map((section: any, sIdx: number) => (
                    <Card key={section.id}>
                      <CardHeader>
                        <CardTitle className="text-base">Section {sIdx + 1}: {section.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {section.questions.map((question: any, qIdx: number) => (
                          <div key={question.id} className="border-l-2 border-purple-600 pl-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{question.title}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {question.type.replace("_", " ")}
                                  </Badge>
                                  {question.required && (
                                    <Badge variant="secondary" className="text-xs">Required</Badge>
                                  )}
                                </div>
                                {question.aiImprovement && (
                                  <div className="mt-2 text-xs text-muted-foreground flex gap-1">
                                    <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                    <span>{question.aiImprovement}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Reporting Capabilities
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {generatedSurvey.reportingCapabilities.map((capability: string, idx: number) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
