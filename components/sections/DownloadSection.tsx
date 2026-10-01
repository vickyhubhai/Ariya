'use client';

import { repoUrls } from '@/lib/config';
import { useIsIOS } from '@/lib/hooks';
import { useRelease } from '@/lib/release-context';
import { Size, Version, ReleaseDate } from '@/components/ReleaseValues';
import BuildPicker from '@/components/BuildPicker';
import DownloadButton from '@/components/DownloadButton';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';

/**
 * Download section: error banner, release card, build picker, status line and
 * the Android-only note. Every piece of state comes from the release store.
 * The iOS note stays hidden by CSS and is revealed only on Apple devices,
 * which is what `Download.detectOS()` did on the static site.
 */
export default function DownloadSection() {
  const { release, error, status, checkAgain, acknowledge } = useRelease();
  const isIOS = useIsIOS();

  return (
    <section id="download">
      <div className="container">
        <Reveal className="section-title">
          <h2>Download Ariya</h2>
          <p>Get the latest stable release for Android</p>
        </Reveal>

        <div id="error-banner" className={`error-banner${error ? ' show' : ''}`} role="alert">
          <p id="error-text">{error}</p>
          <button type="button" className="btn-secondary" style={{ marginTop: 14, fontSize: '.82rem', padding: '8px 16px' }} onClick={checkAgain}>
            Try Again
          </button>
        </div>

        <Tilt className="release-card" reveal yaw={5} pitch={5} resetOnLeave>
          <div className="version">
            <Version />
          </div>
          <div className="date">
            Released <ReleaseDate />
          </div>

          <div className="info">
            <div className="item">
              <span className="label">Version</span>
              <span className="value">
                <Version shimmer />
              </span>
            </div>
            <div className="item">
              <span className="label">Size</span>
              <span className="value">
                <Size shimmer />
              </span>
            </div>
            <div className="item">
              <span className="label">Platform</span>
              <span className="value">Android 8.0+</span>
            </div>
          </div>

          <div className="btns">
            <DownloadButton id="download-btn-mobile" />
            {/* `[data-release-url]`: the live release page, and clicking it
                dismisses the "New Update" badge (ReleaseSync.bindReleaseLinks). */}
            <a href={release?.htmlUrl ?? repoUrls.releases} target="_blank" rel="noopener" className="btn-secondary" onClick={acknowledge}>
              Release Notes
            </a>
          </div>
        </Tilt>

        <BuildPicker />

        <div
          className={`release-status${status.warn ? ' warn' : ''}`}
          id="release-status"
          role="status"
          aria-live="polite"
          hidden={!status.visible}
        >
          <span id="release-status-text">{status.message}</span>
          {status.warn ? (
            <button type="button" className="status-btn" id="status-check-btn" onClick={checkAgain}>
              Check again
            </button>
          ) : null}
        </div>

        <div className="ios-banner" id="ios-banner" style={isIOS ? { display: 'block' } : undefined}>
          <h3>Ariya is currently available for Android</h3>
          <p>Ariya is an Android app. iOS support is not available at this time.</p>
        </div>
      </div>
    </section>
  );
}
