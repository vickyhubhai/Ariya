import Link from 'next/link';
import { discordConfig, repoUrls } from '@/lib/config';

/** Site footer, identical link set and wording to the static site. */
export default function Footer() {
  return (
    <footer>
      <div className="container inner">
        <div className="brand">
          <picture>
            <source type="image/webp" srcSet="/assets/ariya-logo-64.webp" />
            <img src="/assets/ariya-logo-64.png" alt="" width={64} height={64} loading="lazy" decoding="async" />
          </picture>
          <span>Ariya</span>
        </div>
        <div className="links">
          <Link href="/about">About</Link>
          <a href={repoUrls.repo} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={repoUrls.releases} target="_blank" rel="noopener noreferrer">
            Releases
          </a>
          <a href={discordConfig.supportUrl} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
          <a href={repoUrls.license} target="_blank" rel="noopener noreferrer">
            License
          </a>
        </div>
        <div className="copy">Built with care by Vicky</div>
      </div>
    </footer>
  );
}
