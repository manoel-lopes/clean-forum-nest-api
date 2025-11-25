import { faker } from '@faker-js/faker'

export interface AnswerTestData {
  id: string
  questionId?: unknown
  content?: unknown
  authorId?: unknown
}

export class AnswerBuilder {
  private answerData: AnswerTestData = {
    id: faker.string.uuid(),
    questionId: faker.string.uuid(),
    content: faker.lorem.paragraphs(2),
    authorId: faker.string.uuid(),
  }

  withQuestionId (questionId: unknown = faker.string.uuid()): AnswerBuilder {
    this.answerData.questionId = questionId
    return this
  }

  withContent (content: unknown = faker.lorem.paragraphs()): AnswerBuilder {
    this.answerData.content = content
    return this
  }

  withAuthorId (authorId: unknown): AnswerBuilder {
    this.answerData.authorId = authorId
    return this
  }

  build (): AnswerTestData {
    return { ...this.answerData }
  }
}

export const anAnswer = (): AnswerBuilder => new AnswerBuilder()
