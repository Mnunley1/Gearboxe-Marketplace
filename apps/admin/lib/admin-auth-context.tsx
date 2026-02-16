"use client";

import { createContext, useContext } from "react";

export type AdminAuthContextValue = {
  user: { _id: string; name: string; role: string };
  orgId: string | null;
  orgRole: string | null;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({
  value,
  children,
}: {
  value: AdminAuthContextValue;
  children: React.ReactNode;
}) {
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error(
      "useAdminAuth must be used within AdminAuthProvider (provided by AdminLayout)"
    );
  }
  return ctx;
}
