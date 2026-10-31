"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { getProgramBranding } from "@/lib/branding";

const liftLinks = [
  { title: "About the Center", href: "/about" },
  { title: "Events & Training", href: "/events" },
  { title: "LIFT Blog", href: "/blog" },
  { title: "Resources", href: "/resources" },
  { title: "Partners", href: "/partners" },
  { title: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const branding = getProgramBranding();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 py-2 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label={branding.siteName}>
          {/* Text wordmark until an approved LIFT/MBDA logo asset is supplied. */}
          <span className="text-2xl font-extrabold tracking-[0.2em] text-foreground">
            LIFT
          </span>
          <span className="hidden md:block text-xs font-semibold leading-tight max-w-[200px] text-muted-foreground">
            Southern University MBDA Rural Business Center
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {liftLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Apply Now</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {liftLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <div className="border-t pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Apply Now
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
