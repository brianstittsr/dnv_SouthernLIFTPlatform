"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { ArrowLeft, GripVertical, Loader2, Plus, Rocket, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FormRunner } from "@/components/forms/form-runner";
import { FieldProperties } from "@/components/forms/form-studio/field-properties";
import { liftFetch } from "@/components/forms/lift-api";
import { CONTROL_CATALOG } from "@/lib/form-builder/controls";
import type { FormField, FormFieldType, LiftFormDoc, PostProcessHook, PublicFormSchema } from "@/lib/form-builder/types";
import { cn } from "@/lib/utils";

const HOOKS: { value: PostProcessHook; label: string }[] = [
  { value: "intake_ai_summary", label: "AI intake summary (B1)" },
  { value: "enrollment_consent", label: "Record MBDA consent / enrollment (B2)" },
  { value: "rural_attestation", label: "Record rural attestation (B3)" },
  { value: "outcome_claims", label: "Create outcome claims (B9)" },
  { value: "proposal_award", label: "Create contract claim on award (B8)" },
];

const selectClass = "h-9 w-full rounded-md border bg-background px-2 text-sm";

/** Fields of LiftFormDoc that are sent to the API when saving. */
function toDefinition(form: LiftFormDoc) {
  return {
    slug: form.slug,
    title: form.title,
    description: form.description,
    category: form.category,
    lifecycleRef: form.lifecycleRef || undefined,
    presentationMode: form.presentationMode,
    audience: form.audience,
    sections: form.sections,
    fields: form.fields,
    ombControlNumber: form.ombControlNumber || undefined,
    ombExpiresOn: form.ombExpiresOn || undefined,
    consentText: form.consentText || undefined,
    submitLabel: form.submitLabel || undefined,
    completionMessage: form.completionMessage || undefined,
    nextFormSlug: form.nextFormSlug || undefined,
    postProcess: form.postProcess?.length ? form.postProcess : undefined,
    pdfConfig: form.pdfConfig,
  };
}

let fieldCounter = 0;
const newField = (type: FormFieldType, section?: string): FormField => {
  fieldCounter += 1;
  const key = `${type.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())}${Date.now().toString(36).slice(-4)}${fieldCounter}`;
  const label = CONTROL_CATALOG.find((control) => control.type === type)?.label ?? "Question";
  return {
    id: key,
    key,
    label: `New ${label.toLowerCase()} question`,
    type,
    required: false,
    section,
    ...(["dropdown", "radio", "multi_select"].includes(type) ? { options: ["Option 1", "Option 2"] } : {}),
    ...(type === "likert_scale" ? { scaleMin: 1, scaleMax: 5 } : {}),
    ...(type === "repeating_table" ? { tableColumns: [{ key: "item", label: "Item", type: "text" as const, required: true }] } : {}),
  };
};

