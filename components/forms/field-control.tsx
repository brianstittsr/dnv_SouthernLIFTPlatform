"use client";

import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { computeFormula } from "@/lib/form-builder/logic";
import type { FieldValue, FormField, FormValues, SignatureValue, TableRow, UploadRef } from "@/lib/form-builder/types";
import { cn } from "@/lib/utils";
import { FileUploadControl } from "./file-upload-control";
import { LookupSelect } from "./lookup-select";
import { RepeatingTableControl } from "./repeating-table-control";
import { SignaturePad } from "./signature-pad";

interface FieldControlProps {
  field: FormField;
  value: FieldValue | undefined;
  values: FormValues;
  error?: string;
  slug: string;
  onChange: (value: FieldValue) => void;
  /** Larger type for conversational (one question at a time) mode. */
  emphasis?: boolean;
}

const asString = (value: FieldValue | undefined) => (typeof value === "string" || typeof value === "number" ? String(value) : "");

/** Renders the label, help text, input, and error for a single field. */
export function FieldControl({ field, value, values, error, slug, onChange, emphasis }: FieldControlProps) {
  const id = `field-${field.key}`;
  const helpId = field.helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const labelClass = cn("block font-medium", emphasis ? "text-xl leading-snug" : "text-sm");

  if (field.type === "section_header") return <h3 className={cn("font-semibold", emphasis ? "text-2xl" : "text-lg")}>{field.label}</h3>;
  if (field.type === "statement") {
    return (
      <div className="whitespace-pre-line rounded-md border bg-muted/40 p-4 text-sm leading-relaxed" role="note">
        {field.label}
      </div>
    );
  }

  const label = (
    <label htmlFor={id} className={labelClass}>
      {field.label}
      {field.required && <span className="text-destructive" aria-hidden="true"> *</span>}
      {field.required && <span className="sr-only"> (required)</span>}
    </label>
  );

  const help = field.helpText ? (
    <p id={helpId} className="text-sm text-muted-foreground">
      {field.helpText}
    </p>
  ) : null;

  const errorMessage = error ? (
    <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
      {error}
    </p>
  ) : null;

  const textProps = {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    placeholder: field.placeholder,
  };

  const choiceGroup = (options: string[], selected: (option: string) => boolean, toggle: (option: string) => void, multiple: boolean) => (
    <fieldset aria-describedby={describedBy} className="space-y-2">
      <legend className={labelClass}>
        {field.label}
        {field.required && <span className="text-destructive" aria-hidden="true"> *</span>}
        {field.required && <span className="sr-only"> (required)</span>}
      </legend>
      {help}
      <div className={cn("grid gap-2", options.length > 4 && "sm:grid-cols-2")}>
        {options.map((option, index) => {
          const optionId = `${id}-${index}`;
          const isSelected = selected(option);
          return (
            <label
              key={option}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
              )}
            >
              <input
                id={optionId}
                type={multiple ? "checkbox" : "radio"}
                name={id}
                className="h-4 w-4 accent-primary"
                checked={isSelected}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          );
        })}
      </div>
      {errorMessage}
    </fieldset>
  );

  switch (field.type) {
    case "radio":
      return choiceGroup(field.options ?? [], (option) => value === option, (option) => onChange(option), false);
    case "yes_no":
      return choiceGroup(["Yes", "No"], (option) => value === option.toLowerCase(), (option) => onChange(option.toLowerCase()), false);
    case "multi_select": {
      const current = Array.isArray(value) ? (value as string[]) : [];
      return choiceGroup(
        field.options ?? [],
        (option) => current.includes(option),
        (option) => onChange(current.includes(option) ? current.filter((item) => item !== option) : [...current, option]),
        true
      );
    }
    case "checkbox":
      return (
        <div className="space-y-1">
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox id={id} checked={value === true} onCheckedChange={(checked) => onChange(checked === true)} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
            <label htmlFor={id} className="text-sm leading-relaxed">
              {field.label}
              {field.required && <span className="text-destructive" aria-hidden="true"> *</span>}
            </label>
          </div>
          {help}
          {errorMessage}
        </div>
      );
    case "likert_scale":
    case "nps":
    case "rating_stars": {
      const min = field.type === "nps" ? 0 : field.scaleMin ?? 1;
      const max = field.type === "nps" ? 10 : field.type === "rating_stars" ? 5 : field.scaleMax ?? 5;
      const points = Array.from({ length: max - min + 1 }, (_, index) => min + index);
      const minLabel = field.type === "nps" ? "Not at all likely" : field.scaleMinLabel;
      const maxLabel = field.type === "nps" ? "Extremely likely" : field.scaleMaxLabel;
      return (
        <fieldset aria-describedby={describedBy} className="space-y-2">
          <legend className={labelClass}>
            {field.label}
            {field.required && <span className="text-destructive" aria-hidden="true"> *</span>}
          </legend>
          {help}
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {points.map((point) => {
              const selected = value === point;
              return (
                <button
                  key={point}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={field.type === "rating_stars" ? `${point} star${point === 1 ? "" : "s"}` : String(point)}
                  onClick={() => onChange(point)}
                  className={cn(
                    "flex h-10 min-w-10 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  {field.type === "rating_stars" ? <Star className={cn("h-5 w-5", typeof value === "number" && point <= value && "fill-current")} /> : point}
                </button>
              );
            })}
          </div>
          {(minLabel || maxLabel) && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
          )}
          {errorMessage}
        </fieldset>
      );
    }
    default:
      break;
  }

  let control: React.ReactNode;
  switch (field.type) {
    case "long_text":
      control = <Textarea {...textProps} rows={emphasis ? 5 : 4} value={asString(value)} onChange={(event) => onChange(event.target.value)} />;
      break;
    case "number":
    case "currency":
      control = (
        <div className="relative">
          {field.type === "currency" && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>}
          <Input
            {...textProps}
            type="number"
            inputMode="decimal"
            step={field.type === "currency" ? "0.01" : "any"}
            min={field.type === "currency" ? 0 : undefined}
            className={cn(field.type === "currency" && "pl-7")}
            value={asString(value)}
            onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
          />
        </div>
      );
      break;
    case "calculated": {
      const result = computeFormula(field.formula, values);
      control = (
        <output id={id} aria-describedby={describedBy} className="block rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {result === null ? "Calculated when the related answers are filled in" : result.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </output>
      );
      break;
    }
    case "dropdown":
      control = (
        <select
          id={id}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm aria-[invalid=true]:border-destructive"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select...</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    case "platform_lookup":
      control =
        field.lookupSource && field.lookupSource !== "manual_list" ? (
          <LookupSelect id={id} source={field.lookupSource} value={asString(value)} onChange={onChange} invalid={Boolean(error)} describedBy={describedBy} />
        ) : (
          <Input {...textProps} value={asString(value)} onChange={(event) => onChange(event.target.value)} />
        );
      break;
    case "file_upload":
      control = (
        <FileUploadControl
          id={id}
          slug={slug}
          value={Array.isArray(value) ? (value as UploadRef[]) : []}
          onChange={(refs) => onChange(refs)}
          maxFiles={field.maxFiles ?? 5}
          accept={field.accept}
          describedBy={describedBy}
        />
      );
      break;
    case "signature":
      control = (
        <SignaturePad id={id} value={(value as SignatureValue | null) ?? null} onChange={(signature) => onChange(signature)} invalid={Boolean(error)} describedBy={describedBy} />
      );
      break;
    case "repeating_table":
      control = (
        <RepeatingTableControl
          id={id}
          columns={field.tableColumns ?? []}
          value={Array.isArray(value) ? (value as TableRow[]) : []}
          onChange={(rows) => onChange(rows)}
          describedBy={describedBy}
        />
      );
      break;
    default: {
      const inputType =
        field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text";
      control = (
        <Input
          {...textProps}
          type={inputType}
          autoComplete={field.type === "email" ? "email" : field.type === "phone" ? "tel" : undefined}
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }
  }

  return (
    <div className="space-y-2">
      {label}
      {help}
      {control}
      {errorMessage}
    </div>
  );
}
