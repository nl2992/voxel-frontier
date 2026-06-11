# Voxel Frontier — Exhaustive Spec

> Original voxel sandbox game. This is a genre exercise, **not** a Minecraft clone.
> Do not use Minecraft's name, textures, sounds, models, UI, mobs, item names, or branding.

## 0. Project framing

Working title: **Voxel Frontier**.

Goal: build a first-person/third-person sandbox survival game with block-based terrain, procedural worlds, mining, crafting, inventory, simple mobs, day-night cycle, saving/loading, and optional multiplayer.

Non-goal: copying Minecraft assets, exact recipes, mob designs, item names, UI layout, sound effects, or branded terminology.

Core fantasy: the player wakes in a procedurally generated voxel world, gathers materials, shapes the terrain, crafts tools, survives environmental threats, explores biomes, and builds structures.

Primary modes:

1. Creative mode: unlimited blocks, flying, no health/damage.
2. Survival mode: health, hunger/stamina, resource gathering, crafting, mobs.
3. Debug/developer mode: world inspection, chunk boundaries, lighting view, entity stats.

## 1. Technical architecture

### 1.1 Recommended default stack

For fastest implementation:

Frontend/client:

* TypeScript
* Three.js or Babylon.js
* Vite
* WebGL/WebGPU where available
* Zustand or ECS-style state management

Backend:

* Node.js + TypeScript
* WebSocket authoritative server
* SQLite for local persistence or PostgreSQL for multiplayer worlds
* Redis optional for session/cache state

Alternative serious-engine stack:

* Godot 4 with GDScript/C#
* Unity with C#
* Bevy/Rust
* Unreal/C++ for larger-scale engine work

### 1.2 High-level modules

Client:

* Renderer
* Chunk mesh generator
* Input controller
* Player physics
* Inventory UI
* Crafting UI
* Audio system
* Network sync
* Local save cache
* Debug overlay

Server:

* World generator
* Chunk storage
* Entity simulation
* Player session manager
* Anti-cheat validation
* Inventory authority
* Crafting validation
* Persistence layer
* Admin commands

Shared:

* Block registry
* Item registry
* Recipe registry
* Entity definitions
* World constants
* Network protocol types

## 2. World model

### 2.1 Coordinate system

Use integer voxel coordinates:

```text
World position: floating-point x, y, z
Block position: integer floor(x), floor(y), floor(z)
Chunk coordinate: floor(block_x / CHUNK_SIZE_X), floor(block_z / CHUNK_SIZE_Z)
Vertical section coordinate: floor(block_y / CHUNK_SIZE_Y)
```

Recommended chunk size:

```text
16 × 16 × 128 for MVP
16 × 16 × 256 for later
```

Use Y as vertical axis.

### 2.2 Block representation

Each block stores:

```ts
type BlockId = number;

interface BlockDef {
  id: BlockId;
  key: string;
  displayName: string;
  solid: boolean;
  opaque: boolean;
  transparent: boolean;
  liquid: boolean;
  hardness: number;
  toolType?: "hand" | "pick" | "axe" | "shovel";
  drops: ItemDrop[];
  textures: BlockTextureSet;
  emitsLight?: number;
  friction?: number;
  climbable?: boolean;
  gravityAffected?: boolean;
}
```

MVP block types:

Terrain:

* Air
* Grass soil
* Dirt
* Stone
* Sand
* Gravel
* Clay
* Snow

Natural resources:

* Coal ore
* Copper ore
* Iron ore
* Gold ore
* Crystal ore
* Salt
* Sulfur

Organic:

* Tree trunk
* Leaves
* Bush
* Tall grass
* Flower
* Mushroom

Liquids:

* Water source
* Water flow
* Lava source
* Lava flow

Crafted/building:

* Planks
* Stairs
* Slab
* Wall
* Door
* Glass
* Torch
* Furnace
* Chest
* Crafting bench
* Ladder

