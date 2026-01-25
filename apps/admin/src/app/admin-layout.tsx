"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { AdminNavbar } from "../../components/ui/admin-navbar";
import { Footer } from "../../components/ui/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
  }, [authLoaded, isSignedIn]);

  // Show loading while auth is being determined
  if (!authLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Only redirect if Clerk auth is not loaded or user is not signed in
  if (!isSignedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="admin-gradient flex min-h-screen flex-col">
      <AdminNavbar />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </div>
  );
}
