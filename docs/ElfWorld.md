---
title: ElfWorld Documentation
file: ElfWorld.js
description: Main entry point for the Elf World game. Initializes core systems, loads realms and entities, and handles global state and input.
author: Patrick Hall
last_updated: 2025-07-10
---

# ElfWorld.js

This is the main game controller file for **Elf World**. It initializes all core subsystems, loads realm and entity data, manages global state, and exposes debugging tools in the browser console.

---

## Responsibilities

- Load external resources (realms, entities)
- Initialize:
  - `ConlangEngine` for language generation
  - `GameWorld` for world map and rendering
  - `UIManager` for interface elements
  - `CommandProcessor` for handling user input
- Set up keyboard and command input
- Maintain global `gameState`
- Expose browser debugging interface

---

## Game Configuration

Defined in the `CONFIG` object:

- `world`: Grid size and view window
- `conlang`: Phonology and seed words
- `game`: Starting realm and known vocabulary

---

## Global State: `gameState`

```js
gameState = {
  conlang,
  world,
  ui,
  commands,
  realms,
  player,
  knownWords,
  focusedEntity,
  selectedEntity,
  currentRealm
}
````

---

## Initialization

### `initializeGame()`

Top-level function called on startup:

1. Loads realm and entity data
2. Initializes subsystems
3. Builds and displays the world
4. Welcomes the player
5. Exposes a debug API in the browser console

---

## Realm and Entity Loading

### `loadRealms()`

* Loads `realms/index.json`
* For each realm file:

  * Loads and processes entities
  * Handles fallback if loading fails

### `loadEntityCatalog()`

* Loads `entities/index.json`
* Falls back to a hardcoded catalog if necessary

### `processRealmData(realmData, entityCatalog)`

* Expands `entityRef` references using the catalog
* Supports both procedural and pre-defined entity formats
* Handles portal setup and custom entity integration

---

## Fallback Utilities

### `getDefaultEntityCatalog()`

Returns a small catalog with fallback emoji entities:

* Tree, rock, fairy, snake, portal

### `getFallbackRealms()`

Returns a default realm ("Fairy Realm") with pink forest and one talking fairy NPC.

---

## UI and Input

### `setupEventListeners()`

Registers all DOM input events:

* Arrow key movement
* `<Enter>` to process command input
* Audio toggle button
* Resizing view on window resize
* Disables right-click on game area

---

### `showGame()` / `showError(message)`

Controls visibility of game screen and loading/error display.

---

## Debug API

Exposed to `window` for in-console debugging:

### Core objects:

```js
game, conlang, lexicon, player()
```

### Vocabulary tools:

```js
addWord(gloss, form)
learnWord(word)
exportLexicon()
searchLexicon(term)
showKnownWords()
```

### Stats:

```js
getLexiconStats()
getPhonologyStats()
dumpGameState()
```

### World navigation:

```js
showRealms()
switchRealm('forest')
getCurrentRealm()
showPortals()
```

### Example:

```js
showKnownWords()
getCurrentRealm()
```

---

## Startup

### `initializeGame()`

Starts the game. Logs any errors during loading and displays an error screen.

```js
initializeGame().catch(error => {
  console.error('Game initialization failed:', error)
  showError('Game failed to start. Check console for details.')
})
```

---

## File Structure Assumptions

* `realms/index.json`: lists all realm files
* `entities/index.json`: maps entity IDs to emoji/gloss data
* `realms/*.json`: individual realm definitions

---

## Summary

This file glues together all components of the Elf World game. It handles loading, setup, interaction, and developer tools.

**Modules used:**

* `ConlangEngine`
* `GameWorld`
* `UIManager`
* `CommandProcessor`

**Game can be controlled and debugged entirely from the browser console.**
