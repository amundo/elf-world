// GameWorld.js - World management and rendering

import { Entity } from './Entity.js'
import { Player } from './Player.js'


export class GameWorld {
  constructor(config, gameState) {
    this.config = config
    this.gameState = gameState
    this.tileElements = Array.from({ length: config.rows }, () => Array(config.cols).fill(null))
    this.entityGrid = Array.from({ length: config.rows }, () => Array(config.cols).fill(null))
    this.camera = { x: 2, y: 2 }
    this.backgroundMusic = null
    this.isPlaying = false
    this.tileWidth = 0
    this.tileHeight = 0
  }

  async initialize() {
    this.createTileGrid()
    
    // Force immediate resize with fallback dimensions
    this.resizeView()
  }

  // Remove the waitForLayout method entirely and use fallback dimensions

  createTileGrid() {
    const worldEl = document.getElementById('world')
    worldEl.innerHTML = ''
    
    // Force CSS grid properties (in case CSS file isn't loading)
    worldEl.style.display = 'grid'
    worldEl.style.position = 'absolute'
    worldEl.style.width = '100%'
    worldEl.style.height = '100%'
    
    console.log('🎯 Creating', this.config.rows * this.config.cols, 'tiles')
    
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        const tile = document.createElement('div')
        tile.className = 'tile'
        tile.dataset.x = x
        tile.dataset.y = y
        
        // Add visual debugging
        tile.style.border = '1px solid rgba(0,0,0,0.1)'
        tile.style.minHeight = '20px'
        tile.style.minWidth = '20px'
        
        worldEl.appendChild(tile)
        this.tileElements[y][x] = tile
      }
    }
    
    console.log('✅ Created', worldEl.children.length, 'tiles')
  }

  async switchRealm(realmKey) {
    console.log('🌍 Attempting to switch to realm:', realmKey)
    console.log('🔍 Available realms:', Object.keys(this.gameState.realms))
    
    const newRealm = this.gameState.realms[realmKey]
    if (!newRealm) {
      console.error('❌ Realm not found:', realmKey)
      console.log('Available realms:', Object.keys(this.gameState.realms))
      return
    }
    
    if (newRealm === this.gameState.currentRealm) {
      console.log('⏭️ Already in realm:', realmKey)
      return
    }

    console.log('✅ Switching to realm:', newRealm.name)

    // Transition effect
    const transition = document.getElementById('transition')
    transition.classList.add('active')

    setTimeout(() => {
      // Stop current music
      if (this.backgroundMusic) {
        this.backgroundMusic.pause()
        this.backgroundMusic.currentTime = 0
      }

      this.gameState.currentRealm = newRealm
      
      // Generate conlang realm name
      const conlangName = newRealm.nameConlang 
        ? newRealm.nameConlang.map(word => this.gameState.conlang.getWord(word.toLowerCase())).join(' ')
        : newRealm.name
      
      document.getElementById('realmInfo').textContent = conlangName

      this.clearEntities()
      this.applyTerrain(newRealm)
      this.generateEntities(newRealm)
      this.repositionPlayer()
      this.updateCamera()

      this.backgroundMusic = new Audio(newRealm.music)

      setTimeout(() => transition.classList.remove('active'), 250)
    }, 250)
  }

  clearEntities() {
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        this.entityGrid[y][x] = null
        const tile = this.tileElements[y][x]
        if (tile) {
          const entities = tile.querySelectorAll('.entity:not(.player)')
          entities.forEach(entity => entity.remove())
        }
      }
    }
  }

  applyTerrain(realm) {
    // Check if realm has custom terrain data
    if (realm.customTerrain) {
      this.applyCustomTerrain(realm.customTerrain)
    } else {
      this.applyProceduralTerrain(realm.terrain)
    }
  }

  applyCustomTerrain(customTerrain) {
    console.log('🎨 Applying custom terrain design')
    for (let y = 0; y < this.config.rows && y < customTerrain.length; y++) {
      for (let x = 0; x < this.config.cols && x < customTerrain[y].length; x++) {
        const tile = this.tileElements[y][x]
        tile.style.backgroundColor = customTerrain[y][x]
      }
    }
  }

  applyProceduralTerrain(terrain) {
    console.log('🎲 Generating procedural terrain')
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        const tile = this.tileElements[y][x]
        const rand = Math.random()

        if (rand < terrain.accent.weight) {
          tile.style.backgroundColor = terrain.accent.color
        } else if (rand < terrain.accent.weight + terrain.secondary.weight) {
          tile.style.backgroundColor = terrain.secondary.color
        } else {
          tile.style.backgroundColor = terrain.primary.color
        }
      }
    }
  }

  generateEntities(realm) {
    console.log('🎯 Generating entities for realm:', realm.name)
    console.log('🔍 Realm entities:', realm.entities)
    console.log('🔍 Custom entities:', realm.customEntities)
    
    // Check if realm has custom entity placement
    if (realm.customEntities) {
      this.placeCustomEntities(realm.customEntities)
    } else if (realm.entities && Array.isArray(realm.entities)) {
      // Handle processed realm entities (array format)
      this.generateRandomEntities(realm)
    } else if (realm.entities && realm.entities.spawns) {
      // Handle unprocessed realm entities (object with spawns array)
      console.warn('⚠️ Realm entities not processed correctly, attempting fallback')
      this.generateFromSpawns(realm.entities.spawns)
    } else {
      console.warn('⚠️ No entities found for realm, using empty generation')
    }

    // Always place guaranteed portals last
    this.placePortals(realm)
  }

  generateFromSpawns(spawns) {
    console.log('🎲 Generating from spawn definitions')
    // This is a fallback for unprocessed realm data
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        if (this.gameState.player && x === this.gameState.player.x && y === this.gameState.player.y) continue

        for (const spawn of spawns) {
          if (Math.random() < spawn.chance) {
            // Create a basic entity from spawn definition
            new Entity({
              x, y,
              entityDef: {
                type: 'object', // Default type
                emoji: '❓', // Placeholder
                concept: spawn.entity,
                solid: true,
                dialogue: null
              },
              gameState: this.gameState,
              world: this
            })
            break
          }
        }
      }
    }
  }

  generateRandomEntities(realm) {
    console.log('🎲 Generating random entities')
    console.log('🔍 Available entities:', realm.entities.length)
    
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        if (this.gameState.player && x === this.gameState.player.x && y === this.gameState.player.y) continue

        for (const entityDef of realm.entities) {
          if (Math.random() < entityDef.chance) {
            new Entity({
              x, y,
              entityDef,
              gameState: this.gameState,
              world: this
            })
            break
          }
        }
      }
    }
  }

  placeCustomEntities(customEntities) {
    console.log('🎯 Placing custom entities')
    for (let y = 0; y < this.config.rows && y < customEntities.length; y++) {
      for (let x = 0; x < this.config.cols && x < customEntities[y].length; x++) {
        const entityData = customEntities[y][x]
        if (entityData && entityData.category !== 'erase') {
          // Handle portals specially
          if (entityData.category === 'portals' && entityData.destination) {
            new Entity({
              x, y,
              entityDef: {
                type: 'portal',
                emoji: entityData.emoji,
                concept: entityData.gloss,
                destination: entityData.destination,
                solid: false,
                dialogue: null
              },
              gameState: this.gameState,
              world: this
            })
          } else {
            // Regular entities with dialogue
            new Entity({
              x, y,
              entityDef: {
                type: this.getEntityType(entityData.category),
                emoji: entityData.emoji,
                concept: entityData.gloss,
                solid: this.getEntitySolidity(entityData.category, entityData.gloss),
                dialogue: this.getEntityDialogue(entityData.category, entityData.gloss)
              },
              gameState: this.gameState,
              world: this
            })
          }
        }
      }
    }
  }

  getEntityType(category) {
    const typeMap = {
      'objects': 'object',
      'npcs': 'npc', 
      'enemies': 'enemy',
      'portals': 'portal'
    }
    return typeMap[category] || 'object'
  }

  generateRandomEntities(realm) {
    console.log('🎲 Generating random entities')
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        if (this.gameState.player && x === this.gameState.player.x && y === this.gameState.player.y) continue

        for (const entityDef of realm.entities) {
          if (Math.random() < entityDef.chance) {
            new Entity({
              x, y,
              entityDef,
              gameState: this.gameState,
              world: this
            })
            break
          }
        }
      }
    }
  }

  getEntitySolidity(type, concept) {
    const solidEntities = ['tree', 'rock', 'crystal', 'mushroom']
    return solidEntities.includes(concept) || type === 'object'
  }

  getEntityDialogue(category, concept) {
    const dialogues = {
      // NPCs
      fairy: ["GREETINGS", "!", "WELCOME", "TO", "OUR", "REALM", "."],
      elder: ["HELLO", "VISITOR", ".", "WELCOME", "HERE", "."],
      wizard: ["GOOD", "DAY", "FRIEND", ".", "MAGIC", "IS", "STRONG", "HERE", "."],
      witch: ["THE", "DEAD", "WHISPER", "SECRETS", "..."],
      queen: ["I", "AM", "QUEEN", ".", "YOU", "ARE", "WELCOME", "IN", "MY", "DOMAIN", "."],
      miner: ["BEEN", "MINING", "HERE", "FOR", "YEARS", ".", "STRANGE", "MAGIC", "..."],
      
      // Enemies
      snake: ["GREETINGS", "STRANGER", "!"],
      dragon: ["ANCIENT", "GUARDIAN", "OF", "CRYSTALS", "!"],
      skull: ["WHO", "DISTURBS", "THE", "DEAD", "?"],
      zombie: ["HUNGRY", ".", "SO", "HUNGRY", "..."],
      ghost: ["YOU", "NOT", "BELONG", "HERE", "!"],
      bat: ["WHO", "IS", "HERE", "?"],
      bee: ["BUSY", "BUSY", "!", "NO", "TIME", "FOR", "TALK", "."],
      unicorn: ["PURE", "HEART", "ONLY", ".", "YOU", "ARE", "WELCOME", "?"],
      
      // Generic dialogues by category
      _npc_default: ["HELLO", "TRAVELER", ".", "WELCOME", "."],
      _enemy_default: ["WHO", "GOES", "THERE", "?"],
      _object_default: null // Objects don't speak
    }
    
    // Try specific concept first
    if (dialogues[concept]) {
      return dialogues[concept]
    }
    
    // Try category default
    if (category === 'npcs') {
      return dialogues._npc_default
    } else if (category === 'enemies') {
      return dialogues._enemy_default
    } else {
      return dialogues._object_default
    }
  }

  placePortals(realm) {
    if (!realm.portals || realm.portals.length === 0) {
      console.log('📍 No portals defined for', realm.name)
      return
    }

    console.log('🌀 Placing', realm.portals.length, 'portals for', realm.name)

    for (const portalDef of realm.portals) {
      const position = this.findEmptyPosition()
      if (position) {
        console.log(`📍 Placing ${portalDef.emoji} portal to ${portalDef.destination} at (${position.x}, ${position.y})`)
        
        new Entity({
          x: position.x,
          y: position.y,
          entityDef: {
            type: 'portal',
            emoji: portalDef.emoji,
            concept: portalDef.concept,
            destination: portalDef.destination,
            description: portalDef.description || `Portal to ${portalDef.destination}`,
            solid: false
          },
          gameState: this.gameState,
          world: this
        })
      } else {
        console.warn('⚠️ Could not find empty position for portal', portalDef.emoji)
      }
    }
  }

  findEmptyPosition(maxAttempts = 100) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * this.config.cols)
      const y = Math.floor(Math.random() * this.config.rows)

      // Check if position is empty
      if (!this.entityGrid[y][x] && 
          !(this.gameState.player && x === this.gameState.player.x && y === this.gameState.player.y)) {
        return { x, y }
      }
    }
    return null // Could not find empty position
  }

  repositionPlayer() {
    if (!this.gameState.player) {
      this.gameState.player = new Player({ 
        x: 2, y: 2, 
        world: this, 
        gameState: this.gameState 
      })
    } else {
      // Find empty spot for existing player
      let newX = 2, newY = 2
      for (let attempts = 0; attempts < 50; attempts++) {
        const testX = Math.floor(Math.random() * this.config.cols)
        const testY = Math.floor(Math.random() * this.config.rows)
        if (!this.entityGrid[testY][testX]) {
          newX = testX
          newY = testY
          break
        }
      }
      this.gameState.player.moveTo(newX, newY)
    }
  }

  updateCamera() {
    if (!this.gameState.player) return

    const marginX = Math.floor(this.config.viewWidth / 2)
    const marginY = Math.floor(this.config.viewHeight / 2)

    if (this.gameState.player.x < this.camera.x - marginX + 1) {
      this.camera.x = this.clamp(this.gameState.player.x + marginX - 1, marginX, this.config.cols - marginX - 1)
    }
    if (this.gameState.player.x > this.camera.x + marginX - 1) {
      this.camera.x = this.clamp(this.gameState.player.x - marginX + 1, marginX, this.config.cols - marginX - 1)
    }
    if (this.gameState.player.y < this.camera.y - marginY + 1) {
      this.camera.y = this.clamp(this.gameState.player.y + marginY - 1, marginY, this.config.rows - marginY - 1)
    }
    if (this.gameState.player.y > this.camera.y + marginY - 1) {
      this.camera.y = this.clamp(this.gameState.player.y - marginY + 1, marginY, this.config.rows - marginY - 1)
    }

    const offsetX = this.clamp(this.camera.x - marginX, 0, this.config.cols - this.config.viewWidth) * this.tileWidth
    const offsetY = this.clamp(this.camera.y - marginY, 0, this.config.rows - this.config.viewHeight) * this.tileHeight
    
    const worldEl = document.getElementById('world')
    worldEl.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`
  }

  resizeView() {
    console.log('🔧 Starting resizeView...')
    
    const gamePane = document.querySelector('.game-pane')
    console.log('🔍 Game pane element:', gamePane)
    
    let gamePaneWidth = gamePane?.clientWidth || 0
    let gamePaneHeight = gamePane?.clientHeight || 0
    
    console.log('📏 Initial dimensions:', gamePaneWidth, 'x', gamePaneHeight)
    
    // Always use fallback dimensions for now
    if (gamePaneWidth === 0 || gamePaneHeight === 0) {
      console.warn('⚠️ Using fallback dimensions')
      gamePaneWidth = 800   // Fixed width
      gamePaneHeight = 600  // Fixed height
    }
    
    console.log('📐 Final dimensions:', gamePaneWidth, 'x', gamePaneHeight)

    this.tileWidth = gamePaneWidth / this.config.viewWidth
    this.tileHeight = gamePaneHeight / this.config.viewHeight
    
    console.log('📐 Calculated tile size:', this.tileWidth, 'x', this.tileHeight)
    
    const worldEl = document.getElementById('world')
    if (!worldEl) {
      console.error('❌ #world element not found')
      return
    }
    
    // Set grid template with forced dimensions
    worldEl.style.gridTemplateColumns = `repeat(${this.config.cols}, ${this.tileWidth}px)`
    worldEl.style.gridTemplateRows = `repeat(${this.config.rows}, ${this.tileHeight}px)`
    worldEl.style.width = `${this.config.cols * this.tileWidth}px`
    worldEl.style.height = `${this.config.rows * this.tileHeight}px`
    
    // Force display properties
    worldEl.style.display = 'grid'
    worldEl.style.position = 'absolute'
    
    console.log('✅ Grid template set:', worldEl.style.gridTemplateColumns.substring(0, 50) + '...')
    console.log('✅ World size set:', worldEl.style.width, 'x', worldEl.style.height)
    
    this.updateCamera()
  }

  toggleAudio() {
    if (this.isPlaying) {
      if (this.backgroundMusic) this.backgroundMusic.pause()
      document.getElementById('audioToggle').textContent = '🔇'
      this.isPlaying = false
    } else {
      if (this.backgroundMusic) {
        this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e))
      }
      document.getElementById('audioToggle').textContent = '🔊'
      this.isPlaying = true
    }
  }

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
  }
}