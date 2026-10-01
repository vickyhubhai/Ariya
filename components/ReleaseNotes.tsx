'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { CHANGELOG_BROWSE_URL, RELEASE_NOTES_FALLBACK_HTML } from '@/lib/content';
import { repoUrls } from '@/lib/config';
import { renderMarkdown } from '@/lib/markdown';
import { useRelease } from '@/lib/release-context';
import { ReleaseTitle, Version } from '@/components/ReleaseValues';
import Reveal from '@/components/Reveal';
import { ExternalIcon } from '@/components/icons';
/**
 * "Latest Release" card: the changelog body, the sync chip, the update badge
 * and the collapse behaviour that `NotesCollapse` had in `js/app.js`
 * (230px cap, 210px on the smallest screens, toggle only when it overflows).
 */
export default function ReleaseNotes() {
  const { release, fetching, hasUpdate, acknowledge } = useRelease();

  const html = release ? renderMarkdown(release.body) : RELEASE_NOTES_FALLBACK_HTML;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsible, setCollapsible] = useState(false);
  const [cap, setCap] = useState<number | null>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const limit = window.matchMedia('(max-width:480px)').matches ? 210 : 230;
    if (el.scrollHeight <= limit + 24) {
      setCollapsible(false);
      setExpanded(false);
      setCap(null);
      return;
    }
    setCollapsible(true);
    setCap(expanded ? el.scrollHeight : limit);
  }, [html, expanded]);

  // Acknowledging on the changelog click is what stopped the badge reappearing.
  const onViewChangelog = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    acknowledge();
    window.open(CHANGELOG_BROWSE_URL, '_blank', 'noopener');
  };

  return (
    <Reveal className="notes-card">
      <h3>
        Latest Release{' '}
        <span style={{ color: 'var(--accent2)' }}>
          <Version fallback="" />
        </span>
        {hasUpdate ? (
          <span
            className="update-badge"
            id="update-badge"
            title="A new update is available. Click to dismiss."
            role="button"
            tabIndex={0}
            onClick={acknowledge}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                acknowledge();
              }
            }}
          >
            New Update
          </span>
        ) : null}
      </h3>

      <ReleaseTitle className="release-subtitle" />

      {fetching ? (
        <div className="fetch-chip" id="fetch-chip">
          <span className="mini-spinner" aria-hidden="true" />
          Checking the latest release&hellip;
        </div>
      ) : null}

      <div
        className={`notes-body${fetching ? ' notes-loading' : ''}${collapsible && !expanded ? ' collapsed' : ''}`}
        id="notes-body"
        ref={bodyRef}
        style={cap ? { maxHeight: cap } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <button type="button" className="notes-toggle" id="notes-toggle" hidden={!collapsible} aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Show less' : 'Read full notes'}
      </button>

      <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <a
          id="changelog-link"
          href={CHANGELOG_BROWSE_URL}
          target="_blank"
          rel="noopener"
          className="btn-primary"
          style={{ display: 'inline-flex', fontSize: '.85rem', padding: '10px 20px' }}
          onClick={onViewChangelog}
        >
          View Changelog
          <ExternalIcon size={14} />
        </a>
        <a
          id="notes-link"
          href={release?.htmlUrl ?? repoUrls.releases}
          target="_blank"
          rel="noopener"
          className="btn-secondary"
          style={{ display: 'inline-flex', fontSize: '.85rem', padding: '10px 20px' }}
        >
          View All Releases
          <ExternalIcon size={14} />
        </a>
      </div>
    </Reveal>
  );
}
