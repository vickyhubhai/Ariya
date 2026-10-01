import { FAQ_ITEMS } from '@/lib/content';
import Reveal from '@/components/Reveal';

/** FAQ accordion: native `details`, same seven entries and answers as before. */
export default function Faq() {
  return (
    <section id="faq">
      <div className="container">
        <Reveal className="section-title">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers about Ariya</p>
        </Reveal>

        <Reveal className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <div className="faq-answer">{item.answer}</div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
