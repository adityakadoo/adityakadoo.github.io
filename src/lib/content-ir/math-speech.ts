import katex from 'katex';
import renderA11yString from 'katex/contrib/render-a11y-string';

const KATEX_OPTS = { throwOnError: false, strict: 'ignore' as const };

function fromParseTree(tex: string): string {
  try {
    const tree = (katex as unknown as { __parse: (input: string, opts: object) => unknown[] }).__parse(
      tex,
      KATEX_OPTS,
    );
    return flattenTree(tree).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

function flattenTree(nodes: unknown): string {
  if (!nodes) return '';
  if (typeof nodes === 'string') return nodes;
  if (Array.isArray(nodes)) return nodes.map(flattenTree).filter(Boolean).join(' ');
  if (typeof nodes !== 'object') return '';
  const n = nodes as { type?: string; text?: string; loc?: { lexer?: { input?: string } }; body?: unknown };
  if (typeof n.text === 'string' && n.text.trim()) return n.text;
  if (n.body) return flattenTree(n.body);
  return '';
}

function normalizeTeX(tex: string): string {
  return tex
    .replaceAll('&ast;', '*')
    .replaceAll('&amp;', '&')
    .replace(/\\+([{}])/g, '\\$1')
    .trim();
}

function leftoverMacros(s: string): string {
  return s
    .replace(/\\\{/g, 'left brace')
    .replace(/\\\}/g, 'right brace')
    .replace(/\\([a-zA-Z]+)/g, (_, name: string) => {
      const spoken: Record<string, string> = {
        to: 'to',
        rightarrow: 'to',
        star: 'star',
        ast: 'star',
        cdot: 'times',
        times: 'times',
        infty: 'infinity',
        ell: 'ell',
        Sigma: 'Sigma',
        sigma: 'sigma',
        Omega: 'Omega',
        omega: 'omega',
        Delta: 'Delta',
        delta: 'delta',
        sube: 'subset of',
        subseteq: 'subset of',
        empty: 'empty set',
        emptyset: 'empty set',
        cup: 'union',
        cap: 'intersection',
        bigcup: 'union',
      };
      return spoken[name] ?? name;
    })
    .replace(/\\@/g, '')
    .replace(/\\/g, ' ');
}

const INDEX_WORDS: Record<string, string> = {
  '0': 'naught',
  zero: 'naught',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
};

function speakIndex(raw: string): string {
  const t = raw.replace(/,\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return INDEX_WORDS[t] ?? t;
}

/** Collapse KaTeX "start subscript … end subscript" into how a mathematician would say it. */
function compactScripts(s: string): string {
  const inner = '((?:(?!start (?:sub|super)script).)*?)';
  let prev = '';
  let out = s;
  while (out !== prev) {
    prev = out;
    out = out.replace(
      new RegExp(`(?:^|,)\\s*start superscript,\\s*${inner}\\s*,\\s*end superscript`, 'gi'),
      (_, body: string) => {
        const t = speakIndex(body);
        if (t === 'two' || t === '2') return ' squared';
        if (t === 'three' || t === '3') return ' cubed';
        if (t === 'star') return ' star';
        return ` to the ${t}`;
      },
    );
    out = out.replace(
      new RegExp(`(?:^|,)\\s*start subscript,\\s*${inner}\\s*,\\s*end subscript`, 'gi'),
      (_, body: string) => ` ${speakIndex(body)}`,
    );
  }
  return out.replace(/,\s*(squared|cubed)\b/gi, ' $1');
}

const NOT_FUNCTION = new Set([
  'plus',
  'minus',
  'times',
  'equals',
  'comma',
  'colon',
  'semicolon',
  'and',
  'or',
  'to',
  'from',
  'by',
  'in',
  'of',
  'not',
  'divided',
  'over',
  'left',
  'right',
  'start',
  'end',
  'open',
  'close',
  'such',
  'that',
]);

function isFunctionName(name: string): boolean {
  const t = name.trim();
  if (!t) return false;
  const last = (t.split(/\s+/).pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!last || NOT_FUNCTION.has(last)) return false;
  return true;
}

/** f(a,b) → "f of a, comma, b"; keep bare (a,b) as left/right parenthesis. */
function compactFunctionParens(s: string): string {
  let prev = '';
  let out = s;
  const inner = '((?:(?!, left parenthesis|, right parenthesis).)*?)';
  while (out !== prev) {
    prev = out;
    out = out.replace(
      new RegExp(`(^|,\\s)([^,]+), left parenthesis, ${inner}, right parenthesis`, 'g'),
      (full, lead: string, name: string, body: string) => {
        if (!isFunctionName(name)) return full;
        return `${lead}${name.trim()} of ${body.trim()}`;
      },
    );
  }
  return out;
}

/** Spoken tokens for per-symbol highlight, matching `speakTeX` word breaks. */
export function speakTeXChunks(tex: string): string[] {
  return speakTeX(tex).split(/\s+/).filter(Boolean);
}

/** TeX → spoken English (KaTeX a11y / MathSpeak-style). */
export function speakTeX(tex: string): string {
  const trimmed = normalizeTeX(tex);
  if (!trimmed) return 'equation';
  try {
    const spoken = compactFunctionParens(compactScripts(leftoverMacros(renderA11yString(trimmed, KATEX_OPTS))));
    const out = spoken.replace(/\s+/g, ' ').trim();
    if (out) return out;
  } catch {
    /* fall through */
  }
  return compactFunctionParens(compactScripts(leftoverMacros(fromParseTree(trimmed)))) || 'equation';
}

export function ssmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
