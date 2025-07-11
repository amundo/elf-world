// Ultra-Simplified ElfWorld.js - Single realm, no portals

import { ConlangEngine } from './ConlangEngine.js'
import { GameWorld } from './GameWorld.js'
import { UIManager } from './UIManager.js'
import { CommandProcessor } from './CommandProcessor.js'
import { EntityCatalog } from './EntityCatalog.js'

// Game configuration
const CONFIG = {
  world: {
    cols: 30,
    rows: 20,
    viewWidth: 10,
    viewHeight: 8
  },
  conlang: {
    seed: Math.floor(Math.random() * 1000),
    consonants: ['p', 't', 'k', 's', 'n', 'm', 'l', 'r', 'w', 'j'],
    vowels: ['a', 'e', 'i', 'o', 'u'],
    syllableStructures: ['CV', 'CVC', 'V', 'VC'],
    seedWords: [
      // Core command words
      "GO", "HAVE", "HEAR", "HELLO", "HERE", "HOW", "KNOW", "LEARN", 
      "NEAR", "NOT", "OPEN", "SAY", "SEE", "TAKE", "THING", "THIS", 
      "USE", "WHAT", "WHERE", "WHO", "WORD", "WORLD",
      // Social phrases
      "GOOD", "DAY", "WELCOME", "GREETINGS", "FRIEND", "STRANGER", "VISITOR",
      "YOU", "I", "WE", "IS", "ARE", "THE", "TO", "IN", "FOR",
      // Entity-specific words
      "TREE", "ROCK", "FLOWER", "FAIRY", "ELDER", "WIZARD", "SNAKE", "BAT",
      "MAGIC", "REALM", "STRONG", "DEAD", "DISTURBS"
    ]
  },
  game: {
    initialVocabulary: ['what', 'this']
  }
}

// Global game state
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
  selectedEntity: null
}

// Initialize the game
async function initializeGame() {
  try {
    // Load external resources
    const entityCatalogData = await loadEntityCatalog()
    const realmData = await loadRealm()
    console.log(realmData)
    
    // Initialize core systems
    gameState.conlang = new ConlangEngine(CONFIG.conlang)
    gameState.entityCatalog = new EntityCatalog(entityCatalogData)
    gameState.realm = realmData
    gameState.world = new GameWorld(CONFIG.world, gameState)
    gameState.ui = new UIManager(gameState)
    gameState.commands = new CommandProcessor(gameState)

    // Set up event listeners
    setupEventListeners()
    
    // Initialize UI
    gameState.ui.initialize()
    
    // Create and load the world
    await gameState.world.initialize()
    
    // Show the game
    showGame()
    
    // Welcome messages
    gameState.ui.addMessage(gameState.ui.getUIText('welcomeMessage'), 'success')
    gameState.ui.addMessage(gameState.ui.getUIText('helpHint'), 'info')

    // Expose debugging interface
    exposeDebugAPI()
    
  } catch (error) {
    console.error('Failed to initialize game:', error)
    showError('Failed to load game resources. Please refresh the page.')
  }
}

// Load entity catalog
async function loadEntityCatalog() {
  try {
    const response = await fetch('./entities/index.json')
    if (!response.ok) {
      throw new Error(`Failed to load entity catalog: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to load entity catalog:', error)
    return getDefaultEntityCatalog()
  }
}

// Load single realm
async function loadRealm() {
  try {
    const response = await fetch('./realms/forest.json')
    if (!response.ok) {
      throw new Error(`Failed to load realm: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to load realm:', error)
    return getFallbackRealm()
  }
}

// Default entity catalog
function getDefaultEntityCatalog() {
  return {
    objects: {
      tree: { emoji: '🌲', gloss: 'tree', solid: true },
      rock: { emoji: '🪨', gloss: 'rock', solid: true },
      flower: { emoji: '🌸', gloss: 'flower', solid: false },
      mushroom: { emoji: '🍄', gloss: 'mushroom', solid: true }
    },
    npcs: {
      fairy: { 
        emoji: '🧚‍♀️', 
        gloss: 'fairy', 
        solid: false,
        dialogue: ["GREETINGS", "!", "WELCOME", "TO", "OUR", "REALM", "."]
      },
      elder: { 
        emoji: '👴', 
        gloss: 'elder', 
        solid: false,
        dialogue: ["HELLO", "VISITOR", ".", "WELCOME", "HERE", "."]
      },
      wizard: { 
        emoji: '🧙‍♂️', 
        gloss: 'wizard', 
        solid: false,
        dialogue: ["GOOD", "DAY", "FRIEND", ".", "MAGIC", "IS", "STRONG", "HERE", "."]
      }
    },
    enemies: {
      snake: { 
        emoji: '🐍', 
        gloss: 'snake', 
        solid: false,
        dialogue: ["GREETINGS", "STRANGER", "!"]
      },
      bat: { 
        emoji: '🦇', 
        gloss: 'bat', 
        solid: false,
        dialogue: ["WHO", "IS", "HERE", "?"]
      }
    }
  }
}

// Fallback realm with proper format
function getFallbackRealm() {
  return {
    name: "Fairy Realm",
    nameConlang: ["MAGIC", "REALM"],
    size: { width: 30, height: 20 },
    terrain: Array.from({ length: 20 }, () => 
      Array.from({ length: 30 }, () => 
        ['#FFB6C1', '#E6E6FA', '#98FB98'][Math.floor(Math.random() * 3)]
      )
    ),
    entities: Array.from({ length: 20 }, (_, y) => 
      Array.from({ length: 30 }, (_, x) => {
        // Place some entities
        if (Math.random() < 0.08) return 'flower'
        if (Math.random() < 0.05) return 'tree'
        if (Math.random() < 0.03) return 'mushroom'
        if (Math.random() < 0.02) return 'fairy'
        if (Math.random() < 0.01) return 'elder'
        return null
      })
    )
  }
}

// Set up event listeners
function setupEventListeners() {
  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (!gameState.player) return
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        gameState.player.move(-1, 0)
        break
      case 'ArrowRight':
        e.preventDefault()
        gameState.player.move(1, 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        gameState.player.move(0, -1)
        break
      case 'ArrowDown':
        e.preventDefault()
        gameState.player.move(0, 1)
        break
    }
  })

  // Command input
  const commandInput = document.getElementById('commandInput')
  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = commandInput.value.trim()
      if (input) {
        gameState.commands.processCommand(input)
        commandInput.value = ''
      }
    }
  })

  // Window resize
  window.addEventListener('resize', () => {
    gameState.world.resizeView()
  })
}

