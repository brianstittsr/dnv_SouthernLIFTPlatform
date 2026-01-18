"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataToggleProps {
  onToggle: (useMockData: boolean) => void;
  defaultValue?: boolean;
  className?: string;
}

export function DataToggle({ onToggle, defaultValue = false, className }: DataToggleProps) {
  const [useMockData, setUseMockData] = useState(defaultValue);

  const handleToggle = (value: boolean) => {
    setUseMockData(value);
    onToggle(value);
  };

  return (
    <div className={cn("inline-flex rounded-lg border p-1 bg-muted/50", className)}>
      <Button
        variant={!useMockData ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToggle(false)}
        className={cn(
          "gap-2",
          !useMockData && "bg-primary text-primary-foreground"
        )}
      >
        <Database className="h-4 w-4" />
        Live Data
      </Button>
      <Button
        variant={useMockData ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToggle(true)}
        className={cn(
          "gap-2",
          useMockData && "bg-orange-600 text-white hover:bg-orange-700"
        )}
      >
        <Zap className="h-4 w-4" />
        Mock Data
      </Button>
    </div>
  );
}
