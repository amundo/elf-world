// ElfWorld.js - Main game module

import { ConlangEngine } from './ConlangEngine.js'
import { GameWorld } from './GameWorld.js'
import { UIManager } from './UIManager.js'
import { CommandProcessor } from './CommandProcessor.js'

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
      // Politeness and social phrases
      "GOOD", "DAY", "NIGHT", "MORNING", "WELCOME", "THANK", "PLEASE",
      "YES", "NO", "SORRY", "EXCUSE", "FRIEND", "STRANGER", "VISITOR",
      "GREETINGS", "FAREWELL", "PEACE", "BLESSING", "HONOR", "RESPECT",
      // Common conversational words
      "YOU", "I", "WE", "THEY", "IS", "ARE", "WAS", "WILL", "CAN", "MAY",
      // Additional words for NPC dialogue
      "THE", "TO", "OUR", "MY", "IN", "DISTURBS", "DEAD", "HUNGRY", "SO",
      "BELONG", "WHISPER", "SECRETS", "OTHER", "WORLDS", "CRYSTAL", "BUSY",
      "TIME", "FOR", "TALK", "PURE", "HEART", "ONLY", "MAGIC", "FLOWS",
      "STRONG", "FEEL", "IT", "AM", "QUEEN", "DOMAIN",
      // Realm names
      "FOREST", "SHADOW", "REALM", "CRYSTAL", "CAVERNS",
      // Additional words for crystal realm
      "ANCIENT", "GUARDIAN", "CRYSTALS", "DEEP", "PLACES", "POWER",
      "BEEN", "MINING", "YEARS", "STRANGE",
      // Additional dialogue words for custom entities
      "TRAVELER", "GOES", "THERE"
    ]
  },
  game: {
    startingRealm: 'fairy',
    initialVocabulary: ['what', 'this']
  }
}

// Global game state
let gameState = {
  conlang: null,
  world: null,
  ui: null,
  commands: null,
  realms: null,
  player: null,
  knownWords: new Set(CONFIG.game.initialVocabulary),
  focusedEntity: null,
  selectedEntity: null,
  currentRealm: null
}

