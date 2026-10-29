# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-29

### Changed
- **Breaking:** all functions are reached through the `bigint` and `bitset` namespaces (`import { bigint, bitset } from "@serbanghita-gamedev/bitmask"`); the flat exports are removed and the bitset functions no longer repeat the word `bitset` in their names. Migration:

| 1.x name            | 2.0 name                |
|---------------------|-------------------------|
| `addBit`            | `bigint.addBit`         |
| `removeBit`         | `bigint.removeBit`      |
| `hasBit`            | `bigint.hasBit`         |
| `hasAnyOfBits`      | `bigint.hasAnyOfBits`   |
| `toggleBit`         | `bigint.toggleBit`      |
| `toggleAllBits`     | `bigint.toggleAllBits`  |
| `createBitset`      | `bitset.create`         |
| `bitsetFromIndices` | `bitset.fromIndices`    |
| `bitsetCapacity`    | `bitset.capacity`       |
| `setBit`            | `bitset.setBit`         |
| `clearBit`          | `bitset.clearBit`       |
| `flipBit`           | `bitset.flipBit`        |
| `testBit`           | `bitset.testBit`        |
| `hasAllBits`        | `bitset.hasAllBits`     |
| `hasAnyBits`        | `bitset.hasAnyBits`     |
| `isBitsetEmpty`     | `bitset.isEmpty`        |
| `bitsetEquals`      | `bitset.equals`         |
| `clearBitset`       | `bitset.clear`          |
| `cloneBitset`       | `bitset.clone`          |
| `bitsetToString`    | `bitset.toBinaryString` |
| `Bitset` (type)     | `bitset.Bitset`         |

- Notify benchmark tests membership with `bitset.testBit` instead of a one-bit mask loop; README benchmark table is now the median of three runs with the environment and spread stated, and the V8 digit-size explanation is dropped
- Docs no longer require equal capacity for `hasAllBits` and `hasAnyBits`; only `equals` is length-sensitive, missing words read as zero

### Fixed
- `testBit` returned the wrong bit for non-integer indices, `NaN`, `Infinity`, `-Infinity`, and indices at or above 2^32 or at or below -2^32; it now returns false
- `Bitmask` type is now exported (as `bigint.Bitmask`)

## [1.3.0] - 2026-10-28

### Added
- Uint32Array bitset API: `createBitset`, `bitsetFromIndices`, `bitsetCapacity`, `setBit`, `clearBit`, `flipBit`, `testBit`, `hasAllBits`, `hasAnyBits`, `isBitsetEmpty`, `bitsetEquals`, `clearBitset`, `cloneBitset`, `bitsetToString` and the `Bitset` type
- `npm run bench` — vitest benchmarks comparing BigInt masks against Uint32Array bitsets on ECS-shaped workloads (serbanghita/ecs#10)

### Fixed
- Wrong eslint-disable rule name in `bitmask.test.ts` that made `npm run lint` fail

## [1.2.0] - 2026-04-17

### Fixed
- Exclude `.idea/`, `.vscode/`, and `.claude/` from the published npm package

## [1.1.0] - 2025-05-15

### Fixed
- Module resolution compatibility for `nodenext` TypeScript config

### Added
- CI workflow with Node.js version matrix

## [1.0.0] - 2025-05-14

### Added
- `addBit` — add bit(s) to a bitmask using bitwise OR
- `removeBit` — remove bit(s) from a bitmask using AND NOT
- `hasBit` — check if a bit exists in a bitmask
- `hasAnyOfBits` — check if ANY of the specified bits exist
- `toggleBit` — toggle bit(s) using XOR
- `toggleAllBits` — toggle all bits (supports both `number` and `bigint`)
- Unit tests with coverage reporting
- esbuild bundling configuration
- ESLint and Prettier configuration
