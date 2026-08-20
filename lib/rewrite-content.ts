export interface RewriteParams {
  content: string;
  purpose: string;
  audience: string[];
  tone: string;
  uxPrinciples: string[];
  contentType: string;
}

/**
 * Rewrites content based on purpose, tone, audience, and UX principles.
 *
 * This is currently a mock implementation that simulates AI rewriting. It can
 * be replaced with a real OpenAI call later by updating this single file.
 */
export async function rewriteContent(params: RewriteParams): Promise<string> {
  const { content, purpose, audience, tone, uxPrinciples, contentType } = params;

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock intelligent rewriting based on parameters
  let rewritten = content;

  // Apply tone adjustments
  if (tone === "professional") {
    rewritten = rewritten.replace(/!/g, ".");
    rewritten = rewritten.replace(/awesome/gi, "excellent");
    rewritten = rewritten.replace(/cool/gi, "innovative");
  } else if (tone === "friendly") {
    rewritten = rewritten.replace(/\./g, "!");
    rewritten = rewritten.replace(/excellent/gi, "awesome");
  } else if (tone === "bold") {
    rewritten = rewritten.toUpperCase().substring(0, 50) + rewritten.substring(50);
  }

  // Apply UX principles
  if (uxPrinciples.includes("clarity")) {
    // Simplify complex sentences
    rewritten = rewritten.replace(/in order to/gi, "to");
    rewritten = rewritten.replace(/due to the fact that/gi, "because");
  }

  if (uxPrinciples.includes("brevity")) {
    // Shorten content
    const sentences = rewritten.split(". ");
    if (sentences.length > 3) {
      rewritten = sentences.slice(0, 3).join(". ") + ".";
    }
  }

  if (uxPrinciples.includes("action-oriented")) {
    // Add action verbs
    if (contentType === "cta") {
      const actionVerbs = ["Start", "Get", "Discover", "Unlock", "Transform", "Achieve"];
      const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
      rewritten = `${randomVerb} ${rewritten}`;
    }
  }

  // Apply purpose-specific optimization
  if (purpose === "lead-gen") {
    rewritten += " Sign up today to get started.";
  } else if (purpose === "sales") {
    rewritten += " Limited time offer - act now!";
  } else if (purpose === "educate") {
    rewritten += " Learn more about how we can help.";
  }

  // Apply audience-specific language
  if (audience.includes("sme-owners")) {
    rewritten = rewritten.replace(/business/gi, "small business");
  }

  return rewritten.trim();
}
