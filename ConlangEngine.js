import { Lexicon } from './Lexicon.js'

/**
 * ConlangEngine - handles phonological generation and lexicon management
 * Now cleanly separated: ConlangEngine generates forms, Lexicon manages storage
 */
class ConlangEngine {
  constructor(config = {}) {
    // Phonological system
    this.consonants = config.consonants || ['p', 't', 'k', 's', 'n', 'm', 'l', 'r', 'w', 'j']
    this.vowels = config.vowels || ['a', 'e', 'i', 'o', 'u']
    this.syllableStructures = config.syllableStructures || ['CV', 'CVC', 'V', 'VC']
    
    // Random number generator
    this.seed = config.seed || null
    this.rng = this.createRNG(this.seed)
    
    // Lexicon instance
    this.lexicon = new Lexicon()
    
    // Initialize with seed vocabulary
    this.seedWords = config.seedWords || [
      "GO", "HAVE", "HEAR", "HELLO", "HERE", "HOW", "KNOW", "LEARN", 
      "NEAR", "NOT", "OPEN", "SAY", "SEE", "TAKE", "THING", "THIS", 
      "USE", "WHAT", "WHERE", "WHO", "WORD", "WORLD"
    ]
    
    this.initializeSeedVocabulary()
  }

  /**
   * Create a seeded random number generator
   */
  createRNG(seed) {
    if (!seed) return Math.random
    let s = seed
    return function () {
      s = Math.sin(s) * 10000
      return s - Math.floor(s)
    }
  }

  /**
   * Generate a syllable based on structure pattern
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
   * Generate a random word form based on phonological rules
   */
  generateWordForm() {
    const numSyllables = Math.floor(this.rng() * 3) + 1
    let word = ''
    for (let i = 0; i < numSyllables; i++) {
      const structure = this.syllableStructures[Math.floor(this.rng() * this.syllableStructures.length)]
      word += this.generateSyllable(structure)
    }
    return word
  }

  /**
   * Get or create a word for a given concept
   * This is the main interface method
   */
  getWord(gloss, metadata = {}) {
    // Check if word already exists
    const existingWord = this.lexicon.getByGloss(gloss)
    if (existingWord) {
      return existingWord.form
    }

    // Generate new word form
    let form
    do {
      form = this.generateWordForm()
    } while (this.lexicon.hasForm(form)) // Ensure uniqueness

    // Add to lexicon with metadata
    this.lexicon.addWord(gloss, form, {
      generatedBy: 'ConlangEngine',
      phonologicalStructure: this.analyzePhonologicalStructure(form),
      ...metadata
    })

    return form
  }

  /**
   * Check if we have a word for a concept
   */
  hasWord(gloss) {
    return this.lexicon.hasGloss(gloss)
  }

  /**
   * Back-translate from conlang form to English gloss
   */
  backTranslate(conlangText) {
    const words = conlangText.toLowerCase().split(/\s+/)
    return words.map(conlangWord => {
      const gloss = this.lexicon.getGloss(conlangWord)
      return gloss || conlangWord // Return original if not found
    }).join(' ')
  }

  /**
   * Translate from English to conlang
   */
  translate(englishText) {
    const words = englishText.toLowerCase().split(/\s+/)
    return words.map(englishWord => {
      return this.getWord(englishWord)
    }).join(' ')
  }

  /**
   * Initialize seed vocabulary
   */
  initializeSeedVocabulary() {
    for (const word of this.seedWords) {
      this.getWord(word.toLowerCase(), { 
        seedWord: true,
        frequency: 'high'
      })
    }
  }

  /**
   * Analyze phonological structure of a word
   */
  analyzePhonologicalStructure(word) {
    let structure = ''
    for (const char of word.toLowerCase()) {
      if (this.vowels.includes(char)) {
        structure += 'V'
      } else if (this.consonants.includes(char)) {
        structure += 'C'
      } else {
        structure += 'X' // Unknown segment
      }
    }
    return structure
  }

  /**
   * Get phonological statistics
   */
  getPhonologicalStats() {
    const allWords = this.lexicon.getAllWords()
    const consonantCounts = new Map()
    const vowelCounts = new Map()
    const structureCounts = new Map()

    for (const word of allWords) {
      // Count segments
      for (const char of word.form) {
        if (this.consonants.includes(char)) {
          consonantCounts.set(char, (consonantCounts.get(char) || 0) + 1)
        } else if (this.vowels.includes(char)) {
          vowelCounts.set(char, (vowelCounts.get(char) || 0) + 1)
        }
      }

      // Count structures
      const structure = word.phonologicalStructure || this.analyzePhonologicalStructure(word.form)
      structureCounts.set(structure, (structureCounts.get(structure) || 0) + 1)
    }

    return {
      consonantFrequencies: Object.fromEntries(consonantCounts),
      vowelFrequencies: Object.fromEntries(vowelCounts),
      structureFrequencies: Object.fromEntries(structureCounts),
      totalWords: allWords.length
    }
  }

  /**
   * Generate a batch of words for concepts
   */
  generateBatch(concepts, metadata = {}) {
    return concepts.map(concept => ({
      gloss: concept,
      form: this.getWord(concept, metadata),
      word: this.lexicon.getByGloss(concept)
    }))
  }

  /**
   * Export the lexicon
   */
  exportLexicon() {
    return this.lexicon.toJSON()
  }

  /**
   * Import a lexicon
   */
  importLexicon(jsonString) {
    return this.lexicon.fromJSON(jsonString)
  }

  /**
   * Access to underlying lexicon for advanced operations
   */
  getLexicon() {
    return this.lexicon
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    return {
      lexicon: this.lexicon.getStats(),
      phonology: this.getPhonologicalStats(),
      config: {
        consonants: this.consonants,
        vowels: this.vowels,
        syllableStructures: this.syllableStructures,
        seed: this.seed
      }
    }
  }
}

// // Example usage showing the cleaner API:
// const engine = new ConlangEngine({
//   seed: 12345,
//   consonants: ['p', 't', 'k', 's', 'n', 'm', 'l', 'r'],
//   vowels: ['a', 'e', 'i', 'o'],
//   syllableStructures: ['CV', 'CVC']
// })

// // Simple word generation
// console.log(engine.getWord('tree'))     // e.g., 'kelu'
// console.log(engine.getWord('water'))    // e.g., 'amiso'

// // Check existence
// console.log(engine.hasWord('tree'))     // true

// // Translation
// console.log(engine.translate('tree water'))           // 'kelu amiso'
// console.log(engine.backTranslate('kelu amiso'))       // 'tree water'

// // Access lexicon directly for complex operations
// const lexicon = engine.getLexicon()
// console.log(lexicon.searchByGloss('tre'))             // Find words containing 'tre'
// console.log(lexicon.filter(word => word.seedWord))    // Get all seed words

// Statistics

export { ConlangEngine }