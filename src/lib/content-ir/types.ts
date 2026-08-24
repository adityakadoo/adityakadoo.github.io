export type BlockCategory = 1 | 2 | 3 | 4;

export interface ContentBlockData {
  id: string;
  name: string;
  category: 2 | 3 | 4;
  props: Record<string, unknown>;
  caption?: string;
  poster?: string;
}

export interface BlockParseInput {
  lang: string;
  meta?: string;
  value: string;
  attributes: Record<string, string>;
}

export interface Visual {
  kind: 'svg' | 'image';
  content: string;
  width?: number;
  height?: number;
}

export interface Frame {
  t: number;
  label?: string;
  visual: Visual;
}

export interface BlockAdapter {
  name: string;
  category: 2 | 3 | 4;
  langs: string[];
  parse(input: BlockParseInput): Omit<ContentBlockData, 'id' | 'name' | 'category'>;
  html(block: ContentBlockData): string;
  caption(block: ContentBlockData): string;
  visual(block: ContentBlockData): Visual | null;
  frames(block: ContentBlockData): Frame[] | null;
  fallback(block: ContentBlockData): string | null;
  /** When true, markdown children of a directive are kept (callouts, clips). */
  keepChildren?: boolean;
}

export interface SpeechUnit {
  nodeId: string;
  kind: 'heading' | 'prose' | 'code' | 'table' | 'image' | 'math' | 'caption' | 'fallback';
  category: BlockCategory;
  text: string;
  ssml: string;
  /** Spoken pieces aligned with DOM highlight tokens (words, code, math symbols). */
  chunks?: string[];
  /** `block` paints the whole element while an announcement (start/next/end) is spoken. */
  highlight?: 'block' | 'words';
  /** Element to paint for block highlights when it differs from `nodeId` (e.g. a `dl`). */
  blockId?: string;
  depth?: number;
  slug?: string;
  clip?: boolean;
  visual: Visual | null;
  frames: Frame[] | null;
  poster?: string;
}

export interface IrHeading {
  depth: number;
  text: string;
  /** Inline HTML label with typeset math, for tables of contents. */
  html: string;
  slug: string;
  nodeId: string;
}

export interface NoteIr {
  collection: string;
  id: string;
  title: string;
  description?: string;
  math: boolean;
  clip: boolean;
  url: string;
  headings: IrHeading[];
  units: SpeechUnit[];
}

export interface TimelineCue {
  nodeId: string;
  start: number;
  end: number;
  text: string;
  kind: SpeechUnit['kind'];
  category: BlockCategory;
  clip?: boolean;
  chunks?: string[];
  highlight?: 'block' | 'words';
  blockId?: string;
}
