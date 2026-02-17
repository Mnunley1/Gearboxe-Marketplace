"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@gearboxe-market/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  CreditCard,
  Database,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "../../lib/admin-auth-context";
import { OrgSwitcher } from "./org-switcher";

export function AdminSidebar() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { orgId } = useAdminAuth();
  const pathname = usePathname();
  const inboxUnread = useQuery(
    orgId ? api.orgInbox.getAdminUnreadCount : "skip"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevPathname = useRef(pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setMobileOpen(false);
    }
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: Settings,
      active: pathname === "/",
    },
    {
      href: "/listings",
      label: "Listings",
      icon: Car,
      active: pathname.startsWith("/listings"),
    },
    {
      href: "/events",
      label: "Events",
      icon: Calendar,
      active: pathname.startsWith("/events"),
    },
    {
      href: "/checkin",
      label: "Check-in",
      icon: CheckCircle,
      active: pathname.startsWith("/checkin"),
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      active: pathname.startsWith("/messages"),
      badge: inboxUnread && inboxUnread > 0 ? inboxUnread : undefined,
    },
    {
      href: "/seed",
      label: "Database",
      icon: Database,
      active: pathname.startsWith("/seed"),
    },
    {
      href: "/settings/stripe",
      label: "Stripe",
      icon: CreditCard,
      active: pathname.startsWith("/settings"),
    },
  ];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const userInitials = user?.fullName ? getInitials(user.fullName) : "U";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
          <Car className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold font-heading text-lg text-white uppercase tracking-tight">
            Gearboxe
          </span>
          <span className="-mt-1 font-heading font-medium text-[10px] text-gray-400 uppercase tracking-widest">
            Admin
          </span>
        </div>
      </div>

      {/* Org Switcher */}
      <div className="px-4 pb-4">
        <OrgSwitcher variant="sidebar" />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200 ${
              item.active
                ? "bg-primary/15 text-white shadow-sm"
                : "text-gray-400 hover:bg-white/8 hover:text-gray-200"
            }`}
            href={item.href}
            key={item.href}
          >
            <item.icon
              className={`h-4 w-4 shrink-0 transition-colors duration-200 ${item.active ? "text-primary-300" : "group-hover:text-gray-300"}`}
            />
            <span>{item.label}</span>
            {(() => {
              if ("badge" in item && item.badge) {
                return (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-[10px] text-white">
                    {item.badge}
                  </span>
                );
              }
              if (item.active) {
                return (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-300" />
                );
              }
              return null;
            })()}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-white/10 border-t px-3 py-3">
        {/* Back to Site */}
        <Link
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-400 text-sm transition-all duration-200 hover:bg-white/8 hover:text-gray-200"
          href="/myAccount"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to Site</span>
        </Link>

        {/* User Info / Sign Out */}
        {isSignedIn ? (
          <div className="mt-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-primary/20 shadow-sm">
                <span className="font-medium text-white text-xs">
                  {userInitials}
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-sm text-white">
                  {user?.fullName || "User"}
                </div>
                <div className="truncate text-gray-400 text-xs">
                  {user?.emailAddresses?.[0]?.emailAddress || ""}
                </div>
              </div>
            </div>
            <button
              className="shrink-0 rounded-md p-1.5 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
              onClick={() => signOut()}
              title="Sign out"
              type="button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2 px-3">
            <Link
              className="rounded-md bg-white/10 px-3 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-white/20"
              href="/sign-in"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden w-64 shrink-0 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <div className="admin-sidebar fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-white/5 border-b px-4 shadow-lg md:hidden">
        <button
          className="rounded-lg p-1.5 text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
            <Car className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold font-heading text-sm text-white uppercase tracking-tight">
              Gearboxe
            </span>
            <span className="-mt-0.5 font-heading font-medium text-[8px] text-gray-400 uppercase tracking-widest">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          {/* Drawer */}
          <aside className="admin-sidebar relative h-full w-64 shadow-xl">
            <button
              className="absolute top-4 right-3 rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
