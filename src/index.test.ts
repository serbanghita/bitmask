import * as entry from "./index.ts";
import { bigint, bitset } from "./index.ts";

const BITSET_FUNCTIONS = [
    "capacity",
    "clear",
    "clearBit",
    "clone",
    "create",
    "equals",
    "flipBit",
    "fromIndices",
    "hasAllBits",
    "hasAnyBits",
    "isEmpty",
    "setBit",
    "testBit",
    "toBinaryString",
];

const BIGINT_FUNCTIONS = ["addBit", "hasAnyOfBits", "hasBit", "removeBit", "toggleAllBits", "toggleBit"];

test('entry point exposes only the bigint and bitset namespaces', () => {
    expect(Object.keys(entry).sort()).toEqual(["bigint", "bitset"]);
});

test('bitset namespace', () => {
    expect(Object.keys(bitset).sort()).toEqual([...BITSET_FUNCTIONS].sort());

    const signature = bitset.create(64);
    bitset.setBit(signature, 40);
    expect(bitset.testBit(signature, 40)).toBe(true);
    expect(bitset.hasAllBits(signature, bitset.fromIndices([40], 64))).toBe(true);
    expect(bitset.toBinaryString(bitset.fromIndices([0], 32))).toBe("0".repeat(31) + "1");
});

test('bigint namespace', () => {
    expect(Object.keys(bigint).sort()).toEqual([...BIGINT_FUNCTIONS].sort());

    const mask: bigint.Bitmask = bigint.addBit(0n, 1n << 3n);
    expect(bigint.hasBit(mask as bigint, 1n << 3n)).toBe(true);
    expect(bigint.hasBit(bigint.removeBit(mask as bigint, 1n << 3n), 1n << 3n)).toBe(false);
});
