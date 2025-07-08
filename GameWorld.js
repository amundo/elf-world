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
    const newRealm = this.gameState.realms[realmKey]
    if (!newRealm || newRealm === this.gameState.currentRealm) return

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
      document.getElementById('realmInfo').textContent = newRealm.name

      this.clearEntities()
      this.applyTerrain(newRealm)
      this.generateEntities(newRealm)
      this.repositionPlayer()
      this.updateCamera()

      // Load new music (skip for now since files don't exist)
      // this.backgroundMusic = new Audio(newRealm.music)

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
    const terrain = realm.terrain
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
    // First, generate random entities
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

    // Then, place guaranteed portals in random locations
    this.placePortals(realm)
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
            description: portalDef.description,
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