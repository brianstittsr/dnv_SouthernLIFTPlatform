"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Server,
  Database,
  Zap,
  HardDrive,
  Cpu,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export default function SystemHealthPage() {
  const [uptime, setUptime] = useState(99.8);

  const healthMetrics = [
    {
      name: "API Response Time",
      value: "145ms",
      status: "healthy",
      icon: Zap,
      percentage: 95
    },
    {
      name: "Database Performance",
      value: "98.5%",
      status: "healthy",
      icon: Database,
      percentage: 98.5
    },
    {
      name: "Server Load",
      value: "42%",
      status: "healthy",
      icon: Server,
      percentage: 42
    },
    {
      name: "Storage Usage",
      value: "67%",
      status: "warning",
      icon: HardDrive,
      percentage: 67
    },
    {
      name: "CPU Usage",
      value: "38%",
      status: "healthy",
      icon: Cpu,
      percentage: 38
    },
    {
      name: "Memory Usage",
      value: "54%",
      status: "healthy",
      icon: Activity,
      percentage: 54
    }
  ];

  const services = [
    { name: "Web Application", status: "operational", uptime: 99.9 },
    { name: "API Gateway", status: "operational", uptime: 99.8 },
    { name: "Database", status: "operational", uptime: 99.95 },
    { name: "File Storage", status: "operational", uptime: 99.7 },
    { name: "Email Service", status: "operational", uptime: 99.6 },
    { name: "Authentication", status: "operational", uptime: 99.9 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Health</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and service status
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          <CheckCircle className="mr-2 h-5 w-5" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {healthMetrics.map((metric, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </div>
                {getStatusIcon(metric.status)}
              </div>
              <Progress value={metric.percentage} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current status of all platform services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Uptime: {service.uptime}%
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Operational
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-green-600">-12% ↓</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Throughput</span>
                  <span className="text-sm text-green-600">+18% ↑</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-green-600">-5% ↓</span>
                </div>
                <Progress value={2} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-sm text-green-600">+23% ↑</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Platform details and version information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Platform Version</p>
              <p className="text-xl font-bold">v2.5.0</p>
              <p className="text-xs text-green-600">Latest</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Uptime</p>
              <p className="text-xl font-bold">{uptime}%</p>
              <p className="text-xs text-green-600">Last 30 days</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Last Deploy</p>
              <p className="text-xl font-bold">2 days ago</p>
              <p className="text-xs text-muted-foreground">Jan 18, 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
