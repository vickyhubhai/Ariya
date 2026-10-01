'use client';

import { useRef, useState, type FormEvent } from 'react';
import { discordConfig } from '@/lib/config';
import { useRelease } from '@/lib/release-context';
import { submitBugReport } from '@/lib/discord';
import { ApiError } from '@/lib/types';
import { SendIcon, CheckBigIcon } from '@/components/icons';

type ReportType = 'bug' | 'feedback' | 'question';

const INITIAL = { type: 'bug' as ReportType, name: '', contact: '', message: '', website: '' };

/**
 * The in-page bug form, ported from `js/discord.js`: same validation order
 * (honeypot -> length -> cooldown), same success panel, same "sending" lock.
 */
export default function BugReport() {
  const { release, showToast } = useRelease();
  const [values, setValues] = useState(INITIAL);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  const set = <K extends keyof typeof INITIAL,>(key: K, value: (typeof INITIAL)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    setError('');
    setSending(true);
    try {
      await submitBugReport({
        type: values.type,
        name: values.name.trim(),
        contact: values.contact.trim(),
        message: values.message.trim(),
        website: values.website,
        appVersion: release?.version ?? '',
      });
      setValues(INITIAL);
      setSent(true);
      // The original moved focus to the confirmation so keyboard users hear it.
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not send your report. Please try again or use Discord.';
      setError(message);
      showToast(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <form id="bug-form" className="bug-form" noValidate onSubmit={onSubmit} hidden={sent}>
        <div className="field">
          <label htmlFor="bug-type">Type</label>
          <select
            id="bug-type"
            name="type"
            value={values.type}
            onChange={(e) => set('type', e.target.value as ReportType)}
          >
            <option value="bug">🐛 Bug Report</option>
            <option value="feedback">💬 Feedback</option>
            <option value="question">❓ Question</option>
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="bug-name">
              Name <span className="opt">(optional)</span>
            </label>
            <input
              type="text"
              id="bug-name"
              name="name"
              maxLength={50}
              placeholder="Your name"
              autoComplete="nickname"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="bug-contact">
              Contact <span className="opt">(optional)</span>
            </label>
            <input
              type="text"
              id="bug-contact"
              name="contact"
              maxLength={100}
              placeholder="Discord or email"
              value={values.contact}
              onChange={(e) => set('contact', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="bug-message">Message *</label>
          <textarea
            id="bug-message"
            name="message"
            rows={4}
            maxLength={discordConfig.bugMaxLength}
            required
            placeholder="Describe the bug or share your feedback..."
            aria-describedby="bug-count bug-error"
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
          />
          <div className="field-meta">
            <span className="field-error" id="bug-error" role="alert">
              {error}
            </span>
            <span className="char-count" id="bug-count">
              {values.message.length} / {discordConfig.bugMaxLength}
            </span>
          </div>
        </div>

        {/* Honeypot: bots fill it, humans never see it. */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="bug-website">Website</label>
          <input
            type="text"
            id="bug-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary bug-submit" id="bug-submit" disabled={sending}>
          <SendIcon size={18} />
          <span className="btn-text">{sending ? 'Sending…' : 'Send Report'}</span>
        </button>
      </form>

      <div className="bug-success" id="bug-success" ref={successRef} tabIndex={-1} hidden={!sent}>
        <div className="success-check">
          <CheckBigIcon size={28} />
        </div>
        <h4>Report sent!</h4>
        <p>Thanks &mdash; our team has been notified. For faster help, join the Discord server.</p>
        <div className="bug-success-actions">
          <a href={discordConfig.supportUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Join Discord
          </a>
          <button
            type="button"
            className="btn-secondary"
            id="bug-reset"
            onClick={() => {
              setSent(false);
              setError('');
            }}
          >
            Send another
          </button>
        </div>
      </div>
    </>
  );
}
