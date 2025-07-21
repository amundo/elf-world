// GameTile.js
class GameTile extends HTMLElement {
  constructor() {
    super()
    this.classList.add("tile")

    this.coordDiv = document.createElement("div")
    this.coordDiv.className = "coord"

    this.innerSpan = document.createElement("span") // for entity emoji
    this.append(this.innerSpan, this.coordDiv)
  }

  setPosition(x, y) {
    this.dataset.x = x
    this.dataset.y = y
    this.coordDiv.textContent = `${x},${y}`
  }

  setEntity(entity) {
    this.innerSpan.textContent = entity?.emoji || ""
  }

  clear() {
    this.innerSpan.textContent = ""
  }
}

customElements.define("game-tile", GameTile)
export { GameTile }
