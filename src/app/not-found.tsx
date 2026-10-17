import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { IconArrowRight, IconDownload } from "@/components/icons";

export const metadata = {
  title: "Page not found",
  description: "That page does not exist on the Ariya Music Player website.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-height)+4rem)] pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="aurora orb-violet float-slow" style={{ width: 520, height: 520, top: "0%", left: "10%" }} />
        <div className="aurora orb-blue float-slower" style={{ width: 420, height: 420, bottom: "0%", right: "8%" }} />
        <div className="grid-floor" />
        <div className="noise" />
      </div>
      <div className="container-page relative flex flex-col items-center text-center">
        <BrandLogo size={72} />
        <p className="kicker mt-6">404</p>
        <h1 className="h2 mt-4 max-w-xl">This track isn’t in the queue</h1>
        <p className="lede mt-3 max-w-md text-sm">
          The page you followed does not exist. It may have been renamed, or the release or news post
          is no longer published upstream.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-primary">
            Back to home <IconArrowRight size={14} />
          </Link>
          <Link href="/download" className="btn btn-glass">
            <IconDownload size={15} /> Download Ariya
          </Link>
          <Link href="/releases" className="btn btn-ghost">
            Release history
          </Link>
        </div>
      </div>
    </section>
  );
}
