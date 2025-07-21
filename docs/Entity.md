---
title: Entity Documentation
file: Entity.js
description: Defines game entities (NPCs, portals, objects), their behaviors, and interactions
author: Patrick Hall
last_updated: 2025-07-10
---

# Entity.js

The `Entity` class represents interactable objects in the game world, including
NPCs, portals, creatures, and objects. It handles rendering, movement,
interactions, conlang naming, and dialogue.

---

## Class: `Entity`

### Constructor

```js
new Entity({ x, y, entityDef, gameState, world })
```

- **x, y**: Initial position in the world grid
- **entityDef**: Object with properties such as `emoji`, `concept`, `dialogue`,
  `destination`, and `type`
- **gameState**: The main game state object
- **world**: The game world/grid this entity is part of

Initializes:

- Emoji display
- Concept and conlang name
- HTML element and event handlers
- Placement in the world

---

### Method: `createElement()`

Creates the DOM element for the entity:

- Assigns `.entity` and `.type` class names
- Sets emoji as content
- Adds a tooltip showing the concept and conlang name
- Adds a click handler for inspection

---

### Method: `addToWorld()`

Places the entity in the world grid:

- Appends its element to the correct tile in the DOM
- Registers it in `entityGrid`

---

### Method: `speak()`

Returns dialogue from the entity:

- If dialogue is an array of glosses, each is translated using
  `conlang.getWord()`
- Punctuation is preserved
- If a legacy string is used, returns it as-is

Used for NPC interactions.

---

### Method: `getConceptFromEmoji(emoji)`

Maps emoji to known concept strings. Examples:

- `'🌲'` → `'tree'`
- `'🧙‍♂️'` → `'wizard'`
- `'✨'` → `'portal'`
- Unknown emoji → `'entity'`

---

### Method: `inspect()`

Handles clicking on the entity:

- Adds a message with the entity's emoji
- Shows the conlang name if the concept is known
- Displays `???` if not
- Sets the selected entity in `gameState`

---

### Method: `moveTo(newX, newY)`

Moves the entity to a new position in the world:

- Removes element from old tile
- Updates internal coordinates and `entityGrid`
- Appends to new tile

---

### Method: `onInteract(player)`

Triggered when a player interacts with the entity.

- **If `type === 'portal'`**:

  - Switches to the destination realm (if defined)
- **If dialogue is defined**:

  - Calls `speak()` to get translated conlang dialogue
  - Displays it via `UIManager.showDialogue()`

Also logs debug info to the console.

---

## DOM Integration

Each entity creates and manages its own DOM element with:

- CSS class `.entity`
- Text content as its emoji
- Tooltip for concept and conlang name
- Click-to-inspect behavior

---

## Example Usage

```js
const elder = new Entity({
  x: 5,
  y: 7,
  entityDef: {
    type: "npc",
    emoji: "👴",
    concept: "elder",
    dialogue: ["hello", "child"],
    solid: true,
  },
  gameState,
  world,
})
```

---

## Supported Entity Types

Examples include:

- `npc` — characters with dialogue
- `portal` — teleport to other realms
- `object` — static scenery

---

## Summary of Responsibilities

- Visual representation via emoji and DOM
- Conlang naming and dialogue
- Movement and world placement
- Interaction (inspection, speaking, realm switching)
