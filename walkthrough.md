---
title: "Elf World Game Tutorial Walkthrough"
description: "A comprehensive guide to the Elf World game code, explaining its structure, features, and how to extend it."
author: Patrick Hall
---

Welcome to the walkthrough tutorial for the **Elf World** browser-based conlang and exploration game! This guide explains the major components of the code, how it works, and how the pieces fit together.

---

## Table of Contents

1. [Overview](#overview)
2. [HTML Structure](#html-structure)
3. [CSS Styling](#css-styling)
4. [JavaScript Breakdown](#javascript-breakdown)
   - [Constants and DOM Elements](#constants-and-dom-elements)
   - [Conlang System](#conlang-system)
   - [Entity and Player Classes](#entity-and-player-classes)
   - [Realms and World Generation](#realms-and-world-generation)
   - [Rendering and Camera](#rendering-and-camera)
   - [Audio System](#audio-system)
   - [Command Console](#command-console)
   - [Game Initialization](#game-initialization)
5. [Extending the Game](#extending-the-game)

---

## Overview

**Elf World** is a procedurally-generated exploration game featuring a player who can travel between realms, interact with entities, and learn a constructed language (conlang). The player moves around a grid-based world, encounters NPCs, learns vocabulary, and explores multiple realms (Forest, Wraith, Fairy).

---

## HTML Structure

The HTML divides the page into two main panes:

- `.game-pane`: shows the game world, player, terrain, and speech bubbles.
- `.console-pane`: shows the command console for interaction.

Within the game pane, additional overlays provide UI elements like inventory, realm info, audio control, and dialogue bubbles.

---

## CSS Styling

The CSS handles all visual presentation, including:

- Layout (`flex`, full-screen viewport)
- Tile grid (`.tile`, `.world` with CSS Grid)
- Entities layered on top (`.entity`, `.player`, `.portal`)
- Console UI (`.console-pane`, `.command-output`, `.command-input`)
- Transitions and animations (`@keyframes portal-glow`)

---

## JavaScript Breakdown

### Constants and DOM Elements

Variables like `COLS`, `ROWS`, and `VIEW_WIDTH` define the game grid size. DOM elements are cached for easy access and manipulation.

```js
const COLS = 30
const ROWS = 20
```

The game initializes a 2D grid (`tileElements`) and a parallel `entityGrid` to track game entities.

---

### Conlang System

The `Conlang` class defines a constructed language with random syllable generation. Words are stored in a `Map`, with a basic starter lexicon like "tree" = "temi".

```js
conlang.getWord('fire') // e.g. returns 'kilu'
```

Players can use the console to learn words and use them in interactions.

---

### Entity and Player Classes

- `Entity`: base class for all entities on the map, with emoji, position, and interaction logic.
- `Player`: subclass of `Entity` with movement, inventory, and adjacent interaction checking.

```js
player.move(-1, 0) // Move left
```

Entities may be solid (blocking), interactive (NPCs), or portals (change realm).

---

### Realms and World Generation

Three realms are defined in `REALMS`: `forest`, `wraith`, and `fairy`. Each has:

- Terrain colors and weights
- Music track
- Spawnable entities

```js
switchRealm('wraith')
```

Entity generation randomly populates the grid based on chance per entity type.

---

### Rendering and Camera

- The world is rendered using a `<div class="world">` grid.
- The camera centers on the player and updates when moving.
- `updateCamera()` adjusts `transform: translate(...)` based on player's position.

---

### Audio System

Each realm has background music. The toggle button controls whether it's playing:

```js
audioToggle.addEventListener('click', toggleAudio)
```

---

### Command Console

The command interface accepts user input:

- `inspect tree` — inspects nearby tree entity
- `learn fire` — adds a word to known vocabulary
- `say hello` — attempts dialogue with nearby NPC
- `vocab` — shows all known words

Each command is parsed by `processCommand()`.

---

### Game Initialization

On page load, the game:

1. Builds the grid
2. Creates a player
3. Switches to the Forest Realm
4. Resizes tiles to fit the viewport
5. Binds controls and command input

```js
initializeGame()
```

---

## Extending the Game

You can easily expand Elf World by:

- Adding more realms to the `REALMS` object
- Creating new entity types with unique behaviors
- Enhancing the conlang system (e.g. grammar rules, morphology)
- Adding quests, puzzles, or battle mechanics
- Persisting player progress with `localStorage`

---

## Summary

Elf World is a rich and extensible framework for conlang-based gameplay. By combining grid-based movement, entity interactions, and a custom command console, it provides a fun and educational platform to explore language and game design.

