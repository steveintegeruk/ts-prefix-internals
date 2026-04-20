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

// --- @__KEY__ annotation suppression ---

// Element access with @__KEY__: literal type matching renamed — should be SILENT (suppressed)
function accessGraphFieldAnnotated(g: LinkMap, field: GraphKey) {
  return (g as any)[/*@__KEY__*/ field];
}

// Element access with @__KEY__: non-string-literal on a plain object — should be SILENT (suppressed)
function getPropertyAnnotated(obj: { forward: boolean; reverse: boolean }, key: string): unknown {
  return (obj as any)[/*@__KEY__*/ key];
}

// Element access with @__KEY__ on a string literal on any-typed object — should be SILENT and RENAMED
function accessForwardAnnotatedLiteral(g: LinkMap): unknown {
  return (g as any)[/*@__KEY__*/ 'forward'];
}

// Suppress unused warnings
void first;
void getProperty;
void accessGraphField;
void accessGraphFieldAnnotated;
void getPropertyAnnotated;
void accessForwardAnnotatedLiteral;
