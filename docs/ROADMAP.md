# Roadmap

Phase status against [SPEC.md](SPEC.md) §27. Each loop iteration updates this file.

## Phase status

- [ ] Phase 1 — Engine foundation (window/canvas, FP camera, movement, flat world, block registry, cube rendering, crosshair)
- [ ] Phase 2 — Chunks (data structure, generation, meshing, load/unload, render distance)
- [ ] Phase 3 — Procedural terrain (seeded heightmap, layers, biomes, trees, ores)
- [ ] Phase 4 — Interaction (raycast, break, place, hotbar, item stacks)
- [ ] Phase 5 — Crafting and survival (inventory UI, recipes, durability, health, hunger/stamina, fall damage)
- [ ] Phase 6 — Save/load (world metadata, chunk persistence, player persistence, save UI)
- [ ] Phase 7 — Entities (ECS, passive/hostile mobs, AI, combat, drops)
- [ ] Phase 8 — Multiplayer (server, connection, player sync, shared edits, chat, validation)
- [ ] Phase 9 — Polish (audio, settings, particles, lighting, UI, perf)

## TODO (priority order)

1. **P0** Client app boot: Vite + Three.js app in `apps/client`, canvas, render loop, crosshair.
2. **P1** Renderer: chunk meshing with face culling, placeholder texture atlas (original textures).
3. **P1** First-person controller: pointer lock, AABB collision resolved per-axis, gravity, jump.
4. **P1** Deterministic seeded terrain (heightmap + layers), determinism tests.
5. **P2** Raycast block selection, break/place, remesh dirty chunks + neighbors.
6. **P2** Hotbar + inventory operations with stack invariant tests.
7. **P2** Item registry (`data/items/`) mirroring the block registry pattern.
8. **P3** Light data (sunlight/blocklight nibbles) on chunks — deferred from chunk model until lighting lands.

## Done

- 2026-06-11 Project boot: npm workspaces monorepo, TypeScript strict base config, vitest 3.
- 2026-06-11 `@voxel-frontier/shared`: vec3 math, coordinate conversion (world→block→chunk→local→index, negative-safe), chunk data model (16×16×128 Uint16Array, dirty flags, bounds-safe get/set), data-driven block registry loading `data/blocks/blocks.json` (25 blocks, air pinned to id 0, validation). 24 unit tests passing.
