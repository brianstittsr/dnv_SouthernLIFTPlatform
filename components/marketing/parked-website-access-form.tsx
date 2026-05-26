"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ParkedWebsiteAccessForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/website-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Incorrect password.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-left">
        <label htmlFor="parked-site-password" className="text-sm font-medium text-slate-200">
          Owner Access Password
        </label>
        <Input
          id="parked-site-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          className="h-12 border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500"
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting || password.length === 0}
        className="h-12 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
      >
        {isSubmitting ? "Unlocking..." : "Enter Website"}
      </Button>
    </form>
  );
}
