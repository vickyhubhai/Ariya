import { SUPPORT } from '@/lib/content';
import { discordConfig } from '@/lib/config';
import Reveal from '@/components/Reveal';
import BugReport from '@/components/BugReport';
import { DiscordIcon, FlagIcon } from '@/components/icons';

/** Support: the Discord card and the bug-report card (the form is client-side). */
export default function Support() {
  return (
    <section id="support">
      <div className="container">
        <Reveal className="section-title">
          <h2>{SUPPORT.title}</h2>
          <p>{SUPPORT.subtitle}</p>
        </Reveal>

        <div className="support-grid">
          <Reveal className="support-card">
            <div className="support-icon">
              <DiscordIcon size={28} />
            </div>
            <h3>{SUPPORT.discordTitle}</h3>
            <p>{SUPPORT.discordText}</p>
            <a href={discordConfig.supportUrl} target="_blank" rel="noopener noreferrer" className="btn-primary support-cta">
              <DiscordIcon size={18} />
              Join Discord
            </a>
            <div className="support-meta">{discordConfig.inviteSlug}</div>
          </Reveal>

          <Reveal className="support-card" delay={1}>
            <div className="support-icon red">
              <FlagIcon size={26} />
            </div>
            <h3>{SUPPORT.bugTitle}</h3>
            <p>{SUPPORT.bugText}</p>
            <BugReport />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
