import { escapeHtml } from '../html';
import { asRecord, parseBlockBody } from '../parse-body';
import type { BlockAdapter, Frame, Visual } from '../types';

interface SceneObject {
  id: string;
  type: 'circle' | 'rect' | 'text' | 'line';
  [key: string]: unknown;
}

interface Keyframe {
  t: number;
  [objectId: string]: unknown;
}

interface SceneSpec {
  id?: string;
  duration?: number;
  width?: number;
  height?: number;
  caption?: string;
  objects?: SceneObject[];
  keyframes?: Keyframe[];
}

function sceneSpec(props: Record<string, unknown>): SceneSpec {
  return props as SceneSpec;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function asNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function objectState(
  spec: SceneSpec,
  objectId: string,
  base: Record<string, unknown>,
  t: number,
): Record<string, unknown> {
  const frames = [...(spec.keyframes ?? [])].sort((a, b) => a.t - b.t);
  if (frames.length === 0) return { ...base };
  const duration = spec.duration ?? 1;
  const u = duration === 0 ? 0 : Math.min(1, Math.max(0, t / duration));
  let prev = frames[0];
  let next = frames[frames.length - 1];
  for (let i = 0; i < frames.length - 1; i++) {
    if (u >= frames[i].t && u <= frames[i + 1].t) {
      prev = frames[i];
      next = frames[i + 1];
      break;
    }
  }
  const span = next.t - prev.t || 1;
  const local = (u - prev.t) / span;
  const from = asRecord(prev[objectId]);
  const to = asRecord(next[objectId]);
  const keys = new Set([...Object.keys(from), ...Object.keys(to), ...Object.keys(base)]);
  const out: Record<string, unknown> = { ...base };
  for (const key of keys) {
    const a = from[key] ?? base[key];
    const b = to[key] ?? a;
    if (typeof a === 'number' || typeof b === 'number') {
      out[key] = lerp(asNum(a, 0), asNum(b, asNum(a, 0)), local);
    } else if (b !== undefined) {
      out[key] = local < 1 ? a : b;
    }
  }
  return out;
}

function renderObject(obj: SceneObject, state: Record<string, unknown>): string {
  const fill = String(state.fill ?? obj.fill ?? '#AA0000');
  const stroke = String(state.stroke ?? obj.stroke ?? 'none');
  if (obj.type === 'circle') {
    return `<circle cx="${asNum(state.cx, 40)}" cy="${asNum(state.cy, 40)}" r="${asNum(state.r, obj.r as number ?? 10)}" fill="${escapeHtml(fill)}" stroke="${escapeHtml(stroke)}" stroke-width="2"/>`;
  }
  if (obj.type === 'rect') {
    return `<rect x="${asNum(state.x, 0)}" y="${asNum(state.y, 0)}" width="${asNum(state.width, 40)}" height="${asNum(state.height, 40)}" fill="${escapeHtml(fill)}" stroke="${escapeHtml(stroke)}" stroke-width="2"/>`;
  }
  if (obj.type === 'line') {
    return `<line x1="${asNum(state.x1, 0)}" y1="${asNum(state.y1, 0)}" x2="${asNum(state.x2, 80)}" y2="${asNum(state.y2, 80)}" stroke="${escapeHtml(String(state.stroke ?? obj.stroke ?? '#111'))}" stroke-width="${asNum(state.strokeWidth, 3)}" marker-end="url(#scene-arrow)"/>`;
  }
  const text = String(state.text ?? obj.text ?? '');
  return `<text x="${asNum(state.x, 0)}" y="${asNum(state.y, 0)}" fill="${escapeHtml(fill)}" font-size="${asNum(state.fontSize, 18)}" font-family="Georgia, serif">${escapeHtml(text)}</text>`;
}

export function renderSceneAt(props: Record<string, unknown>, t: number): string {
  const spec = sceneSpec(props);
  const W = spec.width ?? 720;
  const H = spec.height ?? 320;
  const objects = spec.objects ?? [];
  const body = objects
    .map((obj) => renderObject(obj, objectState(spec, obj.id, obj, t)))
    .join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="scene-svg">
    <defs>
      <marker id="scene-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#111"/>
      </marker>
    </defs>
    <rect width="${W}" height="${H}" fill="#f7f4ee"/>
    ${body}
  </svg>`;
}

function smilFor(obj: SceneObject, spec: SceneSpec): string {
  const duration = spec.duration ?? 4;
  const frames = [...(spec.keyframes ?? [])].sort((a, b) => a.t - b.t);
  const attrs = obj.type === 'circle' ? ['cx', 'cy', 'r'] : obj.type === 'rect' ? ['x', 'y', 'width', 'height'] : obj.type === 'line' ? ['x1', 'y1', 'x2', 'y2'] : ['x', 'y'];
  return attrs
    .map((attr) => {
      const values = frames.map((kf) => {
        const st = objectState(spec, obj.id, obj, kf.t * duration);
        return st[attr] ?? obj[attr] ?? 0;
      });
      if (values.length < 2) return '';
      return `<animate attributeName="${attr}" values="${values.join(';')}" dur="${duration}s" repeatCount="indefinite"/>`;
    })
    .join('');
}

function renderLiveScene(props: Record<string, unknown>): string {
  const spec = sceneSpec(props);
  const W = spec.width ?? 720;
  const H = spec.height ?? 320;
  const duration = spec.duration ?? 4;
  const objects = spec.objects ?? [];
  const first = renderSceneAt(props, 0);
  const live = objects
    .map((obj) => {
      const state = objectState(spec, obj.id, obj, 0);
      const inner = smilFor(obj, spec);
      if (obj.type === 'circle') {
        return `<circle cx="${asNum(state.cx, 40)}" cy="${asNum(state.cy, 40)}" r="${asNum(state.r, 10)}" fill="${escapeHtml(String(state.fill ?? '#AA0000'))}">${inner}</circle>`;
      }
      if (obj.type === 'rect') {
        return `<rect x="${asNum(state.x, 0)}" y="${asNum(state.y, 0)}" width="${asNum(state.width, 40)}" height="${asNum(state.height, 40)}" fill="${escapeHtml(String(state.fill ?? '#AA0000'))}">${inner}</rect>`;
      }
      if (obj.type === 'line') {
        return `<line x1="${asNum(state.x1, 0)}" y1="${asNum(state.y1, 0)}" x2="${asNum(state.x2, 80)}" y2="${asNum(state.y2, 80)}" stroke="#111" stroke-width="3" marker-end="url(#scene-arrow-live)">${inner}</line>`;
      }
      return `<text x="${asNum(state.x, 0)}" y="${asNum(state.y, 0)}" fill="#111" font-size="18" font-family="Georgia, serif">${escapeHtml(String(obj.text ?? ''))}</text>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="scene-svg scene-live" data-duration="${duration}">
    <defs>
      <marker id="scene-arrow-live" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#111"/>
      </marker>
    </defs>
    <rect width="${W}" height="${H}" fill="#f7f4ee"/>
    ${live}
  </svg>${first ? '' : ''}`;
}

function keyframeStrip(blockProps: Record<string, unknown>): string {
  const spec = sceneSpec(blockProps);
  const frames = spec.keyframes ?? [];
  if (frames.length === 0) return '';
  const duration = spec.duration ?? 4;
  const items = frames.map((kf, i) => {
    const svg = renderSceneAt(blockProps, kf.t * duration);
    return `<figure class="scene-frame"><div class="svg-box">${svg}</div><figcaption>t = ${kf.t}</figcaption></figure>`;
  });
  return `<div class="scene-frames">${items.join('')}</div>`;
}

export const sceneAdapter: BlockAdapter = {
  name: 'scene',
  category: 3,
  langs: ['scene'],
  parse(input) {
    const { props, json } = parseBlockBody(input.value);
    const spec = { ...asRecord(json), ...input.attributes, ...props };
    return {
      props: spec,
      caption: String(spec.caption ?? input.attributes.caption ?? ''),
    };
  },
  html(block) {
    const live = `<div class="scene-live-wrap">${renderLiveScene(block.props)}</div>`;
    return `${live}${keyframeStrip(block.props)}`;
  },
  caption(block) {
    return block.caption || 'An animation.';
  },
  visual(block): Visual {
    const spec = sceneSpec(block.props);
    return {
      kind: 'svg',
      content: renderSceneAt(block.props, 0),
      width: spec.width ?? 720,
      height: spec.height ?? 320,
    };
  },
  frames(block): Frame[] {
    const spec = sceneSpec(block.props);
    const duration = spec.duration ?? 4;
    const keys = spec.keyframes ?? [];
    const ts = keys.length ? keys.map((k) => k.t) : [0, 0.5, 1];
    return ts.map((t) => ({
      t,
      label: `t=${t}`,
      visual: {
        kind: 'svg',
        content: renderSceneAt(block.props, t * duration),
        width: spec.width ?? 720,
        height: spec.height ?? 320,
      },
    }));
  },
  fallback: (block) => sceneAdapter.caption(block),
};
