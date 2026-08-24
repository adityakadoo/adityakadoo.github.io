declare module 'katex/contrib/render-a11y-string' {
  import type { KatexOptions } from 'katex';
  export default function renderA11yString(tex: string, options?: KatexOptions): string;
}
