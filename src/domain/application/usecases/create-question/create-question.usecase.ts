import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { Question, type QuestionProps } from '@/domain/enterprise/entities/question.entity'
import { QuestionWithTitleAlreadyRegisteredError } from './errors/question-with-title-already-registered.error'

type CreateQuestionRequest = Omit<QuestionProps, 'slug'>

@Injectable()
export class CreateQuestionUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: CreateQuestionRequest): Promise<void> {
    const { title, content, authorId, bestAnswerId } = req
    const questionWithTitle = await this.questionsRepository.findByTitle(title)
    if (questionWithTitle) {
      throw new QuestionWithTitleAlreadyRegisteredError()
    }
    const question = Question.create({
      title,
      content,
      authorId,
      bestAnswerId
    })
    await this.questionsRepository.save(question)
  }
}
