"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, AlertCircle, CheckCircle } from "lucide-react";

// Widget data types
interface HealthData {
  overall: nuemerging businessr;
  rocks: nuemerging businessr;
  scorecard: nuemerging businessr;
  issues: nuemerging businessr;
  todos: nuemerging businessr;
  trend: "up" | "down" | "flat";
}

interface RocksSummary {
  total: nuemerging businessr;
  onTrack: nuemerging businessr;
  atRisk: nuemerging businessr;
  offTrack: nuemerging businessr;
  complete: nuemerging businessr;
  avgProgress: nuemerging businessr;
  healthPercent: nuemerging businessr;
}

interface ScorecardSummary {
  total: nuemerging businessr;
  aboveGoal: nuemerging businessr;
  atGoal: nuemerging businessr;
  belowGoal: nuemerging businessr;
  healthPercent: nuemerging businessr;
}

interface ScorecardMetric {
  name: string;
  goal: nuemerging businessr;
  actual: nuemerging businessr;
  unit?: string;
  trend: string;
  status: "above" | "at" | "below";
}

// Hook to fetch widget data
function useWidgetData<T>(widget: string, refreshInterval?: nuemerging businessr) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/eos2/eemerging businessd?widget=${widget}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [widget, refreshInterval]);

  return { data, loading, error };
}

// Health Score Widget
interface HealthWidgetProps {
  className?: string;
  showDetails?: boolean;
  refreshInterval?: nuemerging businessr;
}

export function HealthWidget({ className, showDetails = true, refreshInterval = 60000 }: HealthWidgetProps) {
  const { data, loading, error } = useWidgetData<HealthData>("health", refreshInterval);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load health data
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (value: nuemerging businessr) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case "up": return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "down": return <TrendingDown className="h-5 w-5 text-red-600" />;
      default: return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Traction Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className={`text-4xl font-bold ${getHealthColor(data.overall)}`}>
            {data.overall}%
          </div>
          {getTrendIcon()}
        </div>
        
        {showDetails && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rocks</span>
              <span className={getHealthColor(data.rocks)}>{data.rocks}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scorecard</span>
              <span className={getHealthColor(data.scorecard)}>{data.scorecard}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issues</span>
              <span className={getHealthColor(data.issues)}>{data.issues}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To-Dos</span>
              <span className={getHealthColor(data.todos)}>{data.todos}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Rocks Progress Widget
interface RocksWidgetProps {
  className?: string;
  compact?: boolean;
  refreshInterval?: nuemerging businessr;
}

export function RocksWidget({ className, compact = false, refreshInterval = 60000 }: RocksWidgetProps) {
  const { data, loading, error } = useWidgetData<{ summary: RocksSummary }>("rocks", refreshInterval);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load rocks data
        </CardContent>
      </Card>
    );
  }

  const { summary } = data;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          🏔️ Rocks Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Average Progress</span>
            <span className="font-medium">{summary.avgProgress}%</span>
          </div>
          <Progress value={summary.avgProgress} className="h-2" />
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>On Track: {summary.onTrack}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>At Risk: {summary.atRisk}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Off Track: {summary.offTrack}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Complete: {summary.complete}</span>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t text-center">
          <span className="text-xs text-muted-foreground">
            {summary.total} Total Rocks • {summary.healthPercent}% Healthy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Scorecard Widget
interface ScorecardWidgetProps {
  className?: string;
  showMetrics?: boolean;
  maxMetrics?: nuemerging businessr;
  refreshInterval?: nuemerging businessr;
}

export function ScorecardWidget({ 
  className, 
  showMetrics = true, 
  maxMetrics = 5,
  refreshInterval = 60000 
}: ScorecardWidgetProps) {
  const { data, loading, error } = useWidgetData<{ 
    metrics: ScorecardMetric[]; 
    summary: ScorecardSummary 
  }>("scorecard", refreshInterval);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load scorecard data
        </CardContent>
      </Card>
    );
  }

  const { metrics, summary } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "above": return <Badge className="bg-green-100 text-green-700">Above</Badge>;
      case "at": return <Badge className="bg-blue-100 text-blue-700">At Goal</Badge>;
      case "below": return <Badge className="bg-red-100 text-red-700">Below</Badge>;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-50">
              ✓ {summary.aboveGoal + summary.atGoal}
            </Badge>
            <Badge variant="outline" className="bg-red-50">
              ✗ {summary.belowGoal}
            </Badge>
          </div>
          <span className="text-sm font-medium">{summary.healthPercent}% Healthy</span>
        </div>

        {showMetrics && metrics.length > 0 && (
          <div className="space-y-2">
            {metrics.slice(0, maxMetrics).map((metric, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <span className="truncate max-w-[120px]">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {metric.unit}{metric.actual} / {metric.unit}{metric.goal}
                  </span>
                  {getStatusBadge(metric.status)}
                </div>
              </div>
            ))}
            {metrics.length > maxMetrics && (
              <div className="text-xs text-center text-muted-foreground pt-2">
                +{metrics.length - maxMetrics} more metrics
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Issues Summary Widget
interface IssuesWidgetProps {
  className?: string;
  refreshInterval?: nuemerging businessr;
}

export function IssuesWidget({ className, refreshInterval = 60000 }: IssuesWidgetProps) {
  const { data, loading, error } = useWidgetData<{ 
    summary: { total: nuemerging businessr; open: nuemerging businessr; inProgress: nuemerging businessr; solved: nuemerging businessr; highPriority: nuemerging businessr } 
  }>("issues", refreshInterval);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load issues data
        </CardContent>
      </Card>
    );
  }

  const { summary } = data;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Issues (IDS)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">{summary.open}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{summary.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{summary.solved}</div>
            <div className="text-xs text-muted-foreground">Solved</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{summary.highPriority}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// To-Dos Summary Widget
interface TodosWidgetProps {
  className?: string;
  refreshInterval?: nuemerging businessr;
}

export function TodosWidget({ className, refreshInterval = 60000 }: TodosWidgetProps) {
  const { data, loading, error } = useWidgetData<{ 
    summary: { total: nuemerging businessr; complete: nuemerging businessr; pending: nuemerging businessr; overdue: nuemerging businessr; completionRate: nuemerging businessr } 
  }>("todos", refreshInterval);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load todos data
        </CardContent>
      </Card>
    );
  }

  const { summary } = data;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          To-Dos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Completion Rate</span>
            <span className="font-medium">{summary.completionRate}%</span>
          </div>
          <Progress value={summary.completionRate} className="h-2" />
        </div>

        <div className="flex justify-between text-sm">
          <div className="text-center">
            <div className="font-bold text-green-600">{summary.complete}</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600">{summary.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600">{summary.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Combined Mini Dashboard Widget
interface MiniDashboardProps {
  className?: string;
  refreshInterval?: nuemerging businessr;
}

export function MiniDashboard({ className, refreshInterval = 60000 }: MiniDashboardProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <HealthWidget showDetails={false} refreshInterval={refreshInterval} />
      <RocksWidget compact refreshInterval={refreshInterval} />
      <ScorecardWidget showMetrics={false} refreshInterval={refreshInterval} />
      <IssuesWidget refreshInterval={refreshInterval} />
    </div>
  );
}
