"use client";

import { Button } from "@gearboxe-market/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { Car, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserDropdown } from "./user-dropdown";

export function Navbar() {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/vehicles", label: "Browse Vehicles" },
    { href: "/events", label: "Events" },
  ];

  // Show loading state while auth is being determined
  if (!authLoaded) {
    return (
      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white"
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-18">
            {/* Logo */}
            <Link className="group flex items-center gap-2.5" href="/">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg tracking-tight">
                  Gearboxe
                </span>
                <span className="-mt-1 font-medium text-[10px] text-gray-500 uppercase tracking-widest">
                  Market
                </span>
              </div>
            </Link>

            {/* Loading state */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      isScrolled
        ? "border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md"
        : "border-transparent bg-white"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-18">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-10">
            <Link className="group flex items-center gap-2.5" href="/">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg tracking-tight">
                  Gearboxe
                </span>
                <span className="-mt-1 font-medium text-[10px] text-gray-500 uppercase tracking-widest">
                  Market
                </span>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    className={`relative rounded-lg px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    href={link.href}
                  >
                    {link.label}
                    {isActive && (
                      <span className="-translate-x-1/2 absolute bottom-0 left-1/2 h-0.5 w-6 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated || isSignedIn ? (
              <>
                <Button
                  asChild
                  size="sm"
                  className="hidden shadow-md shadow-primary/20 sm:inline-flex"
                >
                  <Link href="/myAccount/new-listing">
                    List Your Car
                  </Link>
                </Button>
                <UserDropdown afterSignOutUrl="/" />
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button asChild size="sm" variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="shadow-md shadow-primary/20">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              className="relative md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              size="icon"
              variant="ghost"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className={`absolute transition-all duration-200 ${isMobileMenuOpen ? "rotate-45 opacity-0" : "rotate-0 opacity-100"}`}>
                <Menu className="h-5 w-5" />
              </span>
              <span className={`absolute transition-all duration-200 ${isMobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-45 opacity-0"}`}>
                <X className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 border-gray-100 border-t pt-3 pb-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  className={`block rounded-lg px-4 py-3 font-medium text-sm transition-colors ${
                    isActive
                      ? "bg-primary/5 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile auth buttons */}
            {!(isAuthenticated || isSignedIn) && (
              <div className="mt-4 flex flex-col gap-2 border-gray-100 border-t px-4 pt-4">
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="w-full justify-center">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            )}

            {(isAuthenticated || isSignedIn) && (
              <div className="mt-4 border-gray-100 border-t px-4 pt-4">
                <Button asChild className="w-full justify-center">
                  <Link href="/myAccount/new-listing">List Your Car</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
