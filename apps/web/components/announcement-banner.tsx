"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gearboxe-banner-dismissed";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  if (!visible) return null;

  return (
    <div className="animate-slide-down relative z-60 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-700 px-4 py-2 text-center text-sm text-white">
      <p>
        <span className="font-medium">Gearboxe</span> — Your all-in-one car
        maintenance platform.{" "}
        <a
          href="https://gearboxe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white/90"
        >
          Learn more
        </a>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 rounded p-0.5 hover:bg-white/20"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
