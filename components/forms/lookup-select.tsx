"use client";

import { useEffect, useState } from "react";
import { liftApi } from "./lift-api";

const cache = new Map<string, Promise<{ value: string; label: string }[]>>();

/** Loads lookup options once per page session. */
function loadOptions(source: string) {
  if (!cache.has(source)) {
    const request = liftApi.lookup(source).catch((error) => {
      cache.delete(source);
      throw error;
    });
    cache.set(source, request);
  }
  return cache.get(source)!;
}

interface LookupSelectProps {
  id: string;
  source: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

/** Select populated from a live platform lookup (parishes, events, clients, advisors...). */
export function LookupSelect({ id, source, value, onChange, invalid, describedBy }: LookupSelectProps) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    loadOptions(source)
      .then((result) => {
        if (!active) return;
        setOptions(result);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [source]);

  return (
    <div className="space-y-1">
      <select
        id={id}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm aria-[invalid=true]:border-destructive"
        value={value}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        disabled={status === "loading"}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{status === "loading" ? "Loading..." : "Select..."}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {status === "error" && <p className="text-xs text-destructive">Options could not be loaded. Refresh the page to try again.</p>}
      {status === "ready" && options.length === 0 && <p className="text-xs text-muted-foreground">No options are available yet.</p>}
    </div>
  );
}
