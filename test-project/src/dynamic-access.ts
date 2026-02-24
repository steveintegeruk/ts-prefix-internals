import { LinkMap } from './graph.js';

// Array indexing — should be SILENT (no diagnostic)
const items: string[] = ['a', 'b', 'c'];
const first = items[0];
for (let i = 0; i < items.length; i++) {
  const x = items[i];
}

// Dynamic access with broad string type — should be WARN
function getProperty(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

// Access with string literal type matching a prefixed property — should be ERROR
type GraphKey = 'forward' | 'reverse';
function accessGraphField(g: LinkMap, field: GraphKey) {
  return (g as any)[field];
}
