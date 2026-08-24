import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildNoteIr, findNote, listNotes } from '../src/lib/content-ir/notes';
import { toSsml } from '../src/lib/content-ir/timeline';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const outRoot = arg('--out') ?? 'media';
const spec = arg('--note');
const sources = spec ? [findNote(spec)].filter(Boolean) : listNotes();

if (sources.length === 0) {
  console.error('No notes found.');
  process.exit(1);
}

for (const source of sources) {
  if (!source) continue;
  const ir = buildNoteIr(source);
  const dir = join(outRoot, source.collection, source.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'ir.json'), JSON.stringify(ir, null, 2));
  writeFileSync(join(dir, 'headings.json'), JSON.stringify(ir.headings, null, 2));
  writeFileSync(join(dir, 'speech.txt'), ir.units.map((u) => u.text).join('\n\n') + '\n');
  writeFileSync(join(dir, 'speech.ssml'), toSsml(ir.units));
  console.log(`wrote ${dir} (${ir.units.length} units, ${ir.headings.length} headings)`);
}
