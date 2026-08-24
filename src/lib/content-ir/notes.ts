import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { parseMarkdown } from './parse';
import type { NoteIr } from './types';
import { walkIr } from './walk';

export interface NoteSource {
  collection: string;
  id: string;
  filePath: string;
  url: string;
  raw: string;
  data: {
    title: string;
    description?: string;
    math?: boolean;
    clip?: boolean;
    draft?: boolean;
  };
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, acc);
    else if (name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

export function listNotes(contentRoot = 'src/content'): NoteSource[] {
  const notes: NoteSource[] = [];
  for (const collection of ['courses']) {
    const base = join(contentRoot, collection);
    try {
      statSync(base);
    } catch {
      continue;
    }
    for (const filePath of walkFiles(base)) {
      const rel = relative(base, filePath).replaceAll('\\', '/');
      const id = rel.replace(/\.md$/, '').replace(/\/index$/, '');
      if (id === '_index' || id.endsWith('/_index')) continue;
      const raw = readFileSync(filePath, 'utf8');
      const { data } = matter(raw);
      if (data.draft === true) continue;
      notes.push({
        collection,
        id,
        filePath,
        url: `/${collection}/${id}/`,
        raw,
        data: {
          title: String(data.title ?? id),
          description: data.description ? String(data.description) : undefined,
          math: Boolean(data.math),
          clip: Boolean(data.clip),
          draft: Boolean(data.draft),
        },
      });
    }
  }
  return notes.sort((a, b) => a.url.localeCompare(b.url));
}

export function buildNoteIr(source: NoteSource): NoteIr {
  const { content } = matter(source.raw);
  const tree = parseMarkdown(content);
  const { headings, units } = walkIr(tree, { clipAll: source.data.clip });
  return {
    collection: source.collection,
    id: source.id,
    title: source.data.title,
    description: source.data.description,
    math: source.data.math ?? false,
    clip: source.data.clip ?? false,
    url: source.url,
    headings,
    units,
  };
}

export function findNote(spec: string, contentRoot = 'src/content'): NoteSource | undefined {
  const notes = listNotes(contentRoot);
  if (!spec) return notes[0];
  const needle = spec.replace(/^\/+|\/+$/g, '').replace(/\/index$/, '');
  return notes.find(
    (n) => n.id === needle || n.url.replace(/^\/+|\/+$/g, '') === needle || `${n.collection}/${n.id}` === needle,
  );
}
