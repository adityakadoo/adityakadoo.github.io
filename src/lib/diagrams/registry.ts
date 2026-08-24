import type { DiagramRenderer } from './types';
import { renderFootballFieldFromProps } from './football-field';

export type { DiagramRenderer };

const renderers: Record<string, DiagramRenderer> = {
  'football-field': renderFootballFieldFromProps,
};

export function renderDiagram(type: string, props: Record<string, string>): string | null {
  return renderers[type]?.(props) ?? null;
}

export function registerDiagram(type: string, renderer: DiagramRenderer): void {
  renderers[type] = renderer;
}

export function knownDiagramTypes(): string[] {
  return Object.keys(renderers);
}
