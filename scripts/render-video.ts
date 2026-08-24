import { mkdirSync, writeFileSync, existsSync, readFileSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import sharp from 'sharp';
import { buildNoteIr, findNote, listNotes } from '../src/lib/content-ir/notes';
import { buildTimeline, estimateDurationMs, toVtt } from '../src/lib/content-ir/timeline';
import { SHORT_HEIGHT, SHORT_WIDTH, VIDEO_HEIGHT, VIDEO_WIDTH, cardVisual } from '../src/lib/content-ir/visuals';
import type { SpeechUnit, Visual } from '../src/lib/content-ir/types';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function which(bin: string): string | undefined {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], { encoding: 'utf8' });
  if (r.status !== 0) return undefined;
  return r.stdout.trim().split('\n')[0];
}

function wavDurationMs(buf: Buffer): number {
  if (buf.length < 44) return 0;
  const byteRate = buf.readUInt32LE(28);
  const dataSize = buf.readUInt32LE(40);
  if (!byteRate) return 0;
  return Math.round((dataSize / byteRate) * 1000);
}

function writeSilenceWav(durationMs: number, sampleRate = 22050): Buffer {
  const n = Math.max(1, Math.round((durationMs / 1000) * sampleRate));
  const data = Buffer.alloc(n * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function concatWav(parts: Buffer[]): Buffer {
  if (parts.length === 0) return writeSilenceWav(100);
  const sampleRate = parts[0].readUInt32LE(24);
  const pcm = parts.map((part) => part.subarray(44));
  const data = Buffer.concat(pcm);
  const header = Buffer.from(parts[0].subarray(0, 44));
  header.writeUInt32LE(36 + data.length, 4);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function ttsToWav(text: string, bin: string): Buffer | undefined {
  const dir = mkdtempSync(join(tmpdir(), 'scrolls-tts-'));
  const dest = join(dir, 'cue.wav');
  const r = spawnSync(bin, ['-w', dest, '--', text], { encoding: 'utf8' });
  if (r.status !== 0 || !existsSync(dest)) return undefined;
  return readFileSync(dest);
}

function padVisual(visual: Visual, width: number, height: number): string {
  if (visual.kind === 'image') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f7f4ee"/>
      <image href="${visual.content}" x="${width * 0.08}" y="${height * 0.12}" width="${width * 0.84}" height="${height * 0.76}" preserveAspectRatio="xMidYMid meet"/>
    </svg>`;
  }
  const innerW = visual.width ?? 800;
  const innerH = visual.height ?? 450;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f7f4ee"/>
    <svg x="${width * 0.06}" y="${height * 0.1}" width="${width * 0.88}" height="${height * 0.8}" viewBox="0 0 ${innerW} ${innerH}" preserveAspectRatio="xMidYMid meet">${visual.content}</svg>
  </svg>`;
}

async function rasterize(svg: string, dest: string, width: number, height: number): Promise<void> {
  await sharp(Buffer.from(svg)).resize(width, height, { fit: 'fill' }).png().toFile(dest);
}

const outRoot = arg('--out') ?? 'media';
const spec = arg('--note');
const clipHeading = arg('--clip');
const isShort = hasFlag('--short');
const width = isShort ? SHORT_WIDTH : VIDEO_WIDTH;
const height = isShort ? SHORT_HEIGHT : VIDEO_HEIGHT;
const sources = spec ? [findNote(spec)].filter(Boolean) : listNotes();
const ttsBin = which('espeak-ng') ?? which('espeak');
const ffmpeg = which('ffmpeg');

if (sources.length === 0) {
  console.error('No notes found.');
  process.exit(1);
}

function selectUnits(units: SpeechUnit[]): SpeechUnit[] {
  let selected = units;
  if (clipHeading) {
    const start = units.findIndex(
      (u) => u.kind === 'heading' && u.text.toLowerCase().includes(clipHeading.toLowerCase()),
    );
    if (start >= 0) {
      const end =
        units.findIndex((u, i) => i > start && u.kind === 'heading' && (u.depth ?? 99) <= (units[start].depth ?? 99));
      selected = units.slice(start, end === -1 ? undefined : end);
    }
  }
  if (isShort) {
    const clipped = selected.filter((u) => u.clip);
    if (clipped.length) selected = clipped;
  }
  return selected;
}

function unitVisual(unit: SpeechUnit, w: number, h: number): string {
  if (unit.frames && unit.frames.length > 0) {
    return padVisual(unit.frames[0].visual, w, h);
  }
  if (unit.visual) {
    if (unit.visual.kind === 'svg' && unit.category !== 1) return padVisual(unit.visual, w, h);
    if (unit.visual.kind === 'image') return padVisual(unit.visual, w, h);
    if (unit.category === 1) return unit.visual.content;
  }
  return cardVisual(unit.text, { width: w, height: h }).content;
}

for (const source of sources) {
  if (!source) continue;
  const ir = buildNoteIr(source);
  const units = selectUnits(ir.units);
  if (units.length === 0) {
    console.warn(`skip ${source.url}: no units`);
    continue;
  }
  const dir = join(outRoot, source.collection, source.id);
  const framesDir = join(dir, isShort ? 'frames-short' : 'frames');
  mkdirSync(framesDir, { recursive: true });

  const wavs: Buffer[] = [];
  const durations: number[] = [];
  for (const unit of units) {
    const wav = ttsBin ? ttsToWav(unit.text, ttsBin) : undefined;
    if (wav) {
      wavs.push(wav);
      durations.push(wavDurationMs(wav) || estimateDurationMs(unit.text));
    } else {
      const ms = estimateDurationMs(unit.text);
      durations.push(ms);
      wavs.push(writeSilenceWav(ms));
    }
  }
  const timeline = buildTimeline(units, durations);
  writeFileSync(join(dir, isShort ? 'timeline-short.json' : 'timeline.json'), JSON.stringify(timeline, null, 2));
  writeFileSync(join(dir, isShort ? 'captions-short.vtt' : 'captions.vtt'), toVtt(timeline));
  const audioPath = join(dir, isShort ? 'audio-short.wav' : 'audio.wav');
  writeFileSync(audioPath, concatWav(wavs));

  const concatLines: string[] = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const frames = unit.frames?.length ? unit.frames : [{ t: 0, visual: unit.visual ?? cardVisual(unit.text) }];
    const slice = (durations[i] / 1000) / frames.length;
    for (let f = 0; f < frames.length; f++) {
      const frame = frames[f];
      const svg =
        frame.visual != null
          ? unit.frames
            ? padVisual(frame.visual, width, height)
            : unitVisual(unit, width, height)
          : cardVisual(unit.text, { width, height }).content;
      const file = resolve(join(framesDir, `${String(i).padStart(3, '0')}-${f}.png`));
      await rasterize(svg, file, width, height);
      concatLines.push(`file '${file.replaceAll("'", "'\\''")}'`);
      concatLines.push(`duration ${slice.toFixed(3)}`);
    }
  }
  if (concatLines.length >= 2) {
    concatLines.push(concatLines[concatLines.length - 2]);
  }
  const concatPath = join(dir, isShort ? 'frames-short.txt' : 'frames.txt');
  writeFileSync(concatPath, concatLines.join('\n') + '\n');

  const mp4 = join(dir, isShort ? 'video-short.mp4' : 'video.mp4');
  if (!ffmpeg) {
    console.warn(`ffmpeg not found — frames and audio written for ${source.url}`);
    continue;
  }
  const r = spawnSync(
    ffmpeg,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatPath,
      '-i',
      audioPath,
      '-vf',
      `fps=30,format=yuv420p,scale=${width}:${height}`,
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-shortest',
      mp4,
    ],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) {
    console.error(r.stderr);
    console.error(`ffmpeg failed for ${source.url}`);
    continue;
  }
  console.log(`wrote ${mp4}`);
  if (!isShort) {
    const pub = join('public', 'media', source.collection, source.id);
    mkdirSync(pub, { recursive: true });
    copyFileSync(mp4, join(pub, 'video.mp4'));
  }
}

