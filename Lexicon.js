/**
 * Lexicon class for managing constructed language vocabulary
 * Maintains an array of word entries with efficient lookup indices
 */
class Lexicon {
  constructor() {
    // Core data: array of word objects
    this.words = []

    // Lookup indices for O(1) access
    this.glossIndex = new Map()  // gloss -> word object
    this.formIndex = new Map()   // form -> word object

    // Track next available ID
    this.nextId = 1
  }

  /**
   * Add a new word to the lexicon
   * @param {string} gloss - English meaning/concept
   * @param {string} form - Conlang word form
   * @param {Object} metadata - Optional additional data
   * @returns {Object} The created word object
   */
  addWord(gloss, form, metadata = {}) {
    // Check for duplicates
    if (this.glossIndex.has(gloss)) {
      throw new Error(`Word with gloss "${gloss}" already exists`)
    }
    if (this.formIndex.has(form)) {
      throw new Error(`Word with form "${form}" already exists`)
    }

    // Create word object
    const word = {
      id: this.nextId++,
      gloss: gloss.toLowerCase(),
      form: form.toLowerCase(),
      created: new Date(),
      ...metadata
    }

    // Add to array and indices
    this.words.push(word)
    this.glossIndex.set(word.gloss, word)
    this.formIndex.set(word.form, word)

    return word
  }

  /**
   * Look up word by English gloss
   * @param {string} gloss - English meaning to look up
   * @returns {Object|null} Word object or null if not found
   */
  getByGloss(gloss) {
    return this.glossIndex.get(gloss.toLowerCase()) || null
  }

  /**
   * Look up word by conlang form
   * @param {string} form - Conlang form to look up
   * @returns {Object|null} Word object or null if not found
   */
  getByForm(form) {
    return this.formIndex.get(form.toLowerCase()) || null
  }

  /**
   * Check if gloss exists in lexicon
   * @param {string} gloss - English meaning to check
   * @returns {boolean}
   */
  hasGloss(gloss) {
    return this.glossIndex.has(gloss.toLowerCase())
  }

  /**
   * Check if form exists in lexicon
   * @param {string} form - Conlang form to check
   * @returns {boolean}
   */
  hasForm(form) {
    return this.formIndex.has(form.toLowerCase())
  }

  /**
   * Get the conlang form for a gloss (convenience method)
   * @param {string} gloss - English meaning
   * @returns {string|null} Conlang form or null if not found
   */
  getForm(gloss) {
    const word = this.getByGloss(gloss)
    return word ? word.form : null
  }

  /**
   * Get the English gloss for a form (convenience method)
   * @param {string} form - Conlang form
   * @returns {string|null} English gloss or null if not found
   */
  getGloss(form) {
    const word = this.getByForm(form)
    return word ? word.gloss : null
  }

  /**
   * Remove word by gloss
   * @param {string} gloss - English meaning to remove
   * @returns {boolean} True if word was found and removed
   */
  removeByGloss(gloss) {
    const word = this.getByGloss(gloss)
    if (!word) return false

    // Remove from indices
    this.glossIndex.delete(word.gloss)
    this.formIndex.delete(word.form)

    // Remove from array
    const index = this.words.findIndex(w => w.id === word.id)
    if (index > -1) {
      this.words.splice(index, 1)
    }

    return true
  }

  /**
   * Update word metadata
   * @param {string} gloss - English meaning to update
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated word object or null if not found
   */
  updateWord(gloss, updates) {
    const word = this.getByGloss(gloss)
    if (!word) return null

    // Apply updates (but protect core fields)
    const protectedFields = ['id', 'gloss', 'form', 'created']
    for (const [key, value] of Object.entries(updates)) {
      if (!protectedFields.includes(key)) {
        word[key] = value
      }
    }

    word.modified = new Date()
    return word
  }

  /**
   * Get all words as array (for iteration)
   * @returns {Array} Copy of words array
   */
  getAllWords() {
    return [...this.words]
  }

