
// ElfWorld.js - Main game module (Debug Version)

import { ConlangEngine } from './ConlangEngine.js'
import { GameWorld } from './GameWorld.js'
import { UIManager } from './UIManager.js'
import { CommandProcessor } from './CommandProcessor.js'

console.log('🔍 Loading ElfWorld.js...')

// Test if modules can be imported
try {
  console.log('📦 Importing modules...')
  
  // Import with error handling
  const { ConlangEngine } = await import('./ConlangEngine.js').catch(e => {
    console.error('❌ Failed to import ConlangEngine:', e)
    throw e
  })
  
  const { GameWorld } = await import('./GameWorld.js').catch(e => {
    console.error('❌ Failed to import GameWorld:', e)
    throw e
  })
  
  const { UIManager } = await import('./UIManager.js').catch(e => {
    console.error('❌ Failed to import UIManager:', e)
    throw e
  })
  
  const { CommandProcessor } = await import('./CommandProcessor.js').catch(e => {
    console.error('❌ Failed to import CommandProcessor:', e)
    throw e
  })
  
  console.log('✅ All modules imported successfully')

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
      syllableStructures: ['CV', 'CVC', 'V', 'VC']
    },
    game: {
      startingRealm: 'fairy',
      initialVocabulary: ['what', 'this'],
      debugMode: true // Force debug mode for testing
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

  // Load realms data
  async function loadRealms() {
    console.log('🏰 Loading realms...')
    try {
      const response = await fetch('./realms.json')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log('✅ Realms loaded:', Object.keys(data))
      return data
    } catch (error) {
      console.error('❌ Failed to load realms:', error)
      console.log('🔄 Using fallback realm data')
      // Fallback to minimal realm data
      return {
        fairy: {
          name: "Fairy Realm",
          description: "A magical fairy realm",
          terrain: {
            primary: { color: "#FFB6C1", weight: 0.4 },
            secondary: { color: "#E6E6FA", weight: 0.3 },
            accent: { color: "#98FB98", weight: 0.3 }
          },
          entities: [
            {
              type: 'npc',
              emoji: '🧚‍♀️',
              concept: 'fairy',
              chance: 0.05,
              dialogue: 'Welcome to the fairy realm!'
            }
          ]
        }
      }
    }
  }

  // Initialize the game
  async function initializeGame() {
    console.log('🎮 Initializing game...')
    try {
      // Load external resources
      console.log('📄 Loading external resources...')
      const realmsData = await loadRealms()
      
      // Initialize core systems
      console.log('🧠 Initializing core systems...')
      gameState.conlang = new ConlangEngine(CONFIG.conlang)
      console.log('✅ ConlangEngine initialized')
      
      gameState.realms = realmsData
      console.log('✅ Realms data loaded')
      
      gameState.world = new GameWorld(CONFIG.world, gameState)
      console.log('✅ GameWorld initialized')
      
      gameState.ui = new UIManager(gameState)
      console.log('✅ UIManager initialized')
      
      gameState.commands = new CommandProcessor(gameState)
      console.log('✅ CommandProcessor initialized')

      // Set up event listeners
      console.log('🎯 Setting up event listeners...')
      setupEventListeners()
      
      // Initialize UI
      console.log('🖥️ Initializing UI...')
      gameState.ui.initialize()
      
      // Create game world
      console.log('🌍 Creating game world...')
      await gameState.world.initialize()
      
      // Check if world element exists and has tiles
      const worldEl = document.getElementById('world')
      console.log('🔍 World element:', worldEl)
      console.log('🔍 Tile count:', worldEl?.children.length)
      
      // Start in the initial realm
      console.log('🏰 Switching to initial realm...')
      await gameState.world.switchRealm(CONFIG.game.startingRealm)
      
      // Show the game
      console.log('👁️ Showing game interface...')
      showGame()
      
      // Welcome messages
      gameState.ui.addMessage(gameState.ui.getUIText('welcomeMessage'), 'success')
      gameState.ui.addMessage(gameState.ui.getUIText('helpHint'), 'info')
      
      // Debug mode is always available in browser console, no need for in-game words

      // Expose debugging interface
      exposeDebugAPI()
      
      console.log('🎉 Game initialization complete!')
      
    } catch (error) {
      console.error('💥 Failed to initialize game:', error)
      showError('Failed to load game resources. Please refresh the page.')
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
        },
        
        // Quick debug functions
        checkWorldElement: () => {
          const worldEl = document.getElementById('world')
          console.log('World element:', worldEl)
          console.log('World children:', worldEl?.children.length)
          console.log('World style:', worldEl?.style.cssText)
          return worldEl
        }
      })
      
      console.log('🧝‍♂️ Elf World Debug API loaded!')
      console.log('Available browser console commands:')
      console.log('  🎮 Game: game, conlang, lexicon, player()')
      console.log('  📊 Stats: getLexiconStats(), getPhonologyStats(), dumpGameState()')
      console.log('  🌍 World: showRealms(), getCurrentRealm(), showPortals(), switchRealm(name)')
      console.log('  📚 Learning: showKnownWords(), learnWord(word), addWord(gloss, form)')
      console.log('  🔧 Debug: exportLexicon(), searchLexicon(term), checkWorldElement()')
      console.log('')
      console.log('Try: showRealms() or getCurrentRealm() or showPortals()')
    }
  }

  // Start the game
  initializeGame().catch(error => {
    console.error('Game initialization failed:', error)
    showError('Game failed to start. Check console for details.')
  })

} catch (error) {
  console.error('💥 Failed to load modules:', error)
  document.getElementById('loadingScreen').textContent = 'Failed to load game modules. Check console for details.'
  document.getElementById('loadingScreen').style.color = '#ff6666'
}