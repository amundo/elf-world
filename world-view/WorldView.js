class WorldView extends HTMLElement {
  constructor() {
    super()
    this.world = new World()
    this.camera = new Camera(this.world)
  }

  connectedCallback() {
    this.connectWebSocket()
    document.addEventListener("keydown", this.handleInput.bind(this))
  }

  update(worldData) {
    this.world.data = worldData
    this.render()
  }

  connectWebSocket() {
    this.webSocket = new WebSocket("ws://localhost:8080")
    this.webSocket.onmessage = (event) => {
      const worldData = JSON.parse(event.data)
      this.update(worldData)
    }
  }

  createCommand(event) {
    let command = null
    switch (event.key) {
      case "ArrowUp":
        command = { type: "move", direction: "up" }
        break
      case "ArrowDown":
        command = { type: "move", direction: "down" }
        break
      case "ArrowLeft":
        command = { type: "move", direction: "left" }
        break
      case "ArrowRight":
        command = { type: "move", direction: "right" }
        break
    }
    return command
  }
  render() {
    this.camera.terrain.reduce((grid, row, y) => {
      row.forEach((cell, x) => {
        const cellElement = document.createElement("game-cell")
        cellElement.style.gridColumn = x
        cellElement.style.gridRow = y
        cellElement.terrain = cell.type
        const actor = this.world.getActorAt(x, y)
        if (actor) {
          cellElement.setAttribute("actor", actor.type)
        }
        this.appendChild(cellElement)
      })
      return grid
    }, [])
  }

  handleInput(event) {
    const command = this.createCommand(event)
    this.dispatchEvent(
      new CustomEvent("game-command", {
        detail: { command },
        bubbles: true,
      }),
    )
    this.sendCommand(command)
  }

  async sendCommand(command) {
    // Send the command
    this.webSocket.send(JSON.stringify(command))
  }
}
