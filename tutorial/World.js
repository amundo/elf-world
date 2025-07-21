class World {
  #data = { "actors": [], "terrain": [] }
  constructor() {
    console.log("World created")
  }

  async load(url) {
    console.log(`Loading world data from ${url}...`)
    url = new URL("./world1.json", import.meta.url) // @TODO: remove for production
    let response = await fetch(url)
    let data = await response.json()
    this.data = data
  }

  buildGrid(terrain) {
    let grid = terrain.map((row) =>
      row.map((cell) => ({
        type: cell,
      }))
    )
    this.#data.terrain = grid
  }

  processData(gameData) {
    this.buildGrid(gameData.terrain)
    this.processActors(gameData.actors)
  }

  processActors(actors) {
    this.#data.actors = actors
    this.setPlayer()
  }

  setPlayer(id = null) {
    let player
    if (id) {
      player = this.#data.actors.find((actor) => actor.id === id)
    } else {
      player = this.#data.actors.find((actor) => actor.type === "player")
    }
    this.#data.npcs = this.#data.actors.filter((actor) => actor !== player)
    console.log(`npcs: ${this.#data.npcs.length}`)
    this.#data.player = player
  }

  set data(gameData) {
    this.processData(gameData)
  }

  set terrain(terrain) {
    this.#data.terrain = terrain
  }

  get actors() {
    return this.#data.actors
  }
  get terrain() {
    return this.#data.terrain
  }
  get player() {
    return this.#data.player
  }
  get npcs() {
    return this.#data.npcs
  }

  at(x, y) { // get terrain and actors at a specific location
    let terrainCell = this.#data.terrain[y]?.[x] || null
    let actorsHere = this.#data.actors.filter((actor) =>
      actor.x === x && actor.y === y
    )
    return {
      terrain: terrainCell,
      actors: actorsHere,
    }
  }

  debugRender() { // use emojis to render a simple text version of the world
    let terrain = this.#data.terrain.map((row) =>
      row.map((cell) => {
        if (cell.type === "grass") return "🟩"
        if (cell.type === "water") return "🟦"
        if (cell.type === "mountain") return "⬜"
        return "⬜"
      })
    )
    this.#data.actors.forEach((actor) => {
      let { x, y, emoji } = actor
      terrain[y][x] = emoji
    })
    let terrainText = terrain.map((row) => row.join("")).join("\n")
    return terrainText
  }
}

export { World }
