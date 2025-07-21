// ========================================
// UIManager.js - UI state and translation
// ========================================

/*
This module is responsible for managing the UI state and translating UI text using the constructed conlang.
It handles displaying messages, updating the inventory display, and showing speech bubbles for entities.
*/

export class UIManager {
  constructor(gameState) {
    this.gameState = gameState
    this.commandOutput = null
  }

  initialize() {
    this.commandOutput = document.getElementById("commandOutput")

    // Translate UI elements
    const consoleHeader = document.getElementById("consoleHeader")
    consoleHeader.textContent = this.getUIText("consoleHeader")

    const commandInput = document.getElementById("commandInput")
    commandInput.placeholder = this.getUIText("helpHint")

    this.updateInventory()
  }

  translateGloss(glossText) {
    if (!(glossText.startsWith("[") && glossText.endsWith("]"))) {
      return glossText
    }
    const innerGlossText = glossText.slice(1, -1).toLowerCase()
    return this.gameState.conlang.translate(innerGlossText)
  }

  getUIText(key) {
    const uiGlosses = {
      consoleHeader: "[word learn]",
      inventoryLabel: "[have]",
      welcomeMessage: "[hello world]!",
      helpHint: "[say what near thing]",
      unknownCommand: "[not know word]",
      notNear: "[not near]",
      learned: "[now know]",
      youSay: "[you say]",
      youSee: "[you see]",
      focus: "[this]",
      realmChanged: "[realm change]",
      exported: "[data save]",
    }

    const gloss = uiGlosses[key] || `[${key}]`
    return this.translateGloss(gloss)
  }

  addMessage(text, className = "") {
    const div = document.createElement("div")
    div.textContent = text
    if (className) div.className = className
    this.commandOutput.appendChild(div)
    this.commandOutput.scrollTop = this.commandOutput.scrollHeight

    // Keep only last 20 messages
    while (this.commandOutput.children.length > 20) {
      this.commandOutput.removeChild(this.commandOutput.firstChild)
    }
  }

  updateInventory() {
    if (!this.gameState.player) return
    const haveWord = this.gameState.conlang.getWord("have")
    const inventoryEl = document.getElementById("inventory")
    inventoryEl.textContent = `${haveWord}: ${
      this.gameState.player.inventory.join(" ")
    }`
  }

  showDialogue(text, entity) {
    if (!entity || !entity.el) return

    let bubble = entity.el.querySelector(".speech-bubble")
    if (!bubble) {
      bubble = document.createElement("div")
      bubble.className = "speech-bubble"
      entity.el.appendChild(bubble)
    }

    bubble.textContent = text
    bubble.style.display = "block"

    setTimeout(() => {
      if (bubble) bubble.style.display = "none"
    }, 3000)
  }
}
