# Bitmask

## Overview

Bitwise operations library offering two representations: BigInt masks (arbitrary precision, single value) and Uint32Array bitsets (fixed capacity, segmented 32-bit words, in-place mutation). Used by the ECS library for component matching.

## Source Structure

| File | Description |
|------|-------------|
| `src/bitmask.ts` | BigInt mask functions (addBit, removeBit, hasBit, etc.) |
| `src/bitset.ts` | Uint32Array bitset functions (createBitset, setBit, hasAllBits, etc.) |
| `src/bitset.bench.ts` | Vitest benchmarks comparing BigInt vs Uint32Array on ECS-shaped workloads |
| `src/index.ts` | Public API re-export |

## Key Exports

### BigInt masks

| Export | Type | Description |
|--------|------|-------------|
| `addBit(bitmask, bit)` | Function | Add bit(s) using bitwise OR |
| `removeBit(bitmask, bit)` | Function | Remove bit(s) using AND NOT |
| `hasBit(bitmask, bit)` | Function | Check if bit exists using AND |
| `hasAnyOfBits(bitmask, bits)` | Function | Check if ANY of the bits exist |
| `toggleBit(bitmask, bit)` | Function | Toggle bit(s) using XOR |
| `toggleAllBits(bitmask)` | Function | Toggle all bits (overloaded: number \| bigint) |
| `Bitmask` | Type | `number \| bigint` |

### Uint32Array bitsets

| Export | Type | Description |
|--------|------|-------------|
| `Bitset` | Type | Alias for `Uint32Array` |
| `createBitset(capacity)` | Function | Empty bitset with `ceil(capacity / 32)` words |
| `bitsetFromIndices(indices, capacity)` | Function | Bitset with the given indices set |
| `bitsetCapacity(bitset)` | Function | Bits the bitset can hold |
| `setBit(bitset, index)` | Function | Set bit in place; throws RangeError when out of range |
| `clearBit(bitset, index)` | Function | Clear bit in place; throws RangeError when out of range |
| `flipBit(bitset, index)` | Function | Toggle bit in place; throws RangeError when out of range |
| `testBit(bitset, index)` | Function | Check one bit; false when out of range |
| `hasAllBits(bitset, bits)` | Function | Every set bit of `bits` is set in `bitset` |
| `hasAnyBits(bitset, bits)` | Function | At least one set bit of `bits` is set in `bitset` |
| `isBitsetEmpty(bitset)` | Function | No bits set |
| `bitsetEquals(a, b)` | Function | Same length and same words |
| `clearBitset(bitset)` | Function | Zero all words in place |
| `cloneBitset(bitset)` | Function | Copy |
| `bitsetToString(bitset)` | Function | Binary string, MSB first |

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
- Tests: `src/bitmask.test.ts`, `src/bitset.test.ts`
- Benchmarks: `src/bitset.bench.ts` (excluded from tests and the npm package)

## Coding Guidelines

- BigInt functions take and return `bigint`; they never mutate.
- Bitset functions take `Uint32Array`; mutators change it in place and return `void`.
- Bitsets passed together to `hasAllBits`/`hasAnyBits`/`bitsetEquals` must share the same capacity.
- Keep the library dependency-free.
- Avoid unnecessary comments in code.
