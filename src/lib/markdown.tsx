import type { ReactNode } from "react";

/**
 * Minimal, dependency-free GitHub-flavoured Markdown renderer.
 *
 * It produces React nodes directly — there is no `dangerouslySetInnerHTML`,
 * so raw HTML in upstream release notes or news posts can never execute.
 * Links are restricted to HTTPS + an allowlist of project-related hosts.
 */

const ALLOWED_LINK_HOSTS = [
  "github.com",
  "www.github.com",
  "raw.githubusercontent.com",
  "ariyamusic.us.ci",
  "discord.gg",
  "discord.com",
  "youtube.com",
  "www.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "spotify.com",
  "open.spotify.com",
  "unsplash.com",
  "images.unsplash.com",
];

const IMGIX_SUFFIX = ".imgix.net";

export function safeHref(raw: string | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const allowed =
    ALLOWED_LINK_HOSTS.includes(host) || host.endsWith(IMGIX_SUFFIX) || host.endsWith(".githubusercontent.com");
  return allowed ? url.toString() : null;
}

function renderLink(label: string, href: string | undefined, key: string): ReactNode {
  const safe = safeHref(href);
  if (!safe) return <span key={key}>{label}</span>;
  return (
    <a key={key} href={safe} target="_blank" rel="noopener noreferrer nofollow">
      {renderInline(label, `${key}-l`)}
    </a>
  );
}

const INLINE_SOURCE =
  "(`[^`]+`)|(\\*\\*[^*]+\\*\\*)|(__[^_]+__)|(\\*[^*\\n]+\\*)|(_[^_\\n]+_)|(~~[^~]+~~)|(\\[[^\\]]+\\]\\([^)\\s]+\\))";

export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  // A fresh regex per call keeps recursion safe. A shared global regex would
  // have its lastIndex reset by nested calls and could loop forever.
  const inlinePattern = new RegExp(INLINE_SOURCE, "g");
  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key}>{renderInline(token.slice(2, -2), key)}</strong>);
    } else if (token.startsWith("~~")) {
      nodes.push(<del key={key}>{renderInline(token.slice(2, -2), key)}</del>);
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(renderLink(linkMatch[1], linkMatch[2], key));
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function isTableDivider(line: string): boolean {
  return /^\s{0,3}\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function flushParagraph(buffer: string[], out: ReactNode[], keyBase: string) {
  if (buffer.length === 0) return;
  const text = buffer.join(" ").trim();
  buffer.length = 0;
  if (!text) return;
  out.push(<p key={`${keyBase}-p`}>{renderInline(text, `${keyBase}-p`)}</p>);
}

export function Markdown({ markdown, className }: { markdown: string; className?: string }) {
  const source = String(markdown ?? "").replace(/\r\n?/g, "\n").slice(0, 120_000);
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  const paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let inCode = false;
  let codeBuffer: string[] = [];

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    out.push(
      <Tag key={`list-${out.length}`}>
        {list.items.map((item, i) => (
          <li key={`li-${i}`}>{renderInline(item, `li-${out.length}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        out.push(
          <pre key={`code-${i}`} className="overflow-x-auto">
            <code>{codeBuffer.join("\n")}</code>
          </pre>,
        );
        codeBuffer = [];
        inCode = false;
      } else {
        flushParagraph(paragraph, out, `p-${i}`);
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph(paragraph, out, `p-${i}`);
      flushList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph(paragraph, out, `p-${i}`);
      flushList();
      const level = Math.min(4, heading[1].length);
      const Tag = (`h${level === 1 ? 2 : level}` as "h2" | "h3" | "h4");
      out.push(<Tag key={`h-${i}`}>{renderInline(heading[2], `h-${i}`)}</Tag>);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(paragraph, out, `p-${i}`);
      flushList();
      out.push(<hr key={`hr-${i}`} />);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph(paragraph, out, `p-${i}`);
      flushList();
      out.push(
        <blockquote key={`bq-${i}`}>{renderInline(trimmed.replace(/^>\s?/, ""), `bq-${i}`)}</blockquote>,
      );
      continue;
    }

    if (trimmed.includes("|") && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flushParagraph(paragraph, out, `p-${i}`);
      flushList();
      const header = splitRow(trimmed);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].includes("|") && lines[j].trim()) {
        rows.push(splitRow(lines[j]));
        j += 1;
      }
      out.push(
        <table key={`table-${i}`}>
          <thead>
            <tr>
              {header.map((cell, cellIndex) => (
                <th key={`th-${cellIndex}`}>{renderInline(cell, `th-${i}-${cellIndex}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`tr-${rowIndex}`}>
                {header.map((_, cellIndex) => (
                  <td key={`td-${rowIndex}-${cellIndex}`}>
                    {renderInline(row[cellIndex] ?? "", `td-${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      i = j - 1;
      continue;
    }

    const unordered = /^[-*+]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (unordered || ordered) {
      flushParagraph(paragraph, out, `p-${i}`);
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push((unordered ?? ordered)?.[1] ?? "");
      continue;
    }

    if (list) {
      // Continuation of the previous list item.
      list.items[list.items.length - 1] = `${list.items[list.items.length - 1]} ${trimmed}`;
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph(paragraph, out, "p-final");
  flushList();
  if (inCode && codeBuffer.length > 0) {
    out.push(
      <pre key="code-final" className="overflow-x-auto">
        <code>{codeBuffer.join("\n")}</code>
      </pre>,
    );
  }

  return <div className={className ?? "prose-ariya"}>{out}</div>;
}

/** Plain-text preview of a Markdown body, safe for meta descriptions. */
export function markdownToText(markdown: string, maxLength = 220): string {
  const text = String(markdown ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
