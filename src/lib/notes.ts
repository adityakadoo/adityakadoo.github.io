import type { CollectionEntry } from 'astro:content';

export type NoteEntry = CollectionEntry<'courses'> | CollectionEntry<'skills'>;

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

export function titleFromSlug(slug: string): string {
  return slug
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function isSectionIndex(entry: NoteEntry): boolean {
  return entry.id === '_index';
}

export function publishedNotes<T extends 'courses' | 'skills'>(
  entries: CollectionEntry<T>[],
): CollectionEntry<T>[] {
  return entries
    .filter((entry) => !isSectionIndex(entry) && !entry.data.draft)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export function neighbors<T extends 'courses' | 'skills'>(
  entries: CollectionEntry<T>[],
  currentId: string,
) {
  const notes = publishedNotes(entries);
  const index = notes.findIndex((entry) => entry.id === currentId);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: index > 0 ? notes[index - 1] : undefined,
    next: index < notes.length - 1 ? notes[index + 1] : undefined,
  };
}

/** Ensures paths match Astro `trailingSlash: 'always'`. */
export function withTrailingSlash(path: string): string {
  if (!path || path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

export function breadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let href = '';

  for (const segment of segments) {
    href = withTrailingSlash(`${href}/${segment}`);
    crumbs.push({
      label: titleFromSlug(segment),
      href,
    });
  }

  return crumbs;
}