// Initialize the game
async function initializeGame() {
  try {
    // Load external resources
    const realmsData = await loadRealms()
    
    // Initialize core systems
    gameState.conlang = new ConlangEngine(CONFIG.conlang)
    gameState.realms = realmsData
    gameState.world = new GameWorld(CONFIG.world, gameState)
    gameState.ui = new UIManager(gameState)
    gameState.commands = new CommandProcessor(gameState)

    // Set up event listeners
    setupEventListeners()
    
    // Initialize UI
    gameState.ui.initialize()
    
    // Create game world
    await gameState.world.initialize()
    
    // Start in the initial realm
    await gameState.world.switchRealm(CONFIG.game.startingRealm)
    
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

// Load realms data from new modular system
async function loadRealms() {
  try {
    // Load realm index
    const indexResponse = await fetch('./realms/index.json')
    if (!indexResponse.ok) {
      throw new Error(`Failed to load realm index: ${indexResponse.status}`)
    }
    const realmIndex = await indexResponse.json()
    
    // Load individual realm files
    const realms = {}
    const entityCatalog = await loadEntityCatalog()
    
    for (const realmInfo of realmIndex.realms) {
      try {
        const realmResponse = await fetch(`./realms/${realmInfo.file}`)
        if (realmResponse.ok) {
          const realmData = await realmResponse.json()
          
          // Process entity references using catalog
          realms[realmInfo.id] = processRealmData(realmData, entityCatalog)
          console.log(`✅ Loaded realm: ${realmInfo.name}`)
        } else {
          console.warn(`⚠️ Failed to load realm file: ${realmInfo.file}`)
        }
      } catch (error) {
        console.error(`❌ Error loading realm ${realmInfo.id}:`, error)
      }
    }
    
    return Object.keys(realms).length > 0 ? realms : getFallbackRealms()
  } catch (error) {
    console.error('Failed to load realm system:', error)
    return getFallbackRealms()
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

// Process realm data, resolving entity references
function processRealmData(realmData, entityCatalog) {
  const processedRealm = { ...realmData }
  
  // Convert entity references to full entity definitions
  if (realmData.entities && realmData.entities.type === 'procedural' && realmData.entities.spawns) {
    processedRealm.entities = realmData.entities.spawns.map(spawn => {
      const entityRef = findEntityInCatalog(spawn.entity, entityCatalog)
      if (entityRef) {
        return {
          type: entityRef.category.slice(0, -1), // Remove 's' from category
          emoji: entityRef.emoji,
          concept: entityRef.gloss,
          chance: spawn.chance,
          solid: entityRef.solid !== undefined ? entityRef.solid : true,
          dialogue: entityRef.dialogue || null
        }
      } else {
        console.warn(`Unknown entity reference: ${spawn.entity}`)
        return null
      }
    }).filter(Boolean)
  } else if (realmData.entities && Array.isArray(realmData.entities)) {
    // Already processed or in legacy format
    processedRealm.entities = realmData.entities
  } else {
    // No entities or invalid format
    console.warn(`No valid entities found for realm ${realmData.name}`)
    processedRealm.entities = []
  }
  
  // Process custom entities if present
  if (realmData.customEntities) {
    // Custom entities are already in the correct format
    processedRealm.customEntities = realmData.customEntities
  }
  
  // Process portals
  if (realmData.portals && Array.isArray(realmData.portals)) {
    processedRealm.portals = realmData.portals.map(portal => {
      if (portal.position === 'custom') {
        // Portal positions are defined in customEntities
        return null // Skip, handled by custom entity placement
      } else {
        const portalRef = findEntityInCatalog(portal.entity, entityCatalog)
        return {
          emoji: portalRef?.emoji || '🌀',
          concept: portalRef?.gloss || 'portal',
          destination: portal.destination,
          description: portal.description || `Portal to ${portal.destination}`
        }
      }
    }).filter(Boolean)
  } else {
    // No portals or invalid format
    processedRealm.portals = []
  }
  
  return processedRealm
}

// Find entity in catalog by ID
function findEntityInCatalog(entityId, catalog) {
  for (const [category, entities] of Object.entries(catalog)) {
    if (entities[entityId]) {
      return { ...entities[entityId], category }
    }
  }
  return null
}

// Default entity catalog fallback
function getDefaultEntityCatalog() {
  return {
    objects: {
      tree: { emoji: '🌲', gloss: 'tree', solid: true },
      rock: { emoji: '🪨', gloss: 'rock', solid: true }
    },
    npcs: {
      fairy: { emoji: '🧚‍♀️', gloss: 'fairy', solid: false }
    },
    enemies: {
      snake: { emoji: '🐍', gloss: 'snake', solid: false }
    },
    portals: {
      swirl: { emoji: '🌀', gloss: 'portal', solid: false }
    }
  }
}

// Fallback realms
function getFallbackRealms() {
  return {
    fairy: {
      name: "Fairy Realm",
      nameConlang: ["MAGIC", "REALM"],
      terrain: {
        primary: { color: "#FFB6C1", weight: 0.4 },
        secondary: { color: "#E6E6FA", weight: 0.3 },
        accent: { color: "#98FB98", weight: 0.3 }
      },
      portals: [],
      entities: [
        {
          type: 'npc',
          emoji: '🧚‍♀️',
          concept: 'fairy',
          chance: 0.05,
          solid: false,
          dialogue: ["GREETINGS", "!", "WELCOME", "TO", "OUR", "REALM", "."]
        }
      ]
    }
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

  // Audio toggle
  const audioToggle = document.getElementById('audioToggle')
  audioToggle.addEventListener('click', () => {
    gameState.world.toggleAudio()
  })

  // Window resize
  window.addEventListener('resize', () => {
    gameState.world.resizeView()
  })

  // Prevent context menu on game area
  document.getElementById('world').addEventListener('contextmenu', (e) => {
    e.preventDefault()
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
      player: () => gameState.player,
      
      // Utility functions
      addWord: (gloss, form) => gameState.conlang.getLexicon().addWord(gloss, form),
      exportLexicon: () => gameState.conlang.exportLexicon(),
      getLexiconStats: () => gameState.conlang.getStats(),
      searchLexicon: (term) => gameState.conlang.getLexicon().searchByGloss(term),
      getPhonologyStats: () => gameState.conlang.getPhonologicalStats(),
      
      // Game controls
      switchRealm: (realm) => gameState.world.switchRealm(realm),
      addMessage: (text, type) => gameState.ui.addMessage(text, type),
      learnWord: (word) => gameState.knownWords.add(word),
      
      // Debug info functions
      showRealms: () => {
        console.log('🏰 Available realms:')
        for (const [key, realm] of Object.entries(gameState.realms)) {
          console.log(`  ${key}: ${realm.name}`)
          if (realm.portals) {
            realm.portals.forEach(portal => {
              console.log(`    ${portal.emoji} → ${portal.destination}`)
            })
          }
        }
        return Object.keys(gameState.realms)
      },
      
      showKnownWords: () => {
        console.log('📚 Known words:')
        Array.from(gameState.knownWords).forEach(word => {
          const conlangWord = gameState.conlang.getWord(word)
          console.log(`  ${word} = ${conlangWord}`)
        })
        return Array.from(gameState.knownWords)
      },
      
      getCurrentRealm: () => {
        const realm = gameState.currentRealm
        if (realm) {
          console.log('🌍 Current realm:', realm.name)
          if (realm.nameConlang) {
            const conlangName = realm.nameConlang.map(word => 
              gameState.conlang.getWord(word.toLowerCase())
            ).join(' ')
            console.log('🗣️ Conlang name:', conlangName)
            console.log('📝 Breakdown:', realm.nameConlang.map(word => 
              `${word.toLowerCase()} = ${gameState.conlang.getWord(word.toLowerCase())}`
            ).join(', '))
          }
          console.log('📍 Portals:')
          realm.portals?.forEach(portal => {
            console.log(`  ${portal.emoji} → ${portal.destination}`)
          })
        }
        return realm?.name || 'Unknown'
      },
      
      showPortals: () => {
        let portalCount = 0
        console.log('🌀 Portals in current world:')
        for(let y = 0; y < gameState.world.config.rows; y++) {
          for(let x = 0; x < gameState.world.config.cols; x++) {
            const entity = gameState.world.entityGrid[y][x]
            if(entity?.type === 'portal') {
              console.log(`  ${entity.emoji} at (${x}, ${y}) → ${entity.destination}`)
              portalCount++
            }
          }
        }
        console.log(`Total: ${portalCount} portals`)
        return portalCount
      },
      
      // Advanced debugging
      dumpGameState: () => {
        const state = {
          knownWords: Array.from(gameState.knownWords),
          currentRealm: gameState.currentRealm?.name,
          playerPos: gameState.player ? { x: gameState.player.x, y: gameState.player.y } : null,
          lexiconSize: gameState.conlang.getLexicon().size,
          realmsLoaded: Object.keys(gameState.realms),
          portalCount: gameState.world ? (() => {
            let count = 0
            for(let y = 0; y < gameState.world.config.rows; y++) {
              for(let x = 0; x < gameState.world.config.cols; x++) {
                if(gameState.world.entityGrid[y][x]?.type === 'portal') count++
              }
            }
            return count
          })() : 0
        }
        console.table(state)
        return state
      }
    })
    
    console.log('🧝‍♂️ Elf World Debug API loaded!')
    console.log('Available browser console commands:')
    console.log('  🎮 Game: game, conlang, lexicon, player()')
    console.log('  📊 Stats: getLexiconStats(), getPhonologyStats(), dumpGameState()')
    console.log('  🌍 World: showRealms(), getCurrentRealm(), showPortals(), switchRealm(name)')
    console.log('  📚 Learning: showKnownWords(), learnWord(word), addWord(gloss, form)')
    console.log('  🔧 Debug: exportLexicon(), searchLexicon(term)')
    console.log('')
    console.log('Try: showRealms() or getCurrentRealm() or showPortals()')
  }
}

// Start the game
initializeGame().catch(error => {
  console.error('Game initialization failed:', error)
  showError('Game failed to start. Check console for details.')
})