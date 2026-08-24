import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildNoteIr, findNote } from './notes';
import { buildTimeline, estimateDurationMs } from './timeline';
import type { TimelineCue } from './types';

export interface PlayerPayload {
  cues: TimelineCue[];
  audioUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
}

function publicMediaDir(collection: string, id: string): string {
  return join('public', 'media', collection, id);
}

function publicUrl(collection: string, id: string, file: string): string {
  return `/media/${collection}/${id}/${file}`;
}

export function loadPlayerPayload(collection: string, id: string): PlayerPayload | null {
  const source = findNote(`${collection}/${id}`);
  if (!source) return null;
  const ir = buildNoteIr(source);
  if (ir.units.length === 0) return null;

  const estimated = buildTimeline(
    ir.units,
    ir.units.map((unit) => estimateDurationMs(unit.text)),
  );

  const dir = publicMediaDir(collection, id);
  const timelinePath = join(dir, 'timeline.json');
  let cues = estimated;
  if (existsSync(timelinePath)) {
    try {
      const parsed = JSON.parse(readFileSync(timelinePath, 'utf8')) as TimelineCue[];
      if (Array.isArray(parsed) && parsed.length) cues = parsed;
    } catch {
      cues = estimated;
    }
  }

  return {
    cues,
    audioUrl: existsSync(join(dir, 'audio.wav')) ? publicUrl(collection, id, 'audio.wav') : undefined,
    videoUrl: existsSync(join(dir, 'video.mp4')) ? publicUrl(collection, id, 'video.mp4') : undefined,
    pdfUrl: existsSync(join(dir, 'note.pdf')) ? publicUrl(collection, id, 'note.pdf') : undefined,
  };
}
