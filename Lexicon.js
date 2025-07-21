/**
 * Lexicon class for managing constructed language vocabulary
 * Supports efficient lookup, role-based filtering, and metadata handling
 */
class Lexicon {
  constructor(entries = []) {
    // Internal data
    this.entries = [] // All word entries: { id, form, gloss, role?, ... }
    this.glossIndex = new Map() // Lowercased gloss -> entry[]
    this.formIndex = new Map() // Lowercased form -> entry[]
    this.nextId = 1

    // Populate from initial entries
    for (const entry of entries) {
      this.addEntry(entry)
    }
  }

  /**
   * Add a new word entry
   * @param {Object} entry - Must include 'form' and 'gloss'
   * @returns {Object} The added entry
   */
  addEntry(entry) {
    const form = entry.form.toLowerCase()
    const gloss = entry.gloss.toLowerCase()

    const newEntry = {
      id: this.nextId++,
      form,
      gloss,
      created: new Date(),
      ...entry,
    }

    this.entries.push(newEntry)

    if (!this.formIndex.has(form)) this.formIndex.set(form, [])
    if (!this.glossIndex.has(gloss)) this.glossIndex.set(gloss, [])

    this.formIndex.get(form).push(newEntry)
    this.glossIndex.get(gloss).push(newEntry)

    return newEntry
  }

  /**
   * Find all entries matching a conlang form
   */
  findEntriesByForm(form) {
    return this.formIndex.get(form.toLowerCase()) || []
  }

  /**
   * Find first entry by form
   */
  findFirstEntryByForm(form) {
    const entries = this.findEntriesByForm(form)
    return entries.length > 0 ? entries[0] : null
  }

  /**
   * Find all entries matching a gloss
   */
  findEntriesByGloss(gloss) {
    return this.glossIndex.get(gloss.toLowerCase()) || []
  }

  /**
   * Find first entry by gloss
   */
  findFirstEntryByGloss(gloss) {
    const entries = this.findEntriesByGloss(gloss)
    return entries.length > 0 ? entries[0] : null
  }

  /**
   * Find entries by role
   */
  findEntriesByRole(role) {
    return this.entries.filter((entry) => entry.role === role)
  }

  /**
   * Get list of forms by role
   */
  getFormsByRole(role) {
    return this.findEntriesByRole(role).map((entry) => entry.form)
  }

  /**
   * Check if gloss exists
   */
  hasGloss(gloss) {
    return this.glossIndex.has(gloss.toLowerCase())
  }

  /**
   * Check if form exists
   */
  hasForm(form) {
    return this.formIndex.has(form.toLowerCase())
  }

  /**
   * Remove an entry (exact match)
   */
  removeEntry(entryToRemove) {
    const idx = this.entries.indexOf(entryToRemove)
    if (idx === -1) return false

    this.entries.splice(idx, 1)

    const formList = this.formIndex.get(entryToRemove.form)
    if (formList) {
      this.formIndex.set(
        entryToRemove.form,
        formList.filter((e) => e !== entryToRemove),
      )
      if (this.formIndex.get(entryToRemove.form).length === 0) {
        this.formIndex.delete(entryToRemove.form)
      }
    }

    const glossList = this.glossIndex.get(entryToRemove.gloss)
    if (glossList) {
      this.glossIndex.set(
        entryToRemove.gloss,
        glossList.filter((e) => e !== entryToRemove),
      )
      if (this.glossIndex.get(entryToRemove.gloss).length === 0) {
        this.glossIndex.delete(entryToRemove.gloss)
      }
    }

    return true
  }

  /**
   * Replace all entries
   */
  setEntries(newEntries) {
    this.entries = []
    this.formIndex.clear()
    this.glossIndex.clear()
    this.nextId = 1
    for (const entry of newEntries) {
      this.addEntry(entry)
    }
  }

  /**
   * Update fields of the first entry matching a gloss
   */
  updateEntry(gloss, updates) {
    const entry = this.findFirstEntryByGloss(gloss)
    if (!entry) return null

    const protectedFields = ["id", "form", "gloss", "created"]
    for (const [key, value] of Object.entries(updates)) {
      if (!protectedFields.includes(key)) {
        entry[key] = value
      }
    }

    entry.modified = new Date()
    return entry
  }

  /**
   * Search entries by partial gloss
   */
  searchByGloss(partial) {
    const term = partial.toLowerCase()
    return this.entries.filter((e) => e.gloss.includes(term))
  }

  /**
   * Search entries by partial form
   */
  searchByForm(partial) {
    const term = partial.toLowerCase()
    return this.entries.filter((e) => e.form.includes(term))
  }

  /**
   * Get all entries
   */
  getAllEntries() {
    return [...this.entries]
  }

  /**
   * Export to JSON
   */
  toJSON() {
    return JSON.stringify(
      {
        entries: this.entries,
        nextId: this.nextId,
        exported: new Date(),
      },
      null,
      2,
    )
  }

  /**
   * Import from JSON
   */
  fromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      this.setEntries(data.entries || [])
      this.nextId = data.nextId || this.entries.length + 1
      return this.entries.length
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`)
    }
  }

  /**
   * Stats
   */
  getStats() {
    return {
      total: this.entries.length,
      averageFormLength: this.entries.length > 0
        ? this.entries.reduce((sum, e) => sum + e.form.length, 0) /
          this.entries.length
        : 0,
      averageGlossLength: this.entries.length > 0
        ? this.entries.reduce((sum, e) => sum + e.gloss.length, 0) /
          this.entries.length
        : 0,
      oldestEntry: this.entries.length > 0
        ? this.entries.reduce((a, b) => (a.created < b.created ? a : b))
        : null,
      newestEntry: this.entries.length > 0
        ? this.entries.reduce((a, b) => (a.created > b.created ? a : b))
        : null,
    }
  }

  clear() {
    this.entries = []
    this.formIndex.clear()
    this.glossIndex.clear()
    this.nextId = 1
  }

  get size() {
    return this.entries.length
  }

  get isEmpty() {
    return this.entries.length === 0
  }
}

export { Lexicon }
