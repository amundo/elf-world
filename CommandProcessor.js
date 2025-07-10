// CommandProcessor.js - Command handling

/*

* Process player text commands and map them to game actions
* Validate commands against known words in the conlang
* Provide feedback via the UIManager
* Handle learning new words and inspecting entities

*/

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
      default:
        this.handleDefaultCommand(conlangWord)
    }
  }

  // Remove all the debug command handlers since they're browser-only now

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
    
    // Show current realm name if in a realm
    if (this.gameState.currentRealm?.nameConlang) {
      const realmNameGloss = this.gameState.currentRealm.nameConlang.join(' ').toLowerCase()
      const realmNameConlang = this.gameState.currentRealm.nameConlang
        .map(word => this.gameState.conlang.getWord(word.toLowerCase()))
        .join(' ')
      this.gameState.ui.addMessage(`Current realm: ${realmNameGloss} = ${realmNameConlang}`, 'info')
    }
  }

  handleDefaultCommand(conlangWord) {
    const youSayText = this.gameState.ui.getUIText('youSay')
    this.gameState.ui.addMessage(`${youSayText} ${conlangWord}`, 'success')
  }
}