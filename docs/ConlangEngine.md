---
title: ConlangEngine Documentation
file: ConlangEngine.js
description: Core engine for generating conlang word forms and managing the lexicon
author: Patrick Hall
last_updated: 2025-07-10
---

# ConlangEngine.js

The `ConlangEngine` is responsible for generating word forms according to
phonological rules and managing the lexicon through a separate `Lexicon` class.
It supports seeded generation, back-translation, and statistics.

---

## Overview

**Key responsibilities:**

- Generate unique, pronounceable word forms based on phonological constraints
- Maintain a lexicon mapping glosses (English concepts) to conlang forms
- Handle bidirectional translation
- Track and export lexical and phonological statistics

---

## Class: `ConlangEngine`

### Constructor

```js
new ConlangEngine(config = {})
```

**Configuration options:**

- `consonants`: Array of consonant phonemes
- `vowels`: Array of vowel phonemes
- `syllableStructures`: Allowed syllable patterns like `'CV'`, `'CVC'`
- `seed`: Optional RNG seed for repeatable generation
- `seedWords`: List of high-frequency glosses to initialize

---

## Phonology Methods

### `generateSyllable(structure)`

Generates a syllable from a pattern string like `'CVC'`.

---

### `generateWordForm()`

Generates a random word with 1–3 syllables chosen from allowed structures.

---

### `analyzePhonologicalStructure(word)`

Returns a pattern like `'CVCVC'` based on the word’s segment types.

---

## Translation Methods

### `getWord(gloss, metadata = {})`

- Retrieves an existing conlang form for a gloss, or creates a new one
- Stores the form in the lexicon with metadata

---

### `hasWord(gloss)`

Returns `true` if the gloss already has a corresponding conlang form.

---

### `translate(englishText)`

Translates a phrase of English words into conlang word forms.

---

### `backTranslate(conlangText)`

Translates conlang words back into glosses if possible.

---

## Lexicon Management

### `getLexicon()`

Returns the underlying `Lexicon` instance for direct access.

---

### `exportLexicon()`

Exports the lexicon to a JSON string.

---

### `importLexicon(jsonString)`

Imports and replaces the lexicon from a JSON string.

---

### `generateBatch(concepts, metadata = {})`

Generates multiple conlang forms in one call:

```js
engine.generateBatch(["moon", "sun", "cloud"])
```

Returns an array of:

```js
{
  gloss, form, word
}
```

---

## Statistics

### `getPhonologicalStats()`

Returns frequency distributions of consonants, vowels, and syllable structures
across the lexicon:

```js
{
  consonantFrequencies: { p: 12, t: 9, ... },
  vowelFrequencies: { a: 17, i: 14, ... },
  structureFrequencies: { CV: 20, CVC: 15, ... },
  totalWords: 42
}
```

---

### `getStats()`

Returns a full object with:

- Lexicon stats
- Phonological stats
- Phonology configuration

---

## Initialization

### `initializeSeedVocabulary()`

Populates the lexicon with `seedWords` if not already present. Each word is
marked with:

```js
{ seedWord: true, frequency: 'high' }
```

---

## Example Usage

```js
const engine = new ConlangEngine({
  seed: 123,
  consonants: ["p", "t", "k"],
  vowels: ["a", "i"],
  syllableStructures: ["CV", "CVC"],
})

console.log(engine.getWord("tree")) // e.g., 'kapi'
console.log(engine.translate("what is this")) // e.g., 'taka pini sili'
console.log(engine.backTranslate("kapi sili")) // e.g., 'tree this'

console.log(engine.getStats())
```

---

## Dependencies

- Requires `Lexicon.js` in the same directory
- Expects Lexicon to support:

  - `getByGloss()`, `hasGloss()`, `hasForm()`
  - `addWord()`, `getGloss()`, `getAllWords()`
  - `toJSON()`, `fromJSON()`, `getStats()`

---

## Export

```js
export { ConlangEngine }
```
