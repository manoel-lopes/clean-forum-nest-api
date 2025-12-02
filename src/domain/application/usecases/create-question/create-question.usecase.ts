import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { Question, QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { Slug } from '@/domain/enterprise/value-objects/slug/slug.vo'
import { QuestionWithTitleAlreadyRegisteredException } from './exceptions/question-with-title-already-registered.exception'

type CreateQuestionRequest = Omit<QuestionProps, 'slug'>

@Injectable()
export class CreateQuestionUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: CreateQuestionRequest): Promise<Question> {
    const { title, content, authorId, bestAnswerId } = req
    const questionWithTitle = await this.questionsRepository.findByTitle(title)
    if (questionWithTitle) {
      throw new QuestionWithTitleAlreadyRegisteredException()
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
