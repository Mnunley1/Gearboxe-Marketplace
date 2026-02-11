"use client";

import { OrganizationSwitcher, useAuth, useOrganization } from "@clerk/nextjs";
import { api } from "@gearboxe-market/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { AdminNavbar } from "../../components/ui/admin-navbar";
import { Footer } from "../../components/ui/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useConvexAuth();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const isSuperAdmin = useQuery(api.users.isSuperAdmin);

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

  // Non-superAdmin users must have an active org selected
  if (orgLoaded && !organization && isSuperAdmin === false) {
    return (
      <div className="admin-gradient flex min-h-screen flex-col">
        <AdminNavbar />
        <main className="flex-1 bg-white">
          <div className="mx-auto max-w-md px-4 py-24 text-center">
            <h2 className="mb-4 font-bold text-2xl text-gray-900">
              Select an Organization
            </h2>
            <p className="mb-6 text-gray-600">
              Please select your city organization to access the admin panel.
            </p>
            <div className="flex justify-center">
              <OrganizationSwitcher
                afterSelectOrganizationUrl="/admin"
                hidePersonal={true}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-gradient flex min-h-screen flex-col">
      <AdminNavbar />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </div>
  );
}
