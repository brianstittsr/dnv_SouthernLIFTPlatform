"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SignatureValue } from "@/lib/form-builder/types";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  id: string;
  value: SignatureValue | null;
  onChange: (value: SignatureValue | null) => void;
  invalid?: boolean;
  describedBy?: string;
}

/** Drawn (canvas) or typed signature. Drawn signatures are exported as PNG data URLs. */
export function SignaturePad({ id, value, onChange, invalid, describedBy }: SignaturePadProps) {
  const [mode, setMode] = useState<"drawn" | "typed">(value?.mode ?? "typed");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  const context = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111827";
    }
    return ctx;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== "drawn") return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    context()?.scale(ratio, ratio);
    hasInk.current = false;
  }, [mode, context]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const { x, y } = point(event);
    const ctx = context();
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const { x, y } = point(event);
    const ctx = context();
    ctx?.lineTo(x, y);
    ctx?.stroke();
    hasInk.current = true;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasInk.current && canvasRef.current) onChange({ mode: "drawn", dataUrl: canvasRef.current.toDataURL("image/png") });
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) context()?.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    onChange(null);
  };

  const switchMode = (next: "drawn" | "typed") => {
    setMode(next);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2" role="group" aria-label="Signature method">
        <Button type="button" size="sm" variant={mode === "typed" ? "default" : "outline"} onClick={() => switchMode("typed")}>
          Type signature
        </Button>
        <Button type="button" size="sm" variant={mode === "drawn" ? "default" : "outline"} onClick={() => switchMode("drawn")}>
          Draw signature
        </Button>
      </div>
      {mode === "typed" ? (
        <div className="space-y-1">
          <Input
            id={id}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder="Type your full legal name"
            value={value?.typedName ?? ""}
            onChange={(event) => onChange(event.target.value.trim() ? { mode: "typed", typedName: event.target.value } : null)}
          />
          {value?.typedName && <p className="font-serif text-2xl italic text-foreground/90">{value.typedName}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            id={id}
            role="img"
            aria-label="Signature drawing area. Use a mouse, finger, or stylus to sign."
            aria-describedby={describedBy}
            className={cn("h-36 w-full touch-none rounded-md border bg-white", invalid && "border-destructive")}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
          />
          <Button type="button" size="sm" variant="ghost" onClick={clear}>
            Clear signature
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">By signing, you agree that your electronic signature is the legal equivalent of your handwritten signature.</p>
    </div>
  );
}
