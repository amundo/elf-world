import { ConlangEngine } from "./ConlangEngine.js"
import { GameWorld } from "./GameWorld.js"
import { UIManager } from "./UIManager.js"
import { CommandProcessor } from "./CommandProcessor.js"
import { EntityCatalog } from "./EntityCatalog.js"
import { Camera } from "./Camera.js"
import { GameTile } from "./GameTile.js"

const CONFIG = {
  world: {
    cols: 30,
    rows: 20,
    viewWidth: 10,
    viewHeight: 8,
  },
  conlang: {
    seed: Math.floor(Math.random() * 1000),
    consonants: ["p", "t", "k", "s", "n", "m", "l", "r", "w", "j"],
    vowels: ["a", "e", "i", "o", "u"],
    syllableStructures: ["CV", "CVC", "V", "VC"],
    seedWords: [
      "GO",
      "HAVE",
      "HEAR",
      "HELLO",
      "HERE",
      "HOW",
      "KNOW",
      "LEARN",
      "NEAR",
      "NOT",
      "OPEN",
      "SAY",
      "SEE",
      "TAKE",
      "THING",
      "THIS",
      "USE",
      "WHAT",
      "WHERE",
      "WHO",
      "WORD",
      "WORLD",
      "GOOD",
      "DAY",
      "WELCOME",
      "GREETINGS",
      "FRIEND",
      "STRANGER",
      "VISITOR",
      "YOU",
      "I",
      "WE",
      "IS",
      "ARE",
      "THE",
      "TO",
      "IN",
      "FOR",
      "TREE",
      "ROCK",
      "FLOWER",
      "FAIRY",
      "ELDER",
      "WIZARD",
      "SNAKE",
      "BAT",
      "MAGIC",
      "REALM",
      "STRONG",
      "DEAD",
      "DISTURBS",
    ],
  },
  game: {
    initialVocabulary: ["what", "this"],
  },
}

let gameState = {
  conlang: null,
  world: null,
  ui: null,
  commands: null,
  realm: null,
  entityCatalog: null,
  player: null,
  knownWords: new Set(CONFIG.game.initialVocabulary),
  focusedEntity: null,
  selectedEntity: null,
  camera: null,
  container: null,
}

async function initializeGame() {
  try {
    const entityCatalogData = await loadEntityCatalog()
    let realmData = await loadRealm()
    realmData = realmData.forest

    gameState.conlang = new ConlangEngine(CONFIG.conlang)
    gameState.entityCatalog = new EntityCatalog(entityCatalogData)
    gameState.realm = realmData
    gameState.world = new GameWorld(CONFIG.world, gameState)
    gameState.ui = new UIManager(gameState)
    gameState.commands = new CommandProcessor(gameState)

    setupEventListeners()
    gameState.ui.initialize()
    await gameState.world.initialize()

    const container = document.getElementById("world")
    const TILE_SIZE = 48
    const camera = new Camera(CONFIG.world)
    camera.setPlayer(gameState.player)

    gameState.camera = camera
    gameState.container = container

    showGame()

    // Wait until layout is visible
    requestAnimationFrame(() => {
      updateViewportSize(camera, container, TILE_SIZE)
      camera.focusAt(gameState.player.x, gameState.player.y)
      renderViewport(camera, gameState.world, container)
    })

    gameState.ui.addMessage(gameState.ui.getUIText("welcomeMessage"), "success")
    gameState.ui.addMessage(gameState.ui.getUIText("helpHint"), "info")

    exposeDebugAPI()
  } catch (error) {
    console.error("Failed to initialize game:", error)
    showError("Failed to load game resources. Please refresh the page.")
  }
}

