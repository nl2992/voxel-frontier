# Voxel Frontier

An original voxel sandbox survival game — procedural block worlds, mining, crafting, inventory, simple mobs, day-night cycle, save/load, and (later) multiplayer. Built as a genre exercise with entirely original assets, names, and mechanics.

## Stack

- TypeScript + Vite + Three.js (client)
- Node.js + TypeScript WebSocket server (multiplayer, later phases)
- Monorepo: `apps/client`, `apps/server`, `packages/shared`, data-driven registries in `data/`

## Docs

- [Spec](docs/SPEC.md) — full game/engine specification
- [Roadmap](docs/ROADMAP.md) — phase status and TODOs
- [Changelog](docs/CHANGELOG.md) — per-iteration implementation notes

## Development

```sh
npm install
npm run dev    # client dev server
npm test       # unit tests
npm run build  # production build
```

(Commands come online as Phase 1 lands — see the roadmap.)
