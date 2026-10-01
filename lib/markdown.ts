import { safeUrl } from './utils';

/**
 * Escaping mini-markdown renderer, ported from `GitHub.renderMarkdown`.
 *
 * Input is HTML-escaped first, then only the supported constructs are turned
 * back into markup, so release bodies and changelogs cannot inject script.
 * Output is rendered with `dangerouslySetInnerHTML` exactly like the static
 * site did (`notesBody.innerHTML = GitHub.renderMarkdown(body)`).
 */
export function renderMarkdown(text: string | null | undefined): string {
  if (!text) return '';

  let out = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  out = out
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, url: string) => {
      const safe = safeUrl(url, ['https:', 'http:']);
      if (!safe) return alt || '';
      return `<img src="${safe}" alt="${alt}" loading="lazy" decoding="async" style="max-width:100%;border-radius:12px;margin:12px 0">`;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
      const safe = safeUrl(url, ['https:', 'http:', 'mailto:', '#']);
      if (!safe) return label;
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^## (.+)$/gm, '<strong>$1</strong>')
    .replace(/^# (.+)$/gm, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '  \u2022 $1')
    .replace(/\n/g, '<br>');

  return out;
}

export const NO_NOTES_HTML = '<em style="color:var(--text3)">No release notes available.</em>';
export const NO_CHANGELOG_HTML =
  '<em style="color:var(--text3)">Changelog is not available for this release.</em>';
export const CHANGELOG_FAILED_HTML =
  '<em style="color:var(--text3)">Unable to load the changelog. Please try again.</em>';
export const LOADING_CHANGELOG_HTML =
  '<em style="color:var(--text3)">Loading changelog...</em>';
