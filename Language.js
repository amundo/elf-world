import { Lexicon } from "./Lexicon.js"

class Language {
  constructor() {
    this.metadata = {}
    this.inventory = []
    this.phonology = []
    this.lexicon = new Lexicon()
    this.grammar = []
  }

  set data(languageObject) {
    this.metadata = languageObject.metadata || {}
    this.inventory = languageObject.inventory || []
    this.phonology = languageObject.phonology || []
    this.lexicon = new Lexicon(languageObject.lexicon || [])
    this.grammar = languageObject.grammar || []
  }

  get data() {
    return {
      metadata: this.metadata,
      inventory: this.inventory,
      phonology: this.phonology,
      lexicon: this.lexicon.entries,
      grammar: this.grammar,
    }
  }

  generateWord(syllableCount = null) {
    if (!this.phonology.length || !this.inventory.length) return ""

    const choose = (list) => list[Math.floor(Math.random() * list.length)]

    const syllableCountChoices = [1, 2, 2, 3, 3, 3, 4]
    const numberOfSyllables = syllableCount ?? choose(syllableCountChoices)

    const consonants = this.inventory.filter((symbol) =>
      !/[aeiou]/i.test(symbol)
    )
    const vowels = this.inventory.filter((symbol) => /[aeiou]/i.test(symbol))

    const chooseSymbolForType = (type) => {
      const symbolList = type === "C" ? consonants : vowels
      return choose(symbolList) || ""
    }

    let resultWord = ""
    for (let i = 0; i < numberOfSyllables; i++) {
      const syllablePattern = choose(this.phonology)
      const syllable = syllablePattern
        .split("")
        .map((symbolType) => {
          if (symbolType === "C" || symbolType === "V") {
            return chooseSymbolForType(symbolType)
          }
          return ""
        })
        .join("")
      resultWord += syllable
    }

    return resultWord
  }
}
