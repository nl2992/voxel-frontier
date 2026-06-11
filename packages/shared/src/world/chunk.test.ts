import { describe, expect, it } from "vitest";
import { AIR_BLOCK_ID, CHUNK_VOLUME } from "../constants.js";
import { createChunk, getBlock, highestBlockY, setBlock } from "./chunk.js";

describe("createChunk", () => {
  it("starts as all air, clean, ungenerated", () => {
    const chunk = createChunk({ chunkX: 2, chunkZ: -3 });
    expect(chunk.chunkX).toBe(2);
    expect(chunk.chunkZ).toBe(-3);
    expect(chunk.blocks.length).toBe(CHUNK_VOLUME);
    expect(chunk.blocks.every((b) => b === AIR_BLOCK_ID)).toBe(true);
    expect(chunk.dirty).toBe(false);
    expect(chunk.generated).toBe(false);
  });
});

describe("setBlock / getBlock", () => {
  it("round-trips a block id and marks the chunk dirty", () => {
    const chunk = createChunk({ chunkX: 0, chunkZ: 0 });
    expect(setBlock(chunk, { x: 5, y: 60, z: 9 }, 3)).toBe(true);
    expect(getBlock(chunk, { x: 5, y: 60, z: 9 })).toBe(3);
    expect(chunk.dirty).toBe(true);
    expect(chunk.meshDirty).toBe(true);
  });

  it("is a no-op when the block is unchanged", () => {
    const chunk = createChunk({ chunkX: 0, chunkZ: 0 });
    setBlock(chunk, { x: 1, y: 1, z: 1 }, 7);
    chunk.dirty = false;
    chunk.meshDirty = false;
    expect(setBlock(chunk, { x: 1, y: 1, z: 1 }, 7)).toBe(false);
    expect(chunk.dirty).toBe(false);
  });

  it("rejects out-of-bounds writes and reads air out of bounds", () => {
    const chunk = createChunk({ chunkX: 0, chunkZ: 0 });
    expect(setBlock(chunk, { x: -1, y: 0, z: 0 }, 5)).toBe(false);
    expect(setBlock(chunk, { x: 0, y: 128, z: 0 }, 5)).toBe(false);
    expect(setBlock(chunk, { x: 0, y: 0, z: 16 }, 5)).toBe(false);
    expect(getBlock(chunk, { x: 99, y: 0, z: 0 })).toBe(AIR_BLOCK_ID);
    expect(chunk.dirty).toBe(false);
  });
});

describe("highestBlockY", () => {
  it("finds the top non-air block in a column", () => {
    const chunk = createChunk({ chunkX: 0, chunkZ: 0 });
    expect(highestBlockY(chunk, 4, 4)).toBe(-1);
    setBlock(chunk, { x: 4, y: 10, z: 4 }, 2);
    setBlock(chunk, { x: 4, y: 63, z: 4 }, 2);
    expect(highestBlockY(chunk, 4, 4)).toBe(63);
  });
});
