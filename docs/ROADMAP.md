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

1. **P0** Project boot: monorepo workspaces, Vite client app, vitest, tsconfig, lint.
2. **P0** Shared package: math utils, coordinate conversion, block registry loading from `data/blocks/`.
3. **P0** Chunk data model (16×16×128, Uint16Array, flatten index) + unit tests.
4. **P1** Renderer: Three.js scene, chunk meshing with face culling, placeholder texture atlas.
5. **P1** First-person controller: pointer lock, AABB collision resolved per-axis, gravity, jump.
6. **P1** Deterministic seeded terrain (heightmap + layers), determinism tests.
7. **P2** Raycast block selection, break/place, remesh dirty chunks + neighbors.
8. **P2** Hotbar + inventory operations with stack invariant tests.

## Done

(nothing yet — repo scaffold only)
