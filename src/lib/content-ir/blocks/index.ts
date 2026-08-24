import { registerBlock } from '../registry';
import { calloutAdapter } from './callout';
import { clipAdapter } from './clip';
import { diagramAdapter } from './diagram';
import { interactiveAdapter } from './interactive';
import { mapAdapter } from './map';
import { mermaidAdapter } from './mermaid';
import { plotAdapter } from './plot';
import { sceneAdapter } from './scene';

let registered = false;

export function registerAllBlocks(): void {
  if (registered) return;
  registerBlock(diagramAdapter);
  registerBlock(calloutAdapter);
  registerBlock(clipAdapter);
  registerBlock(plotAdapter);
  registerBlock(mermaidAdapter);
  registerBlock(mapAdapter);
  registerBlock(sceneAdapter);
  registerBlock(interactiveAdapter);
  registered = true;
}

registerAllBlocks();