Functional:

* Spawn marker
* Light block
* Debug block

### 2.3 Chunk data structure

Each chunk stores:

```ts
interface Chunk {
  chunkX: number;
  chunkZ: number;
  minY: number;
  maxY: number;
  blocks: Uint16Array;
  light: Uint8Array;
  metadata?: Map<number, BlockMetadata>;
  dirty: boolean;
  meshDirty: boolean;
  generated: boolean;
  populated: boolean;
}
```

Flattening formula:

```ts
index = x + CHUNK_SIZE_X * (z + CHUNK_SIZE_Z * y)
```

### 2.4 Chunk lifecycle

States:

```text
Unloaded
Requested
Generated
Populated
Meshed
Active
Dirty
Saved
Unloaded
```

Client chunk loading:

* Load chunks within render distance.
* Unload chunks outside render distance plus buffer.
* Mesh chunks asynchronously where possible.
* Remesh only changed chunks and neighbor chunk boundaries.

Server chunk loading:

* Keep chunks active around online players.
* Persist dirty chunks periodically.
* Evict inactive chunks after timeout.

## 3. Procedural terrain

### 3.1 Terrain generation pipeline

For each chunk:

1. Generate base heightmap.
2. Apply biome map.
3. Fill terrain layers.
4. Carve caves.
5. Place ores.
6. Place water level.
7. Add surface decorations.
8. Add trees.
9. Add structures.
10. Mark chunk as populated.

### 3.2 Noise fields

Use seeded deterministic noise:

```text
continentalness noise
erosion noise
temperature noise
humidity noise
height noise
cave density noise
ore distribution noise
```

Recommended:

* Simplex/OpenSimplex noise
* Fractal Brownian motion
* Domain warping for less uniform terrain

### 3.3 Biomes

MVP biomes:

1. Plains
2. Forest
3. Desert
4. Snowfield
5. Mountains
6. Swamp
7. Beach
8. Ocean

Each biome defines:

```ts
interface BiomeDef {
  key: string;
  temperature: number;
  humidity: number;
  minHeightBias: number;
  maxHeightBias: number;
  surfaceBlock: BlockId;
  subSurfaceBlock: BlockId;
  treeDensity: number;
  grassDensity: number;
  flowerDensity: number;
  mobWeights: Record<EntityKey, number>;
  ambientColor?: string;
}
```

### 3.4 Terrain layers

Example:

```text
y <= 0: unbreakable base block (do not name it "bedrock")
below surface - 5: stone
surface - 5 to surface - 1: dirt/subsoil
surface: biome surface block
below sea level: water
```

### 3.5 Caves

Cave options:

* 3D noise threshold caves
* Worm/tunnel random-walk caves
* Ravines as stretched noise cuts

MVP:

* Use 3D noise caves below y=60.
* Do not carve through water bodies initially.
* Add cave air pockets and ore exposure.

### 3.6 Ore generation

Ore generation parameters:

```ts
interface OreRule {
  block: BlockId;
  minY: number;
  maxY: number;
  clusterSizeMin: number;
  clusterSizeMax: number;
  clustersPerChunk: number;
  biomeMultiplier?: Record<string, number>;
}
```

MVP ore rules:

* Coal: common, mid/high levels
* Copper: common, mid levels
* Iron: medium, low/mid levels
* Gold: rare, low levels
* Crystal: very rare, deep caves

### 3.7 Structures

MVP structures:

* Small cabin ruins
* Stone circles
* Abandoned mineshafts
* Surface ponds
* Cave shrines
* Trees

Structure placement rules:

* Deterministic by seed.
* Must not overlap water unless designed for it.
* Must fit terrain slope constraints.
* Must be sparse enough to preserve exploration value.

## 4. Rendering

### 4.1 Rendering goal

Render a large voxel world efficiently by converting visible block faces into chunk meshes.

### 4.2 Mesh generation

Naive MVP:

