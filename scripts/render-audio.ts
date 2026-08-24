import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildNoteIr, findNote, listNotes } from '../src/lib/content-ir/notes';
import { buildTimeline, estimateDurationMs, toSsml, toVtt } from '../src/lib/content-ir/timeline';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
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
  const pcm: Buffer[] = [];
  for (const part of parts) {
    const rate = part.readUInt32LE(24);
    if (rate !== sampleRate) {
      pcm.push(part.subarray(44));
      continue;
    }
    pcm.push(part.subarray(44));
  }
  const data = Buffer.concat(pcm);
  const header = Buffer.from(parts[0].subarray(0, 44));
  header.writeUInt32LE(36 + data.length, 4);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function tts(text: string, bin: string): Buffer | undefined {
  const dir = mkdtempSync(join(tmpdir(), 'scrolls-tts-'));
  const dest = join(dir, 'cue.wav');
  const r = spawnSync(bin, ['-w', dest, '--', text], { encoding: 'utf8' });
  if (r.status !== 0 || !existsSync(dest)) return undefined;
  return readFileSync(dest);
}

const outRoot = arg('--out') ?? 'media';
const spec = arg('--note');
const sources = spec ? [findNote(spec)].filter(Boolean) : listNotes();
const ttsBin = which('espeak-ng') ?? which('espeak');

function destDirs(collection: string, id: string): string[] {
  const primary = join(outRoot, collection, id);
  const pub = join('public', 'media', collection, id);
  return primary === pub ? [primary] : [primary, pub];
}

if (sources.length === 0) {
  console.error('No notes found.');
  process.exit(1);
}

if (!ttsBin) {
  console.warn('No espeak/espeak-ng on PATH — writing estimated timeline and silent wav.');
}

for (const source of sources) {
  if (!source) continue;
  const ir = buildNoteIr(source);
  const wavs: Buffer[] = [];
  const durations: number[] = [];
  for (const unit of ir.units) {
    if (ttsBin) {
      const wav = tts(unit.text, ttsBin);
      if (wav) {
        wavs.push(wav);
        durations.push(wavDurationMs(wav) || estimateDurationMs(unit.text));
        continue;
      }
    }
    const ms = estimateDurationMs(unit.text);
    durations.push(ms);
    wavs.push(writeSilenceWav(ms));
  }
  const timeline = buildTimeline(ir.units, durations);
  const audio = concatWav(wavs);
  const payload = {
    'ir.json': JSON.stringify(ir, null, 2),
    'timeline.json': JSON.stringify(timeline, null, 2),
    'speech.ssml': toSsml(ir.units),
    'captions.vtt': toVtt(timeline),
    'audio.wav': audio,
  };
  for (const dir of destDirs(source.collection, source.id)) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'ir.json'), payload['ir.json']);
    writeFileSync(join(dir, 'timeline.json'), payload['timeline.json']);
    writeFileSync(join(dir, 'speech.ssml'), payload['speech.ssml']);
    writeFileSync(join(dir, 'captions.vtt'), payload['captions.vtt']);
    writeFileSync(join(dir, 'audio.wav'), payload['audio.wav']);
    console.log(`wrote ${join(dir, 'audio.wav')} (${timeline.at(-1)?.end.toFixed(1) ?? 0}s, tts=${Boolean(ttsBin)})`);
  }
}
