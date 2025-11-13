import type { UseCase } from '@/core/domain/application/use-case'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { Slug } from '@/domain/enterprise/entities/value-objects/slug/slug.vo'
import { QuestionWithTitleAlreadyRegisteredError } from './errors/question-with-title-already-registered.error'

type CreateQuestionRequest = Omit<QuestionProps, 'slug'>

export class CreateQuestionUseCase implements UseCase {
  constructor (private readonly questionsRepository: QuestionsRepository) {}

  async execute (req: CreateQuestionRequest): Promise<Question> {
    const { title, content, authorId, bestAnswerId } = req
    const questionWithTitle = await this.questionsRepository.findByTitle(title)
    if (questionWithTitle) {
      throw new QuestionWithTitleAlreadyRegisteredError()
    }
    const slug = Slug.create(title)
    const question = await this.questionsRepository.create({
      title,
      content,
      authorId,
      bestAnswerId,
      slug: slug.value,
    })
    return question
  }
}
