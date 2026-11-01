"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { PSC_CODES, type PscCode } from "@/lib/onboarding/psc-codes";

const MAX_SUGGESTIONS = 30;

/**
 * Products & services input backed by the federal PSC catalog. Typing filters
 * the 2,000+ Product Service Codes by code prefix or description; the user can
 * pick a code or press + / Enter to add their typed text as a custom entry.
 */
export function PscListInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);

  const query = draft.trim().toLowerCase();
  const matches = useMemo<PscCode[]>(() => {
    if (!query) return [];
    const results: PscCode[] = [];
    for (const psc of PSC_CODES) {
      if (
        psc.code.toLowerCase().startsWith(query) ||
        psc.name.toLowerCase().includes(query)
      ) {
        results.push(psc);
        if (results.length >= MAX_SUGGESTIONS) break;
      }
    }
    return results;
  }, [query]);

  const add = (item: string) => {
    const entry = item.trim();
    if (!entry) return;
    if (!value.includes(entry)) onChange([...value, entry]);
    setDraft("");
  };

  const addPsc = (psc: PscCode) => {
    const entry = `${psc.code} - ${psc.name}`;
    // Dedupe on the code so "R425" and "R425 - ..." can't both be added.
    if (value.some((v) => v === entry || v.split(" - ")[0] === psc.code)) {
      setDraft("");
      return;
    }
    onChange([...value, entry]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draft}
              className="pl-9"
              placeholder="Search a PSC code or description — or type your own"
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add(draft);
                } else if (e.key === "Escape") {
                  setDraft("");
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={() => add(draft)}
            disabled={!draft.trim()}
            aria-label="Add product or service"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {focused && query && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            {matches.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
                {matches.map((psc) => (
                  <li key={psc.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      className="flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addPsc(psc);
                      }}
                    >
                      <span className="shrink-0 font-mono font-medium">{psc.code}</span>
                      <span className="truncate text-muted-foreground">{psc.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No PSC code matches — press + to add “{draft.trim()}” as a
                custom entry.
              </p>
            )}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <ul className="space-y-1" aria-label="Added products and services">
          {value.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(value.filter((entry) => entry !== item))}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
