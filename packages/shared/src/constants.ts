/** World constants shared by client and server. See docs/SPEC.md §2. */

export const CHUNK_SIZE_X = 16;
export const CHUNK_SIZE_Z = 16;
export const CHUNK_SIZE_Y = 128;

/** Blocks per chunk. */
export const CHUNK_VOLUME = CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z;

export const SEA_LEVEL = 62;

/** Reserved block id for empty space; the registry pins the "air" key to it. */
export const AIR_BLOCK_ID = 0;

export const SURVIVAL_REACH = 5;
export const CREATIVE_REACH = 8;

export const DEFAULT_STACK_SIZE = 64;
