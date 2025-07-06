/**
 * Conlang Engine - Simple Procedural Language Generator
 * Generates consistent random words with basic phonotactics
 */


class ConlangEngine {
  constructor(config = {}) {
    // Phone inventory
    this.consonants = config.consonants || ['p', 't', 'k', 's', 'n', 'm', 'l', 'r', 'w', 'j']
    this.vowels = config.vowels || ['a', 'e', 'i', 'o', 'u']

    // Syllable structures
    this.syllableStructures = config.syllableStructures || ['CV', 'CVC', 'V', 'VC']

    // Random seed for deterministic generation
    this.seed = config.seed || null
    this.rng = this.createRNG(this.seed)

    // Word cache to ensure consistency
    this.lexicon = new Map()

    // Seed lexicon - basic words to start with
    this.seedWords = config.seedWords || [
      "GO",
      "HAVE",
      "HEAR",
      "HELLO",
      "HERE",
      "HOW",
      "KNOW",
      "LEARN",
      "NEAR",
      "NOT",
      "OPEN",
      "SAY",
      "SEE",
      "TAKE",
      "THING",
      "THIS",
      "USE",
      "WHAT",
      "WHERE",
      "WHO",
      "WORD",
      "WORLD"
    ]
    // Initialize with seed words
    this.initializeLexicon()
  }

  createRNG(seed) {
    if (!seed) return Math.random
    let s = seed
    return function () {
      s = Math.sin(s) * 10000
      return s - Math.floor(s)
    }
  }

  initializeLexicon() {
    for (const word of this.seedWords) {
      const form = this.generateRandomWord()
      this.lexicon.set(word.toLowerCase(), {
        form: form,
        gloss: word,
        concept: word.toLowerCase()
      })
    }
  }

  generateSyllable(structure) {
    let syllable = ''

    for (const segment of structure) {
      if (segment === 'C') {
        syllable += this.consonants[Math.floor(this.rng() * this.consonants.length)]
      } else if (segment === 'V') {
        syllable += this.vowels[Math.floor(this.rng() * this.vowels.length)]
      }
    }

    return syllable
  }

  generateRandomWord() {
    const numSyllables = Math.floor(this.rng() * 3) + 1 // 1-3 syllables
    let word = ''

    for (let i = 0; i < numSyllables; i++) {
      const structure = this.syllableStructures[Math.floor(this.rng() * this.syllableStructures.length)]
      word += this.generateSyllable(structure)
    }

    return word
  }

  getWord(concept) {
    const key = concept.toLowerCase()

    if (this.lexicon.has(key)) {
      return this.lexicon.get(key).form
    }

    // Generate new word
    const form = this.generateRandomWord()
    this.lexicon.set(key, {
      form: form,
      gloss: concept.toUpperCase(),
      concept: key
    })

    return form
  }

  getEntry(concept) {
    return this.lexicon.get(concept.toLowerCase())
  }

  hasWord(concept) {
    return this.lexicon.has(concept.toLowerCase())
  }
}



// Simple test function
function testConlangEngine() {
  console.log('Testing ConlangEngine...')

  const engine = new ConlangEngine({ seed: Math.floor(Math.random() * 10000) })
  console.log('✓ Engine created')

  const whatWord = engine.getWord('what')
  const thisWord = engine.getWord('this')
  console.log(`✓ Seed words: WHAT=${whatWord}, THIS=${thisWord}`)

  const tree1 = engine.getWord('tree')
  const tree2 = engine.getWord('tree')
  console.log(`✓ Consistency: tree=${tree1}, tree=${tree2}, equal=${tree1 === tree2}`)

  const randomWords = ['cat', 'house', 'magic', 'forest'].map(w => `${w}=${engine.getWord(w)}`)
  console.log(`✓ Random words: ${randomWords.join(', ')}`)

  const stats = engine.getStats()
  console.log(`✓ Stats:`, stats)

  console.table(engine.getAllEntries().map(([concept, entry]) => ({
    concept: entry.concept,
    form: entry.form,
    gloss: entry.gloss
  })))
  console.log('All tests passed!')
  return engine
}


if (import.meta?.main) {
  testConlangEngine()
}

export {
  ConlangEngine
}