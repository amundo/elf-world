// CommandProcessor.js - Command handling

export class CommandProcessor {
  constructor(gameState) {
    this.gameState = gameState
  }

  processCommand(input) {
    const trimmedInput = input.toLowerCase().trim()

    // Show what the player typed
    this.gameState.ui.addMessage(`> ${input}`)

    // Check if input is a known word in the conlang
    if (!this.gameState.conlang.hasWord(trimmedInput)) {
      this.gameState.ui.addMessage(this.gameState.ui.getUIText('unknownCommand'), 'error')
      return
    }

    // Check if player knows this word
    if (!this.gameState.knownWords.has(trimmedInput)) {
      this.gameState.ui.addMessage(this.gameState.ui.getUIText('unknownCommand'), 'error')
      return
    }

    // Get the conlang word
    const conlangWord = this.gameState.conlang.getWord(trimmedInput)

    // Process based on word meaning
    switch (trimmedInput) {
      case 'what':
        this.handleWhatCommand()
        break
      case 'say':
        this.handleSayCommand(conlangWord)
        break
      case 'have':
        this.handleHaveCommand()
        break
      case 'see':
        this.handleSeeCommand()
        break
      case 'know':
        this.handleKnowCommand()
        break
      case 'lexicon':
        this.handleLexiconCommand()
        break
      case 'export':
        this.handleExportCommand()
        break
      case 'realm':
        this.handleRealmCommand()
        break
      default:
        this.handleDefaultCommand(conlangWord)
    }
  }

  handleWhatCommand() {
    if (this.gameState.focusedEntity) {
      const entityWord = this.gameState.focusedEntity.conlangName
      const thisWord = this.gameState.conlang.getWord('this')

      this.gameState.ui.addMessage(`${thisWord} ${entityWord}`, 'success')

      // Add entity concept to known words
      this.gameState.knownWords.add(this.gameState.focusedEntity.concept)
      const learnedText = this.gameState.ui.getUIText('learned')
      this.gameState.ui.addMessage(`${learnedText}: ${this.gameState.focusedEntity.concept} = ${entityWord}`, 'info')
    } else {
      this.gameState.ui.addMessage(this.gameState.ui.getUIText('notNear'), 'error')
    }
  }

  handleSayCommand(conlangWord) {
    const youSayText = this.gameState.ui.getUIText('youSay')
    this.gameState.ui.addMessage(`${youSayText} ${conlangWord}`, 'success')
  }

  handleHaveCommand() {
    const haveText = this.gameState.conlang.getWord('have')
    const inventory = this.gameState.player ? this.gameState.player.inventory.join(' ') : ''
    this.gameState.ui.addMessage(`${haveText}: ${inventory}`, 'info')
  }

  handleSeeCommand() {
    if (this.gameState.focusedEntity) {
      const isKnown = this.gameState.knownWords.has(this.gameState.focusedEntity.concept)
      const entityName = isKnown ? this.gameState.focusedEntity.conlangName : '???'
      const youSeeText = this.gameState.ui.getUIText('youSee')
      this.gameState.ui.addMessage(`${youSeeText} ${entityName}`, 'info')
    } else {
      this.gameState.ui.addMessage(this.gameState.ui.getUIText('notNear'), 'error')
    }
  }

  handleKnowCommand() {
    const learnedText = this.gameState.ui.getUIText('learned')
    this.gameState.ui.addMessage(learnedText, 'info')
    for (const word of this.gameState.knownWords) {
      const wordForm = this.gameState.conlang.getWord(word)
      this.gameState.ui.addMessage(`  ${word} = ${wordForm}`, 'success')
    }
  }

  handleLexiconCommand() {
    if (this.gameState.knownWords.has('lexicon')) {
      const stats = this.gameState.conlang.getStats()
      this.gameState.ui.addMessage(`Words in lexicon: ${stats.lexicon.totalWords}`, 'info')
      this.gameState.ui.addMessage(`Phonology: ${stats.phonology.totalWords} words analyzed`, 'info')
    }
  }

  handleExportCommand() {
    if (this.gameState.knownWords.has('export')) {
      const exportData = this.gameState.conlang.exportLexicon()
      console.log('Lexicon export:', exportData)
      this.gameState.ui.addMessage(this.gameState.ui.getUIText('exported'), 'info')
    }
  }

  handleRealmCommand() {
    if (this.gameState.knownWords.has('realm')) {
      const currentRealm = this.gameState.currentRealm?.name || 'Unknown'
      const availableRealms = Object.keys(this.gameState.realms).join(', ')
      this.gameState.ui.addMessage(`Current: ${currentRealm}`, 'info')
      this.gameState.ui.addMessage(`Available: ${availableRealms}`, 'info')
      
      // Show portal connections
      if (this.gameState.currentRealm?.portals) {
        this.gameState.ui.addMessage('Portals:', 'info')
        for (const portal of this.gameState.currentRealm.portals) {
          this.gameState.ui.addMessage(`  ${portal.emoji} → ${portal.destination}`, 'success')
        }
      }
    }
  }

  handleDefaultCommand(conlangWord) {
    const youSayText = this.gameState.ui.getUIText('youSay')
    this.gameState.ui.addMessage(`${youSayText} ${conlangWord}`, 'success')
  }
}