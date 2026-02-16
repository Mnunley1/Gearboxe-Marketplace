"use client";

import { useAuth, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { api } from "@gearboxe-market/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { Car } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AdminSidebar } from "../../components/ui/admin-sidebar";
import { OrgSwitcher } from "../../components/ui/org-switcher";
import { AdminAuthProvider } from "../../lib/admin-auth-context";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));
  const { isLoading: convexLoading } = useConvexAuth();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { organization: activeOrg } = useOrganization();

  const orgContext = useQuery(
    api.users.getOrgContext,
    isSignedIn ? {} : "skip"
  );

  const {
    isLoaded: orgListLoaded,
    userMemberships,
    setActive: setActiveOrg,
  } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const autoSelectAttempted = useRef(false);

  useEffect(() => {
    if (authLoaded && !isSignedIn && !isAuthRoute) {
      router.replace("/sign-in");
    }
  }, [authLoaded, isSignedIn, isAuthRoute, router]);

  // Auto-select org when user has exactly one membership and none is active
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally depends on data length only
  useEffect(() => {
    if (
      !autoSelectAttempted.current &&
      orgListLoaded &&
      !activeOrg &&
      userMemberships?.data?.length === 1 &&
      setActiveOrg
    ) {
      autoSelectAttempted.current = true;
      setActiveOrg({ organization: userMemberships.data[0].organization.id });
    }
  }, [orgListLoaded, activeOrg, userMemberships?.data?.length, setActiveOrg]);

  // 1. Auth routes render without admin chrome
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // 2. Clerk not loaded or Convex loading → spinner
  if (!authLoaded || convexLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 3. Not signed in → redirect (via useEffect)
  if (!isSignedIn) {
    return null;
  }

  // 4. getOrgContext still loading → spinner
  if (orgContext === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 5. No Convex user record → access denied
  if (orgContext === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Car className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 font-bold text-2xl text-gray-900">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Your account is not recognized. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  // 6. Has active org → full access
  if (orgContext.orgRole) {
    return (
      <AdminAuthProvider
        value={{
          user: orgContext.user,
          orgId: orgContext.orgId,
          orgRole: orgContext.orgRole,
        }}
      >
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </AdminAuthProvider>
    );
  }

  // 7. No org selected → show org selector interstitial
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Simple branded header */}
      <div className="admin-sidebar border-white/5 border-b text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold font-heading text-white text-xl uppercase tracking-tight">
                  Gearboxe
                </span>
                <span className="-mt-1 font-heading font-medium text-[10px] text-gray-400 uppercase tracking-widest">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h2 className="mb-2 font-bold font-heading text-2xl text-gray-900">
            Select an Organization
          </h2>
          <p className="mb-6 text-gray-500">
            Choose your city organization to access the admin panel.
          </p>
          <div className="flex justify-center">
            <OrgSwitcher variant="page" />
          </div>
        </div>
      </main>
    </div>
  );
}
