---
title: Lexicon Documentation
file: Lexicon.js
description: Vocabulary manager for constructed languages with efficient lookup and metadata support
author: Patrick Hall
last_updated: 2025-07-10
---

# Lexicon.js

The `Lexicon` class manages vocabulary in a constructed language. It stores word
entries, enables fast lookup by gloss or form, supports filtering and searching,
and provides import/export functionality.

---

## Overview

**Main features:**

- Efficient `O(1)` lookups via internal maps
- Unique ID tracking
- Metadata support per word
- Search, filter, and statistics tools
- JSON serialization/deserialization

---

## Class: `Lexicon`

### Constructor

```js
const lex = new Lexicon()
```

Initializes an empty lexicon with lookup indices and ID counter.

---

## Core Methods

### `addWord(gloss, form, metadata = {})`

Adds a new word to the lexicon.

- **gloss**: English concept (string)
- **form**: Conlang word form (string)
- **metadata**: Optional metadata (object)

Throws an error if the gloss or form already exists.

---

### `getByGloss(gloss)`

Returns the word object for a given gloss, or `null` if not found.

---

### `getByForm(form)`

Returns the word object for a given form, or `null` if not found.

---

### `hasGloss(gloss)`

Returns `true` if the gloss exists in the lexicon.

---

### `hasForm(form)`

Returns `true` if the form exists in the lexicon.

---

### `getForm(gloss)`

Returns the conlang form for a gloss, or `null` if not found.

---

### `getGloss(form)`

Returns the English gloss for a conlang form, or `null` if not found.

---

### `removeByGloss(gloss)`

Removes the word entry for a gloss.

Returns `true` if successful.

---

### `updateWord(gloss, updates)`

Updates metadata fields of a word. Protected fields (`id`, `gloss`, `form`,
`created`) cannot be modified.

Returns the updated word or `null` if not found.

---

## Search and Filter

### `getAllWords()`

Returns a copy of the full array of word entries.

---

### `getAllGlosses()`

Returns an array of all gloss strings.

---

### `getAllForms()`

Returns an array of all conlang forms.

---

### `filter(predicate)`

Returns an array of words matching the given predicate function.

Example:

```js
lex.filter((w) => w.seedWord)
```

---

### `searchByGloss(partial)`

Returns all words with glosses that include the given partial string.

---

### `searchByForm(partial)`

Returns all words with forms that include the given partial string.

---

## Serialization

### `toJSON()`

Exports the full lexicon as a JSON string, including timestamps and IDs.

---

### `fromJSON(jsonString)`

Replaces the lexicon contents with those from the given JSON string.

Returns the number of words imported.

---

## Stats & Info

### `getStats()`

Returns an object with basic statistics:

```json
{
  "totalWords": 42,
  "averageFormLength": 4.5,
  "averageGlossLength": 5.1,
  "oldestWord": { ... },
  "newestWord": { ... }
}
```

---

### `clear()`

Removes all entries from the lexicon and resets ID counter.

---

### `size`

Property: total number of words in the lexicon.

---

### `isEmpty`

Property: `true` if no entries exist.

---

## Example Usage

```js
const lex = new Lexicon()

// Add words
lex.addWord("tree", "kelu")
lex.addWord("water", "ami")

// Lookups
console.log(lex.getForm("tree")) // 'kelu'
console.log(lex.getGloss("ami")) // 'water'

// Search
console.log(lex.searchByGloss("tr")) // [tree]

// Export/Import
const json = lex.toJSON()
const newLex = new Lexicon()
newLex.fromJSON(json)

// Stats
console.log(lex.getStats())
```

---

## Exports

```js
export { Lexicon }
```
