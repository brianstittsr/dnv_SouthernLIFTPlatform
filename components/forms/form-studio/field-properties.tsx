"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTROL_CATALOG, LOOKUP_SOURCES } from "@/lib/form-builder/controls";
import type { CrosswalkKey, FieldMapping, FormField, FormSection, LiftTarget, MappingTransform, ShowIfOperator, TableColumn } from "@/lib/form-builder/types";

const CROSSWALK_KEYS: CrosswalkKey[] = [
  "owner.name", "owner.title", "owner.ethnicity", "business.name", "business.address", "business.city", "business.state",
  "business.zip", "business.parish", "business.website", "business.naics", "business.revenueBand", "business.annualRevenue",
  "business.employeesFullTime", "business.employeesPartTime", "business.applyingAs", "contact.email", "contact.phone",
  "contact.mobile", "ids.uei", "ids.cage", "certifications.current", "capabilities.summary", "needs.top", "needs.helpWanted",
  "business.acquisitionMethod", "teaming.open", "resources.toInvest", "operations.outOfState", "operations.inHouseBD",
  "agencies.target", "referral.source", "referral.by", "serviceArea.primary", "social.linkedin",
];

const TARGETS: LiftTarget[] = [
  "liftClients", "liftBaselines", "liftServicePlans", "liftSessions", "liftTrainingAttendance", "liftFeedback",
  "liftCapitalPackages", "liftCapabilityLibraries", "liftProposalResponses", "liftOutcomeClaims", "liftImpactConsents", "liftExits",
];
const TRANSFORMS: MappingTransform[] = ["none", "currency_to_cents", "number", "split_csv", "boolean"];
const OPERATORS: ShowIfOperator[] = ["equals", "not_equals", "includes", "is_true", "is_false", "answered"];

const selectClass = "h-9 w-full rounded-md border bg-background px-2 text-sm";

interface FieldPropertiesProps {
  field: FormField;
  fields: FormField[];
  sections: FormSection[];
  onChange: (field: FormField) => void;
  onDelete: () => void;
}

/** Serializes table columns as "key | label | type | required | options;comma;list" lines for editing. */
const columnsToText = (columns: TableColumn[] = []) =>
  columns.map((column) => [column.key, column.label, column.type, column.required ? "required" : "", (column.options ?? []).join(";")].join(" | ")).join("\n");

const textToColumns = (text: string): TableColumn[] =>
  text
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts[0] && parts[1])
    .map(([key, label, type, required, options]) => ({
      key,
      label,
      type: (["text", "number", "currency", "date", "dropdown"].includes(type) ? type : "text") as TableColumn["type"],
      required: required === "required",
      ...(options ? { options: options.split(";").map((item) => item.trim()).filter(Boolean) } : {}),
    }));

