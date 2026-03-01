// edge-cases.ts — test fixtures for various renaming edge cases

import { LinkMap } from './graph.js';

// --- Internal enum (not exported from barrel) ---
export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
}

function getPriority(level: string): Priority {
  if (level === 'high') return Priority.High;
  if (level === 'medium') return Priority.Medium;
  return Priority.Low;
}

function getPriorityBracket(level: string): Priority {
  return Priority[level as keyof typeof Priority];
}

// --- Mapped types: Readonly<T>, Partial<T> on internal types ---
interface InternalConfig {
  maxRetries: number;
  timeout: number;
  debug: boolean;
}

function freezeConfig(cfg: InternalConfig): Readonly<InternalConfig> {
  return Object.freeze(cfg);
}

function readFrozen(frozen: Readonly<InternalConfig>): string {
  return `${frozen.maxRetries}-${frozen.timeout}-${frozen.debug}`;
}

function mergePartial(base: InternalConfig, overrides: Partial<InternalConfig>): InternalConfig {
  return { ...base, ...overrides };
}

function applyPartial(partial: Partial<InternalConfig>): string {
  return `${partial.maxRetries ?? 0}-${partial.timeout ?? 0}`;
}

// --- Default parameter values ---
interface InternalOpts {
  enabled: boolean;
  count: number;
}

function processWithDefaults(opts: InternalOpts = { enabled: true, count: 5 }): string {
  return `${opts.enabled}-${opts.count}`;
}

// --- Constructor parameter properties ---
class InternalService {
  constructor(
    private config: InternalConfig,
    private label: string,
  ) {}

  describe(): string {
    // References to constructor parameter properties in body
    return `${this.label}: retries=${this.config.maxRetries}`;
  }
}

// --- Static members ---
class InternalRegistry {
  private static instance: InternalRegistry | null = null;
  private static counter = 0;
  private items: string[] = [];

  static getInstance(): InternalRegistry {
    if (!InternalRegistry.instance) {
      InternalRegistry.instance = new InternalRegistry();
    }
    InternalRegistry.counter++;
    return InternalRegistry.instance;
  }

  static getCount(): number {
    return InternalRegistry.counter;
  }

  add(item: string): void {
    this.items.push(item);
  }
}

// --- Prototype access ---
class InternalWorker {
  private value = 0;

  process(n: number): number {
    this.value += n;
    return this.value;
  }
}

function callViaPrototype(worker: InternalWorker, n: number): number {
  return InternalWorker.prototype.process.call(worker, n);
}

// --- Cross-instance private field access ---
class InternalComparable {
  private score: number;

  constructor(score: number) {
    this.score = score;
  }

  isGreaterThan(other: InternalComparable): boolean {
    return this.score > other.score;
  }
}

// Suppress unused
void getPriority;
void getPriorityBracket;
void freezeConfig;
void readFrozen;
void mergePartial;
void applyPartial;
void processWithDefaults;
void InternalService;
void InternalRegistry;
void callViaPrototype;
void InternalComparable;
void LinkMap;
