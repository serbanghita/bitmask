import { bench, describe } from "vitest";
import { addBit, hasAnyOfBits, hasBit, removeBit } from "./bitmask.ts";
import { hasAllBits, hasAnyBits, isBitsetEmpty, setBit, clearBit, bitsetFromIndices, type Bitset } from "./bitset.ts";

/**
 * Benchmarks for serbanghita/ecs#10: BigInt masks vs segmented Uint32Array bitsets.
 *
 * Scenarios mirror the ECS hot paths:
 * - query match: none -> all -> any evaluation of one entity against one query
 * - mutation: add/remove a component on an entity signature
 * - notify: for every query, test whether the mutated component is in its all/any/none filter
 *
 * Run with `npm run bench`.
 */

const COMPONENT_COUNTS = [16, 32, 64, 128];
const ENTITIES = 1000;
const QUERIES = 32;

let sink = 0;

function seededRandom(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

type Scenario = {
    componentCount: number;
    entityIndices: number[][];
    queryIndices: { all: number[]; any: number[]; none: number[] }[];
    mutations: { entity: number; component: number }[];
};

function buildScenario(componentCount: number): Scenario {
    const random = seededRandom(componentCount * 7919);
    const pick = (count: number, exclude: Set<number> = new Set()) => {
        const picked = new Set<number>();
        while (picked.size < count) {
            const index = Math.floor(random() * componentCount);
            if (!exclude.has(index)) picked.add(index);
        }
        return [...picked];
    };

    const entityIndices: number[][] = [];
    for (let i = 0; i < ENTITIES; i++) {
        entityIndices.push(pick(Math.max(1, Math.floor(componentCount / 4))));
    }

    const queryIndices: Scenario["queryIndices"] = [];
    for (let i = 0; i < QUERIES; i++) {
        const all = pick(2);
        const any = pick(2, new Set(all));
        const none = pick(1, new Set([...all, ...any]));
        queryIndices.push({ all, any, none });
    }

    const mutations: Scenario["mutations"] = [];
    for (let i = 0; i < ENTITIES; i++) {
        mutations.push({ entity: i, component: Math.floor(random() * componentCount) });
    }

    return { componentCount, entityIndices, queryIndices, mutations };
}

function toBigInt(indices: number[]): bigint {
    let mask = 0n;
    for (const index of indices) mask = addBit(mask, 1n << BigInt(index));
    return mask;
}

type BigIntQuery = { all: bigint; any: bigint; none: bigint };
type BitsetQuery = { all: Bitset; any: Bitset; none: Bitset; hasAll: boolean; hasAny: boolean; hasNone: boolean };

function matchBigInt(entity: bigint, query: BigIntQuery): boolean {
    if (query.none !== 0n && hasAnyOfBits(entity, query.none)) return false;
    if (query.all !== 0n && !hasBit(entity, query.all)) return false;
    if (query.any !== 0n && !hasAnyOfBits(entity, query.any)) return false;
    return true;
}

function matchBitset(entity: Bitset, query: BitsetQuery): boolean {
    if (query.hasNone && hasAnyBits(entity, query.none)) return false;
    if (query.hasAll && !hasAllBits(entity, query.all)) return false;
    if (query.hasAny && !hasAnyBits(entity, query.any)) return false;
    return true;
}

for (const componentCount of COMPONENT_COUNTS) {
    const scenario = buildScenario(componentCount);

    const bigIntEntities = scenario.entityIndices.map(toBigInt);
    const bigIntQueries: BigIntQuery[] = scenario.queryIndices.map((q) => ({
        all: toBigInt(q.all),
        any: toBigInt(q.any),
        none: toBigInt(q.none),
    }));
    const bigIntComponentBits = scenario.mutations.map((m) => 1n << BigInt(m.component));

    const bitsetEntities = scenario.entityIndices.map((indices) => bitsetFromIndices(indices, componentCount));
    const bitsetQueries: BitsetQuery[] = scenario.queryIndices.map((q) => {
        const all = bitsetFromIndices(q.all, componentCount);
        const any = bitsetFromIndices(q.any, componentCount);
        const none = bitsetFromIndices(q.none, componentCount);
        return { all, any, none, hasAll: !isBitsetEmpty(all), hasAny: !isBitsetEmpty(any), hasNone: !isBitsetEmpty(none) };
    });
    const bitsetComponentMasks = scenario.mutations.map((m) => bitsetFromIndices([m.component], componentCount));

    describe(`${componentCount} components: query match (${ENTITIES} entities x ${QUERIES} queries)`, () => {
        bench("bigint", () => {
            let matches = 0;
            for (let q = 0; q < bigIntQueries.length; q++) {
                const query = bigIntQueries[q];
                for (let e = 0; e < bigIntEntities.length; e++) {
                    if (matchBigInt(bigIntEntities[e], query)) matches++;
                }
            }
            sink += matches;
        });

        bench("uint32array", () => {
            let matches = 0;
            for (let q = 0; q < bitsetQueries.length; q++) {
                const query = bitsetQueries[q];
                for (let e = 0; e < bitsetEntities.length; e++) {
                    if (matchBitset(bitsetEntities[e], query)) matches++;
                }
            }
            sink += matches;
        });
    });

    describe(`${componentCount} components: mutation add+remove (${ENTITIES} entities)`, () => {
        const bigIntSignatures = bigIntEntities.slice();
        bench("bigint", () => {
            for (let i = 0; i < scenario.mutations.length; i++) {
                const { entity } = scenario.mutations[i];
                const bit = bigIntComponentBits[i];
                bigIntSignatures[entity] = addBit(bigIntSignatures[entity], bit);
                bigIntSignatures[entity] = removeBit(bigIntSignatures[entity], bit);
            }
        });

        const bitsetSignatures = bitsetEntities.map((b) => b.slice());
        bench("uint32array", () => {
            for (let i = 0; i < scenario.mutations.length; i++) {
                const { entity, component } = scenario.mutations[i];
                setBit(bitsetSignatures[entity], component);
                clearBit(bitsetSignatures[entity], component);
            }
        });
    });

    describe(`${componentCount} components: notify queries of mutation (${ENTITIES} mutations x ${QUERIES} queries)`, () => {
        bench("bigint", () => {
            let hits = 0;
            for (let i = 0; i < bigIntComponentBits.length; i++) {
                const bit = bigIntComponentBits[i];
                for (let q = 0; q < bigIntQueries.length; q++) {
                    const query = bigIntQueries[q];
                    if (hasBit(query.none, bit) || hasBit(query.all, bit) || hasBit(query.any, bit)) hits++;
                }
            }
            sink += hits;
        });

        bench("uint32array", () => {
            let hits = 0;
            for (let i = 0; i < bitsetComponentMasks.length; i++) {
                const mask = bitsetComponentMasks[i];
                for (let q = 0; q < bitsetQueries.length; q++) {
                    const query = bitsetQueries[q];
                    if (hasAnyBits(query.none, mask) || hasAnyBits(query.all, mask) || hasAnyBits(query.any, mask)) hits++;
                }
            }
            sink += hits;
        });
    });
}

export { sink };