/** Form Studio editor: build fields, configure settings, preview, save, and publish. */
export default function LiftFormEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<LiftFormDoc | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | "ai" | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    liftFetch<LiftFormDoc>(`/api/lift/forms/${id}`)
      .then((loaded) => {
        setForm(loaded);
        setSelectedKey(loaded.fields[0]?.key ?? null);
      })
      .catch((error: Error) => toast.error(error.message));
  }, [id]);

  const patch = useCallback((update: Partial<LiftFormDoc>) => {
    setForm((current) => (current ? { ...current, ...update } : current));
    setDirty(true);
  }, []);

  const selected = form?.fields.find((field) => field.key === selectedKey) ?? null;
  const preview = useMemo<PublicFormSchema | undefined>(() => (form ? { ...form, fields: form.fields } : undefined), [form]);

  const save = async (): Promise<boolean> => {
    if (!form) return false;
    setBusy("save");
    setIssues([]);
    try {
      const response = await fetch(`/api/lift/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toDefinition(form)),
      });
      const body = (await response.json()) as { data?: LiftFormDoc; error?: string; issues?: { path: (string | number)[]; message: string }[] };
      if (!response.ok || !body.data) {
        setIssues((body.issues ?? []).map((issue) => `${issue.path.join(".")}: ${issue.message}`));
        throw new Error(body.error ?? "Save failed");
      }
      setForm(body.data);
      setDirty(false);
      toast.success("Saved as draft");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (dirty && !(await save())) return;
    setBusy("publish");
    try {
      const published = await liftFetch<LiftFormDoc>(`/api/lift/forms/${id}/publish`, { method: "POST" });
      setForm(published);
      toast.success(`Published version ${published.version}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setBusy(null);
    }
  };

  const runAi = async (mode: "generate" | "optimize_for_reporting") => {
    if (!form) return;
    if (mode === "generate" && !aiPrompt.trim()) {
      toast.error("Describe the form you want to generate");
      return;
    }
    setBusy("ai");
    try {
      const result = await liftFetch<{ fields: FormField[] }>("/api/lift/forms/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "generate" ? { mode, prompt: aiPrompt } : { mode, fields: form.fields }),
      });
      const existingKeys = new Set(form.fields.map((field) => field.key));
      const incoming = result.fields.map((field) => (mode === "generate" && existingKeys.has(field.key) ? { ...field, key: `${field.key}2`, id: `${field.id}2` } : field));
      patch({ fields: mode === "generate" ? [...form.fields, ...incoming] : incoming });
      toast.success(mode === "generate" ? `Added ${incoming.length} AI-generated fields` : "Fields optimized for reporting");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setBusy(null);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!form || !result.destination) return;
    const fields = [...form.fields];
    const [moved] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, moved);
    patch({ fields });
  };

  if (!form) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading form...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/admin/lift/forms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All forms
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{form.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={form.status === "published" ? "default" : "secondary"}>
              {form.status} · v{form.version}
            </Badge>
            <span>{form.slug}</span>
            {dirty && <span className="text-amber-600">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void save()} disabled={busy !== null || !dirty}>
            {busy === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save draft
          </Button>
          <Button onClick={() => void publish()} disabled={busy !== null}>
            {busy === "publish" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm" role="alert">
          <p className="font-medium text-destructive">Fix these issues before saving:</p>
          <ul className="list-disc pl-5">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <Tabs defaultValue="build">
        <TabsList>
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fields ({form.fields.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} role="list" className="space-y-1">
                        {form.fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                style={dragProvided.draggableProps.style as React.CSSProperties | undefined}
                                role="listitem"
                                className={cn("flex items-center gap-2 rounded-md border bg-background px-2 py-2 text-sm", selectedKey === field.key && "border-primary bg-primary/5")}
                              >
                                <span {...dragProvided.dragHandleProps} aria-label={`Reorder ${field.key}`} className="cursor-grab text-muted-foreground">
                                  <GripVertical className="h-4 w-4" />
                                </span>
                                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedKey(field.key)}>
                                  <span className="block truncate font-medium">{field.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {field.type} · {field.key}
                                    {field.required ? " · required" : ""}
                                    {field.staffOnly ? " · staff" : ""}
                                    {field.showIf ? " · conditional" : ""}
                                    {field.mappings?.length ? ` · maps to ${field.mappings.map((mapping) => mapping.target).join(", ")}` : ""}
                                  </span>
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Add a field</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {CONTROL_CATALOG.map((control) => (
                  <Button
                    key={control.type}
                    type="button"
                    variant="outline"
                    size="sm"
                    title={control.description}
                    onClick={() => {
                      const field = newField(control.type, selected?.section);
                      patch({ fields: [...form.fields, field] });
                      setSelectedKey(field.key);
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {control.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" /> AI assist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea aria-label="Describe fields to generate" rows={3} placeholder="e.g., Questions to assess a rural food business's readiness for wholesale buyers" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={busy !== null} onClick={() => void runAi("generate")}>
                    <Wand2 className="mr-1 h-4 w-4" /> Generate fields
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={busy !== null || form.fields.length === 0} onClick={() => void runAi("optimize_for_reporting")}>
                    <Sparkles className="mr-1 h-4 w-4" /> Optimize for reporting
                  </Button>
                  {busy === "ai" && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                </div>
                <p className="text-xs text-muted-foreground">AI suggestions are added to the draft. Review mappings and wording before publishing.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit lg:sticky lg:top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Field properties</CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <FieldProperties
                  field={selected}
                  fields={form.fields}
                  sections={form.sections}
                  onChange={(updated) => {
                    patch({ fields: form.fields.map((field) => (field.key === selected.key ? updated : field)) });
                    setSelectedKey(updated.key);
                  }}
                  onDelete={() => {
                    patch({ fields: form.fields.filter((field) => field.key !== selected.key) });
                    setSelectedKey(null);
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a field to edit it.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="set-title">Title</Label>
                <Input id="set-title" value={form.title} onChange={(event) => patch({ title: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-slug">URL slug</Label>
                <Input id="set-slug" value={form.slug} onChange={(event) => patch({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="set-description">Description</Label>
                <Textarea id="set-description" rows={2} value={form.description} onChange={(event) => patch({ description: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-category">Category</Label>
                <Input id="set-category" value={form.category} onChange={(event) => patch({ category: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-ref">Lifecycle reference</Label>
                <Input id="set-ref" value={form.lifecycleRef ?? ""} placeholder="e.g., B4" onChange={(event) => patch({ lifecycleRef: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-mode">Presentation</Label>
                <select id="set-mode" className={selectClass} value={form.presentationMode} onChange={(event) => patch({ presentationMode: event.target.value as LiftFormDoc["presentationMode"] })}>
                  <option value="standard">Standard (one section per page)</option>
                  <option value="conversational">Conversational (one question at a time)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-audience">Audience</Label>
                <select id="set-audience" className={selectClass} value={form.audience} onChange={(event) => patch({ audience: event.target.value as LiftFormDoc["audience"] })}>
                  <option value="public">Public (no sign-in)</option>
                  <option value="client">Signed-in clients</option>
                  <option value="staff">Staff and advisors only</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-submit">Submit button label</Label>
                <Input id="set-submit" value={form.submitLabel ?? ""} onChange={(event) => patch({ submitLabel: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-next">Next form slug</Label>
                <Input id="set-next" value={form.nextFormSlug ?? ""} onChange={(event) => patch({ nextFormSlug: event.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="set-complete">Completion message</Label>
                <Textarea id="set-complete" rows={2} value={form.completionMessage ?? ""} onChange={(event) => patch({ completionMessage: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-omb">OMB control number</Label>
                <Input id="set-omb" value={form.ombControlNumber ?? ""} onChange={(event) => patch({ ombControlNumber: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="set-omb-exp">OMB expiration date</Label>
                <Input id="set-omb-exp" type="date" value={form.ombExpiresOn ?? ""} onChange={(event) => patch({ ombExpiresOn: event.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="set-consent">Consent text (hashed with each signature)</Label>
                <Textarea id="set-consent" rows={5} value={form.consentText ?? ""} onChange={(event) => patch({ consentText: event.target.value })} />
              </div>
              <fieldset className="space-y-2 md:col-span-2">
                <legend className="text-sm font-medium">After submission</legend>
                {HOOKS.map((hook) => (
                  <label key={hook.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.postProcess?.includes(hook.value) ?? false}
                      onCheckedChange={(checked) =>
                        patch({ postProcess: checked ? [...(form.postProcess ?? []), hook.value] : (form.postProcess ?? []).filter((item) => item !== hook.value) })
                      }
                    />
                    {hook.label}
                  </label>
                ))}
              </fieldset>
              <fieldset className="space-y-2 md:col-span-2">
                <legend className="text-sm font-medium">Sections</legend>
                {form.sections.map((section, index) => (
                  <div key={section.id} className="grid grid-cols-[140px_1fr_auto_auto] items-center gap-2">
                    <Input aria-label="Section id" value={section.id} disabled />
                    <Input
                      aria-label="Section title"
                      value={section.title}
                      onChange={(event) => patch({ sections: form.sections.map((item, position) => (position === index ? { ...item, title: event.target.value } : item)) })}
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <Checkbox
                        checked={section.staffOnly ?? false}
                        onCheckedChange={(checked) => patch({ sections: form.sections.map((item, position) => (position === index ? { ...item, staffOnly: checked === true || undefined } : item)) })}
                      />
                      Staff only
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove section ${section.title}`}
                      disabled={form.fields.some((field) => field.section === section.id)}
                      onClick={() => patch({ sections: form.sections.filter((_, position) => position !== index) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => patch({ sections: [...form.sections, { id: `section${form.sections.length + 1}`, title: "New section" }] })}>
                  <Plus className="mr-1 h-4 w-4" /> Add section
                </Button>
              </fieldset>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {preview && <FormRunner slug={form.slug} context="portal" previewForm={preview} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
