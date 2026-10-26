import type { FieldValue, FormField, FormValues, LiftTarget, MappingTransform } from "./types";

/**
 * How each target is written:
 * - "client_doc": one record per client (doc id = liftClientId), merged on every submission.
 * - "submission_doc": one new record per submission (doc id = submissionId).
 */
export const TARGET_WRITE_MODE: Record<LiftTarget, "client_doc" | "submission_doc"> = {
  liftClients: "client_doc",
  liftCapabilityLibraries: "client_doc",
  liftBaselines: "submission_doc",
  liftServicePlans: "submission_doc",
  liftSessions: "submission_doc",
  liftTrainingAttendance: "submission_doc",
  liftFeedback: "submission_doc",
  liftCapitalPackages: "submission_doc",
  liftProposalResponses: "submission_doc",
  liftOutcomeClaims: "submission_doc",
  liftImpactConsents: "submission_doc",
  liftExits: "submission_doc",
};

const SAFE_PATH = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){0,4}$/;

/** Returns true when a mapping path is safe to write (letters, digits, underscores, dots). */
export function isSafePath(path: string): boolean {
  return SAFE_PATH.test(path) && !path.split(".").some((part) => ["__proto__", "prototype", "constructor"].includes(part));
}

/** Applies a mapping transform to an answer. */
export function applyTransform(value: FieldValue, transform: MappingTransform = "none"): unknown {
  switch (transform) {
    case "currency_to_cents": {
      const amount = typeof value === "number" ? value : Number(value);
      return Number.isFinite(amount) ? Math.round(amount * 100) : null;
    }
    case "number": {
      const amount = typeof value === "number" ? value : Number(value);
      return Number.isFinite(amount) ? amount : null;
    }
    case "split_csv":
      return typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value;
    case "boolean":
      return value === true || value === "yes";
    default:
      return value;
  }
}

/** Sets a dotted path on an object, creating nested objects as needed. */
export function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = target;
  for (const part of parts.slice(0, -1)) {
    if (typeof cursor[part] !== "object" || cursor[part] === null || Array.isArray(cursor[part])) cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

/** Builds the partial records to write for each target from mapped fields. */
export function buildTargetWrites(fields: FormField[], values: FormValues): Partial<Record<LiftTarget, Record<string, unknown>>> {
  const writes: Partial<Record<LiftTarget, Record<string, unknown>>> = {};
  for (const field of fields) {
    if (!field.mappings?.length || !(field.key in values)) continue;
    for (const mapping of field.mappings) {
      if (!isSafePath(mapping.path) || !(mapping.target in TARGET_WRITE_MODE)) continue;
      const record = (writes[mapping.target] ??= {});
      setPath(record, mapping.path, applyTransform(values[field.key], mapping.transform));
    }
  }
  return writes;
}
