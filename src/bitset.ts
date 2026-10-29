/**
 * Fixed-capacity bitset backed by a Uint32Array.
 *
 * Bits are addressed by index (0, 1, 2, ...) and stored 32 per word.
 * Index i lives in word (i >>> 5) at bit position (i & 31).
 *
 * Mutating functions change the bitset in place and never allocate.
 * Two bitsets compared with hasAllBits/hasAnyBits/equals must share the same capacity.
 */

export type Bitset = Uint32Array;

const WORD_BITS = 32;

export function create(capacity: number): Bitset {
    if (!Number.isInteger(capacity) || capacity <= 0) {
        throw new RangeError(`Bitset capacity must be a positive integer, got ${capacity}.`);
    }
    return new Uint32Array(Math.ceil(capacity / WORD_BITS));
}

export function fromIndices(indices: Iterable<number>, capacity: number): Bitset {
    const bitset = create(capacity);
    for (const index of indices) {
        setBit(bitset, index);
    }
    return bitset;
}

export function capacity(bitset: Bitset): number {
    return bitset.length * WORD_BITS;
}

function assertIndex(bitset: Bitset, index: number): void {
    if (index < 0 || index >= bitset.length * WORD_BITS || !Number.isInteger(index)) {
        throw new RangeError(`Bit index ${index} is out of range for a bitset of capacity ${bitset.length * WORD_BITS}.`);
    }
}

export function setBit(bitset: Bitset, index: number): void {
    assertIndex(bitset, index);
    bitset[index >>> 5] |= 1 << (index & 31);
}

export function clearBit(bitset: Bitset, index: number): void {
    assertIndex(bitset, index);
    bitset[index >>> 5] &= ~(1 << (index & 31));
}

export function flipBit(bitset: Bitset, index: number): void {
    assertIndex(bitset, index);
    bitset[index >>> 5] ^= 1 << (index & 31);
}

export function testBit(bitset: Bitset, index: number): boolean {
    if ((index >>> 0) !== index) return false;
    const word = bitset[index >>> 5];
    return word !== undefined && (word & (1 << (index & 31))) !== 0;
}

export function hasAllBits(bitset: Bitset, bits: Bitset): boolean {
    for (let i = 0; i < bits.length; i++) {
        if ((bitset[i] & bits[i]) !== bits[i]) {
            return false;
        }
    }
    return true;
}

export function hasAnyBits(bitset: Bitset, bits: Bitset): boolean {
    for (let i = 0; i < bits.length; i++) {
        if ((bitset[i] & bits[i]) !== 0) {
            return true;
        }
    }
    return false;
}

export function isEmpty(bitset: Bitset): boolean {
    for (let i = 0; i < bitset.length; i++) {
        if (bitset[i] !== 0) {
            return false;
        }
    }
    return true;
}

export function equals(a: Bitset, b: Bitset): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

export function clear(bitset: Bitset): void {
    bitset.fill(0);
}

export function clone(bitset: Bitset): Bitset {
    return bitset.slice();
}

export function toBinaryString(bitset: Bitset): string {
    let result = "";
    for (let i = bitset.length - 1; i >= 0; i--) {
        result += bitset[i].toString(2).padStart(WORD_BITS, "0");
    }
    return result;
}
