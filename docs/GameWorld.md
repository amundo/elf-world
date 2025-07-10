---
title: GameWorld Documentation
file: GameWorld.js
description: Manages the game grid, realm switching, entity generation, camera control, and audio in Elf World.
author: Patrick Hall
last_updated: 2025-07-10
---

# GameWorld.js

The `GameWorld` class is responsible for managing the entire visual and logical grid-based world of **Elf World**. This includes rendering the map, placing entities, handling realm switching, controlling the camera view, and managing background music.

---

## Responsibilities

- Create and render the tile grid
- Manage entities and player placement
- Handle realm data loading and switching
- Apply procedural or custom terrain
- Update camera position and view
- Control background audio playback

---

## Constructor

```js
new GameWorld(config, gameState)
````

* **config**: World dimensions, view size
* **gameState**: Shared game state object (player, conlang, UI, etc.)

Initializes internal structures:

* `tileElements` — DOM tiles
* `entityGrid` — logical occupancy grid
* `camera` — focused region
* `backgroundMusic`, `tileWidth`, `tileHeight`

---

## Initialization

### `initialize()`

Creates the tile grid and applies a viewport resize using fallback dimensions.

### `createTileGrid()`

Generates a 2D DOM grid and stores tile elements in `tileElements`.

---

## Realm Management

### `switchRealm(realmKey)`

* Loads terrain and entities for the given realm
* Clears old entities and regenerates layout
* Updates realm name in conlang
* Plays realm music (if defined)
* Applies a visual transition effect

---

## Terrain Rendering

### `applyTerrain(realm)`

Chooses between custom and procedural terrain rendering.

### `applyCustomTerrain(customTerrain)`

Paints tiles with colors from a predefined 2D array.

### `applyProceduralTerrain(terrain)`

Paints tiles probabilistically using `primary`, `secondary`, and `accent` terrain weights/colors.

---

## Entity Generation

### `generateEntities(realm)`

* Supports both custom and random entity placement
* Falls back to spawn chance definitions if needed
* Always places portals last

### `placeCustomEntities(customEntities)`

Places entities from a 2D grid of definitions, handling `portals` and assigning types/dialogue.

### `generateRandomEntities(realm)`

Randomly places entities based on their `chance` attribute.

### `generateFromSpawns(spawns)`

Fallback generator for unprocessed realm data.

---

### Entity Helpers

* `getEntityType(category)`
* `getEntitySolidity(type, concept)`
* `getEntityDialogue(category, concept)`

Provides derived values for entity attributes based on category or concept.

---

### `placePortals(realm)`

Places realm portals at random available positions, using `realm.portals[]`.

### `findEmptyPosition(maxAttempts)`

Finds a random unoccupied tile (avoiding the player) to place entities or portals.

---

## Player Integration

### `repositionPlayer()`

* Creates a new `Player` instance if none exists
* Moves player to a random open tile otherwise

---

## Camera and Viewport

### `updateCamera()`

Centers the viewport around the player, updating `camera.x` and `camera.y` and applying `translate()` to the `#world` container.

### `resizeView()`

Calculates tile sizes based on `.game-pane` dimensions and updates the grid layout accordingly. Uses fixed fallback dimensions if the layout isn’t ready.

---

## Audio Control

### `toggleAudio()`

Toggles background music on or off and updates the `#audioToggle` button.

---

## Utility

### `clamp(val, min, max)`

Restricts a number to the `[min, max]` range.

---

## DOM Requirements

Requires the following elements to exist:

* `#world` — container for the tile grid
* `#realmInfo` — shows current realm name
* `#transition` — transition effect element
* `#audioToggle` — audio control button
* `.game-pane` — container for calculating available screen space

---

## Example Usage

```js
const world = new GameWorld(CONFIG.world, gameState)
await world.initialize()
await world.switchRealm('forest')
```

---

## Summary

The `GameWorld` class orchestrates all visual and logical aspects of the game's environment, enabling dynamic and modular realm loading, responsive terrain rendering, and player–entity interaction. It works closely with:

* `Entity`
* `Player`
* `ConlangEngine`
* `UIManager`

