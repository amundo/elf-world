---
title: "Emoji Zelda Game: Viewport, Movement, and Camera Math"
description: "A breakdown of the mathematical logic behind viewport sizing, player movement, and camera behavior in a DOM-only, grid-based emoji-style top-down game inspired by classic Zelda mechanics."
author: Patrick Hall
---


This project is a lightweight, DOM-only, top-down Zelda-style game. It uses **CSS Grid** and emoji-based entities to render a procedurally generated game world. Everything is managed in HTML, CSS, and vanilla JavaScript — no canvas or game engine required.


## 🚀 Features

- Grid-based world layout (`30 × 20`)
- Viewport shows only a portion of the map (`10 × 8`)
- Player movement with arrow keys
- Laggy camera that scrolls only when the player nears the edges
- Procedural world generation using probability rules
- Modular entity system using classes
- Interaction with enemies and NPCs
- Inventory system
- Dialogue overlay UI

---

## 📐 Viewport and Tile Sizing

The screen is divided into a fixed number of visible tiles:

```js
const VIEW_WIDTH = 10
const VIEW_HEIGHT = 8
tileWidth = window.innerWidth / VIEW_WIDTH
tileHeight = window.innerHeight / VIEW_HEIGHT
````

This ensures that tiles always fit exactly in the screen regardless of screen size.

---

## 🧊 Procedural World Generation

Entities are generated based on `terrainOptions`, where each object has a `chance` to appear at any `(x, y)` position:

```js
const terrainOptions = [
  { type: 'object', emoji: '🌲', chance: 0.1 },      // tree
  { type: 'object', emoji: '🪨', chance: 0.05 },     // rock
  { type: 'enemy',  emoji: '🐍', chance: 0.03 },     // snake
  { type: 'enemy',  emoji: '🦇', chance: 0.02 },     // bat
  { type: 'npc',    emoji: '👴', chance: 0.02, dialogue: 'Welcome, traveler!' },
  { type: 'npc',    emoji: '🧙‍♂️', chance: 0.01, dialogue: 'Magic is real!' }
]
```

Entities are instantiated dynamically using:

```js
const entity = new Cls({ ...data, x, y })
grid[y][x] = entity
```

---

## 🧱 Entity Class System

Each tile on the map may contain a dynamic entity:

### Base Class: `Entity`

* Manages `x`, `y`, emoji, rendering
* `onInteract(player)` is defined by subclasses

### `ObjectEntity`

* Solid, blocks movement (e.g. 🌲 or 🪨)

### `Enemy`

* Not solid
* Shows dialogue when touched

### `NPC`

* Not solid
* Triggers dialogue and gives item if needed

### `Player`

* Stores position, emoji, inventory
* Handles movement logic
* Interacts with entities via grid lookup

---

## 🕹️ Movement and Interaction

```js
player.move(dx, dy)
```

Performs:

* Clamp to world bounds
* Check if grid tile has an entity

  * If solid, block movement
  * If interactive, call `onInteract()`
* Update player position and camera

---

## 🎥 Camera Math

```js
const offsetX = (cameraX - marginX) * tileWidth
const offsetY = (cameraY - marginY) * tileHeight
```

* `cameraX` and `cameraY` track the virtual center
* Camera only moves when the player nears the visible edge
* `transform: translate(...)` scrolls the grid and entities

---

## 📦 Inventory & UI

* Inventory is a simple array: `player.inventory`
* Shown at top-left of screen
* `🗝️` is given by NPCs if not already in inventory
* Dialogue box appears at the bottom for 2 seconds

---

## 🧠 Extending the Game

You can easily add:

* New entity types: just subclass `Entity`
* More emojis: update `terrainOptions`
* Items, combat, quests: hook into `onInteract()`
* Zones or levels: change generation logic

---

## 🛠️ Tech Stack

* HTML + CSS Grid
* Plain JavaScript (DOM APIs)
* No canvas
* No frameworks

---

## ✅ Example Screenshot

```
🧝‍♂️
⬜⬜🌲⬜⬜⬜⬜🧙‍♂️⬜⬜
⬜⬜⬜⬜🪨⬜⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜🐍⬜⬜⬜
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
```

---