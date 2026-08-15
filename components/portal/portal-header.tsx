"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/contexts/user-profile-context";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart } from "@/components/marketplace/shopping-cart";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Search,
  Bell,
  Plus,
  Settings,
  LogOut,
  User,
  Sparkles,
  Target,
  FolderKanban,
  Calendar,
  FileText,
  ShoppingBag,
} from "lucide-react";

const quickActions = [
  { title: "New Opportunity", href: "/portal/opportunities/new", icon: Target },
  { title: "New Project", href: "/portal/projects/new", icon: FolderKanban },
  { title: "Schedule Meeting", href: "/portal/meetings/new", icon: Calendar },
  { title: "Upload Document", href: "/portal/documents/new", icon: FileText },
];

interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  link?: string;
  time: string;
  unread: boolean;
}

function getRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function PortalHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const { getDisplayName, getInitials, profile } = useUserProfile();
  const { getTotalItems } = useCart();
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Subscribe to this member's persistent in-app notifications
  useEffect(() => {
    if (!auth || !db) return;

    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = undefined;
      }
      if (!user || !db) {
        setNotifications([]);
        return;
      }

      const notifQuery = query(
        collection(db, COLLECTIONS.USER_NOTIFICATIONS),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      unsubscribeNotifications = onSnapshot(notifQuery, (snapshot) => {
        const items: HeaderNotification[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAt: Timestamp | undefined = data.createdAt;
          return {
            id: docSnap.id,
            title: data.title || "Notification",
            message: data.message || "",
            link: data.link || undefined,
            time: createdAt ? getRelativeTime(createdAt.toDate()) : "",
            unread: !data.read,
          };
        });
        setNotifications(items);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  const markNotificationRead = async (notificationId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.USER_NOTIFICATIONS, notificationId), {
        read: true,
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-2" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities, projects, affiliates..."
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Ask AI Button */}
        <Button variant="outline" size="sm" className="hidden md:flex" asChild>
          <Link href="/portal/ask">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Ask AI
          </Link>
        </Button>

        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={action.href}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Link href="/portal/notifications" className="text-xs text-primary font-normal">
                View all
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3" asChild>
                  <Link
                    href={notification.link || "/portal/notifications"}
                    onClick={() => notification.unread && markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                      <div className={notification.unread ? "" : "ml-4"}>
                        <p className="text-sm font-medium">{notification.title}</p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Shopping Cart */}
        <Button
          size="icon"
          variant="outline"
          className="relative"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>

        <ShoppingCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary">{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{getDisplayName()}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {profile.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/portal/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/portal/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={async () => {
                try {
                  const { signOut } = await import("firebase/auth");
                  const { auth } = await import("@/lib/firebase");
                  if (auth) {
                    await signOut(auth);
                    window.location.href = "/";
                  }
                } catch (error) {
                  console.error("Error signing out:", error);
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
