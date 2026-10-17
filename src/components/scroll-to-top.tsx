"use client";

import { useEffect, useState } from "react";
import { IconChevron } from "@/components/icons";

/** Floating "back to top" control. Appears after meaningful scroll only. */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setVisible(window.scrollY > 700);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className="floating-control btn btn-glass btn-icon"
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "none" : "translateY(8px)",
        transition: "opacity .25s ease, transform .25s ease",
        backdropFilter: "blur(14px)",
        background: "rgba(16,14,28,.72)",
        border: "1px solid rgba(255,255,255,.14)",
      }}
    >
      <IconChevron size={18} className="rotate-180" />
    </button>
  );
}
