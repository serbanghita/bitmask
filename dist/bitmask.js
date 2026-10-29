(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/bitmask.ts
  var bitmask_exports = {};
  __export(bitmask_exports, {
    addBit: () => addBit,
    hasAnyOfBits: () => hasAnyOfBits,
    hasBit: () => hasBit,
    removeBit: () => removeBit,
    toggleAllBits: () => toggleAllBits,
    toggleBit: () => toggleBit
  });
  function addBit(bitmasks, bit) {
    bitmasks |= bit;
    return bitmasks;
  }
  function toggleBit(bitmasks, bit) {
    bitmasks ^= bit;
    return bitmasks;
  }
  function removeBit(bitmasks, bit) {
    bitmasks &= ~bit;
    return bitmasks;
  }
  function hasBit(bitmasks, bit) {
    return (bitmasks & bit) === bit;
  }
  function hasAnyOfBits(bitmask, bits) {
    return (bitmask & bits) !== 0n;
  }
  function toggleAllBits(bitmask) {
    const oneBit = typeof bitmask === "bigint" ? 1n : 1;
    let start = oneBit;
    while (start <= bitmask) {
      bitmask ^= start;
      start = start << oneBit;
    }
    return bitmask;
  }

  // src/bitset.ts
  var bitset_exports = {};
  __export(bitset_exports, {
    capacity: () => capacity,
    clear: () => clear,
    clearBit: () => clearBit,
    clone: () => clone,
    create: () => create,
    equals: () => equals,
    flipBit: () => flipBit,
    fromIndices: () => fromIndices,
    hasAllBits: () => hasAllBits,
    hasAnyBits: () => hasAnyBits,
    isEmpty: () => isEmpty,
    setBit: () => setBit,
    testBit: () => testBit,
    toBinaryString: () => toBinaryString
  });
  var WORD_BITS = 32;
  function create(capacity2) {
    if (!Number.isInteger(capacity2) || capacity2 <= 0) {
      throw new RangeError(`Bitset capacity must be a positive integer, got ${capacity2}.`);
    }
    return new Uint32Array(Math.ceil(capacity2 / WORD_BITS));
  }
  function fromIndices(indices, capacity2) {
    const bitset = create(capacity2);
    for (const index of indices) {
      setBit(bitset, index);
    }
    return bitset;
  }
  function capacity(bitset) {
    return bitset.length * WORD_BITS;
  }
  function assertIndex(bitset, index) {
    if (index < 0 || index >= bitset.length * WORD_BITS || !Number.isInteger(index)) {
      throw new RangeError(`Bit index ${index} is out of range for a bitset of capacity ${bitset.length * WORD_BITS}.`);
    }
  }
  function setBit(bitset, index) {
    assertIndex(bitset, index);
    bitset[index >>> 5] |= 1 << (index & 31);
  }
  function clearBit(bitset, index) {
    assertIndex(bitset, index);
    bitset[index >>> 5] &= ~(1 << (index & 31));
  }
  function flipBit(bitset, index) {
    assertIndex(bitset, index);
    bitset[index >>> 5] ^= 1 << (index & 31);
  }
  function testBit(bitset, index) {
    if (index >>> 0 !== index) return false;
    const word = bitset[index >>> 5];
    return word !== void 0 && (word & 1 << (index & 31)) !== 0;
  }
  function hasAllBits(bitset, bits) {
    for (let i = 0; i < bits.length; i++) {
      if ((bitset[i] & bits[i]) !== (bits[i] | 0)) {
        return false;
      }
    }
    return true;
  }
  function hasAnyBits(bitset, bits) {
    for (let i = 0; i < bits.length; i++) {
      if ((bitset[i] & bits[i]) !== 0) {
        return true;
      }
    }
    return false;
  }
  function isEmpty(bitset) {
    for (let i = 0; i < bitset.length; i++) {
      if (bitset[i] !== 0) {
        return false;
      }
    }
    return true;
  }
  function equals(a, b) {
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
  function clear(bitset) {
    bitset.fill(0);
  }
  function clone(bitset) {
    return bitset.slice();
  }
  function toBinaryString(bitset) {
    let result = "";
    for (let i = bitset.length - 1; i >= 0; i--) {
      result += bitset[i].toString(2).padStart(WORD_BITS, "0");
    }
    return result;
  }
})();