/** Property editor for the selected field in the Form Studio. */
export function FieldProperties({ field, fields, sections, onChange, onDelete }: FieldPropertiesProps) {
  const update = (patch: Partial<FormField>) => onChange({ ...field, ...patch });
  const hasOptions = ["dropdown", "radio", "multi_select"].includes(field.type);
  const isScale = field.type === "likert_scale";
  const mappings = field.mappings ?? [];

  const updateMapping = (index: number, patch: Partial<FieldMapping>) =>
    update({ mappings: mappings.map((mapping, position) => (position === index ? { ...mapping, ...patch } : mapping)) });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="prop-label">Question / label</Label>
        <Textarea id="prop-label" rows={3} value={field.label} onChange={(event) => update({ label: event.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="prop-key">Key</Label>
          <Input id="prop-key" value={field.key} onChange={(event) => update({ key: event.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="prop-type">Type</Label>
          <select id="prop-type" className={selectClass} value={field.type} onChange={(event) => update({ type: event.target.value as FormField["type"] })}>
            {CONTROL_CATALOG.map((control) => (
              <option key={control.type} value={control.type}>
                {control.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="prop-section">Section</Label>
          <select id="prop-section" className={selectClass} value={field.section ?? ""} onChange={(event) => update({ section: event.target.value || undefined })}>
            <option value="">(first section)</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={field.required} onCheckedChange={(checked) => update({ required: checked === true })} /> Required
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={field.staffOnly ?? false} onCheckedChange={(checked) => update({ staffOnly: checked === true || undefined })} /> Staff only
          </label>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="prop-help">Help text</Label>
        <Input id="prop-help" value={field.helpText ?? ""} onChange={(event) => update({ helpText: event.target.value || undefined })} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="prop-placeholder">Placeholder</Label>
        <Input id="prop-placeholder" value={field.placeholder ?? ""} onChange={(event) => update({ placeholder: event.target.value || undefined })} />
      </div>

      {hasOptions && (
        <div className="space-y-1">
          <Label htmlFor="prop-options">Options (one per line)</Label>
          <Textarea
            id="prop-options"
            rows={5}
            value={(field.options ?? []).join("\n")}
            onChange={(event) => update({ options: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })}
          />
        </div>
      )}
      {field.type === "platform_lookup" && (
        <div className="space-y-1">
          <Label htmlFor="prop-lookup">Lookup source</Label>
          <select id="prop-lookup" className={selectClass} value={field.lookupSource ?? ""} onChange={(event) => update({ lookupSource: (event.target.value || undefined) as FormField["lookupSource"] })}>
            <option value="">Select...</option>
            {LOOKUP_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {isScale && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prop-min">Scale min</Label>
            <Input id="prop-min" type="number" value={field.scaleMin ?? 1} onChange={(event) => update({ scaleMin: Number(event.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-max">Scale max</Label>
            <Input id="prop-max" type="number" value={field.scaleMax ?? 5} onChange={(event) => update({ scaleMax: Number(event.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-minlabel">Min label</Label>
            <Input id="prop-minlabel" value={field.scaleMinLabel ?? ""} onChange={(event) => update({ scaleMinLabel: event.target.value || undefined })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-maxlabel">Max label</Label>
            <Input id="prop-maxlabel" value={field.scaleMaxLabel ?? ""} onChange={(event) => update({ scaleMaxLabel: event.target.value || undefined })} />
          </div>
        </div>
      )}
      {field.type === "repeating_table" && (
        <div className="space-y-1">
          <Label htmlFor="prop-columns">Columns</Label>
          <Textarea id="prop-columns" rows={4} value={columnsToText(field.tableColumns)} onChange={(event) => update({ tableColumns: textToColumns(event.target.value) })} />
          <p className="text-xs text-muted-foreground">One per line: key | label | text, number, currency, date, or dropdown | required | option;option</p>
        </div>
      )}
      {field.type === "calculated" && (
        <div className="space-y-1">
          <Label htmlFor="prop-formula">Formula</Label>
          <Input id="prop-formula" value={field.formula ?? ""} placeholder="{revenueNow} - {revenueBaseline}" onChange={(event) => update({ formula: event.target.value || undefined })} />
        </div>
      )}
      {field.type === "file_upload" && (
        <div className="space-y-1">
          <Label htmlFor="prop-maxfiles">Maximum files</Label>
          <Input id="prop-maxfiles" type="number" min={1} max={10} value={field.maxFiles ?? 5} onChange={(event) => update({ maxFiles: Number(event.target.value) })} />
        </div>
      )}

      <fieldset className="space-y-2 rounded-md border p-3">
        <legend className="px-1 text-sm font-medium">Show only if</legend>
        <div className="grid grid-cols-3 gap-2">
          <select
            aria-label="Condition field"
            className={selectClass}
            value={field.showIf?.fieldKey ?? ""}
            onChange={(event) => update({ showIf: event.target.value ? { fieldKey: event.target.value, operator: field.showIf?.operator ?? "is_true", value: field.showIf?.value } : undefined })}
          >
            <option value="">Always show</option>
            {fields.filter((other) => other.key !== field.key).map((other) => (
              <option key={other.key} value={other.key}>
                {other.key}
              </option>
            ))}
          </select>
          <select
            aria-label="Condition operator"
            className={selectClass}
            disabled={!field.showIf}
            value={field.showIf?.operator ?? "is_true"}
            onChange={(event) => field.showIf && update({ showIf: { ...field.showIf, operator: event.target.value as ShowIfOperator } })}
          >
            {OPERATORS.map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
          <Input
            aria-label="Condition value"
            disabled={!field.showIf || !["equals", "not_equals", "includes"].includes(field.showIf.operator)}
            value={field.showIf?.value ?? ""}
            onChange={(event) => field.showIf && update({ showIf: { ...field.showIf, value: event.target.value } })}
          />
        </div>
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="prop-prefill">Prefill / cross-walk key</Label>
        <select id="prop-prefill" className={selectClass} value={field.prefillKey ?? ""} onChange={(event) => update({ prefillKey: (event.target.value || undefined) as CrosswalkKey | undefined })}>
          <option value="">None</option>
          {CROSSWALK_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2 rounded-md border p-3">
        <legend className="px-1 text-sm font-medium">Write answer to records</legend>
        {mappings.map((mapping, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <select aria-label="Target record" className={selectClass} value={mapping.target} onChange={(event) => updateMapping(index, { target: event.target.value as LiftTarget })}>
              {TARGETS.map((target) => (
                <option key={target} value={target}>
                  {target}
                </option>
              ))}
            </select>
            <Input aria-label="Path" value={mapping.path} placeholder="business.revenue" onChange={(event) => updateMapping(index, { path: event.target.value })} />
            <select aria-label="Transform" className={selectClass} value={mapping.transform ?? "none"} onChange={(event) => updateMapping(index, { transform: event.target.value as MappingTransform })}>
              {TRANSFORMS.map((transform) => (
                <option key={transform} value={transform}>
                  {transform}
                </option>
              ))}
            </select>
            <Button type="button" variant="ghost" size="icon" aria-label="Remove mapping" onClick={() => update({ mappings: mappings.filter((_, position) => position !== index) })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={mappings.length >= 5} onClick={() => update({ mappings: [...mappings, { target: "liftClients", path: field.key }] })}>
          <Plus className="mr-1 h-4 w-4" />
          Add mapping
        </Button>
      </fieldset>

      <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="mr-1 h-4 w-4" />
        Delete field
      </Button>
    </div>
  );
}
