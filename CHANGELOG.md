# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
