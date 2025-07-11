// Ultra-Simplified GameWorld.js - Single realm, no portals

import { Entity } from './Entity.js'
import { Player } from './Player.js'

import {SimplexNoise} from './editor/simplex-noise.js'

const simplex = new SimplexNoise('wtf')

window.simplex = simplex
/* 
Responsible for:

* Creating and managing the tile grid
* Loading and applying realm data (terrain, entities)
* Managing the camera and view
* Handling resizing and tile dimensions


*/

export class GameWorld {
  constructor(config, gameState) {
    this.config = config
    this.gameState = gameState
    this.tileElements = Array.from({ length: config.rows }, () => Array(config.cols).fill(null))
    this.entityGrid = Array.from({ length: config.rows }, () => Array(config.cols).fill(null))
    this.camera = { x: 2, y: 2 }
    this.tileWidth = 0
    this.tileHeight = 0
  }

  async initialize() {
    this.createTileGrid()
    this.resizeView()
    this.loadRealm()
  }

  createTileGrid() {
    const worldEl = document.getElementById('world')
    worldEl.innerHTML = ''
    
    // Force CSS grid properties
    worldEl.style.display = 'grid'
    worldEl.style.position = 'absolute'
    worldEl.style.width = '100%'
    worldEl.style.height = '100%'
    
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
  }

  /*
  Load realm data and apply terrain and entities
  */
  loadRealm() {
    const realm = this.gameState.realm
    if (!realm) {
      console.error('❌ No realm data loaded')
      return
    }

    console.log('🌍 Loading realm:', realm.name)
    

    // Update realm name display
    const conlangName = realm.nameConlang 
      ? realm.nameConlang.map(word => this.gameState.conlang.getWord(word.toLowerCase())).join(' ')
      : realm.name
    document.getElementById('realmInfo').textContent = conlangName

    // Apply terrain and entities
    this.applyTerrain(realm)
    this.placeEntities(realm)
    this.createPlayer()
    this.updateCamera()
  }

  applyTerrain(realm) {


const width = this.config.cols
const height = this.config.rows
const scale = 0.05
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const value = simplex.noise2D(x * scale, y * scale)
    const normalized = (value + 1) / 2 // Normalize to [0, 1]
    // terrain is an array of colors
    let color = 'lightgreen' // default
    if (Array.isArray(realm.terrain) && Array.isArray(realm.terrain[0])) {
      const terrainColors = realm.terrain.flat()
      const index = Math.floor(normalized * terrainColors.length)
      color = terrainColors[Math.min(index, terrainColors.length - 1)]
    } else if (typeof realm.terrain === 'string') {
      color = realm.terrain
    }
    const tile = this.tileElements[y][x]
    tile.style.backgroundColor = color
  }
}

  }

  placeEntities(realm) {
    if (!realm.entities) {
      console.warn('⚠️ No entity data for realm')
      return
    }

    console.log('🎯 Placing entities')
    
    for (let y = 0; y < this.config.rows && y < realm.entities.length; y++) {
      for (let x = 0; x < this.config.cols && x < realm.entities[y].length; x++) {
        const entityId = realm.entities[y][x]
        if (entityId) {
          this.createEntityFromId(x, y, entityId)
        }
      }
    }
  }

  createEntityFromId(x, y, entityId) {
    const entityDef = this.gameState.entityCatalog.findEntity(entityId)
    if (!entityDef) {
      console.warn('⚠️ Unknown entity ID:', entityId)
      return
    }

    new Entity({
      x, y,
      entityDef: {
        type: entityDef.type,
        emoji: entityDef.emoji,
        concept: entityDef.gloss,
        solid: entityDef.solid,
        dialogue: entityDef.dialogue
      },
      gameState: this.gameState,
      world: this
    })
  }

  createPlayer() {
    // Find empty spot for player
    let playerX = 2, playerY = 2
    
    for (let attempts = 0; attempts < 50; attempts++) {
      const testX = Math.floor(Math.random() * this.config.cols)
      const testY = Math.floor(Math.random() * this.config.rows)
      if (!this.entityGrid[testY][testX]) {
        playerX = testX
        playerY = testY
        break
      }
    }

    this.gameState.player = new Player({ 
      x: playerX, 
      y: playerY, 
      world: this, 
      gameState: this.gameState 
    })
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
    const gamePane = document.querySelector('.game-pane')
    if (!gamePane) {
      console.error('❌ .game-pane element not found')
      return
    }
    
    let gamePaneWidth = gamePane.clientWidth
    let gamePaneHeight = gamePane.clientHeight
    
    // Fallback dimensions if layout isn't ready
    if (gamePaneWidth === 0 || gamePaneHeight === 0) {
      console.warn('⚠️ Using fallback dimensions')
      gamePaneWidth = 800
      gamePaneHeight = 600
    }

    this.tileWidth = gamePaneWidth / this.config.viewWidth
    this.tileHeight = gamePaneHeight / this.config.viewHeight
    
    const worldEl = document.getElementById('world')
    worldEl.style.gridTemplateColumns = `repeat(${this.config.cols}, ${this.tileWidth}px)`
    worldEl.style.gridTemplateRows = `repeat(${this.config.rows}, ${this.tileHeight}px)`
    worldEl.style.width = `${this.config.cols * this.tileWidth}px`
    worldEl.style.height = `${this.config.rows * this.tileHeight}px`
    
    this.updateCamera()
  }

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
  }
}