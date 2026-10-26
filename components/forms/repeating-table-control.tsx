"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TableColumn, TableRow } from "@/lib/form-builder/types";

interface RepeatingTableControlProps {
  id: string;
  columns: TableColumn[];
  value: TableRow[];
  onChange: (rows: TableRow[]) => void;
  describedBy?: string;
}

const emptyRow = (columns: TableColumn[]): TableRow => Object.fromEntries(columns.map((column) => [column.key, null]));

/** Editable list of rows (line items) with typed columns. */
export function RepeatingTableControl({ id, columns, value, onChange, describedBy }: RepeatingTableControlProps) {
  const rows = value.length ? value : [];

  const updateCell = (rowIndex: number, column: TableColumn, raw: string) => {
    const parsed = column.type === "number" || column.type === "currency" ? (raw === "" ? null : Number(raw)) : raw;
    onChange(rows.map((row, index) => (index === rowIndex ? { ...row, [column.key]: parsed } : row)));
  };

  return (
    <div id={id} aria-describedby={describedBy} className="space-y-3">
      {rows.map((row, rowIndex) => (
        <fieldset key={rowIndex} className="rounded-md border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">Row {rowIndex + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {columns.map((column) => {
              const cellId = `${id}-${rowIndex}-${column.key}`;
              const cell = row[column.key];
              return (
                <div key={column.key} className="space-y-1">
                  <label htmlFor={cellId} className="text-xs font-medium">
                    {column.label}
                    {column.required && <span className="text-destructive"> *</span>}
                  </label>
                  {column.type === "dropdown" ? (
                    <select
                      id={cellId}
                      className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                      value={cell === null || cell === undefined ? "" : String(cell)}
                      onChange={(event) => updateCell(rowIndex, column, event.target.value)}
                    >
                      <option value="">Select...</option>
                      {(column.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={cellId}
                      type={column.type === "date" ? "date" : column.type === "text" ? "text" : "number"}
                      inputMode={column.type === "currency" || column.type === "number" ? "decimal" : undefined}
                      step={column.type === "currency" ? "0.01" : undefined}
                      min={column.type === "currency" ? 0 : undefined}
                      value={cell === null || cell === undefined ? "" : String(cell)}
                      onChange={(event) => updateCell(rowIndex, column, event.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => onChange(rows.filter((_, index) => index !== rowIndex))}>
            <Trash2 className="mr-1 h-4 w-4" />
            Remove row
          </Button>
        </fieldset>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, emptyRow(columns)])} disabled={rows.length >= 100}>
        <Plus className="mr-1 h-4 w-4" />
        Add row
      </Button>
    </div>
  );
}
