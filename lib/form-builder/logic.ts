import type { FieldValue, FormField, FormValues, ShowIfRule } from "./types";

/** Returns true when a value counts as answered. */
export function isAnswered(value: FieldValue | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  if (typeof value === "object") {
    const signature = value as { typedName?: string; dataUrl?: string };
    return Boolean(signature.typedName?.trim() || signature.dataUrl);
  }
  return true;
}

/** Evaluates a show-if rule against current answers. */
export function evaluateShowIf(rule: ShowIfRule | undefined, values: FormValues): boolean {
  if (!rule) return true;
  const value = values[rule.fieldKey];
  switch (rule.operator) {
    case "equals":
      return String(value ?? "") === (rule.value ?? "");
    case "not_equals":
      return String(value ?? "") !== (rule.value ?? "");
    case "includes":
      return Array.isArray(value) && (value as unknown[]).some((item) => String(item) === rule.value);
    case "is_true":
      return value === true || value === "yes";
    case "is_false":
      return value === false || value === "no";
    case "answered":
      return isAnswered(value);
    default:
      return true;
  }
}

/** Returns the fields a respondent can see, given role and current answers. */
export function getVisibleFields(fields: FormField[], values: FormValues, isStaff: boolean, staffSectionIds: Set<string> = new Set()): FormField[] {
  return fields.filter((field) => {
    if (!isStaff && (field.staffOnly || (field.section && staffSectionIds.has(field.section)))) return false;
    return evaluateShowIf(field.showIf, values);
  });
}

type Token = { kind: "num"; value: number } | { kind: "op"; value: string };

/** Tokenizes an arithmetic expression after placeholders are replaced with numbers. */
function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = [];
  const pattern = /\s*(\d+(?:\.\d+)?|[+\-*/()])\s*/y;
  let index = 0;
  while (index < expression.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(expression);
    if (!match) return null;
    const part = match[1];
    tokens.push(/^\d/.test(part) ? { kind: "num", value: Number(part) } : { kind: "op", value: part });
    index = pattern.lastIndex;
  }
  return tokens;
}

/** Safely evaluates + - * / and parentheses without eval. Returns null on invalid input. */
export function evaluateArithmetic(expression: string): number | null {
  const tokens = tokenize(expression);
  if (!tokens || tokens.length === 0) return null;
  let position = 0;

  const parseFactor = (): number | null => {
    const token = tokens[position];
    if (!token) return null;
    if (token.kind === "op" && token.value === "-") {
      position += 1;
      const inner = parseFactor();
      return inner === null ? null : -inner;
    }
    if (token.kind === "op" && token.value === "(") {
      position += 1;
      const inner = parseExpression();
      if (tokens[position]?.kind !== "op" || tokens[position]?.value !== ")") return null;
      position += 1;
      return inner;
    }
    if (token.kind === "num") {
      position += 1;
      return token.value;
    }
    return null;
  };

  const parseTerm = (): number | null => {
    let left = parseFactor();
    while (left !== null && tokens[position]?.kind === "op" && ["*", "/"].includes(tokens[position].value as string)) {
      const operator = tokens[position].value;
      position += 1;
      const right = parseFactor();
      if (right === null) return null;
      if (operator === "/" && right === 0) return null;
      left = operator === "*" ? left * right : left / right;
    }
    return left;
  };

  const parseExpression = (): number | null => {
    let left = parseTerm();
    while (left !== null && tokens[position]?.kind === "op" && ["+", "-"].includes(tokens[position].value as string)) {
      const operator = tokens[position].value;
      position += 1;
      const right = parseTerm();
      if (right === null) return null;
      left = operator === "+" ? left + right : left - right;
    }
    return left;
  };

  const result = parseExpression();
  return position === tokens.length && result !== null && Number.isFinite(result) ? result : null;
}

/** Computes a calculated field formula like "{a} - {b}" from current answers. */
export function computeFormula(formula: string | undefined, values: FormValues): number | null {
  if (!formula) return null;
  let missing = false;
  const expression = formula.replace(/\{([a-zA-Z0-9_.]+)\}/g, (_match, key: string) => {
    const raw = values[key];
    const parsed = typeof raw === "number" ? raw : Number(raw);
    if (raw === null || raw === undefined || raw === "" || Number.isNaN(parsed)) {
      missing = true;
      return "0";
    }
    return String(parsed);
  });
  if (missing) return null;
  return evaluateArithmetic(expression);
}
