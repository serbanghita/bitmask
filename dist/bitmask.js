(() => {
  // src/bitmask.ts
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
  var WORD_BITS = 32;
  function createBitset(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError(`Bitset capacity must be a positive integer, got ${capacity}.`);
    }
    return new Uint32Array(Math.ceil(capacity / WORD_BITS));
  }
  function bitsetFromIndices(indices, capacity) {
    const bitset = createBitset(capacity);
    for (const index of indices) {
      setBit(bitset, index);
    }
    return bitset;
  }
  function bitsetCapacity(bitset) {
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
    const word = bitset[index >>> 5];
    return word !== void 0 && (word & 1 << (index & 31)) !== 0;
  }
  function hasAllBits(bitset, bits) {
    for (let i = 0; i < bits.length; i++) {
      if ((bitset[i] & bits[i]) !== bits[i]) {
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
  function isBitsetEmpty(bitset) {
    for (let i = 0; i < bitset.length; i++) {
      if (bitset[i] !== 0) {
        return false;
      }
    }
    return true;
  }
  function bitsetEquals(a, b) {
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
  function clearBitset(bitset) {
    bitset.fill(0);
  }
  function cloneBitset(bitset) {
    return bitset.slice();
  }
  function bitsetToString(bitset) {
    let result = "";
    for (let i = bitset.length - 1; i >= 0; i--) {
      result += bitset[i].toString(2).padStart(WORD_BITS, "0");
    }
    return result;
  }
})();
