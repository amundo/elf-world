---
title: CommandProcessor Documentation
file: CommandProcessor.js
description: Processes and interprets player commands in the game world
author: Patrick Hall
last_updated: 2025-07-10
---

# CommandProcessor.js

The `CommandProcessor` class interprets text commands from the player, validates
them against the conlang lexicon, executes corresponding game actions, and
updates the UI with appropriate feedback.

## Overview

This module is responsible for:

- Handling player input
- Checking known words
- Executing predefined commands (`what`, `say`, `have`, `see`, `know`)
- Providing fallback behavior for unknown or default commands
- Interfacing with `UIManager` and `gameState`

---

## Class: `CommandProcessor`

### Constructor

```js
new CommandProcessor(gameState)
```

- **gameState**: The full game state object, including references to `ui`,
  `conlang`, `player`, and `knownWords`.

---

### Method: `processCommand(input)`

Processes a single line of user input and determines which command handler to
invoke.

- **input**: Player's raw text command

Steps:

1. Normalizes input (lowercased + trimmed).
2. Displays the player's input in the UI.
3. Validates the input against the conlang dictionary and the player's known
   words.
4. Routes to one of the specific handlers or the default handler.

---

## Built-in Command Handlers

### `handleWhatCommand()`

- Describes the currently focused entity using the conlang word for “this”.
- Adds the entity's concept to the set of known words.
- Displays a message like: `this tree` and `now know: tree = 🌳`.

Fallback: Displays `[not near]` if no entity is in focus.

---

### `handleSayCommand(conlangWord)`

- Echoes back the word the player says.
- Displays: `you say 🌳`.

---

### `handleHaveCommand()`

- Lists the contents of the player’s inventory using the conlang word for
  `have`.
- Displays: `have: 🗡️ 🧪`.

---

### `handleSeeCommand()`

- Describes the focused entity if it's known.
- If the concept is unknown, shows `???`.
- Displays: `you see 🌳` or `you see ???`.

Fallback: Displays `[not near]` if no entity is in focus.

---

### `handleKnowCommand()`

- Lists all known words with their conlang equivalents.

- Displays:

  ```
  now know
    tree = 🌳
    water = 💧
  ```

- Also shows the current realm's name, if available.

---

### `handleDefaultCommand(conlangWord)`

- Used when no specific command matches.
- Repeats the word back using the `you say` message.

---

## Example Gloss Keys Used

These gloss keys are passed to `UIManager.getUIText()` and must be defined:

- `unknownCommand`
- `learned`
- `notNear`
- `youSay`
- `youSee`

---

## Example Usage

```js
const processor = new CommandProcessor(gameState)
processor.processCommand("what")
processor.processCommand("have")
processor.processCommand("dragonfruit")
```

---

## Notes

- All command recognition is based on gloss keys and conlang word knowledge.
- Unknown or unlearned words result in an error message.
- Realm names are shown using gloss and conlang translations.
