import type { ReactNode } from "react";

export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SectionHeading({
  kicker,
  title,
  children,
  align = "center",
  id,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  id?: string;
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto flex max-w-3xl flex-col items-center text-center"
          : "flex max-w-3xl flex-col items-start text-left"
      }
    >
      {kicker ? <span className="kicker">{kicker}</span> : null}
      <h2 id={id} className="h2 mt-5">
        {title}
      </h2>
      {children ? <div className="lede mt-4 max-w-2xl">{children}</div> : null}
    </div>
  );
}

export function Ambient({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "subtle" | "hero";
  className?: string;
}) {
  const opacity = variant === "subtle" ? "opacity-40" : variant === "hero" ? "opacity-90" : "opacity-70";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${opacity} ${className}`}>
      <div
        className="aurora orb-violet float-slow"
        style={{ width: 620, height: 620, top: "-22%", left: "-12%" }}
      />
      <div
        className="aurora orb-blue float-slower"
        style={{ width: 520, height: 520, top: "12%", right: "-16%" }}
      />
      <div
        className="aurora orb-rose"
        style={{ width: 420, height: 420, bottom: "-18%", left: "26%", opacity: 0.32 }}
      />
      {variant !== "subtle" ? <div className="grid-floor" /> : null}
      <div className="noise" />
    </div>
  );
}
