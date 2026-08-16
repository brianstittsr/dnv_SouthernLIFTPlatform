"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LiveAnalyticsData {
  totalVisitors: number;
  totalPageviews: number;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  topPages: { path: string; views: number; visitors: number }[];
  topSources: { source: string; visitors: number }[];
  dailyVisitors: { date: string; visitors: number; pageviews: number }[];
  from: string;
  to: string;
}

export default function LiveAnalyticsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LiveAnalyticsData | null>(null);
  const [days, setDays] = useState<number>(7);
  const [environment, setEnvironment] = useState<string>("production");
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) throw new Error("You must be signed in");
    return currentUser.getIdToken();
  };

  const fetchLive = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/admin/analytics/live?days=${days}&environment=${environment}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch live analytics");
      setData(json.data);
    } catch (err) {
      console.error("Fetch live analytics error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      toast.error(err instanceof Error ? err.message : "Failed to fetch live analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchLive();
    }
  }, [profile, days, environment]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Vercel Analytics</h1>
          <p className="text-muted-foreground">Real-time web analytics from Vercel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portal/admin/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Button onClick={fetchLive} disabled={loading} size="sm">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-40">
          <span className="text-sm font-medium mb-1.5 block">Days</span>
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v, 10))}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <span className="text-sm font-medium mb-1.5 block">Environment</span>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard title="Pageviews" value={data.totalPageviews} />
            <MetricCard title="Visitors" value={data.totalVisitors} />
            <MetricCard title="Bounce Rate" value={data.bounceRate} suffix="%" fallback="—" />
            <MetricCard title="Avg. Session" value={data.avgSessionDuration} suffix="s" fallback="—" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  {data.from} to {data.to}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.topPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                  <div className="space-y-3">
                    {data.topPages.map((page) => (
                      <div key={page.path} className="flex items-center justify-between text-sm">
                        <span
                          className="font-mono truncate max-w-[60%]"
                          title={page.path}
                        >
                          {page.path}
                        </span>
                        <div className="flex gap-4 text-muted-foreground">
                          <span>{page.views.toLocaleString()} views</span>
                          <span>{page.visitors.toLocaleString()} visitors</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Sources</CardTitle>
                <CardDescription>
                  {data.from} to {data.to}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.topSources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                  <div className="space-y-3">
                    {data.topSources.map((source) => (
                      <div
                        key={source.source}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate max-w-[70%]" title={source.source}>
                          {source.source}
                        </span>
                        <span className="text-muted-foreground">
                          {source.visitors.toLocaleString()} visitors
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Traffic</CardTitle>
              <CardDescription>
                {data.from} to {data.to}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.dailyVisitors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No daily data available.</p>
              ) : (
                <div className="space-y-4">
                  {data.dailyVisitors.map((day) => {
                    const max = Math.max(
                      ...data.dailyVisitors.map((d) => d.pageviews),
                      1
                    );
                    return (
                      <div key={day.date} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{day.date}</span>
                          <span className="text-muted-foreground">
                            {day.pageviews.toLocaleString()} views ·{" "}
                            {day.visitors.toLocaleString()} visitors
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(day.pageviews / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  suffix,
  fallback,
}: {
  title: string;
  value: number | null;
  suffix?: string;
  fallback?: string;
}) {
  const display =
    value === null
      ? fallback || "—"
      : `${value.toLocaleString()}${suffix ? ` ${suffix}` : ""}`;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{display}</div>
      </CardContent>
    </Card>
  );
}
