"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  Database,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserDropdown } from "./user-dropdown";

export function AdminNavbar() {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn, isLoaded: authLoaded, user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = useQuery(api.users.isAdmin);
  const isSuperAdmin = useQuery(api.users.isSuperAdmin);

  // Show loading state while auth is being determined
  if (!authLoaded) {
    return (
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Admin Panel</span>
            </div>

            {/* Loading state */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-16 animate-pulse rounded bg-gray-700" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-700" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!(isSignedIn && user) || isAdmin === false) {
    return null;
  }

  const adminNavItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Settings,
      active: pathname === "/admin",
    },
    {
      href: "/admin/listings",
      label: "Listings",
      icon: Car,
      active: pathname.startsWith("/admin/listings"),
    },
    {
      href: "/admin/events",
      label: "Events",
      icon: Calendar,
      active: pathname.startsWith("/admin/events"),
    },
    {
      href: "/admin/checkin",
      label: "Check-in",
      icon: CheckCircle,
      active: pathname.startsWith("/admin/checkin"),
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
      show: isSuperAdmin === true, // Only show for superAdmin
    },
    {
      href: "/admin/seed",
      label: "Database",
      icon: Database,
      active: pathname.startsWith("/admin/seed"),
    },
  ].filter((item) => item.show !== false); // Filter out items that shouldn't be shown

  return (
    <nav className="admin-navbar relative text-white shadow-lg">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Admin Panel</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden items-center space-x-6 md:flex">
              {adminNavItems.map((item) => (
                <Link
                  className={`flex items-center space-x-2 font-medium text-sm transition-colors hover:text-primary ${
                    item.active ? "text-primary" : "text-gray-300"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Back to main site */}
            <Button
              asChild
              className="text-gray-300 hover:text-white"
              size="sm"
              variant="ghost"
            >
              <Link href="/myAccount/my-listings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>

            {isAuthenticated || isSignedIn ? (
              <UserDropdown afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  asChild
                  className="border-gray-600 text-white hover:bg-gray-800 active:bg-gray-900"
                  size="sm"
                  variant="outline"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              className="text-gray-300 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              size="sm"
              variant="ghost"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-gray-700 border-t bg-gray-800 md:hidden">
            <div className="space-y-1 px-4 py-2">
              {adminNavItems.map((item) => (
                <Link
                  className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm transition-colors hover:text-primary ${
                    item.active ? "text-primary" : "text-gray-300"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="mt-2 border-gray-700 border-t pt-2">
                <Link
                  className="flex items-center space-x-2 px-3 py-2 font-medium text-gray-300 text-sm hover:text-primary"
                  href="/myAccount/my-listings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Site</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
