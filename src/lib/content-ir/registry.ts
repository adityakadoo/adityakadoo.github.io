import type { BlockAdapter } from './types';

const byName = new Map<string, BlockAdapter>();
const byLang = new Map<string, BlockAdapter>();

export function registerBlock(adapter: BlockAdapter): void {
  byName.set(adapter.name, adapter);
  for (const lang of adapter.langs) {
    byLang.set(lang, adapter);
  }
}

export function getBlock(name: string): BlockAdapter | undefined {
  return byName.get(name);
}

export function adapterForLang(lang: string): BlockAdapter | undefined {
  const exact = byLang.get(lang);
  if (exact) return exact;
  if (lang.startsWith('svg-')) return byName.get('diagram');
  return undefined;
}

export function knownBlockLangs(): string[] {
  return [...byLang.keys()];
}

export function allBlocks(): BlockAdapter[] {
  return [...byName.values()];
}