function setupEventListeners() {
  window.addEventListener("keydown", (e) => {
    console.log(
      `camera: ${gameState.camera.x},${gameState.camera.y}, player: ${gameState.player?.x},${gameState.player?.y}`,
    )

    if (!gameState.player) return
    let dx = 0, dy = 0

    switch (e.key) {
      case "ArrowLeft":
        dx = -1
        break
      case "ArrowRight":
        dx = 1
        break
      case "ArrowUp":
        dy = -1
        break
      case "ArrowDown":
        dy = 1
        break
      default:
        return
    }

    e.preventDefault()
    gameState.player.move(dx, dy)
    gameState.camera.trackPlayer()
    renderViewport(gameState.camera, gameState.world, gameState.container)
  })

  const commandInput = document.getElementById("commandInput")
  commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const input = commandInput.value.trim()
      if (input) {
        gameState.commands.processCommand(input)
        commandInput.value = ""
      }
    }
  })

  window.addEventListener("resize", () => {
    updateViewportSize(gameState.camera, gameState.container, 48)
    renderViewport(gameState.camera, gameState.world, gameState.container)
  })
}

function updateViewportSize(camera, container, tileSize) {
  const widthPx = container.clientWidth
  const heightPx = container.clientHeight

  const viewWidth = Math.floor(widthPx / tileSize)
  const viewHeight = Math.floor(heightPx / tileSize)

  camera.setViewSize(viewWidth, viewHeight)
  container.style.gridTemplateColumns = `repeat(${viewWidth}, 1fr)`
  container.style.gridTemplateRows = `repeat(${viewHeight}, 1fr)`
}

// function renderViewport(camera, world, container) {
//   const { startX, endX, startY, endY } = camera.getVisibleBounds()
//   const tiles = []

//   for (let y = startY; y < endY; y++) {
//     for (let x = startX; x < endX; x++) {
//       const tile = document.createElement('div')
//       tile.classList.add('tile')

//       const entity = world.getEntity?.(x, y)
//       const terrain = world.getTerrain?.(x, y)

//       const isPlayerHere = gameState.player && x === gameState.player.x && y === gameState.player.y

//       if (isPlayerHere) {
//           console.log(`Player rendered at tile (${x}, ${y})`)

//         tile.appendChild(gameState.player)
//       } else if (entity?.emoji) {
//         tile.textContent = entity.emoji
//       }

//       tiles.push(tile)
//     }
//   }

//   container.replaceChildren(...tiles)
// }
//

function renderViewport(camera, world, container) {
  const { startX, endX, startY, endY } = camera.getVisibleBounds()
  const tiles = []

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const tile = new GameTile()
      tile.setPosition(x, y)

      const entity = world.getEntity?.(x, y)
      tile.setEntity(entity)

      tiles.push(tile)
    }
  }

  container.replaceChildren(...tiles)
}

function showGame() {
  document.getElementById("loadingScreen").style.display = "none"
  document.getElementById("gameView").style.display = "flex"
}

function showError(message) {
  const loadingScreen = document.getElementById("loadingScreen")
  loadingScreen.textContent = `Error: ${message}`
  loadingScreen.style.color = "#ff6666"
}

