export class QuestionWithTitleAlreadyRegisteredException extends Error {
  constructor () {
    super('Question with title already registered')
  }
}
