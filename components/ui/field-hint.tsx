import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small hint shown under a form field explaining what it asks for and how it
 * feeds LIFT's AI-powered advisor matching and opportunity recommendations.
 */
export function FieldHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("flex items-start gap-1.5 text-xs text-muted-foreground", className)}>
      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
