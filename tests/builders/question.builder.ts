import { faker } from '@faker-js/faker'

export interface QuestionTestData {
  id?: string
  title?: unknown
  content?: unknown
  authorId?: unknown
}

export class QuestionBuilder {
  private questionData: QuestionTestData = {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
  }

  withTitle (title: unknown = faker.lorem.sentence()): QuestionBuilder {
    this.questionData.title = title
    return this
  }

  withContent (content: unknown = faker.lorem.paragraphs()): QuestionBuilder {
    this.questionData.content = content
    return this
  }

  withId (id = faker.string.uuid()): QuestionBuilder {
    this.questionData.id = id
    return this
  }

  withAuthorId (authorId: unknown): QuestionBuilder {
    this.questionData.authorId = authorId
    return this
  }

  build (): QuestionTestData {
    return { ...this.questionData }
  }
}

export const aQuestion = (): QuestionBuilder => new QuestionBuilder()
