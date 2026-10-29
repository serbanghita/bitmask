import {
    bitsetCapacity,
    bitsetEquals,
    bitsetFromIndices,
    bitsetToString,
    clearBit,
    clearBitset,
    cloneBitset,
    createBitset,
    flipBit,
    hasAllBits,
    hasAnyBits,
    isBitsetEmpty,
    setBit,
    testBit,
} from "./bitset.ts";

test('createBitset', () => {
    expect(createBitset(1).length).toBe(1);
    expect(createBitset(32).length).toBe(1);
    expect(createBitset(33).length).toBe(2);
    expect(createBitset(128).length).toBe(4);
    expect(bitsetCapacity(createBitset(33))).toBe(64);
    expect(() => createBitset(0)).toThrow(RangeError);
    expect(() => createBitset(-1)).toThrow(RangeError);
    expect(() => createBitset(1.5)).toThrow(RangeError);
});

test('setBit / testBit across word boundaries', () => {
    const bitset = createBitset(128);
    setBit(bitset, 0);
    setBit(bitset, 31);
    setBit(bitset, 32);
    setBit(bitset, 64);
    setBit(bitset, 127);

    expect(testBit(bitset, 0)).toBe(true);
    expect(testBit(bitset, 31)).toBe(true);
    expect(testBit(bitset, 32)).toBe(true);
    expect(testBit(bitset, 64)).toBe(true);
    expect(testBit(bitset, 127)).toBe(true);
    expect(testBit(bitset, 1)).toBe(false);
    expect(testBit(bitset, 63)).toBe(false);
    expect(testBit(bitset, 128)).toBe(false);

    expect(bitset[0]).toBe(0x80000001);
    expect(bitset[1]).toBe(1);
    expect(bitset[2]).toBe(1);
    expect(bitset[3]).toBe(0x80000000);
});

test('setBit is idempotent', () => {
    const bitset = createBitset(32);
    setBit(bitset, 5);
    setBit(bitset, 5);
    expect(bitset[0]).toBe(0b100000);
});

test('clearBit', () => {
    const bitset = bitsetFromIndices([0, 1, 2, 40], 64);
    clearBit(bitset, 1);
    expect(testBit(bitset, 0)).toBe(true);
    expect(testBit(bitset, 1)).toBe(false);
    expect(testBit(bitset, 2)).toBe(true);
    clearBit(bitset, 1);
    expect(testBit(bitset, 1)).toBe(false);
    clearBit(bitset, 40);
    expect(testBit(bitset, 40)).toBe(false);
    expect(bitset[1]).toBe(0);
});

test('flipBit', () => {
    const bitset = createBitset(64);
    flipBit(bitset, 33);
    expect(testBit(bitset, 33)).toBe(true);
    flipBit(bitset, 33);
    expect(testBit(bitset, 33)).toBe(false);
});

test('mutators reject out of range indices', () => {
    const bitset = createBitset(32);
    expect(() => setBit(bitset, 32)).toThrow(RangeError);
    expect(() => setBit(bitset, -1)).toThrow(RangeError);
    expect(() => setBit(bitset, 1.5)).toThrow(RangeError);
    expect(() => clearBit(bitset, 32)).toThrow(RangeError);
    expect(() => flipBit(bitset, 32)).toThrow(RangeError);
});

test('hasAllBits', () => {
    const entity = bitsetFromIndices([0, 2, 3, 40, 70], 96);

    expect(hasAllBits(entity, bitsetFromIndices([0], 96))).toBe(true);
    expect(hasAllBits(entity, bitsetFromIndices([0, 40], 96))).toBe(true);
    expect(hasAllBits(entity, bitsetFromIndices([0, 40, 70], 96))).toBe(true);
    expect(hasAllBits(entity, bitsetFromIndices([0, 1], 96))).toBe(false);
    expect(hasAllBits(entity, bitsetFromIndices([41], 96))).toBe(false);
    expect(hasAllBits(entity, bitsetFromIndices([70, 71], 96))).toBe(false);
    expect(hasAllBits(entity, createBitset(96))).toBe(true);
});

test('hasAnyBits', () => {
    const entity = bitsetFromIndices([0, 2, 3, 40], 64);

    expect(hasAnyBits(entity, bitsetFromIndices([0], 64))).toBe(true);
    expect(hasAnyBits(entity, bitsetFromIndices([1], 64))).toBe(false);
    expect(hasAnyBits(entity, bitsetFromIndices([1, 2], 64))).toBe(true);
    expect(hasAnyBits(entity, bitsetFromIndices([1, 40], 64))).toBe(true);
    expect(hasAnyBits(entity, bitsetFromIndices([33, 34], 64))).toBe(false);
    expect(hasAnyBits(entity, createBitset(64))).toBe(false);
});

test('isBitsetEmpty / clearBitset', () => {
    const bitset = createBitset(64);
    expect(isBitsetEmpty(bitset)).toBe(true);
    setBit(bitset, 50);
    expect(isBitsetEmpty(bitset)).toBe(false);
    clearBitset(bitset);
    expect(isBitsetEmpty(bitset)).toBe(true);
});

test('bitsetEquals / cloneBitset', () => {
    const a = bitsetFromIndices([1, 35], 64);
    const b = bitsetFromIndices([1, 35], 64);
    const c = bitsetFromIndices([1, 36], 64);

    expect(bitsetEquals(a, b)).toBe(true);
    expect(bitsetEquals(a, c)).toBe(false);
    expect(bitsetEquals(a, bitsetFromIndices([1, 35], 96))).toBe(false);

    const clone = cloneBitset(a);
    expect(bitsetEquals(a, clone)).toBe(true);
    setBit(clone, 2);
    expect(testBit(a, 2)).toBe(false);
});

test('bitsetToString', () => {
    expect(bitsetToString(bitsetFromIndices([0], 32))).toBe("0".repeat(31) + "1");
    expect(bitsetToString(bitsetFromIndices([32], 64))).toBe("0".repeat(31) + "1" + "0".repeat(32));
    expect(bitsetToString(bitsetFromIndices([0, 63], 64))).toBe("1" + "0".repeat(62) + "1");
});

test('testBit returns false for invalid indices', () => {
    const bitset = bitsetFromIndices([0, 1], 64);
    for (const index of [1.5, 0.5, 2 ** 32, 2 ** 32 + 1, -(2 ** 32), NaN, Infinity, -Infinity, -1, Number.MAX_SAFE_INTEGER]) {
        expect(testBit(bitset, index), `index ${index}`).toBe(false);
    }
    expect(testBit(bitset, -0)).toBe(true);
    expect(testBit(bitset, 0)).toBe(true);
});
