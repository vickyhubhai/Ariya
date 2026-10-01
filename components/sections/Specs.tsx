import { SPECS } from '@/lib/content';
import Reveal from '@/components/Reveal';

/** System requirements strip. */
export default function Specs() {
  return (
    <section id="specs">
      <div className="container">
        <Reveal className="section-title">
          <h2>System Requirements</h2>
        </Reveal>

        <div className="specs-grid">
          {SPECS.map((spec, i) => (
            <Reveal key={spec.label} className="spec-item" delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <div className="icon" aria-hidden="true">
                {spec.icon}
              </div>
              <div className="text">
                <div className="label">{spec.label}</div>
                <div className="value">{spec.value}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
