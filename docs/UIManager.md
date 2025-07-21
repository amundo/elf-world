---
title: UIManager Documentation
file: UIManager.js
description: Manages UI translation and state updates for game elements
author: Patrick Hall
last_updated: 2025-07-10
---

# UIManager.js

`UIManager` is responsible for updating UI elements based on the current game
state and translating interface text using the game's constructed language
(`conlang`).

## Overview

The class handles:

- Translating UI strings using glosses
- Updating inventory display
- Displaying messages to the command log
- Showing NPC dialogue bubbles

---

## Class: `UIManager`

### Constructor

```js
new UIManager(gameState)
```

- **gameState**: The game state object, which includes the `conlang` and
  `player` data.

---

### Method: `initialize()`

Initializes the UI:

- Binds elements like `commandOutput`, `consoleHeader`, and `commandInput`.
- Sets translated text for placeholders and labels.
- Calls `updateInventory()` to initialize inventory display.

---

### Method: `translateGloss(glossText)`

```js
translateGloss(glossText: string): string
```

Translates a gloss-formatted string like `[word learn]` into a conlang term
using the game state. If the input is not in gloss format, it returns the text
unchanged.

---

### Method: `getUIText(key)`

```js
getUIText(key: string): string
```

Maps UI text keys to glosses and translates them. Supported keys include:

- `consoleHeader`
- `inventoryLabel`
- `welcomeMessage`
- `helpHint`
- `unknownCommand`
- `notNear`
- `learned`
- `youSay`
- `youSee`
- `focus`
- `realmChanged`
- `exported`

Returns the translated text from the `conlang`.

---

### Method: `addMessage(text, className = '')`

Adds a new message to the `#commandOutput` log and scrolls to the bottom. Limits
message history to 20.

- **text**: The message string.
- **className**: Optional class for styling.

---

### Method: `updateInventory()`

Updates the `#inventory` element with the player's current inventory using the
conlang word for `have`.

---

### Method: `showDialogue(text, entity)`

Displays a temporary speech bubble with `text` above the DOM element for the
specified `entity`.

- **text**: The dialogue to show.
- **entity**: An object with an `.el` DOM property.

---

## DOM Dependencies

The following DOM elements are expected to exist:

- `#commandOutput`
- `#consoleHeader`
- `#commandInput`
- `#inventory`

---

## Example Usage

```js
const ui = new UIManager(gameState)
ui.initialize()
ui.addMessage("Hello, world!")
ui.updateInventory()
ui.showDialogue("Greetings!", npc)
```
