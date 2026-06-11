import { CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z } from "../constants.js";
import type { Vec3 } from "../math/vec3.js";

/** Integer block coordinate in world space. */
export interface BlockPos {
  x: number;
  y: number;
  z: number;
}

/** Horizontal chunk coordinate. */
export interface ChunkPos {
  chunkX: number;
  chunkZ: number;
}

/** Block coordinate local to a chunk (0..CHUNK_SIZE-1 on each axis). */
export interface LocalPos {
  x: number;
  y: number;
  z: number;
}

/** Floating-point world position → integer block position (floor, correct for negatives). */
export function worldToBlock(pos: Vec3): BlockPos {
  return { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) };
}

/** Block position → chunk coordinate (floor division, correct for negatives). */
export function blockToChunk(pos: BlockPos): ChunkPos {
  return {
    chunkX: Math.floor(pos.x / CHUNK_SIZE_X),
    chunkZ: Math.floor(pos.z / CHUNK_SIZE_Z),
  };
}

/** Block position → coordinate local to its containing chunk. */
export function blockToLocal(pos: BlockPos): LocalPos {
  return {
    x: ((pos.x % CHUNK_SIZE_X) + CHUNK_SIZE_X) % CHUNK_SIZE_X,
    y: pos.y,
    z: ((pos.z % CHUNK_SIZE_Z) + CHUNK_SIZE_Z) % CHUNK_SIZE_Z,
  };
}

/** Chunk coordinate + local position → absolute block position. */
export function localToBlock(chunk: ChunkPos, local: LocalPos): BlockPos {
  return {
    x: chunk.chunkX * CHUNK_SIZE_X + local.x,
    y: local.y,
    z: chunk.chunkZ * CHUNK_SIZE_Z + local.z,
  };
}

/** Flatten a local position into a chunk block-array index. SPEC §2.3. */
export function localToIndex(local: LocalPos): number {
  return local.x + CHUNK_SIZE_X * (local.z + CHUNK_SIZE_Z * local.y);
}

/** Inverse of localToIndex. */
export function indexToLocal(index: number): LocalPos {
  const x = index % CHUNK_SIZE_X;
  const z = Math.floor(index / CHUNK_SIZE_X) % CHUNK_SIZE_Z;
  const y = Math.floor(index / (CHUNK_SIZE_X * CHUNK_SIZE_Z));
  return { x, y, z };
}

export function isLocalInBounds(local: LocalPos): boolean {
  return (
    local.x >= 0 && local.x < CHUNK_SIZE_X &&
    local.y >= 0 && local.y < CHUNK_SIZE_Y &&
    local.z >= 0 && local.z < CHUNK_SIZE_Z
  );
}

/** Stable string key for chunk maps. */
export function chunkKey(pos: ChunkPos): string {
  return `${pos.chunkX},${pos.chunkZ}`;
}
