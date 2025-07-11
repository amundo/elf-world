// Entity.js - Entity and Player classes

export class Entity {
  constructor({ x, y, entityDef, gameState, world }) {
    this.x = x
    this.y = y
    this.type = entityDef.type
    this.solid = entityDef.solid || false
    this.dialogue = entityDef.dialogue || null
    this.destination = entityDef.destination || null
    this.gameState = gameState
    this.world = world

    this.emoji = Array.isArray(entityDef.emoji) 
      ? entityDef.emoji[Math.floor(Math.random() * entityDef.emoji.length)]
      : entityDef.emoji

    this.concept = entityDef.concept || this.getConceptFromEmoji(this.emoji)
    this.conlangName = gameState.conlang.getWord(this.concept, {
      entityType: this.type,
      emoji: this.emoji,
      realm: gameState.currentRealm?.name || 'unknown'
    })

    this.createElement()
    this.addToWorld()
  }

  createElement() {
    this.el = document.createElement('div')
    this.el.className = `entity ${this.type}`
    this.el.textContent = this.emoji
    this.el.title = `${this.concept} (${this.conlangName})`
    this.el.addEventListener('click', () => this.inspect())
  }

  addToWorld() {
    const tile = this.world.tileElements[this.y][this.x]
    if (tile) {
      tile.appendChild(this.el)
    }
    this.world.entityGrid[this.y][this.x] = this
  }

  speak() {
    if (!this.dialogue) return 'The entity makes no sound.'
    
    // If dialogue is an array of concepts, translate to conlang
    if (Array.isArray(this.dialogue)) {
      return this.dialogue.map(word => {
        // Keep punctuation as-is
        if (word.match(/^[.!?,:;]$/)) return word
        // Translate concepts to conlang
        return this.gameState.conlang.getWord(word.toLowerCase())
      }).join(' ')
    }
    
    // Legacy support for English dialogue
    return this.dialogue
  }

  getConceptFromEmoji(emoji) {
    const emojiMap = {
      '🌲': 'tree', '🪨': 'rock', '🐍': 'snake', '🦇': 'bat',
      '👴': 'elder', '🧙‍♂️': 'wizard', '🌀': 'portal', '✨': 'portal',
      '🌫️': 'portal', '🪦': 'grave', '🌙': 'moon', '💀': 'skull',
      '🧟': 'zombie', '👻': 'ghost', '🧙‍♀️': 'witch', '🔮': 'crystal',
      '🌸': 'flower', '🌺': 'flower', '🍄': 'mushroom', '🦋': 'butterfly',
      '🐝': 'bee', '🦄': 'unicorn', '🧚‍♀️': 'fairy', '🧚‍♂️': 'fairy',
      '👑': 'queen'
    }
    return emojiMap[emoji] || 'entity'
  }

  inspect() {
    const isKnown = this.gameState.knownWords.has(this.concept)
    
    this.gameState.ui.addMessage(`${this.gameState.ui.getUIText('youSee')} ${this.emoji}`)
    if (isKnown) {
      this.gameState.ui.addMessage(`${this.conlangName}`, 'success')
    } else {
      this.gameState.ui.addMessage(`???`, 'error')
    }

    this.gameState.selectedEntity = this
  }

  moveTo(newX, newY) {
    if (this.el.parentElement) {
      this.el.parentElement.removeChild(this.el)
    }
    this.world.entityGrid[this.y][this.x] = null

    this.x = newX
    this.y = newY
    const tile = this.world.tileElements[newY][newX]
    if (tile) {
      tile.appendChild(this.el)
    }
    this.world.entityGrid[newY][newX] = this
  }

  onInteract(player) {
    console.log('🎯 Entity interaction:', this.type, this.concept)
    
    if (this.dialogue) {
      // NPCs and enemies speak in conlang
      const spokenText = this.speak()
      console.log('💬 Entity speaking:', spokenText)
      this.gameState.ui.showDialogue(spokenText, this)
    }
  }
}
