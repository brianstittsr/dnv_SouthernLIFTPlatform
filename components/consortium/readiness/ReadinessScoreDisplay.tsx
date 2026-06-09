"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Info,
} from "lucide-react";
import type { ReadinessScore } from "@/lib/readiness-scoring";
import { getReadinessCategory } from "@/lib/readiness-scoring";
import { cn } from "@/lib/utils";

interface ReadinessScoreDisplayProps {
  readinessScore: ReadinessScore;
  showDetails?: boolean;
  onRecalculate?: () => void;
  loading?: boolean;
}

export function ReadinessScoreDisplay({
  readinessScore,
  showDetails = true,
  onRecalculate,
  loading = false,
}: ReadinessScoreDisplayProps) {
  const category = getReadinessCategory(readinessScore.overallScore);
  const { breakdown } = readinessScore;

  const scoreColor = {
    green: "text-green-600 bg-green-50 border-green-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    orange: "text-orange-600 bg-orange-50 border-orange-200",
    red: "text-red-600 bg-red-50 border-red-200",
  }[category.color] as string;

  const progressColor = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  }[category.color] as string;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={cn("w-5 h-5", category.color === "green" ? "text-green-600" : category.color === "red" ? "text-red-600" : "text-blue-600")} />
            <CardTitle>Government Contracting Readiness Score</CardTitle>
          </div>
          {onRecalculate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecalculate}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Recalculate"}
            </Button>
          )}
        </div>
        <CardDescription>
          Your readiness to participate in federal contracting programs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold">{readinessScore.overallScore}</div>
          <Badge className={cn(scoreColor, "text-sm px-3 py-1")}>
            {category.category}
          </Badge>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{readinessScore.overallScore}%</span>
          </div>
          <Progress value={readinessScore.overallScore} className="h-2" />
        </div>

        {showDetails && (
          <>
            {/* Score Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Score Breakdown</h4>
              <div className="space-y-3">
                <ScoreItem
                  label="SAM.gov Registration"
                  score={breakdown.samRegistration}
                  max={20}
                  color={breakdown.samRegistration === 20 ? "green" : breakdown.samRegistration > 0 ? "yellow" : "red"}
                />
                <ScoreItem
                  label="Unique Entity ID (UEI)"
                  score={breakdown.uei}
                  max={15}
                  color={breakdown.uei === 15 ? "green" : breakdown.uei > 0 ? "yellow" : "red"}
                />
                <ScoreItem
                  label="CAGE Code"
                  score={breakdown.cageCode}
                  max={15}
                  color={breakdown.cageCode === 15 ? "green" : breakdown.cageCode > 0 ? "yellow" : "red"}
                />
                <ScoreItem
                  label="NAICS Code Coverage"
                  score={breakdown.naicsCoverage}
                  max={15}
                  color={breakdown.naicsCoverage === 15 ? "green" : breakdown.naicsCoverage > 0 ? "yellow" : "red"}
                />
                <ScoreItem
                  label="Federal Certifications"
                  score={breakdown.federalCertifications}
                  max={15}
                  color={breakdown.federalCertifications === 15 ? "green" : breakdown.federalCertifications > 0 ? "yellow" : "red"}
                />
                <ScoreItem
                  label="Past Performance"
                  score={breakdown.pastPerformance}
                  max={10}
                  color={breakdown.pastPerformance === 10 ? "green" : breakdown.pastPerformance > 0 ? "yellow" : "red"}
                />
                <ScoreItem
                  label="GSA Schedule"
                  score={breakdown.gsaSchedule}
                  max={10}
                  color={breakdown.gsaSchedule === 10 ? "green" : "yellow"}
                />
              </div>
            </div>

            {/* Gaps */}
            {readinessScore.gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Gaps Identified
                </h4>
                <ScrollArea className="h-32">
                  <ul className="space-y-2">
                    {readinessScore.gaps.map((gap: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Remediation Recommendations */}
            {readinessScore.remediationRecommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Recommended Actions
                </h4>
                <ScrollArea className="h-32">
                  <ul className="space-y-2">
                    {readinessScore.remediationRecommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Resources */}
            {readinessScore.resources.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-green-500" />
                  Helpful Resources
                </h4>
                <div className="space-y-2">
                  {readinessScore.resources.map((resource: any, index: number) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm p-2 rounded border hover:bg-muted transition-colors"
                    >
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-xs text-muted-foreground">{resource.description}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Score History */}
            {readinessScore.scoreHistory.length > 1 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Score History
                </h4>
                <div className="space-y-2">
                  {readinessScore.scoreHistory.slice(-5).map((history: any, index: number) => {
                    const prevScore = readinessScore.scoreHistory[index - 1]?.score || history.score;
                    const trend = history.score - prevScore;
                    return (
                      <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-muted">
                        <span>{new Date(history.calculatedAt.toDate()).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{history.score}</span>
                          {trend > 0 && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {trend < 0 && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {trend === 0 && <Minus className="w-4 h-4 text-gray-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
  max: number;
  color: "green" | "yellow" | "red";
}

function ScoreItem({ label, score, max, color }: ScoreItemProps) {
  const percentage = (score / max) * 100;
  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score}/{max}</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}
