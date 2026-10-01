import Reveal from '@/components/Reveal';
import ReleaseNotes from '@/components/ReleaseNotes';

/** What's New: section chrome here, the live release card inside. */
export default function WhatsNew() {
  return (
    <section id="whats-new">
      <div className="container">
        <Reveal className="section-title">
          <h2>What&apos;s New</h2>
          <p>Latest changes and improvements</p>
        </Reveal>
        <ReleaseNotes />
      </div>
    </section>
  );
}
