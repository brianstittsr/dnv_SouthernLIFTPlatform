"use client";

import { Button } from "@/components/ui/button";
import { Database, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DataModeToggleProps {
  useMockData: boolean;
  onToggle: () => void;
  className?: string;
}

export function DataModeToggle({ useMockData, onToggle, className }: DataModeToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Badge variant={useMockData ? "secondary" : "default"} className="text-xs">
        {useMockData ? (
          <>
            <TestTube className="h-3 w-3 mr-1" />
            Mock Data
          </>
        ) : (
          <>
            <Database className="h-3 w-3 mr-1" />
            Live Data
          </>
        )}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        title={useMockData ? "Switch to Live Data" : "Switch to Mock Data"}
      >
        {useMockData ? "Use Live Data" : "Use Mock Data"}
      </Button>
    </div>
  );
}
