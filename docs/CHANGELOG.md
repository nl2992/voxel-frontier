# Changelog

Newest first. Each loop iteration records what changed, what was verified, and what remains.

## 2026-06-11 — Iteration 1: project boot + shared core

**Changed**
- Root: npm workspaces (`apps/*`, `packages/*`), strict `tsconfig.base.json`, vitest 3, scripts (`test`, `build`, `typecheck`).
- `packages/shared`: `constants.ts` (chunk 16×16×128, sea level 62, reach, stack size), `math/vec3.ts`, `world/coords.ts` (negative-safe floor/wrap conversions + spec flatten formula), `world/chunk.ts` (Uint16Array chunk, dirty/meshDirty flags, bounds-safe get/set, highestBlockY), `blocks/registry.ts` (data-driven, validates keys/hardness/light/drops, air pinned to id 0, ids stable by data order).
- `data/blocks/blocks.json`: 25 original block definitions (terrain, ores, organic, liquids, crafted; original naming — e.g. `deep_base` not "bedrock", `furnace_kiln`, `storage_crate`).

**Verified**
- `npm test`: 24/24 tests pass (coords incl. negatives, chunk index bijection, chunk get/set invariants, registry load/validation).
- `npm run typecheck`: clean composite build of shared.
- `npm audit`: 0 vulnerabilities after bumping vitest 2→3.

**Remaining**
- No client app yet (next: Vite + Three.js boot, render loop).
- Light array deferred from chunk struct until lighting phase.
- No item registry yet; drops reference item keys that don't resolve anywhere.

## 2026-06-11 — Repo scaffold

- Initialized repository with spec ([SPEC.md](SPEC.md)), roadmap, changelog, README, .gitignore.
- No code yet; first loop iteration starts with project boot/build/test setup.
