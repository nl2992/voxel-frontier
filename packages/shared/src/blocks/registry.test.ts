import { describe, expect, it } from "vitest";
import blockData from "../../../../data/blocks/blocks.json";
import { AIR_BLOCK_ID } from "../constants.js";
import { createBlockRegistry, type BlockDef } from "./registry.js";

const defs = blockData as BlockDef[];

describe("createBlockRegistry with data/blocks/blocks.json", () => {
  it("loads every definition with air pinned to id 0", () => {
    const registry = createBlockRegistry(defs);
    expect(registry.all().length).toBe(defs.length);
    expect(registry.byId(AIR_BLOCK_ID)?.key).toBe("air");
    expect(registry.idOf("air")).toBe(AIR_BLOCK_ID);
  });

  it("assigns stable ids for the same data ordering", () => {
    const a = createBlockRegistry(defs);
    const b = createBlockRegistry(defs);
    for (const block of a.all()) {
      expect(b.byKey(block.key)?.id).toBe(block.id);
    }
  });

  it("resolves lookups consistently by id and key", () => {
    const registry = createBlockRegistry(defs);
    const stone = registry.byKey("stone_raw");
    expect(stone).toBeDefined();
    expect(registry.byId(stone!.id)).toBe(stone);
    expect(stone!.solid).toBe(true);
    expect(stone!.toolType).toBe("pick");
  });

  it("exposes light emitters from data", () => {
    const registry = createBlockRegistry(defs);
    expect(registry.byKey("torch")?.emitsLight).toBe(14);
    expect(registry.byKey("lava_source")?.emitsLight).toBe(15);
  });
});

describe("createBlockRegistry validation", () => {
  const air: BlockDef = { key: "air", displayName: "Air", solid: false, opaque: false, hardness: 0 };

  it("requires an air definition", () => {
    expect(() => createBlockRegistry([{ ...air, key: "stone" }])).toThrow(/air/);
  });

  it("rejects duplicate keys", () => {
    const dup: BlockDef = { key: "dirt", displayName: "Dirt", solid: true, opaque: true, hardness: 1 };
    expect(() => createBlockRegistry([air, dup, { ...dup }])).toThrow(/Duplicate/);
  });

  it("rejects invalid keys and out-of-range light", () => {
    expect(() => createBlockRegistry([air, { ...air, key: "Bad Key" }])).toThrow(/Invalid block key/);
    expect(() => createBlockRegistry([air, { ...air, key: "lamp", emitsLight: 16 }])).toThrow(/emitsLight/);
  });

  it("rejects negative drop counts", () => {
    expect(() =>
      createBlockRegistry([air, { ...air, key: "ore", drops: [{ item: "x", count: -1 }] }]),
    ).toThrow(/drop count/);
  });

  it("returns undefined for unknown lookups and throws from idOf", () => {
    const registry = createBlockRegistry([air]);
    expect(registry.byKey("nope")).toBeUndefined();
    expect(registry.byId(99)).toBeUndefined();
    expect(() => registry.idOf("nope")).toThrow(/Unknown block key/);
  });
});
