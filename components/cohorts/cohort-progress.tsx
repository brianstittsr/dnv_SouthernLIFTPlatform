"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  Award,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CohortProgressProps {
  completedSessions: number;
  totalSessions: number;
  progressPercentage: number;
  variant?: "default" | "compact" | "detailed";
  showModules?: boolean;
  modules?: Array<{
    id: string;
    title: string;
    completed: boolean;
    locked: boolean;
    sessionCount: number;
    completedSessionCount: number;
  }>;
}

export function CohortProgress({
  completedSessions,
  totalSessions,
  progressPercentage,
  variant = "default",
  showModules = false,
  modules = [],
}: CohortProgressProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  const getProgressLabel = (percentage: number) => {
    if (percentage >= 100) return "Completed";
    if (percentage >= 75) return "Almost There";
    if (percentage >= 50) return "Halfway";
    if (percentage >= 25) return "Getting Started";
    return "Just Started";
  };

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className={cn("font-medium", getProgressColor(progressPercentage))}>
            {progressPercentage}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {completedSessions} of {totalSessions} sessions
          </span>
          {progressPercentage >= 100 && (
            <Badge variant="outline" className="text-green-600">
              <Award className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </div>
    );
  }

  if (variant === "detailed" && showModules) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {getProgressLabel(progressPercentage)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={cn("text-3xl font-bold", getProgressColor(progressPercentage))}>
                    {progressPercentage}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completedSessions}/{totalSessions} sessions
                  </p>
                </div>
              </div>

              <Progress value={progressPercentage} className="h-3" />

              {progressPercentage >= 100 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Congratulations! You've completed this cohort!
                    </p>
                    <p className="text-xs text-green-700">
                      Your certificate is ready to download.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {modules.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-4">Module Progress</h4>
              <div className="space-y-3">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      module.locked && "opacity-50 bg-gray-50",
                      module.completed && "bg-green-50 border-green-200"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {module.locked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : module.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          Module {index + 1}: {module.title}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {module.completedSessionCount}/{module.sessionCount}
                        </span>
                      </div>
                      <Progress
                        value={(module.completedSessionCount / module.sessionCount) * 100}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={cn("h-5 w-5", getProgressColor(progressPercentage))} />
              <h3 className="font-semibold">Course Progress</h3>
            </div>
            <Badge variant="outline" className={getProgressColor(progressPercentage)}>
              {getProgressLabel(progressPercentage)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedSessions} of {totalSessions} sessions completed
              </span>
              <span className={cn("font-bold", getProgressColor(progressPercentage))}>
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {progressPercentage >= 100 ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Cohort completed! Certificate available.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Circle className="h-4 w-4" />
              <span>
                {totalSessions - completedSessions} sessions remaining
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
