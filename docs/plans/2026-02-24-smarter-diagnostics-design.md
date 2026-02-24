# Smarter Dynamic Access Diagnostics

## Problem

`detectDynamicAccess` warns on every `obj[expr]` where `expr` isn't a string literal. This produces false positives for array indexing (`arr[i]`), tuple access (`tuple[0]`), and Map lookups — none of which are affected by symbol prefixing. Meanwhile, cases where we can *prove* a bracket access hits a prefixed property get the same soft warning as unknowable cases.

## Design

Replace the current flat warning system with a three-tier diagnostic model using TypeScript's type checker to classify each `ElementAccessExpression`.

### Tiers

| Tier | Condition | Behavior |
|------|-----------|----------|
| **Silent** | Object type has numeric index signature, or is array/tuple | No diagnostic emitted |
| **Error** | Argument type is a string literal (or union of string literals) matching a symbol in the rename set | Hard error — exit 1 unless `--force` |
| **Warn** | Anything else (broad `string`, `any`, unresolved) | Warning — informational only |

### Detection Logic

For each `ElementAccessExpression` in project source files:

1. Get the type of `node.expression` (the object) via `checker.getTypeAtLocation()`
2. If the type has a number index signature, or `checker.isArrayType()` / `checker.isTupleType()` — **skip**
3. Get the type of `node.argumentExpression` (the key)
4. If the argument type is a `StringLiteral` type (check `type.isStringLiteral()`), or a union of string literal types, collect all literal values
5. Check each literal value against `symbolsToRename` — if any match, emit **ERROR** with the specific property name
6. Otherwise — emit **WARN**

### Data Structures

New `Diagnostic` type in `config.ts`:

```typescript
interface Diagnostic {
  level: 'error' | 'warn';
  message: string;
  file: string;
  line: number;
}
```

Replace `warnings: string[]` with `diagnostics: Diagnostic[]` in:
- `ClassificationResult`
- `PrefixResult`
- `FullResult`

### Config Changes

Add `force: boolean` to `PrefixConfig` (default `false`). When `true`, errors are downgraded to warnings.

### CLI Changes

- New `--force` flag
- Print errors and warnings in separate sections
- Exit 1 if any errors exist and `--force` is not set
- Dry-run mode also shows errors/warnings with the same severity logic

### Programmatic API Changes

`prefixInternals()` returns `diagnostics: Diagnostic[]` instead of `warnings: string[]`. Callers can filter by level. The function does NOT throw on errors — callers decide how to handle them.

## Examples

```
// SILENT — no diagnostic
const items: string[] = ['a', 'b'];
items[0];           // array type → suppress
items[i];           // array type → suppress

// ERROR — provably hits prefixed property
obj['secretKey'];   // 'secretKey' in rename set → error
const k: 'foo' = 'foo';
obj[k];             // k has literal type 'foo', 'foo' in rename set → error

// WARN — can't determine
obj[dynamicKey];    // dynamicKey: string → warn
obj[x as any];      // any → warn
```

## Files Changed

- `config.ts` — add `Diagnostic` type, `force` config, update result interfaces
- `classifier.ts` — rewrite `detectDynamicAccess` with type-aware logic
- `index.ts` — pass through diagnostics, respect `force`
- `cli.ts` — add `--force` flag, separate error/warn output, exit logic
- Tests — new test cases for all three tiers