  /**
   * Get all glosses
   * @returns {Array} Array of all English glosses
   */
  getAllGlosses() {
    return Array.from(this.glossIndex.keys())
  }

  /**
   * Get all forms
   * @returns {Array} Array of all conlang forms
   */
  getAllForms() {
    return Array.from(this.formIndex.keys())
  }

  /**
   * Filter words by predicate function
   * @param {Function} predicate - Function to test each word
   * @returns {Array} Array of matching words
   */
  filter(predicate) {
    return this.words.filter(predicate)
  }

  /**
   * Search words by partial gloss match
   * @param {string} partial - Partial gloss to search for
   * @returns {Array} Array of matching words
   */
  searchByGloss(partial) {
    const searchTerm = partial.toLowerCase()
    return this.words.filter(word =>
      word.gloss.includes(searchTerm)
    )
  }

  /**
   * Search words by partial form match
   * @param {string} partial - Partial form to search for
   * @returns {Array} Array of matching words
   */
  searchByForm(partial) {
    const searchTerm = partial.toLowerCase()
    return this.words.filter(word =>
      word.form.includes(searchTerm)
    )
  }

  /**
   * Export lexicon to JSON
   * @returns {string} JSON representation
   */
  toJSON() {
    return JSON.stringify({
      words: this.words,
      nextId: this.nextId,
      exported: new Date()
    }, null, 2)
  }

  /**
   * Import lexicon from JSON
   * @param {string} jsonString - JSON data to import
   * @returns {number} Number of words imported
   */
  fromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)

      // Clear existing data
      this.words = []
      this.glossIndex.clear()
      this.formIndex.clear()

      // Import words
      for (const word of data.words) {
        this.words.push(word)
        this.glossIndex.set(word.gloss, word)
        this.formIndex.set(word.form, word)
      }

      this.nextId = data.nextId || this.words.length + 1

      return this.words.length
    } catch (error) {
      throw new Error(`Invalid JSON data: ${error.message}`)
    }
  }

  /**
   * Get lexicon statistics
   * @returns {Object} Statistics about the lexicon
   */
  getStats() {
    return {
      totalWords: this.words.length,
      averageFormLength: this.words.length > 0
        ? this.words.reduce((sum, word) => sum + word.form.length, 0) / this.words.length
        : 0,
      averageGlossLength: this.words.length > 0
        ? this.words.reduce((sum, word) => sum + word.gloss.length, 0) / this.words.length
        : 0,
      oldestWord: this.words.length > 0
        ? this.words.reduce((oldest, word) =>
          word.created < oldest.created ? word : oldest
        )
        : null,
      newestWord: this.words.length > 0
        ? this.words.reduce((newest, word) =>
          word.created > newest.created ? word : newest
        )
        : null
    }
  }

  /**
   * Clear all words from lexicon
   */
  clear() {
    this.words = []
    this.glossIndex.clear()
    this.formIndex.clear()
    this.nextId = 1
  }

  /**
   * Get size of lexicon
   * @returns {number} Number of words
   */
  get size() {
    return this.words.length
  }

  /**
   * Check if lexicon is empty
   * @returns {boolean}
   */
  get isEmpty() {
    return this.words.length === 0
  }
}
if (import.meta.main) {
  // Example usage:
  const lexicon = new Lexicon()

  // Add words
  lexicon.addWord('tree', 'kelu')
  lexicon.addWord('water', 'ami')
  lexicon.addWord('fire', 'soto')

  // Lookup examples
  console.log(lexicon.getForm('tree'))        // 'kelu'
  console.log(lexicon.getGloss('ami'))        // 'water'
  console.log(lexicon.hasGloss('fire'))       // true
  console.log(lexicon.hasForm('nonexistent')) // false

  // Get all data
  console.log(lexicon.getAllWords())
  console.log(lexicon.getStats())
}


export { Lexicon }