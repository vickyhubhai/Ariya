import type { ReactNode } from "react";

/** Per-navigation entrance transition. CSS-only, disabled by reduced motion. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
