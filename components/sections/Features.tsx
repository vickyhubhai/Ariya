import { FEATURES } from '@/lib/content';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';

/** Feature grid: tilt + entrance on the card itself, one node per card. */
export default function Features() {
  return (
    <section id="features">
      <div className="container">
        <Reveal className="section-title">
          <h2>Features</h2>
          <p>Everything you need for a complete music experience</p>
        </Reveal>

        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <Tilt key={feature.title} className="feature-card" reveal delay={((i % 3) + 1) as 1 | 2 | 3} yaw={8} pitch={8}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}