async function loadEntityCatalog() {
  try {
    const response = await fetch("./entities/index.json")
    if (!response.ok) {
      throw new Error(`Failed to load entity catalog: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to load entity catalog:", error)
    return getDefaultEntityCatalog()
  }
}

async function loadRealm() {
  try {
    const response = await fetch("./realms/realms.json")
    if (!response.ok) {
      throw new Error(`Failed to load realm: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to load realm:", error)
    return getFallbackRealm()
  }
}

function getDefaultEntityCatalog() {
  return {
    objects: {
      tree: { emoji: "🌲", gloss: "tree", solid: true },
      rock: { emoji: "🪨", gloss: "rock", solid: true },
      flower: { emoji: "🌸", gloss: "flower", solid: false },
      mushroom: { emoji: "🍄", gloss: "mushroom", solid: true },
    },
    npcs: {
      fairy: {
        emoji: "🧚‍♀️",
        gloss: "fairy",
        solid: false,
        dialogue: ["GREETINGS", "!", "WELCOME", "TO", "OUR", "REALM", "."],
      },
      elder: {
        emoji: "👴",
        gloss: "elder",
        solid: false,
        dialogue: ["HELLO", "VISITOR", ".", "WELCOME", "HERE", "."],
      },
      wizard: {
        emoji: "🧙‍♂️",
        gloss: "wizard",
        solid: false,
        dialogue: [
          "GOOD",
          "DAY",
          "FRIEND",
          ".",
          "MAGIC",
          "IS",
          "STRONG",
          "HERE",
          ".",
        ],
      },
    },
    enemies: {
      snake: {
        emoji: "🐍",
        gloss: "snake",
        solid: false,
        dialogue: ["GREETINGS", "STRANGER", "!"],
      },
      bat: {
        emoji: "🦇",
        gloss: "bat",
        solid: false,
        dialogue: ["WHO", "IS", "HERE", "?"],
      },
    },
  }
}

function getFallbackRealm() {
  return {
    name: "Fairy Realm",
    nameConlang: ["MAGIC", "REALM"],
    size: { width: 30, height: 20 },
    terrain: Array.from(
      { length: 20 },
      () =>
        Array.from(
          { length: 30 },
          () =>
            ["#FFB6C1", "#E6E6FA", "#98FB98"][Math.floor(Math.random() * 3)],
        ),
    ),
    entities: Array.from(
      { length: 20 },
      () =>
        Array.from({ length: 30 }, () => {
          if (Math.random() < 0.08) return "flower"
          if (Math.random() < 0.05) return "tree"
          if (Math.random() < 0.03) return "mushroom"
          if (Math.random() < 0.02) return "fairy"
          if (Math.random() < 0.01) return "elder"
          return null
        }),
    ),
  }
}

function exposeDebugAPI() {
  if (typeof window !== "undefined") {
    Object.assign(window, {
      game: gameState,
      conlang: gameState.conlang,
      lexicon: gameState.conlang?.getLexicon(),
      entityCatalog: gameState.entityCatalog,
      realm: gameState.realm,
      player: () => gameState.player,
      addWord: (gloss, form) =>
        gameState.conlang.getLexicon().addWord(gloss, form),
      exportLexicon: () => gameState.conlang.exportLexicon(),
      learnWord: (word) => gameState.knownWords.add(word),
      findEntity: (id) => gameState.entityCatalog.findEntity(id),
      getAllEntities: () => gameState.entityCatalog.getAllEntities(),
      showKnownWords: () => {
        console.log("📚 Known words:")
        Array.from(gameState.knownWords).forEach((word) => {
          const conlangWord = gameState.conlang.getWord(word)
          console.log(`  ${word} = ${conlangWord}`)
        })
        return Array.from(gameState.knownWords)
      },
      analyzeRealm: () => {
        const realm = gameState.realm
        console.log(`🔍 Analyzing realm: ${realm.name}`)
        const colorCounts = {}
        const entityCounts = {}
        realm.terrain?.forEach((row) =>
          row.forEach((color) => {
            colorCounts[color] = (colorCounts[color] || 0) + 1
          })
        )
        realm.entities?.forEach((row) =>
          row.forEach((id) => {
            if (id) entityCounts[id] = (entityCounts[id] || 0) + 1
          })
        )
        console.log("🎯 Entities placed:")
        console.table(entityCounts)
        return realm
      },
      dumpGameState: () => {
        const state = {
          knownWords: Array.from(gameState.knownWords),
          playerPos: gameState.player
            ? { x: gameState.player.x, y: gameState.player.y }
            : null,
          lexiconSize: gameState.conlang.getLexicon().size,
          entitiesInCatalog: gameState.entityCatalog.getAllEntities().length,
          realmName: gameState.realm?.name,
        }
        console.table(state)
        return state
      },
    })
    console.log("🧝‍♂️ Elf World Debug API loaded!")
  }
}

initializeGame().catch((error) => {
  console.error("Game initialization failed:", error)
  showError("Game failed to start. Check console for details.")
})