* For every non-air block:
  * Check six neighbors.
  * If neighbor is air/transparent, add face.
* Generate vertices, normals, UVs, indices.

Optimized later:

* Greedy meshing.
* Ambient occlusion.
* Texture atlas.
* Instancing for vegetation.
* Mesh worker threads.

### 4.3 Face culling

A face is visible when:

* The current block is solid/visible.
* The neighbor block is air, transparent, or liquid boundary.
* For transparent blocks, render order must be handled separately.

### 4.4 Texture atlas

Use original generated textures.

Atlas requirements:

* 16×16, 32×32, or 64×64 tile resolution.
* Each block face maps to atlas coordinates.
* Support separate top, bottom, and side textures.

### 4.5 Lighting

MVP lighting:

* Global directional sunlight.
* Simple block light from torches.
* Optional per-vertex ambient occlusion.

Later lighting:

* Sunlight propagation per column.
* Local light BFS propagation.
* Day/night color curves.
* Smooth lighting between voxels.

Light data:

```ts
interface LightValue {
  sunlight: number; // 0-15
  blocklight: number; // 0-15
}
```

### 4.6 Camera

Modes:

* First-person
* Third-person orbit
* Debug freecam

Camera features:

* Mouse look
* FOV setting
* Head bob optional
* Viewmodel/tool rendering
* Collision-safe third-person camera

### 4.7 Visual effects

MVP:

* Block break cracks
* Block placement particles
* Hit particles
* Water surface animation
* Torch flicker
* Fog at render distance

Later:

* Weather particles
* Cloud layer
* Volumetric fog approximation
* Screen-space effects
* Shadows

## 5. Player controller

### 5.1 Movement

Survival:

* Walk
* Sprint
* Jump
* Crouch
* Swim
* Climb ladder
* Fall damage

Creative:

* Fly
* No collision optional
* Fast move
* Vertical ascend/descend

### 5.2 Physics model

Player collider:

* Capsule or AABB
* Recommended size: width 0.6, height 1.8
* Step height: 0.5 blocks
* Gravity: tunable
* Terminal velocity: tunable

Collision:

* Resolve X, Y, Z axes separately.
* Prevent tunneling with swept AABB or small fixed timestep.
* Support solid blocks only for MVP.

### 5.3 Player state

```ts
interface PlayerState {
  id: string;
  username: string;
  position: Vec3;
  velocity: Vec3;
  yaw: number;
  pitch: number;
  health: number;
  maxHealth: number;
  hunger: number;
  stamina: number;
  selectedHotbarSlot: number;
  inventory: Inventory;
  gameMode: "survival" | "creative" | "debug";
  spawnPoint?: Vec3;
}
```

### 5.4 Interaction raycast

Raycast from camera up to reach distance.

MVP reach:

* Survival: 5 blocks
* Creative: 8 blocks

Raycast returns:

* Hit block coordinate
* Hit face normal
* Hit distance
* Adjacent placement coordinate

Actions:

* Left click: damage/break block
* Right click: place block or use item
* Middle click: pick block in creative
* Scroll: change hotbar slot

## 6. Block breaking and placement

### 6.1 Breaking

Each block has hardness.

Break time formula:

```text
break_time = hardness / tool_multiplier
```

Tool multiplier depends on:

* Tool type
* Tool material
* Whether tool is correct for block
* Player status effects, if later added

Breaking states:

* Start
* Continue
* Cancel
* Complete
* Drop item

### 6.2 Placement

Validation:

* Target coordinate is replaceable.
* Player collider does not overlap placed block.
* Item stack count > 0.
* Server approves placement in multiplayer.
* Block-specific orientation is valid.

Metadata:

* Doors need hinge/facing state.
* Stairs need facing/upside-down state.
* Chests need inventory ID.
* Furnaces need processing state.

### 6.3 Block updates

Triggered when:

* Neighbor block changes.
* Liquid updates.
* Gravity block unsupported.
* Light source added/removed.
* Functional block state changes.

## 7. Items and inventory

### 7.1 Item model

```ts
interface ItemDef {
  id: number;
  key: string;
  displayName: string;
  stackSize: number;
  icon: string;
  placeBlockId?: BlockId;
  toolType?: ToolType;
  toolMaterial?: ToolMaterial;
  durability?: number;
  edible?: FoodStats;
  fuelValue?: number;
}
```

### 7.2 Inventory structure

Player:

* Hotbar: 9 slots
* Main inventory: 27 slots
* Armor/equipment optional
* Offhand optional

Containers:

* Chest: 27 slots
* Furnace: input, fuel, output
* Crafting bench: 3×3 grid

Slot:

```ts
interface ItemStack {
  itemId: number;
  count: number;
  durability?: number;
  metadata?: Record<string, unknown>;
}
```

### 7.3 Inventory operations

Must support:

* Pick up stack
* Split stack
* Merge stacks
* Swap slots
* Shift-click transfer
* Drop item
* Drag distribute
* Hotbar number-key swap

Acceptance criteria:

* No item duplication.
* No negative counts.
* Stack size limits enforced.
* Server is authoritative in multiplayer.

## 8. Crafting

### 8.1 Crafting types

MVP:

* 2×2 personal crafting
* 3×3 bench crafting
* Furnace smelting

Later:

* Workstations
* Tool repair
* Recipe discovery
* Recipe book

### 8.2 Recipe model

Shaped recipe:

```ts
interface ShapedRecipe {
  type: "shaped";
  width: number;
  height: number;
  pattern: (ItemKey | null)[];
  output: ItemStack;
}
```

Shapeless recipe:

```ts
interface ShapelessRecipe {
  type: "shapeless";
  inputs: ItemKey[];
  output: ItemStack;
}
```

Smelting recipe:

```ts
interface SmeltingRecipe {
  input: ItemKey;
  output: ItemStack;
  cookTimeSeconds: number;
}
```

### 8.3 MVP recipes

Basic:

* Logs → planks
* Planks → sticks
* Planks → crafting bench
* Stone + fuel → refined stone
* Sand + fuel → glass
* Ore + fuel → ingot

Tools:

* Wooden pick
* Stone pick
* Copper pick
* Iron pick
* Axe
* Shovel
* Sword or generic blade

Utility:

* Torch
* Chest
* Furnace
* Ladder
* Door

Keep recipe shapes original enough to avoid direct imitation.

## 9. Tools and durability

### 9.1 Tool categories

Tools:

* Pick: stone/ore blocks
* Axe: wood blocks
* Shovel: soil/sand blocks
* Blade: entity damage
* Hoe optional for farming later

Materials:

* Wood
* Stone
* Copper
* Iron
* Gold
* Crystal

Each material defines:

```ts
interface ToolMaterialDef {
  key: string;
  durability: number;
  speedMultiplier: number;
  damage: number;
  miningTier: number;
}
```

### 9.2 Durability

Durability decreases when:

* Correctly used on block
* Used as weapon
* Used incorrectly, optionally at reduced penalty

When durability reaches zero:

* Tool breaks
* Play sound
* Remove item

## 10. Survival systems

### 10.1 Health

Player stats:

* Health: 0–100
* Hunger: 0–100
* Stamina: 0–100

Damage sources:

* Falling
* Hostile entities
* Lava
* Drowning
* Starvation
* Environmental cold/heat optional

### 10.2 Hunger

Hunger decreases from:

* Sprinting
* Jumping
* Mining
* Time

Food restores hunger and possibly health regeneration.

### 10.3 Death and respawn

On death:

* Drop inventory, configurable.
* Respawn at world spawn or bed-equivalent spawn marker.
* Reset health.
* Keep discovered map optional.

### 10.4 Status effects

Optional:

* Burning
* Poison
* Regeneration
* Slowness
* Cold
* Heat

