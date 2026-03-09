# Bitmask

## Overview

Bitwise operations library for working with bitmasks using BigInt for arbitrary-precision support. Used by the ECS library for component matching.

## Source Structure

| File | Description |
|------|-------------|
| `src/bitmask.ts` | All bitwise manipulation functions (addBit, removeBit, hasBit, etc.) |
| `src/index.ts` | Public API re-export |

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `addBit(bitmask, bit)` | Function | Add bit(s) using bitwise OR |
| `removeBit(bitmask, bit)` | Function | Remove bit(s) using AND NOT |
| `hasBit(bitmask, bit)` | Function | Check if bit exists using AND |
| `hasAnyOfBits(bitmask, bits)` | Function | Check if ANY of the bits exist |
| `toggleBit(bitmask, bit)` | Function | Toggle bit(s) using XOR |
| `toggleAllBits(bitmask)` | Function | Toggle all bits (overloaded: number \| bigint) |
| `Bitmask` | Type | `number \| bigint` |

## Dependencies

None (standalone library).

## Development

| Command | What it does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Bundle with esbuild |
| `npm run test` | Run tests with coverage (vitest + v8/istanbul) |
| `npm run lint` | Lint (eslint) |

## Testing

- Framework: Vitest with coverage
- Tests: `src/bitmask.test.ts`

## Coding Guidelines

- All functions use BigInt parameters for arbitrary-precision bitmask support.
- Keep the library dependency-free.
- Avoid unnecessary comments in code.
