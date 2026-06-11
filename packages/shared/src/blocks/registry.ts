import { AIR_BLOCK_ID } from "../constants.js";
import type { BlockId } from "../world/chunk.js";

export type ToolType = "hand" | "pick" | "axe" | "shovel";

export interface ItemDrop {
  item: string;
  count: number;
}

/** Per-face texture tile names; "all" applies to any face not overridden. */
export interface BlockTextureSet {
  all?: string;
  top?: string;
  bottom?: string;
  side?: string;
}

/** Data-driven block definition, loaded from data/blocks/*.json. SPEC §2.2. */
export interface BlockDef {
  key: string;
  displayName: string;
  solid: boolean;
  opaque: boolean;
  liquid?: boolean;
  /** Break-time scalar; <0 means unbreakable. */
  hardness: number;
  toolType?: ToolType;
  drops?: ItemDrop[];
  textures?: BlockTextureSet;
  /** Emitted block light, 0–15. */
  emitsLight?: number;
  climbable?: boolean;
  gravityAffected?: boolean;
}

/** A registered block: definition plus its assigned runtime id. */
export interface RegisteredBlock extends BlockDef {
  id: BlockId;
}

export interface BlockRegistry {
  byId(id: BlockId): RegisteredBlock | undefined;
  byKey(key: string): RegisteredBlock | undefined;
  /** Throws if the key is unknown — for code paths where the block must exist. */
  idOf(key: string): BlockId;
  all(): readonly RegisteredBlock[];
}

/**
 * Builds a registry from raw definitions. Ids are assigned by array order so
 * the same data file always yields the same ids (stable for save files within
 * a schema version). The "air" definition is required and pinned to id 0.
 */
export function createBlockRegistry(defs: BlockDef[]): BlockRegistry {
  const byKey = new Map<string, RegisteredBlock>();
  const byId: RegisteredBlock[] = [];

  const airIndex = defs.findIndex((d) => d.key === "air");
  if (airIndex === -1) {
    throw new Error('Block registry requires an "air" definition');
  }
  const ordered = [defs[airIndex]!, ...defs.filter((_, i) => i !== airIndex)];

  for (const [id, def] of ordered.entries()) {
    validateDef(def);
    if (byKey.has(def.key)) {
      throw new Error(`Duplicate block key: ${def.key}`);
    }
    const registered: RegisteredBlock = { ...def, id };
    byKey.set(def.key, registered);
    byId.push(registered);
  }

  if (byId[AIR_BLOCK_ID]!.key !== "air") {
    throw new Error("Air must occupy block id 0");
  }

  return {
    byId: (id) => byId[id],
    byKey: (key) => byKey.get(key),
    idOf: (key) => {
      const block = byKey.get(key);
      if (!block) throw new Error(`Unknown block key: ${key}`);
      return block.id;
    },
    all: () => byId,
  };
}

function validateDef(def: BlockDef): void {
  if (!def.key || !/^[a-z0-9_]+$/.test(def.key)) {
    throw new Error(`Invalid block key: ${JSON.stringify(def.key)}`);
  }
  if (typeof def.hardness !== "number" || Number.isNaN(def.hardness)) {
    throw new Error(`Block ${def.key}: hardness must be a number`);
  }
  if (def.emitsLight !== undefined && (def.emitsLight < 0 || def.emitsLight > 15)) {
    throw new Error(`Block ${def.key}: emitsLight must be 0-15`);
  }
  for (const drop of def.drops ?? []) {
    if (drop.count < 0) {
      throw new Error(`Block ${def.key}: drop count must be >= 0`);
    }
  }
}