// Show/hide game interface
function showGame() {
  document.getElementById('loadingScreen').style.display = 'none'
  document.getElementById('gameView').style.display = 'flex'
}

function showError(message) {
  const loadingScreen = document.getElementById('loadingScreen')
  loadingScreen.textContent = `Error: ${message}`
  loadingScreen.style.color = '#ff6666'
}

// Expose debugging API
function exposeDebugAPI() {
  if (typeof window !== 'undefined') {
    Object.assign(window, {
      // Core game objects
      game: gameState,
      conlang: gameState.conlang,
      lexicon: gameState.conlang?.getLexicon(),
      entityCatalog: gameState.entityCatalog,
      realm: gameState.realm,
      player: () => gameState.player,
      
      // Utility functions
      addWord: (gloss, form) => gameState.conlang.getLexicon().addWord(gloss, form),
      exportLexicon: () => gameState.conlang.exportLexicon(),
      learnWord: (word) => gameState.knownWords.add(word),
      
      // Entity functions
      findEntity: (id) => gameState.entityCatalog.findEntity(id),
      getAllEntities: () => gameState.entityCatalog.getAllEntities(),
      
      // Debug functions
      showKnownWords: () => {
        console.log('📚 Known words:')
        Array.from(gameState.knownWords).forEach(word => {
          const conlangWord = gameState.conlang.getWord(word)
          console.log(`  ${word} = ${conlangWord}`)
        })
        return Array.from(gameState.knownWords)
      },
      
      analyzeRealm: () => {
        const realm = gameState.realm
        console.log(`🔍 Analyzing realm: ${realm.name}`)
        
        // Count terrain colors
        const colorCounts = {}
        realm.terrain?.forEach(row => {
          row.forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + 1
          })
        })
        console.log('🎨 Terrain colors:')
        console.table(colorCounts)
        
        // Count entities
        const entityCounts = {}
        realm.entities?.forEach(row => {
          row.forEach(entityId => {
            if (entityId) {
              entityCounts[entityId] = (entityCounts[entityId] || 0) + 1
            }
          })
        })
        console.log('🎯 Entities placed:')
        console.table(entityCounts)
        
        return realm
      },
      
      dumpGameState: () => {
        const state = {
          knownWords: Array.from(gameState.knownWords),
          playerPos: gameState.player ? { x: gameState.player.x, y: gameState.player.y } : null,
          lexiconSize: gameState.conlang.getLexicon().size,
          entitiesInCatalog: gameState.entityCatalog.getAllEntities().length,
          realmName: gameState.realm?.name
        }
        console.table(state)
        return state
      }
    })
    
    console.log('🧝‍♂️ Elf World Debug API loaded!')
    console.log('Available commands:')
    console.log('  🎮 game, conlang, lexicon, entityCatalog, realm, player()')
    console.log('  📚 showKnownWords(), learnWord(word)')
    console.log('  🎯 findEntity(id), getAllEntities()')
    console.log('  🔍 analyzeRealm(), dumpGameState()')
  }
}

// Start the game
initializeGame().catch(error => {
  console.error('Game initialization failed:', error)
  showError('Game failed to start. Check console for details.')
})