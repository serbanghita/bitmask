# Bitmask
> Bitwise operations for bitmasks and general purposes.

[![Node.js CI](https://github.com/serbanghita/bitmask/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/serbanghita/bitmask/actions/workflows/node.js.yml)

Two representations are provided, each under its own namespace:

- **`bigint`**: BigInt masks. A single arbitrary-precision integer, one bit per flag. Simple, unbounded, returns a new value on every change.
- **`bitset`**: Uint32Array bitsets. A fixed-capacity array of 32-bit words, addressed by bit index. Mutates in place, no allocations, 2-3x faster than BigInt past 64 bits (see [Benchmarks](#benchmarks)).

```ts
import { bigint, bitset } from "@serbanghita-gamedev/bitmask";
```

## `bigint`: BigInt masks

| Operation              | Description                                       |
|------------------------|---------------------------------------------------|
| `bigint.addBit`        | Adds bit to the bitmask.                          |
| `bigint.removeBit`     | Remove bit from bitmask.                          |
| `bigint.hasBit`        | Check if a bit already exists in the bitmask.     |
| `bigint.hasAnyOfBits`  | Check if the bitmask contains any of the bits.    |
| `bigint.toggleBit`     | Toggle existing/non-existing bits in the bitmask. |
| `bigint.toggleAllBits` | Toggle all bits in the bitmask.                   |
| `bigint.Bitmask`       | Type: `number \| bigint`.                         |

```ts
import { bigint } from "@serbanghita-gamedev/bitmask";

const CAN_WALK = 1n << 0n;
const CAN_FLY = 1n << 1n;

let mask = 0n;
mask = bigint.addBit(mask, CAN_WALK);
bigint.hasBit(mask, CAN_WALK); // true
bigint.hasBit(mask, CAN_FLY);  // false
```

## `bitset`: Uint32Array bitsets

Bits are addressed by index (`0, 1, 2, ...`). Index `i` lives in word `i >>> 5` at position `i & 31`.

`bitset.equals` returns false for bitsets of different lengths. `bitset.hasAllBits` and `bitset.hasAnyBits`
accept any lengths and treat missing words as zero. Creating all bitsets with the same capacity is still
recommended.

| Operation               | Description                                                                                              |
|-------------------------|----------------------------------------------------------------------------------------------------------|
| `bitset.create`         | Create an empty bitset with room for `capacity` bits.                                                    |
| `bitset.fromIndices`    | Create a bitset with the given bit indices set.                                                          |
| `bitset.capacity`       | Number of bits the bitset can hold (rounded up to a multiple of 32).                                     |
| `bitset.setBit`         | Set the bit at `index` (in place).                                                                       |
| `bitset.clearBit`       | Clear the bit at `index` (in place).                                                                     |
| `bitset.flipBit`        | Toggle the bit at `index` (in place).                                                                    |
| `bitset.testBit`        | Check if the bit at `index` is set; false for any index that is not a valid bit index (negative, non-integer or beyond capacity). |
| `bitset.hasAllBits`     | Check if the bitset contains every bit set in `bits`.                                                    |
| `bitset.hasAnyBits`     | Check if the bitset contains at least one bit set in `bits`.                                             |
| `bitset.isEmpty`        | Check if no bits are set.                                                                                |
| `bitset.equals`         | Check if two bitsets have the same capacity and the same bits.                                           |
| `bitset.clear`          | Clear every bit (in place).                                                                              |
| `bitset.clone`          | Copy a bitset.                                                                                           |
| `bitset.toBinaryString` | Binary string, most significant bit first (debugging).                                                   |
| `bitset.Bitset`         | Type: alias for `Uint32Array`.                                                                           |

```ts
import { bitset } from "@serbanghita-gamedev/bitmask";

const MAX_COMPONENTS = 128;
const POSITION = 0, VELOCITY = 1, HEALTH = 70;

const entity = bitset.create(MAX_COMPONENTS);
bitset.setBit(entity, POSITION);
bitset.setBit(entity, VELOCITY);

const all = bitset.fromIndices([POSITION, VELOCITY], MAX_COMPONENTS);
const none = bitset.fromIndices([HEALTH], MAX_COMPONENTS);

bitset.hasAllBits(entity, all);  // true
bitset.hasAnyBits(entity, none); // false
```

## Migrating from 1.x

Version 2.0 removes the flat exports. Every function lives under the `bigint` or `bitset` namespace, and the
bitset functions no longer repeat the word `bitset` in their names. A local variable named `bitset` shadows the
namespace, so rename the variable or import the namespace under an alias (`import { bitset as bs }`).

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
