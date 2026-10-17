"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconRefresh } from "@/components/icons";

export function RefreshButton({
  label = "Retry",
  className = "btn btn-glass btn-sm",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={isPending || clicked}
      onClick={() => {
        setClicked(true);
        startTransition(() => {
          router.refresh();
          window.setTimeout(() => setClicked(false), 4000);
        });
      }}
    >
      <IconRefresh size={14} className={isPending ? "animate-spin" : ""} />
      {isPending ? "Refreshing…" : label}
    </button>
  );
}

export function OfflineNotice() {
  return (
    <p className="text-xs text-white/40">
      If you are offline, cached pages may still be available. Release and news data always come from
      GitHub and require a connection.
    </p>
  );
}
