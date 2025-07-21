export class GamePlayer extends HTMLElement {
  constructor() {
    super()
    this.classList.add("player")
    this.textContent = "🧝‍♂️"
    this.x = 0
    this.y = 0
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
  }

  move(dx, dy) {
    this.x += dx
    this.y += dy
    this.dataset.x = this.x
    this.dataset.y = this.y
  }
}

customElements.define("game-player", GamePlayer)
