import { HERO } from '@/lib/content';
import { ClockIcon } from '@/components/icons';
import { Size, Version } from '@/components/ReleaseValues';
import DownloadButton from '@/components/DownloadButton';
import HeroCanvas from '@/components/3d/HeroCanvas';

/**
 * The static site generated these with Math.random() at runtime, which would
 * hydrate differently on every pass. A fixed hash of the index gives each
 * particle the same spread on the server and in the browser.
 */
const PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const rand = (salt: number) => {
    const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    left: rand(1) * 100,
    size: rand(2) * 3 + 1,
    duration: rand(3) * 15 + 10,
    delay: rand(4) * 15,
    opacity: rand(5) * 0.5 + 0.1,
  };
});

/** Hero: CSS orbs + particles behind, the optional 3D layer between, copy on top. */
export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb o1" />
        <div className="hero-orb o2" />
        <div className="hero-orb o3" />
      </div>

      <div className="particles" id="particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <HeroCanvas />

      <div className="hero-content">
        <div className="hero-logo-wrap">
          <div className="hero-logo-glow" aria-hidden="true" />
          <picture>
            <source
              type="image/webp"
              srcSet="/assets/ariya-logo-120.webp 120w, /assets/ariya-logo-180.webp 180w, /assets/ariya-logo-240.webp 240w, /assets/ariya-logo-320.webp 320w"
              sizes="90px, (min-width: 481px) 120px"
            />
            <img
              src="/assets/ariya-logo-240.png"
              alt=""
              className="hero-logo"
              width={240}
              height={240}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>

        <h1>
          <span className="gradient">Ariya</span>
        </h1>
        <p className="tagline">{HERO.tagline}</p>
        <p className="desc">{HERO.description}</p>

        <div className="btns">
          <DownloadButton id="download-btn" />
          <a href="#whats-new" className="btn-secondary">
            <ClockIcon size={18} />
            What&apos;s New
          </a>
        </div>

        <div className="hero-meta">
          <span className="item">
            <Version />
          </span>
          <span className="dot" aria-hidden="true" />
          <span className="item">{HERO.android}</span>
          <span className="dot" aria-hidden="true" />
          <span className="item">
            <Size />
          </span>
        </div>
      </div>
    </section>
  );
}
