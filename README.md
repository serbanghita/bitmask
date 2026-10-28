# Bitmask
> Bitwise operations for bitmasks and general purposes.

[![Node.js CI](https://github.com/serbanghita/bitmask/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/serbanghita/bitmask/actions/workflows/node.js.yml)

Two representations are provided:

- **BigInt masks** — a single arbitrary-precision integer, one bit per flag. Simple, unbounded, allocates on every mutation.
- **Uint32Array bitsets** — a fixed-capacity array of 32-bit words, addressed by bit index. Mutates in place, no allocations, 2-3x faster than BigInt past 64 bits (see [Benchmarks](#benchmarks)).

## BigInt masks

| Operation       | Description                                       |
|-----------------|---------------------------------------------------|
| `addBit`        | Adds bit to the bitmask.                          |
| `removeBit`     | Remove bit from bitmask.                          |
| `hasBit`        | Check if a bit already exists in the bitmask.     |
| `hasAnyOfBits`  | Check if the bitmask contains any of the bits.    |
| `toggleBit`     | Toggle existing/non-existing bits in the bitmask. |
| `toggleAllBits` | Toggle all bits in the bitmask                    |

```ts
import { addBit, hasBit } from "@serbanghita-gamedev/bitmask";

const CAN_WALK = 1n << 0n;
const CAN_FLY = 1n << 1n;

let mask = 0n;
mask = addBit(mask, CAN_WALK);
hasBit(mask, CAN_WALK); // true
hasBit(mask, CAN_FLY);  // false
```

## Uint32Array bitsets

Bits are addressed by index (`0, 1, 2, ...`). Index `i` lives in word `i >>> 5` at position `i & 31`.
Bitsets compared with each other must be created with the same capacity.

| Operation             | Description                                                      |
|-----------------------|------------------------------------------------------------------|
| `createBitset`        | Create an empty bitset with room for `capacity` bits.            |
| `bitsetFromIndices`   | Create a bitset with the given bit indices set.                  |
| `bitsetCapacity`      | Number of bits the bitset can hold (rounded up to 32).           |
| `setBit`              | Set the bit at `index` (in place).                               |
| `clearBit`            | Clear the bit at `index` (in place).                             |
| `flipBit`             | Toggle the bit at `index` (in place).                            |
| `testBit`             | Check if the bit at `index` is set.                              |
| `hasAllBits`          | Check if the bitset contains every bit set in `bits`.            |
| `hasAnyBits`          | Check if the bitset contains at least one bit set in `bits`.     |
| `isBitsetEmpty`       | Check if no bits are set.                                        |
| `bitsetEquals`        | Check if two bitsets have the same capacity and the same bits.   |
| `clearBitset`         | Clear every bit (in place).                                      |
| `cloneBitset`         | Copy a bitset.                                                   |
| `bitsetToString`      | Binary string, most significant bit first (debugging).           |

```ts
import { createBitset, setBit, bitsetFromIndices, hasAllBits, hasAnyBits } from "@serbanghita-gamedev/bitmask";

const MAX_COMPONENTS = 128;
const POSITION = 0, VELOCITY = 1, HEALTH = 70;

const entity = createBitset(MAX_COMPONENTS);
setBit(entity, POSITION);
setBit(entity, VELOCITY);

const all = bitsetFromIndices([POSITION, VELOCITY], MAX_COMPONENTS);
const none = bitsetFromIndices([HEALTH], MAX_COMPONENTS);

hasAllBits(entity, all);  // true
hasAnyBits(entity, none); // false
```

## Benchmarks

`npm run bench` runs `src/bitset.bench.ts` with vitest. It models the ECS hot paths at 16, 32, 64 and 128 components:

- **query match** — 1000 entities x 32 queries, `none -> all -> any` evaluation
- **mutation** — add then remove one component on 1000 entity signatures
- **notify** — for 1000 mutations x 32 queries, test whether the component is in the query's `all`/`any`/`none`

Results on Node 24, Apple Silicon (higher is better, speedup of `uint32array` over `bigint`):

| Components | Query match | Mutation | Notify |
|-----------:|------------:|---------:|-------:|
| 16         | 1.04x       | 2.57x    | 0.93x  |
| 32         | 1.17x       | 2.32x    | 0.92x  |
| 64         | 1.97x       | 2.78x    | 2.12x  |
| 128        | 1.80x       | 2.88x    | 2.10x  |

Up to 32 bits a BigInt fits in a single internal digit and V8 handles it nearly as fast as a typed array read. Past 64 bits BigInt needs multiple digits and every operation allocates, which is where the Uint32Array bitset pulls ahead.