## 11. Entities and mobs

### 11.1 Entity system

Use ECS-style model.

Components:

* Transform
* Velocity
* Collider
* Health
* AI brain
* Render model
* Inventory
* Lifetime
* Network sync

Entity interface:

```ts
interface Entity {
  id: string;
  type: EntityType;
  position: Vec3;
  velocity: Vec3;
  rotation: Vec3;
  components: ComponentMap;
}
```

### 11.2 Entity types

MVP passive:

* Small grazer
* Bird
* Forest critter

MVP hostile:

* Cave crawler
* Night stalker
* Slime-like blob, but visually distinct
* Flying insect swarm

Utility:

* Dropped item
* Projectile
* Boat/cart later

### 11.3 AI behavior

Passive:

* Wander
* Flee player
* Seek food
* Avoid cliffs/water depending on entity

Hostile:

* Idle
* Detect player by distance/line of sight
* Chase
* Attack
* Retreat if low health optional
* Despawn far from player

Pathfinding MVP:

* Simple steering
* A* on local voxel grid later
* Avoid excessive pathfinding every tick

### 11.4 Spawning

Rules:

* Spawn near player but outside visible radius.
* Respect biome weights.
* Respect light level.
* Respect surface/cave constraints.
* Cap entity count per chunk.

## 12. Combat

### 12.1 Player combat

Inputs:

* Primary attack
* Charged attack optional
* Block/parry optional
* Projectile use optional

Damage formula:

```text
damage = weapon_base_damage × material_multiplier × attack_charge_multiplier
```

### 12.2 Entity combat

Hostile entity attributes:

* Health
* Damage
* Attack cooldown
* Detection radius
* Movement speed
* Knockback resistance

### 12.3 Projectiles

Optional MVP:

* Throwing stone
* Basic bow-equivalent original weapon
* Projectile arc with gravity
* Collision against blocks/entities

## 13. Liquids

### 13.1 MVP liquid behavior

Water:

* Source block
* Flow block
* Horizontal spread up to N blocks
* Downward flow priority
* Flow updates on neighbor changes

Lava:

* Slower flow
* Damages player/entities
* Emits light
* Interacts with water to form stone-like block

### 13.2 Liquid constraints

For MVP, avoid full fluid simulation.

Use cellular update:

* Queue liquid update events.
* Limit max updates per tick.
* Store flow level metadata.

## 14. Time, sky, and weather

### 14.1 Day-night cycle

World time:

* 0 to 1 normalized day value
* Configurable day length, e.g. 20 real minutes

Effects:

* Sky color changes
* Ambient light changes
* Hostile spawn conditions change
* Sun/moon direction changes

### 14.2 Weather

MVP optional:

* Clear
* Rain
* Snow in cold biomes
* Thunderstorm later

Weather state:

```ts
interface WeatherState {
  type: "clear" | "rain" | "snow" | "storm";
  intensity: number;
  remainingSeconds: number;
}
```

## 15. Building system

### 15.1 Block shapes

MVP:

* Full cube
* Cross-plane vegetation
* Slab
* Stair
* Door
* Torch
* Ladder

Later:

* Fence
* Wall
* Trapdoor
* Sign
* Custom block models

### 15.2 Orientation

Placement depends on:

* Player yaw
* Clicked face
* Sneaking/crouch modifier
* Adjacent block support

### 15.3 Structural integrity

Optional original mechanic:

* Unsupported structures degrade or collapse.
* Different materials have different support spans.

This would make the game more distinct from Minecraft.

## 16. UI and UX

### 16.1 HUD

Display:

* Crosshair
* Health
* Hunger/stamina
* Hotbar
* Selected item name
* Damage indicator
* Breath meter underwater
* Debug coordinates optional

### 16.2 Menus

Menus:

* Main menu
* New world
* Load world
* Settings
* Pause
* Inventory
* Crafting
* Chest/container
* Death screen
* Multiplayer server list

