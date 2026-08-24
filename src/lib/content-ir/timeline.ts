import type { SpeechUnit, TimelineCue } from './types';

/** Typical English TTS is ~150 wpm, slower on short function words and math. */
export const WORDS_PER_SEC = 2.35;
export const CHARS_PER_SEC = 11;

export function estimateDurationMs(text: string): number {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return 400;
  const words = trimmed.split(/[\s,/]+/).filter(Boolean).length;
  const pauses = (trimmed.match(/[.;:!?]/g) ?? []).length;
  let ms = (words / WORDS_PER_SEC) * 1000 + pauses * 160 + 200;

  if (/^Next\./i.test(trimmed)) ms += 280;
  else if (/^Start of /i.test(trimmed)) ms += 420;
  else if (/^End of /i.test(trimmed)) ms += 380;
  else if (/^Definition of /i.test(trimmed)) ms += 380;
  else if (/^Quote\./i.test(trimmed)) ms += 260;
  else if (/^Section /i.test(trimmed)) ms += 300;
  else if (/^\d+\./.test(trimmed)) ms += 220;

  if (/^(Next\.|Start of list\.|End of list\.|\d+\.)$/.test(trimmed)) {
    return Math.max(750, Math.round(ms));
  }
  return Math.max(1200, Math.round(ms));
}

export function buildTimeline(units: SpeechUnit[], durationsMs: number[]): TimelineCue[] {
  const cues: TimelineCue[] = [];
  let t = 0;
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const dur = durationsMs[i] ?? estimateDurationMs(unit.text);
    const start = t / 1000;
    const end = (t + dur) / 1000;
    cues.push({
      nodeId: unit.nodeId,
      start,
      end,
      text: unit.text,
      kind: unit.kind,
      category: unit.category,
      clip: unit.clip,
      chunks: unit.chunks,
      highlight: unit.highlight,
      blockId: unit.blockId,
    });
    t += dur;
  }
  return cues;
}

export function toSsml(units: SpeechUnit[]): string {
  const body = units.map((u) => u.ssml).join('\n');
  return `<speak>\n${body}\n</speak>\n`;
}

export function toVtt(cues: TimelineCue[]): string {
  const lines = ['WEBVTT', ''];
  for (const cue of cues) {
    lines.push(`${formatVtt(cue.start)} --> ${formatVtt(cue.end)}`);
    lines.push(cue.text);
    lines.push('');
  }
  return lines.join('\n');
}

function formatVtt(seconds: number): string {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const milli = ms % 1000;
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(milli, 3)}`;
}
