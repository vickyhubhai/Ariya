"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconAlert, IconClose, IconRefresh } from "@/components/icons";

/**
 * Offline / connectivity notice.
 * Renders nothing while online, so it never shifts layout in the normal case.
 */
export function OfflineBanner() {
  const router = useRouter();
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function update() {
      setOffline(!navigator.onLine);
      setDismissed(false);
    }
    const timer = window.setTimeout(update, 0);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-2 top-[calc(var(--nav-height)+0.5rem)] z-[58] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-amber-300/25 bg-[#1b1626]/95 px-3 py-2.5 text-xs text-amber-100/90 shadow-xl backdrop-blur-xl sm:text-sm"
    >
      <IconAlert size={16} className="shrink-0" />
      <p className="min-w-0 flex-1">
        You appear to be offline. Release and news data need a connection.
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="btn btn-glass btn-sm shrink-0"
        aria-label="Retry loading data"
      >
        <IconRefresh size={13} /> Retry
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="btn btn-ghost btn-icon-sm"
        aria-label="Dismiss offline notice"
      >
        <IconClose size={14} />
      </button>
    </div>
  );
}
