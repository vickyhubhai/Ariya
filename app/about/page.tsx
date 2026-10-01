import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';
import { Version } from '@/components/ReleaseValues';
import { DiscordIcon, DownloadIcon, GithubIcon } from '@/components/icons';
import { ABOUT } from '@/lib/content';
import { discordConfig, repoUrls, siteConfig } from '@/lib/config';
import { buildAboutJsonLd } from '@/lib/seo';

const aboutImage = { url: siteConfig.logo, width: 512, height: 512, alt: 'Ariya app logo' };

export const metadata: Metadata = {
  title: 'About Ariya - Free Open-Source Android Music Player',
  description: ABOUT.hero.description,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'article',
    title: 'About Ariya',
    description: ABOUT.hero.description,
    url: '/about',
    images: [aboutImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Ariya',
    description: ABOUT.hero.description,
    images: [aboutImage],
  },
};

/** Every section of the old `about/index.html`, in order, with the same classes. */
export default function AboutPage() {
  return (
    <>
      {/* About hero */}
      <section className="hero about-hero" id="about-hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb o1" />
          <div className="hero-orb o2" />
          <div className="hero-orb o3" />
        </div>
        <div className="hero-content">
          <div className="hero-logo-wrap">
            <div className="hero-logo-glow" />
            <picture>
              <source
                type="image/webp"
                srcSet="/assets/ariya-logo-120.webp 120w, /assets/ariya-logo-180.webp 180w, /assets/ariya-logo-240.webp 240w, /assets/ariya-logo-320.webp 320w"
                sizes="90px, (min-width: 481px) 120px"
              />
              <img
                src="/assets/ariya-logo-240.png"
                alt="Ariya app logo"
                className="hero-logo"
                width={240}
                height={240}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
          <h1>
            <span className="gradient">{ABOUT.hero.title}</span>
          </h1>
          <Version className="version-chip" />
          <p className="tagline">{ABOUT.hero.tagline}</p>
          <p className="desc">{ABOUT.hero.description}</p>
          <div className="btns">
            <a href="/#download" className="btn-primary">
              <DownloadIcon size={20} />
              Download Ariya
            </a>
            <a href={repoUrls.repo} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <GithubIcon size={18} />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* What is Ariya */}
      <section className="about-section" id="what-is-ariya">
        <div className="container">
          <Reveal className="section-title">
            <h2>{ABOUT.whatIs.title}</h2>
          </Reveal>
          <Reveal className="about-panel">
            {ABOUT.whatIs.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Why Ariya */}
      <section className="about-section" id="why-ariya">
        <div className="container">
          <Reveal className="section-title">
            <h2>{ABOUT.why.title}</h2>
            <p>{ABOUT.why.subtitle}</p>
          </Reveal>
          <div className="about-split">
            {ABOUT.why.panels.map((panel, i) => (
              <Reveal key={panel.title} className="about-panel" delay={i % 2 === 0 ? 1 : 2}>
                <h3>{panel.title}</h3>
                <p>{panel.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="about-section" id="key-features">
        <div className="container">
          <Reveal className="section-title">
            <h2>{ABOUT.keyFeatures.title}</h2>
            <p>{ABOUT.keyFeatures.subtitle}</p>
          </Reveal>
          <div className="features-grid">
            {ABOUT.keyFeatures.items.map((feature, i) => (
              <Tilt key={feature.title} className="feature-card" reveal delay={((i % 3) + 1) as 1 | 2 | 3} yaw={8} pitch={8}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dives */}
      {ABOUT.deepDives.map((section) => (
        <section className="about-section" id={section.id} key={section.id}>
          <div className="container">
            <Reveal className="section-title">
              <h2>{section.title}</h2>
              {section.subtitle ? <p>{section.subtitle}</p> : null}
            </Reveal>
            <Reveal className="about-panel">
              {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
              {section.bullets ? (
                <ul className="about-bullets">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
          </div>
        </section>
      ))}

      {/* Community & support */}
      <section className="about-section" id="community">
        <div className="container">
          <Reveal className="section-title">
            <h2>{ABOUT.community.title}</h2>
            <p>{ABOUT.community.subtitle}</p>
          </Reveal>
          <Reveal className="about-panel">
            <p>{ABOUT.community.paragraph}</p>
          </Reveal>
          <Reveal className="about-cta">
            <a href={repoUrls.repo} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <GithubIcon size={18} />
              GitHub
            </a>
            <a href={discordConfig.supportUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <DiscordIcon size={18} />
              Join Discord
            </a>
            <a href="/#support" className="btn-secondary">
              Report a Bug
            </a>
            <a href="/#download" className="btn-secondary">
              Download <Version />
            </a>
          </Reveal>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAboutJsonLd()) }} />
    </>
  );
}