### 16.3 Settings

Graphics:

* Render distance
* FOV
* VSync
* FPS cap
* Particles
* Clouds
* Shadows
* Smooth lighting

Controls:

* Key rebinding
* Mouse sensitivity
* Invert Y
* Controller support later

Audio:

* Master
* Music
* Blocks
* Mobs
* UI
* Ambient

Accessibility:

* Subtitles
* High contrast UI
* Reduced motion
* Colorblind-safe indicators
* Hold-to-mine toggle
* Auto-jump optional

## 17. Audio

### 17.1 Audio categories

* Footsteps by block material
* Block break/place
* Tool swing
* Entity sounds
* Ambient biome loops
* Weather
* UI clicks
* Music

### 17.2 Audio rules

Use original sounds only.

Dynamic audio:

* Cave reverb
* Underwater low-pass
* Rain muffling indoors
* Distance attenuation
* Random pitch variation

## 18. Save/load system

### 18.1 World save structure

```text
/worlds/{world_id}/
  world.json
  playerdata/
    {player_id}.json
  chunks/
    region_x_region_z.dat
  entities/
    active_entities.dat
  screenshots/
```

### 18.2 World metadata

```ts
interface WorldMetadata {
  id: string;
  name: string;
  seed: string;
  createdAt: string;
  lastPlayedAt: string;
  version: number;
  gameMode: string;
  worldSpawn: Vec3;
}
```

### 18.3 Chunk persistence

Store only:

* Modified/generated chunks
* Block IDs
* Metadata
* Light values optional
* Entities in chunk

Compression:

* Run-length encoding
* zstd/gzip optional
* Region files later

### 18.4 Versioning

Every save has:

* Game version
* World schema version
* Migration path

Acceptance:

* Old worlds either migrate cleanly or fail with clear error.

## 19. Multiplayer

### 19.1 Multiplayer model

Server authoritative.

Client sends:

* Input commands
* Look direction
* Interaction requests
* Inventory requests
* Chat messages

Server sends:

* Chunk data
* Entity snapshots
* Player snapshots
* Inventory updates
* World events
* Chat messages

### 19.2 Network protocol

Message examples:

```ts
type ClientMessage =
  | { type: "player_input"; seq: number; input: InputState }
  | { type: "break_block_start"; block: BlockPos }
  | { type: "break_block_cancel"; block: BlockPos }
  | { type: "place_block"; block: BlockPos; face: Vec3; itemSlot: number }
  | { type: "inventory_move"; from: SlotRef; to: SlotRef }
  | { type: "chat"; text: string };

type ServerMessage =
  | { type: "chunk_data"; chunkX: number; chunkZ: number; data: ChunkPayload }
  | { type: "block_update"; pos: BlockPos; block: BlockId }
  | { type: "entity_snapshot"; entities: EntitySnapshot[] }
  | { type: "inventory_state"; inventory: Inventory }
  | { type: "error"; code: string; message: string };
```

### 19.3 Multiplayer features

MVP:

* Join server
* See other players
* Shared world edits
* Chat
* Basic inventory authority

Later:

* Permissions
* Whitelist
* Admin commands
* Protected zones
* Server browser
* Voice proximity optional

### 19.4 Anti-cheat baseline

Validate:

* Movement speed
* Reach distance
* Block placement legality
* Inventory operations
* Crafting recipes
* Damage events
* Tool durability
* Chunk edit permissions

## 20. Admin and debug tools

### 20.1 Debug overlay

Display:

* FPS
* Frame time
* Position
* Chunk coordinate
* Facing direction
* Rendered chunks
* Mesh count
* Draw calls
* Memory estimate
* Network ping
* Entity count

### 20.2 Commands

Commands:

* `/tp x y z`
* `/give item count`
* `/setblock x y z block`
* `/time set value`
* `/weather type`
* `/gamemode mode`
* `/spawn entity`
* `/kill entity`
* `/save`
* `/reload`

