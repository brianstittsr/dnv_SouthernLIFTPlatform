"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Store,
  MessageSquare,
  BarChart3,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const marketplaceNav = [
  {
    label: "Browse",
    href: "/portal/marketplace",
    icon: Search,
  },
  {
    label: "My Listings",
    href: "/portal/marketplace/my-listings",
    icon: Store,
  },
  {
    label: "Inquiries",
    href: "/portal/marketplace/inquiries",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/portal/marketplace/analytics",
    icon: BarChart3,
  },
];

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Marketplace Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">KDM Marketplace</h1>
              <p className="text-sm text-muted-foreground">
                Showcase your products and services to KDM OEMs, suppliers, and consortium members
              </p>
            </div>
            <Button asChild>
              <Link href="/portal/marketplace/create-listing/wizard">
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Link>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex gap-2 overflow-x-auto">
            {marketplaceNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
