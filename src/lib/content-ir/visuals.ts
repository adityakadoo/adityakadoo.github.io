import type { Visual } from './types';
import { escapeHtml } from './html';

export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const SHORT_WIDTH = 1080;
export const SHORT_HEIGHT = 1920;

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 14);
}

export function cardVisual(
  text: string,
  opts: { title?: string; kicker?: string; width?: number; height?: number } = {},
): Visual {
  const width = opts.width ?? VIDEO_WIDTH;
  const height = opts.height ?? VIDEO_HEIGHT;
  const maxChars = width > height ? 48 : 28;
  const lines = wrapWords(text, maxChars);
  const startY = opts.title ? 200 : 160;
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 44}">${escapeHtml(line)}</tspan>`,
    )
    .join('');
  const title = opts.title
    ? `<text x="${width / 2}" y="120" text-anchor="middle" fill="#111" font-size="36" font-family="Georgia, serif" font-weight="700">${escapeHtml(opts.title)}</text>`
    : '';
  const kicker = opts.kicker
    ? `<text x="${width / 2}" y="72" text-anchor="middle" fill="#AA0000" font-size="18" font-family="Georgia, serif" letter-spacing="0.12em">${escapeHtml(opts.kicker.toUpperCase())}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#f7f4ee"/>
  <rect x="48" y="48" width="${width - 96}" height="${height - 96}" fill="none" stroke="#111" stroke-width="2"/>
  ${kicker}
  ${title}
  <text x="${width / 2}" y="${startY}" text-anchor="middle" fill="#222" font-size="32" font-family="Georgia, serif">${tspans}</text>
</svg>`;
  return { kind: 'svg', content: svg, width, height };
}
