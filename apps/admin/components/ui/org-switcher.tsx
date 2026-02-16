"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type OrgSwitcherProps = {
  variant: "sidebar" | "page";
};

export function OrgSwitcher({ variant }: OrgSwitcherProps) {
  const { organization: activeOrg } = useOrganization();
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!isLoaded) return null;

  const isDark = variant === "sidebar";

  const triggerLabel = activeOrg?.name ?? "Select organization";

  const orgs = userMemberships?.data ?? [];

  function handleSelect(orgId: string) {
    setActive?.({ organization: orgId });
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors ${
          isDark
            ? "bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white"
            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-2">
          <OrgAvatar isDark={isDark} name={triggerLabel} />
          <span className="truncate">{triggerLabel}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && orgs.length > 0 && (
        <div
          className={`absolute left-0 z-50 mt-1 w-full rounded-md border py-1 shadow-lg ${
            isDark ? "border-white/10 bg-gray-800" : "border-gray-200 bg-white"
          }`}
        >
          {orgs.map((membership) => {
            const org = membership.organization;
            const isActive = activeOrg?.id === org.id;
            return (
              <button
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isDark
                    ? "text-gray-300 hover:bg-white/10 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                key={org.id}
                onClick={() => handleSelect(org.id)}
                type="button"
              >
                <OrgAvatar isDark={isDark} name={org.name} />
                <span className="min-w-0 truncate">{org.name}</span>
                {isActive && (
                  <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrgAvatar({ name, isDark }: { name: string; isDark: boolean }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-semibold text-xs ${
        isDark ? "bg-primary text-white" : "bg-primary/10 text-primary"
      }`}
    >
      {initial}
    </div>
  );
}
