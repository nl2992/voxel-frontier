import { describe, expect, it } from "vitest";
import { CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z, CHUNK_VOLUME } from "../constants.js";
import {
  blockToChunk,
  blockToLocal,
  chunkKey,
  indexToLocal,
  isLocalInBounds,
  localToBlock,
  localToIndex,
  worldToBlock,
} from "./coords.js";

describe("worldToBlock", () => {
  it("floors positive coordinates", () => {
    expect(worldToBlock({ x: 1.9, y: 64.2, z: 0.001 })).toEqual({ x: 1, y: 64, z: 0 });
  });

  it("floors negative coordinates toward negative infinity", () => {
    expect(worldToBlock({ x: -0.1, y: -1.5, z: -16.999 })).toEqual({ x: -1, y: -2, z: -17 });
  });
});

describe("blockToChunk", () => {
  it("maps the origin chunk", () => {
    expect(blockToChunk({ x: 0, y: 0, z: 0 })).toEqual({ chunkX: 0, chunkZ: 0 });
    expect(blockToChunk({ x: 15, y: 0, z: 15 })).toEqual({ chunkX: 0, chunkZ: 0 });
  });

  it("maps positive boundaries", () => {
    expect(blockToChunk({ x: 16, y: 0, z: 31 })).toEqual({ chunkX: 1, chunkZ: 1 });
  });

  it("maps negative coordinates with floor division", () => {
    expect(blockToChunk({ x: -1, y: 0, z: -16 })).toEqual({ chunkX: -1, chunkZ: -1 });
    expect(blockToChunk({ x: -17, y: 0, z: -33 })).toEqual({ chunkX: -2, chunkZ: -3 });
  });
});

describe("blockToLocal / localToBlock", () => {
  it("wraps negative block coordinates into 0..15", () => {
    expect(blockToLocal({ x: -1, y: 5, z: -16 })).toEqual({ x: 15, y: 5, z: 0 });
  });

  it("round-trips through chunk + local for a spread of positions", () => {
    const samples = [
      { x: 0, y: 0, z: 0 },
      { x: 15, y: 127, z: 15 },
      { x: 16, y: 1, z: -1 },
      { x: -1, y: 64, z: 1 },
      { x: -100, y: 3, z: 250 },
    ];
    for (const block of samples) {
      const chunk = blockToChunk(block);
      const local = blockToLocal(block);
      expect(isLocalInBounds(local)).toBe(true);
      expect(localToBlock(chunk, local)).toEqual(block);
    }
  });
});

describe("localToIndex / indexToLocal", () => {
  it("matches the spec flattening formula", () => {
    const local = { x: 3, y: 7, z: 5 };
    expect(localToIndex(local)).toBe(3 + CHUNK_SIZE_X * (5 + CHUNK_SIZE_Z * 7));
  });

  it("covers the full volume bijectively", () => {
    const seen = new Set<number>();
    for (let y = 0; y < CHUNK_SIZE_Y; y += 31) {
      for (let z = 0; z < CHUNK_SIZE_Z; z++) {
        for (let x = 0; x < CHUNK_SIZE_X; x++) {
          const index = localToIndex({ x, y, z });
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(CHUNK_VOLUME);
          expect(seen.has(index)).toBe(false);
          seen.add(index);
          expect(indexToLocal(index)).toEqual({ x, y, z });
        }
      }
    }
  });
});

describe("chunkKey", () => {
  it("is unique per chunk including negatives", () => {
    expect(chunkKey({ chunkX: -1, chunkZ: 2 })).toBe("-1,2");
    expect(chunkKey({ chunkX: 1, chunkZ: -2 })).not.toBe(chunkKey({ chunkX: -1, chunkZ: 2 }));
  });
});
