/**
 * Cross-walk between existing onboarding data and LIFT form fields
 * (LIFT_Onboarding_Questions.txt, Appendix 2). Answers given once are reused
 * to prefill later forms.
 */
import { isAnswered } from "./logic";
import type { CrosswalkKey, FieldValue, FormField, FormValues } from "./types";

type Source = Record<string, unknown>;
type Prefill = Partial<Record<CrosswalkKey, FieldValue>>;

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const list = (value: unknown): string[] | undefined =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "") : undefined;

const yesNo = (value: unknown): "yes" | "no" | undefined =>
  typeof value === "boolean" ? (value ? "yes" : "no") : undefined;

const joinName = (...parts: unknown[]): string | undefined =>
  text(parts.map((part) => (typeof part === "string" ? part.trim() : "")).filter(Boolean).join(" "));

/** Removes undefined and empty values. */
function compact(prefill: Record<string, FieldValue | undefined>): Prefill {
  return Object.fromEntries(Object.entries(prefill).filter(([, value]) => value !== undefined && isAnswered(value))) as Prefill;
}

/** Maps a clientRegistrations document (flows A1 and A2) to cross-walk keys. */
export function fromClientRegistration(doc: Source): Prefill {
  const cage = list(doc.cageCodes);
  const cert = text(doc.minorityBusinessCertification);
  return compact({
    "owner.name": joinName(doc.firstName, doc.middleName, doc.lastName),
    "owner.title": text(doc.title),
    "owner.ethnicity": text(doc.companyOwnerEthnicity),
    "business.name": text(doc.companyName),
    "business.address": joinName(doc.streetAddress, doc.streetAddress2),
    "business.city": text(doc.city),
    "business.state": text(doc.state),
    "business.zip": text(doc.zipCode),
    "business.website": text(doc.websiteUrl),
    "business.naics": list(doc.naicsCodes)?.join(", "),
    "business.revenueBand": text(doc.approximateAnnualRevenue),
    "contact.email": text(doc.companyEmail),
    "contact.phone": text(doc.companyPhone),
    "contact.mobile": text(doc.mobilePhone),
    "ids.uei": text(doc.samRegistration),
    "ids.cage": cage?.[0],
    "certifications.current": cert && cert !== "None" ? [cert] : undefined,
    "needs.top": text(doc.topCompanyNeed),
    "needs.helpWanted": text(doc.helpNeededFromKDM),
    "business.acquisitionMethod": text(doc.currentBusinessAcquisitionMethod),
    "teaming.open": yesNo(doc.openToTeamingArrangement),
    "resources.toInvest": yesNo(doc.hasResourcesToInvest),
    "operations.outOfState": yesNo(doc.ableToWorkOutOfState),
    "operations.inHouseBD": yesNo(doc.hasInHouseBDTeam),
    "agencies.target": list(doc.targetAgencies)?.join(", "),
    "referral.source": text(doc.howFoundKDMAssociates),
    "referral.by": text(doc.referredBy),
    "social.linkedin": text(doc.linkedInUrl),
  });
}

/** Maps a users document (portal onboarding flows A3 and A5) to cross-walk keys. */
export function fromUserProfile(doc: Source): Prefill {
  return compact({
    "owner.name": joinName(doc.firstName, doc.lastName),
    "business.name": text(doc.company),
    "business.address": text(doc.address),
    "business.city": text(doc.city),
    "business.state": text(doc.state),
    "business.zip": text(doc.zip),
    "business.website": text(doc.website),
    "business.naics": list(doc.primaryNaics)?.map((code) => code.split(" - ")[0]).join(", "),
    "contact.email": text(doc.email),
    "contact.phone": text(doc.phone),
    "ids.uei": text(doc.dunsUei),
    "ids.cage": text(doc.cageCode),
    "certifications.current": list(doc.certifications),
    "capabilities.summary": text(doc.coreCapabilities),
  });
}

/** Coerces a prefill value to the shape a field expects; returns undefined when incompatible. */
export function coercePrefillValue(field: FormField, value: FieldValue): FieldValue | undefined {
  const options = field.options ?? [];
  switch (field.type) {
    case "multi_select": {
      const items = Array.isArray(value) ? (value as unknown[]).map(String) : typeof value === "string" ? value.split(",").map((item) => item.trim()) : [];
      const filtered = options.length ? items.filter((item) => options.includes(item)) : items;
      return filtered.length ? filtered : undefined;
    }
    case "dropdown":
    case "radio": {
      const single = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
      return !options.length || options.includes(single) ? single || undefined : undefined;
    }
    case "yes_no":
      return value === "yes" || value === "no" ? value : undefined;
    case "number":
    case "currency": {
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    case "platform_lookup":
    case "short_text":
    case "long_text":
    case "email":
    case "phone":
    case "url":
      return Array.isArray(value) ? (value as unknown[]).map(String).join(", ") : typeof value === "string" || typeof value === "number" ? String(value) : undefined;
    default:
      return undefined;
  }
}

/**
 * Builds default answers for a form from cross-walk values. Sources are given in
 * priority order (first wins), e.g. [liftProfile, clientRegistration, userProfile].
 */
export function buildPrefill(fields: FormField[], sources: Prefill[]): FormValues {
  const merged: Prefill = {};
  for (const source of [...sources].reverse()) Object.assign(merged, source);
  const defaults: FormValues = {};
  for (const field of fields) {
    if (!field.prefillKey) continue;
    const value = merged[field.prefillKey];
    if (value === undefined) continue;
    const coerced = coercePrefillValue(field, value);
    if (coerced !== undefined) defaults[field.key] = coerced;
  }
  return defaults;
}

/** Extracts cross-walk values from a validated submission for the client profile index. */
export function extractCrosswalkValues(fields: FormField[], values: FormValues): Prefill {
  const result: Prefill = {};
  for (const field of fields) {
    if (!field.prefillKey) continue;
    const value = values[field.key];
    if (!isAnswered(value)) continue;
    const isScalar = typeof value === "string" || typeof value === "number";
    const isStringList = Array.isArray(value) && value.every((item) => typeof item === "string");
    if (isScalar || isStringList) result[field.prefillKey] = value;
  }
  return result;
}