Use a different command namespace if avoiding similarity.

## 21. Data-driven registries

All content should be loaded from JSON/TOML/YAML where practical.

Registries:

* Blocks
* Items
* Recipes
* Biomes
* Entities
* Structures
* Sounds
* Loot tables

Example block config:

```json
{
  "key": "stone_raw",
  "displayName": "Raw Stone",
  "solid": true,
  "opaque": true,
  "hardness": 3.0,
  "toolType": "pick",
  "drops": [{ "item": "stone_chunk", "count": 1 }],
  "textures": {
    "all": "stone_raw"
  }
}
```

## 22. Modding support

### 22.1 Content packs

Support:

* Custom blocks
* Custom items
* Custom recipes
* Custom textures
* Custom sounds
* Custom biomes

### 22.2 Scripted behavior

Later:

* Lua, JS, or WASM scripting
* Event hooks:
  * onBlockBreak
  * onBlockPlace
  * onEntityDamage
  * onTick
  * onCraft
  * onPlayerJoin

### 22.3 Safety

Sandbox scripts:

* No file system access by default
* No network access by default
* Time budget per tick
* Memory budget

## 23. Testing plan

### 23.1 Unit tests

Test:

* Coordinate conversion
* Chunk indexing
* Block registry loading
* Recipe matching
* Inventory movement
* Stack merging
* Terrain determinism
* Ore placement bounds
* Damage calculations
* Save/load round-trip

### 23.2 Integration tests

Test:

* Generate world from seed
* Load/unload chunks
* Break and place block
* Craft item
* Smelt item
* Kill entity
* Save world, reload, verify edits
* Join multiplayer server
* Two clients edit same chunk

### 23.3 Property tests

Useful invariants:

* No inventory slot has negative count.
* No stack exceeds max stack size.
* Same seed and chunk coordinate always produce same chunk.
* Client cannot place blocks beyond reach.
* Saving then loading preserves block IDs.

### 23.4 Performance tests

Benchmarks:

* Chunk generation time
* Chunk meshing time
* Remesh after single block edit
* Render FPS at 4/8/12/16 chunk radius
* Server tick time with 1/10/50 players
* Network bandwidth per player

Target MVP:

* 60 FPS at 8 chunk render distance on normal desktop hardware.
* Chunk mesh generation below 16 ms average, or async enough not to stall visible gameplay.
* Server tick stable at 20 TPS for small multiplayer.

## 24. Performance requirements

### 24.1 Client targets

MVP:

* 60 FPS at 1080p with render distance 6–8 chunks.
* No visible freeze longer than 100 ms during normal exploration.
* Chunk loading prioritized in view direction.
* Mesh generation off main thread where possible.

### 24.2 Server targets

MVP:

* 20 ticks per second.
* 10 concurrent players.
* 8 chunk simulation radius.
* Persistent world edits.
* Crash-safe periodic save.

### 24.3 Optimizations

Prioritize:

1. Face culling.
2. Texture atlas.
3. Chunk mesh batching.
4. Async chunk generation.
5. Async chunk meshing.
6. Greedy meshing.
7. Frustum culling.
8. Occlusion culling.
9. Compressed network chunk packets.
10. Region-file persistence.

## 25. Art direction

### 25.1 Visual identity

Use a distinct style:

* Softer hand-painted blocks
* Rounded UI panels
* Different color palette
* Distinct creatures
* Different item silhouettes
* Different logo/name

Avoid:

* Minecraft textures
* Minecraft block names where distinctive
* Creeper-like mobs
* Minecraft UI layout
* Minecraft sounds
* Minecraft font/logo treatment

### 25.2 Texture requirements

Each block texture:

* Original
* Tileable
* Consistent resolution
* Has normal/roughness maps optional
* Clearly readable at distance

## 26. Game progression

### 26.1 Early game

