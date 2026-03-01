// in-operator.ts — test case for 'prop' in obj type guards
// The string literal in the `in` expression must be renamed when the
// property it references is an internal (prefixed) property.

import { LinkMap } from './graph.js';

// Type guard on unknown — we can't resolve the type, so leave alone
function isLinkMap(obj: unknown): obj is LinkMap {
  return typeof obj === 'object' && obj !== null && 'connect' in obj;
}

// Concrete type — `in` on a LinkMap instance, property should be renamed
function hasConnect(map: LinkMap): boolean {
  return 'connect' in map;
}

// Discriminated union using internal properties
interface InternalA {
  kind: 'a';
  forward: boolean;
}

interface InternalB {
  kind: 'b';
  reverse: boolean;
}

type InternalUnion = InternalA | InternalB;

function describeUnion(u: InternalUnion): string {
  if ('forward' in u) {
    return `a:${u.forward}`;
  }
  return `b:${u.reverse}`;
}

// Suppress unused
void isLinkMap;
void hasConnect;
void describeUnion;
