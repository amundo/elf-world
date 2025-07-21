---
title: Player Documentation
file: Player.js
description: Represents the player character in Elf World. Extends Entity with player-specific logic for movement, interaction, and inventory.
author: Patrick Hall
last_updated: 2025-07-10
---

# Player.js

The `Player` class extends `Entity` and represents the player character in the
game. It handles user input (via keyboard), movement within the game world,
entity interaction, and manages a basic inventory.

---

## Class: `Player`

```js
export class Player extends Entity
```

Inherits all functionality from the `Entity` class and extends it with
player-specific logic.

---

## Constructor

```js
new Player({ x, y, world, gameState })
```

Initializes the player at a specified `(x, y)` position in the grid.

**Properties:**

- `emoji`: `'🧝‍♂️'`
- `type`: `'player'`
- `concept`: `'player'`
- `solid`: `false`
- `inventory`: Initialized with `['🍎']`

---

## Method: `move(dx, dy)`

Moves the player character by the given delta in the x and y directions.

**Behavior:**

1. Uses `world.clamp()` to prevent out-of-bounds movement.
2. Blocks movement into solid objects.
3. Interacts with portals if the target tile contains one.
4. Updates position and camera.
5. Calls `checkAdjacentInteractions()` to update focus and auto-interact.

---

## Method: `checkAdjacentInteractions()`

Checks tiles adjacent to the player to:

- Set `focusedEntity` in the game state based on proximity.
- Display a message using the gloss key `'focus'` and the entity’s emoji.
- Automatically interact with adjacent `npc` or `enemy` entities.

### Directions checked:

- Left, Right, Up, Down (no diagonals)

---

## Example Usage

```js
const player = new Player({
  x: 5,
  y: 10,
  world,
  gameState,
})

player.move(1, 0) // Move right
```

---

## Inherited from `Entity`

The player also inherits all methods from the `Entity` class, such as:

- `moveTo(x, y)`
- `inspect()`
- `onInteract()`
- DOM rendering (`createElement`, `addToWorld`)

---

## Summary

The `Player` class encapsulates the movement logic, inventory, and interaction
capabilities specific to the playable character in Elf World. It integrates
tightly with `gameState`, particularly:

- `focusedEntity`
- `ui.addMessage()`
- `world.entityGrid`
