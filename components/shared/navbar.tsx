"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart/cart-icon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Globe,
  Users,
  FileText,
  Briefcase,
  BarChart3,
  Cpu,
  Megaphone,
  Calendar,
  Building2,
  Newspaper,
  Package,
  Video,
  BookOpen,
  Play,
  Columns,
  Shield,
  Factory,
  Radio,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Digital Solutions",
    href: "/services",
    description: "Websites, Digital Ecosystems, E-commerce",
    icon: Globe,
    items: [
      { title: "Websites", href: "/services#digital" },
      { title: "Digital Ecosystems", href: "/services#digital" },
      { title: "E-commerce", href: "/services#digital" },
    ],
  },
  {
    title: "Technology Solutions",
    href: "/services",
    description: "Blockchain, CRM & AI Integration, Cybersecurity",
    icon: Cpu,
    items: [
      { title: "Blockchain", href: "/services#technology" },
      { title: "CRM & AI Integration", href: "/services#technology" },
      { title: "Cybersecurity", href: "/services#technology" },
    ],
  },
  {
    title: "Grants & RFPs",
    href: "/services",
    description: "Proposal Management, Grant Writing",
    icon: FileText,
    items: [
      { title: "Quick Bid/No Bid", href: "/services#grants" },
      { title: "Proposal Management", href: "/services#grants" },
      { title: "Grant Writing", href: "/services#grants" },
    ],
  },
];

const resources = [
  { title: "Blog", href: "/blog", icon: BookOpen },
  { title: "Press Releases", href: "/press-releases", icon: Radio },
  { title: "IAEOZ Summit Videos", href: "/iaeoz-summit", icon: Play },
  { title: "CMMC", href: "/cmmc", icon: Shield },
  { title: "Industries", href: "/industries", icon: Factory },
  { title: "Client Registration", href: "/resources", icon: UserPlus },
];

const companyLinks = [
  { title: "Home", href: "/", icon: Globe },
  { title: "About Us", href: "/about", icon: Globe },
  { title: "KDM Team", href: "/team", icon: Users },
  { title: "5 Pillars", href: "/5-pillars", icon: Columns },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 py-2 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/kdm22logo.png"
            alt="KDM & Associates"
            width={180}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}>
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}>
                <Link href="/services">Services</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}>
                <Link href="/pricing">Pricing</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[250px] gap-3 p-4">
                  {companyLinks.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3">
                  {resources.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}>
                <Link href="/contact">Contact</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <CartIcon />
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Join KDM</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Schedule Session</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <div className="border-t pt-4 space-y-4">
                <Link
                  href="/services"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/pricing"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/about"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/team"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  KDM Team
                </Link>
                <Link
                  href="/5-pillars"
                  className="flex items-center gap-2 py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <Columns className="h-4 w-4 text-primary" />
                  5 Pillars
                </Link>
                {resources.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-2 py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact
                </Link>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Join KDM
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    Schedule Session
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
