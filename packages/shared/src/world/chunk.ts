import { AIR_BLOCK_ID, CHUNK_SIZE_Y, CHUNK_VOLUME } from "../constants.js";
import {
  isLocalInBounds,
  localToIndex,
  type ChunkPos,
  type LocalPos,
} from "./coords.js";

export type BlockId = number;

/** Column of voxels (16×128×16). Block ids index into the block registry. */
export interface Chunk {
  chunkX: number;
  chunkZ: number;
  blocks: Uint16Array;
  /** Block edits not yet persisted. */
  dirty: boolean;
  /** Mesh out of date with block data. */
  meshDirty: boolean;
  generated: boolean;
  populated: boolean;
}

export function createChunk(pos: ChunkPos): Chunk {
  return {
    chunkX: pos.chunkX,
    chunkZ: pos.chunkZ,
    blocks: new Uint16Array(CHUNK_VOLUME),
    dirty: false,
    meshDirty: false,
    generated: false,
    populated: false,
  };
}

/** Returns AIR for any out-of-bounds local position. */
export function getBlock(chunk: Chunk, local: LocalPos): BlockId {
  if (!isLocalInBounds(local)) return AIR_BLOCK_ID;
  return chunk.blocks[localToIndex(local)] ?? AIR_BLOCK_ID;
}

/**
 * Sets a block and marks the chunk dirty. Returns false (no-op) when the
 * position is out of bounds or the block is unchanged.
 */
export function setBlock(chunk: Chunk, local: LocalPos, id: BlockId): boolean {
  if (!isLocalInBounds(local)) return false;
  const index = localToIndex(local);
  if (chunk.blocks[index] === id) return false;
  chunk.blocks[index] = id;
  chunk.dirty = true;
  chunk.meshDirty = true;
  return true;
}

/** Highest non-air block y in the column, or -1 if the column is empty. */
export function highestBlockY(chunk: Chunk, x: number, z: number): number {
  for (let y = CHUNK_SIZE_Y - 1; y >= 0; y--) {
    if (getBlock(chunk, { x, y, z }) !== AIR_BLOCK_ID) return y;
  }
  return -1;
}
