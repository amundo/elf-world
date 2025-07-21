class Teacher extends Entity {
  constructor() {
    super()
    this.name = "Teacher"
    this.dialogue = [
      "[HELLO] [STUDENT] .",
    ]
    this.lexicon = [
      { gloss: "HELLO", form: "salve" },
      { gloss: "GOODBYE", form: "vale" },
      { gloss: "STUDENT", form: "discipulus" },
    ]
  }
}
