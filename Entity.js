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

export class Player extends Entity {
  constructor({ x, y, world, gameState }) {
    super({ 
      x, y, 
      entityDef: { 
        type: 'player', 
        emoji: '🧝‍♂️', 
        concept: 'player',
        solid: false 
      }, 
      gameState, 
      world 
    })
    this.inventory = ['🍎']
  }

  move(dx, dy) {
    const tx = this.world.clamp(this.x + dx, 0, this.world.config.cols - 1)
    const ty = this.world.clamp(this.y + dy, 0, this.world.config.rows - 1)
    const entity = this.world.entityGrid[ty][tx]

    if (entity?.solid) return

    if (entity?.type === 'portal') {
      entity.onInteract(this)
      return
    }

    this.moveTo(tx, ty)
    this.world.updateCamera()
    this.checkAdjacentInteractions()
  }

  checkAdjacentInteractions() {
    const directions = [
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
    ]

    let closestEntity = null
    let closestDistance = Infinity

    for (const dir of directions) {
      const checkX = this.x + dir.dx
      const checkY = this.y + dir.dy

      if (checkX >= 0 && checkX < this.world.config.cols && 
          checkY >= 0 && checkY < this.world.config.rows) {
        const entity = this.world.entityGrid[checkY][checkX]
        if (entity && entity !== this) {
          const distance = Math.abs(dir.dx) + Math.abs(dir.dy)
          if (distance < closestDistance) {
            closestDistance = distance
            closestEntity = entity
          }
        }
      }
    }

    if (this.gameState.focusedEntity !== closestEntity) {
      this.gameState.focusedEntity = closestEntity
      if (this.gameState.focusedEntity) {
        this.gameState.ui.addMessage(`${this.gameState.ui.getUIText('focus')} ${this.gameState.focusedEntity.emoji}`)
      }
    }

    // Auto-interact with NPCs and enemies
    for (const dir of directions) {
      const checkX = this.x + dir.dx
      const checkY = this.y + dir.dy

      if (checkX >= 0 && checkX < this.world.config.cols && 
          checkY >= 0 && checkY < this.world.config.rows) {
        const entity = this.world.entityGrid[checkY][checkX]
        if (entity && (entity.type === 'npc' || entity.type === 'enemy')) {
          entity.onInteract(this)
          break
        }
      }
    }
  }
}