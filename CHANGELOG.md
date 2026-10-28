# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
