# Bitmask

## Overview

Bitwise operations library offering two representations, each exposed as a namespace from the entry point: `bigint` for BigInt masks (arbitrary precision, single value, never mutates) and `bitset` for Uint32Array bitsets (fixed capacity, segmented 32-bit words, in-place mutation). Used by the ECS library for component matching.

## Source Structure

| File | Description |
|------|-------------|
| `src/bitmask.ts` | BigInt mask functions (addBit, removeBit, hasBit, etc.) |
| `src/bitset.ts` | Uint32Array bitset functions (create, setBit, hasAllBits, etc.) |
| `src/bitset.bench.ts` | Vitest benchmarks comparing BigInt vs Uint32Array on ECS-shaped workloads |
| `src/index.ts` | Namespace re-export (`bigint`, `bitset`) |

## Key Exports

```ts
import { bigint, bitset } from "@serbanghita-gamedev/bitmask";
```

### `bigint` namespace (BigInt masks)

| Export | Type | Description |
|--------|------|-------------|
| `bigint.addBit(bitmask, bit)` | Function | Add bit(s) using bitwise OR |
| `bigint.removeBit(bitmask, bit)` | Function | Remove bit(s) using AND NOT |
| `bigint.hasBit(bitmask, bit)` | Function | Check if bit exists using AND |
| `bigint.hasAnyOfBits(bitmask, bits)` | Function | Check if ANY of the bits exist |
| `bigint.toggleBit(bitmask, bit)` | Function | Toggle bit(s) using XOR |
| `bigint.toggleAllBits(bitmask)` | Function | Toggle all bits (overloaded: number \| bigint) |
| `bigint.Bitmask` | Type | `number \| bigint` |

### `bitset` namespace (Uint32Array bitsets)

| Export | Type | Description |
|--------|------|-------------|
| `bitset.Bitset` | Type | Alias for `Uint32Array` |
| `bitset.create(capacity)` | Function | Empty bitset with `ceil(capacity / 32)` words |
| `bitset.fromIndices(indices, capacity)` | Function | Bitset with the given indices set |
| `bitset.capacity(bitset)` | Function | Bits the bitset can hold (a multiple of 32) |
| `bitset.setBit(bitset, index)` | Function | Set bit in place; throws RangeError when out of range |
| `bitset.clearBit(bitset, index)` | Function | Clear bit in place; throws RangeError when out of range |
| `bitset.flipBit(bitset, index)` | Function | Toggle bit in place; throws RangeError when out of range |
| `bitset.testBit(bitset, index)` | Function | Check one bit; false for any index that is not a valid bit index (negative, non-integer or beyond capacity) |
| `bitset.hasAllBits(bitset, bits)` | Function | Every set bit of `bits` is set in `bitset` |
| `bitset.hasAnyBits(bitset, bits)` | Function | At least one set bit of `bits` is set in `bitset` |
| `bitset.isEmpty(bitset)` | Function | No bits set |
| `bitset.equals(a, b)` | Function | Same length and same words |
| `bitset.clear(bitset)` | Function | Zero all words in place |
| `bitset.clone(bitset)` | Function | Copy |
| `bitset.toBinaryString(bitset)` | Function | Binary string, MSB first |

## Dependencies

None (standalone library).

## Development

| Command | What it does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Bundle with esbuild |
| `npm run test` | Run tests with coverage (vitest + v8/istanbul) |
| `npm run bench` | Run BigInt vs Uint32Array benchmarks (vitest bench) |
| `npm run lint` | Lint (eslint) |

## Testing

- Framework: Vitest with coverage
- Tests: `src/bitmask.test.ts`, `src/bitset.test.ts`, `src/index.test.ts`
- Benchmarks: `src/bitset.bench.ts` (excluded from tests and the npm package)

## Coding Guidelines

- The entry point exports only the `bigint` and `bitset` namespaces; no flat function exports.
- BigInt functions take and return `bigint`; they never mutate.
- Bitset functions take `Uint32Array`; mutators change it in place and return `void`.
- `bitset.equals` returns false for different lengths; `bitset.hasAllBits` and `bitset.hasAnyBits` accept any lengths and treat missing words as zero. Create bitsets that are used together with the same capacity.
- Keep the library dependency-free.
- Avoid unnecessary comments in code.
