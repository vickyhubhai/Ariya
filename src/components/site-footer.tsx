import Link from "next/link";
import { BrandLogo, Wordmark } from "@/components/brand-logo";
import { IconArrowUpRight, IconGithub } from "@/components/icons";
import { footerGroups, links, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-10 border-t border-white/8 bg-[#06060c]">
      <div className="divider-glow" aria-hidden="true" />
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] lg:gap-10">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Ariya Music Player — home">
              <BrandLogo size={44} />
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              {site.tagline}. A free, open-source Android music player built for playback quality,
              synced lyrics and a calmer listening experience.
            </p>
            <div className="actions mt-5">
              <a href={links.repo} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                <IconGithub size={15} />
                vickyhubhai/Ariya
                <IconArrowUpRight size={13} />
              </a>
              <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                Ariya_news
              </a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="min-w-0">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href + link.label} className="min-w-0">
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block break-anywhere text-sm text-white/60 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="block break-anywhere text-sm text-white/60 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/40 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · Developed by {site.developer} ·{" "}
            <a
              href={links.license}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/20 underline-offset-2 hover:text-white/70"
            >
              MIT License
            </a>
          </p>
          <p className="max-w-2xl break-words lg:text-right">
            Independent project. Not affiliated with or endorsed by Spotify, YouTube, Google, Discord
            or any other music service. APK files are distributed only through GitHub Releases.
          </p>
        </div>
      </div>
    </footer>
  );
}
