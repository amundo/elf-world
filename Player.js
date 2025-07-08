import { Entity } from './Entity.js'

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