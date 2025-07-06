// Simple ConlangEngine embedded directly
class ConlangEngine {
  constructor(config = {}) {
    this.consonants = config.consonants || ['p', 't', 'k', 's', 'n', 'm', 'l', 'r', 'w', 'j']
    this.vowels = config.vowels || ['a', 'e', 'i', 'o', 'u']
    this.syllableStructures = config.syllableStructures || ['CV', 'CVC', 'V', 'VC']
    this.seed = config.seed || null
    this.rng = this.createRNG(this.seed)
    this.lexicon = new Map()
    this.seedWords = [
      {
        "emoji": "👋",
        "gloss": "HELLO",
        "category": "politeness",
        "type": "interjection",
        "form": ""
      },
      {
        "emoji": "❓",
        "gloss": "WHAT",
        "category": "question",
        "type": "interrogative",
        "form": ""
      },
      {
        "emoji": "🗣️",
        "gloss": "LANGUAGE",
        "category": "communication",
        "type": "noun",
        "form": ""
      },
      {
        "emoji": "✋",
        "gloss": "TAKE",
        "category": "action",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "🤲",
        "gloss": "GIVE",
        "category": "action",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "😀",
        "gloss": "HAPPY",
        "category": "emotion",
        "type": "adjective",
        "form": ""
      },
      {
        "emoji": "😢",
        "gloss": "SAD",
        "category": "emotion",
        "type": "adjective",
        "form": ""
      },
      {
        "emoji": "😡",
        "gloss": "ANGRY",
        "category": "emotion",
        "type": "adjective",
        "form": ""
      },
      {
        "emoji": "😱",
        "gloss": "AFRAID",
        "category": "emotion",
        "type": "adjective",
        "form": ""
      },
      {
        "emoji": "😴",
        "gloss": "TIRED",
        "category": "emotion",
        "type": "adjective",
        "form": ""
      },
      {
        "emoji": "🥰",
        "gloss": "LOVE",
        "category": "emotion",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "👍",
        "gloss": "YES",
        "category": "response",
        "type": "interjection",
        "form": ""
      },
      {
        "emoji": "👎",
        "gloss": "NO",
        "category": "response",
        "type": "interjection",
        "form": ""
      },
      {
        "emoji": "🏃",
        "gloss": "GO",
        "category": "movement",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "📦",
        "gloss": "HAVE",
        "category": "state",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "👂",
        "gloss": "HEAR",
        "category": "perception",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "📍",
        "gloss": "HERE",
        "category": "location",
        "type": "adverb",
        "form": ""
      },
      {
        "emoji": "🤔",
        "gloss": "HOW",
        "category": "question",
        "type": "interrogative",
        "form": ""
      },
      {
        "emoji": "🧠",
        "gloss": "KNOW",
        "category": "cognition",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "📘",
        "gloss": "LEARN",
        "category": "cognition",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "📶",
        "gloss": "NEAR",
        "category": "spatial",
        "type": "adverb",
        "form": ""
      },
      {
        "emoji": "🚫",
        "gloss": "NOT",
        "category": "negation",
        "type": "particle",
        "form": ""
      },
      {
        "emoji": "🚪",
        "gloss": "OPEN",
        "category": "action",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "🗨️",
        "gloss": "SAY",
        "category": "communication",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "👀",
        "gloss": "SEE",
        "category": "perception",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "📦",
        "gloss": "THING",
        "category": "object",
        "type": "noun",
        "form": ""
      },
      {
        "emoji": "👉",
        "gloss": "THIS",
        "category": "demonstrative",
        "type": "pronoun",
        "form": ""
      },
      {
        "emoji": "🛠️",
        "gloss": "USE",
        "category": "action",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "📍",
        "gloss": "WHERE",
        "category": "question",
        "type": "interrogative",
        "form": ""
      },
      {
        "emoji": "🧑",
        "gloss": "WHO",
        "category": "question",
        "type": "interrogative",
        "form": ""
      },
      {
        "emoji": "📝",
        "gloss": "WORD",
        "category": "language",
        "type": "noun",
        "form": ""
      },
      {
        "emoji": "🌍",
        "gloss": "WORLD",
        "category": "location",
        "type": "noun",
        "form": ""
      },
      {
        "emoji": "🍽️",
        "gloss": "EAT",
        "category": "survival",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "🥤",
        "gloss": "DRINK",
        "category": "survival",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "🛌",
        "gloss": "SLEEP",
        "category": "survival",
        "type": "verb",
        "form": ""
      },
      {
        "emoji": "😋",
        "gloss": "HUNGRY",
        "category": "need",
        "type": "adjective",
        "form": ""
      }
    ].map(word => word.gloss)

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
    const numSyllables = Math.floor(this.rng() * 3) + 1
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
    const form = this.generateRandomWord()
    this.lexicon.set(key, { form: form, gloss: concept.toUpperCase(), concept: key })
    return form
  }

  getEntry(concept) {
    return this.lexicon.get(concept.toLowerCase())
  }

  hasWord(concept) {
    return this.lexicon.has(concept.toLowerCase())
  }
}


if (import.meta?.main) {
  testConlangEngine()
}

export {
  ConlangEngine
}