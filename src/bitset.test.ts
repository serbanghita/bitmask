import {
    capacity,
    equals,
    fromIndices,
    toBinaryString,
    clearBit,
    clear,
    clone,
    create,
    flipBit,
    hasAllBits,
    hasAnyBits,
    isEmpty,
    setBit,
    testBit,
} from "./bitset.ts";

test('create', () => {
    expect(create(1).length).toBe(1);
    expect(create(32).length).toBe(1);
    expect(create(33).length).toBe(2);
    expect(create(128).length).toBe(4);
    expect(capacity(create(33))).toBe(64);
    expect(() => create(0)).toThrow(RangeError);
    expect(() => create(-1)).toThrow(RangeError);
    expect(() => create(1.5)).toThrow(RangeError);
});

test('setBit / testBit across word boundaries', () => {
    const bitset = create(128);
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
    const bitset = create(32);
    setBit(bitset, 5);
    setBit(bitset, 5);
    expect(bitset[0]).toBe(0b100000);
});

test('clearBit', () => {
    const bitset = fromIndices([0, 1, 2, 40], 64);
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
    const bitset = create(64);
    flipBit(bitset, 33);
    expect(testBit(bitset, 33)).toBe(true);
    flipBit(bitset, 33);
    expect(testBit(bitset, 33)).toBe(false);
});

test('mutators reject out of range indices', () => {
    const bitset = create(32);
    expect(() => setBit(bitset, 32)).toThrow(RangeError);
    expect(() => setBit(bitset, -1)).toThrow(RangeError);
    expect(() => setBit(bitset, 1.5)).toThrow(RangeError);
    expect(() => clearBit(bitset, 32)).toThrow(RangeError);
    expect(() => flipBit(bitset, 32)).toThrow(RangeError);
});

test('hasAllBits', () => {
    const entity = fromIndices([0, 2, 3, 40, 70], 96);

    expect(hasAllBits(entity, fromIndices([0], 96))).toBe(true);
    expect(hasAllBits(entity, fromIndices([0, 40], 96))).toBe(true);
    expect(hasAllBits(entity, fromIndices([0, 40, 70], 96))).toBe(true);
    expect(hasAllBits(entity, fromIndices([0, 1], 96))).toBe(false);
    expect(hasAllBits(entity, fromIndices([41], 96))).toBe(false);
    expect(hasAllBits(entity, fromIndices([70, 71], 96))).toBe(false);
    expect(hasAllBits(entity, create(96))).toBe(true);
});

test('hasAnyBits', () => {
    const entity = fromIndices([0, 2, 3, 40], 64);

    expect(hasAnyBits(entity, fromIndices([0], 64))).toBe(true);
    expect(hasAnyBits(entity, fromIndices([1], 64))).toBe(false);
    expect(hasAnyBits(entity, fromIndices([1, 2], 64))).toBe(true);
    expect(hasAnyBits(entity, fromIndices([1, 40], 64))).toBe(true);
    expect(hasAnyBits(entity, fromIndices([33, 34], 64))).toBe(false);
    expect(hasAnyBits(entity, create(64))).toBe(false);
});

test('isEmpty / clear', () => {
    const bitset = create(64);
    expect(isEmpty(bitset)).toBe(true);
    setBit(bitset, 50);
    expect(isEmpty(bitset)).toBe(false);
    clear(bitset);
    expect(isEmpty(bitset)).toBe(true);
});

test('equals / clone', () => {
    const a = fromIndices([1, 35], 64);
    const b = fromIndices([1, 35], 64);
    const c = fromIndices([1, 36], 64);

    expect(equals(a, b)).toBe(true);
    expect(equals(a, c)).toBe(false);
    expect(equals(a, fromIndices([1, 35], 96))).toBe(false);

    const copy = clone(a);
    expect(equals(a, copy)).toBe(true);
    setBit(copy, 2);
    expect(testBit(a, 2)).toBe(false);
});

test('toBinaryString', () => {
    expect(toBinaryString(fromIndices([0], 32))).toBe("0".repeat(31) + "1");
    expect(toBinaryString(fromIndices([32], 64))).toBe("0".repeat(31) + "1" + "0".repeat(32));
    expect(toBinaryString(fromIndices([0, 63], 64))).toBe("1" + "0".repeat(62) + "1");
});

test('testBit returns false for invalid indices', () => {
    const bitset = fromIndices([0, 1], 64);
    for (const index of [1.5, 0.5, 2 ** 32, 2 ** 32 + 1, -(2 ** 32), NaN, Infinity, -Infinity, -1, Number.MAX_SAFE_INTEGER]) {
        expect(testBit(bitset, index), `index ${index}`).toBe(false);
    }
    expect(testBit(bitset, -0)).toBe(true);
    expect(testBit(bitset, 0)).toBe(true);
});

test('hasAllBits / hasAnyBits accept different lengths, equals does not', () => {
    const wide = fromIndices([1, 40], 64);
    const narrow = fromIndices([1], 32);
    const narrowMiss = fromIndices([2], 32);
    const wider = fromIndices([1, 70], 96);

    expect(hasAllBits(wide, narrow)).toBe(true);
    expect(hasAllBits(wide, narrowMiss)).toBe(false);
    expect(hasAllBits(wide, wider)).toBe(false);
    expect(hasAllBits(narrow, wide)).toBe(false);
    expect(hasAnyBits(wide, narrow)).toBe(true);
    expect(hasAnyBits(wide, narrowMiss)).toBe(false);
    expect(hasAnyBits(wide, wider)).toBe(true);
    expect(hasAnyBits(narrow, wide)).toBe(true);
    expect(equals(wide, fromIndices([1, 40], 96))).toBe(false);
});
