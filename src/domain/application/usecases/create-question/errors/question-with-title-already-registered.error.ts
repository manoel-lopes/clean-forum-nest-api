export class QuestionWithTitleAlreadyRegisteredError extends Error {
  constructor () {
    super('Question with title already registered')
  }
}