Player should:

1. Spawn safely.
2. Gather surface resources.
3. Craft basic tools.
4. Build shelter.
5. Survive first night or equivalent danger cycle.

### 26.2 Mid game

Player should:

1. Explore caves.
2. Mine better resources.
3. Build storage.
4. Smelt ores.
5. Fight stronger mobs.
6. Discover structures.

### 26.3 Late game

Optional:

1. Rare biome exploration.
2. Boss-equivalent encounter.
3. Advanced crafting.
4. Automation.
5. Portals or alternate dimensions, but with original lore and mechanics.
6. Settlement/NPC systems.

## 27. MVP implementation order

### Phase 1 — Engine foundation

Deliver:

* Window/canvas
* First-person camera
* Basic movement
* Static flat voxel world
* Block registry
* Simple cube rendering
* Crosshair

Acceptance:

* Player can walk around a block world.
* Player collides with solid blocks.
* Blocks render with original placeholder textures.

### Phase 2 — Chunks

Deliver:

* Chunk data structure
* Chunk generation
* Chunk meshing
* Chunk loading/unloading
* Render distance

Acceptance:

* World loads around player.
* Moving across chunk boundaries loads new chunks.
* Old chunks unload safely.

### Phase 3 — Procedural terrain

Deliver:

* Seeded heightmap
* Terrain layers
* Basic biomes
* Trees
* Ores

Acceptance:

* Same seed generates same world.
* Chunks align without seams.
* Biomes visibly differ.

### Phase 4 — Interaction

Deliver:

* Raycast selection
* Block breaking
* Block placement
* Hotbar
* Item stacks

Acceptance:

* Player can mine blocks.
* Player can place blocks.
* Inventory updates correctly.

### Phase 5 — Crafting and survival

Deliver:

* Inventory screen
* Crafting recipes
* Tool durability
* Health
* Hunger/stamina
* Fall damage

Acceptance:

* Player can gather resources, craft tools, and survive basic hazards.

### Phase 6 — Save/load

Deliver:

* World metadata
* Chunk persistence
* Player persistence
* Save selection UI

Acceptance:

* Edited world reloads exactly.
* Player inventory and position persist.

### Phase 7 — Entities

Deliver:

* Entity system
* Passive mobs
* Hostile mobs
* Basic AI
* Combat
* Drops

Acceptance:

* Entities spawn, move, take damage, attack, and drop items.

### Phase 8 — Multiplayer

Deliver:

* Server
* Client connection
* Player sync
* Shared chunk edits
* Chat
* Server-side validation

Acceptance:

* Two players can join same world and see each other's edits.

### Phase 9 — Polish

Deliver:

* Audio
* Settings
* Particles
* Lighting improvements
* Better UI
* Debug tooling
* Performance pass

Acceptance:

* Game feels coherent and stable enough for a demo.

## 28. Definition of done

A feature is done only when:

1. It has data definitions.
2. It has implementation.
3. It has tests where practical.
4. It is documented.
5. It has debug visibility.
6. It handles invalid input.
7. It does not duplicate items or corrupt saves.
8. It performs acceptably under target load.
9. It uses original assets/naming.
10. It passes a clean build.

## 29. Repository structure

```text
voxel-frontier/
  apps/
    client/
      src/
        rendering/
        world/
        player/
        ui/
        audio/
        networking/
    server/
      src/
        world/
        chunks/
        entities/
        persistence/
        networking/
        admin/
  packages/
    shared/
      src/
        blocks/
        items/
        recipes/
        biomes/
        protocol/
        math/
  assets/
    textures/
    sounds/
    music/
    models/
  data/
    blocks/
    items/
    recipes/
    biomes/
    structures/
    entities/
  docs/
    SPEC.md
    ARCHITECTURE.md
    ROADMAP.md
    TESTING.md
    CHANGELOG.md
  tests/
    unit/
    integration/
    performance/
```
