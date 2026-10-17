import Link from "next/link";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-white/45">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {last ? (
                <span
                  aria-current="page"
                  className="line-clamp-1 max-w-[52vw] text-white/70 sm:max-w-xs"
                >
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition hover:text-white">
                  {item.name}
                </Link>
              )}
              {last ? null : <span aria-hidden="true" className="text-white/25">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
  meta,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  crumbs: { name: string; path: string }[];
  meta?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-white/8 pt-[calc(var(--nav-height)+2.5rem)] pb-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="aurora orb-violet" style={{ width: 520, height: 520, top: "-45%", left: "-6%", opacity: 0.45 }} />
        <div className="aurora orb-blue" style={{ width: 420, height: 420, top: "-20%", right: "-8%", opacity: 0.35 }} />
        <div className="grid-floor" />
        <div className="noise" />
      </div>
      <div className="container-page relative">
        <Breadcrumbs items={crumbs} />
        <p className="kicker mt-5">{eyebrow}</p>
        <h1 className="mt-4 break-words text-[clamp(1.85rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-balance text-white">
          {title}
        </h1>
        <p className="lede mt-4 max-w-2xl break-words">{intro}</p>
        {meta ? <div className="mt-6 flex flex-wrap items-center gap-2 [&>*]:max-w-full">{meta}</div> : null}
      </div>
    </header>
  );
}
