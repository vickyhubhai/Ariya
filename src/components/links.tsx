import { IconExternal } from "@/components/icons";
import { links } from "@/lib/site";

export function GithubReleasesLink({ label = "Official release posts on GitHub" }: { label?: string }) {
  return (
    <a
      href={links.releases}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-white"
    >
      {label}
      <IconExternal size={12} />
    </a>
  );
}

export const Links = {
  GithubReleases: GithubReleasesLink,
};
