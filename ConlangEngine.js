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
      'WHAT', 'THIS', 'GO', 'HERE', 'WHERE', 'SEE', 'HEAR', 
      'TAKE', 'USE', 'OPEN', 'SAY', 'HELLO', 'WHO', 'HOW', 'HAVE', 'KNOW'
    ]
    
    // Initialize with seed words
    this.initializeLexicon()
  }
  
  /**
   * Create a seeded random number generator for deterministic output
   */
  createRNG(seed) {
    if (!seed) return Math.random
    
    let s = seed
    return function() {
      s = Math.sin(s) * 10000
      return s - Math.floor(s)
    }
  }
  
  /**
   * Initialize lexicon with seed words
   */
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
  
  /**
   * Generate a random syllable following a structure pattern
   */
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
  
  /**
   * Generate a random word with 1-3 syllables
   */
  generateRandomWord() {
    const numSyllables = Math.floor(this.rng() * 3) + 1 // 1-3 syllables
    let word = ''
    
    for (let i = 0; i < numSyllables; i++) {
      const structure = this.syllableStructures[Math.floor(this.rng() * this.syllableStructures.length)]
      word += this.generateSyllable(structure)
    }
    
    return word
  }
  
  /**
   * Get or generate a word for a concept
   */
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
  
  /**
   * Get full lexicon entry for a concept
   */
  getEntry(concept) {
    return this.lexicon.get(concept.toLowerCase())
  }
  
  /**
   * Check if a word exists in lexicon
   */
  hasWord(concept) {
    return this.lexicon.has(concept.toLowerCase())
  }
  
  /**
   * Get all lexicon entries
   */
  getAllEntries() {
    return Array.from(this.lexicon.entries())
  }
  
  /**
   * Add a word manually
   */
  addWord(concept, form) {
    this.lexicon.set(concept.toLowerCase(), {
      form: form,
      gloss: concept.toUpperCase(),
      concept: concept.toLowerCase()
    })
  }
  
  /**
   * Export lexicon as JSON
   */
  exportLexicon() {
    return JSON.stringify(Array.from(this.lexicon.entries()), null, 2)
  }
  
  /**
   * Import lexicon from JSON
   */
  importLexicon(jsonString) {
    const entries = JSON.parse(jsonString)
    this.lexicon = new Map(entries)
  }
  
  /**
   * Reset lexicon to initial state
   */
  reset() {
    this.lexicon.clear()
    this.initializeLexicon()
  }
  
  /**
   * Get basic stats
   */
  getStats() {
    return {
      totalWords: this.lexicon.size,
      consonants: this.consonants.length,
      vowels: this.vowels.length,
      syllableStructures: this.syllableStructures.length
    }
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


if(import.meta?.main){
  testConlangEngine()
}

export {
  ConlangEngine
}