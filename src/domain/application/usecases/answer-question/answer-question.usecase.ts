import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { Answer, type AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AnswerQuestionRequest = Omit<AnswerProps, 'excerpt'>

@Injectable()
export class AnswerQuestionUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(UsersRepository) private readonly userRepository: UsersRepository,
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: AnswerQuestionRequest): Promise<void> {
    const { content, authorId, questionId } = req
    const author = await this.userRepository.findById(authorId)
    if (!author) {
      throw new ResourceNotFoundError('User')
    }
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    const answer = Answer.create({
      content,
      authorId,
      questionId,
    })
    await this.answersRepository.save(answer)
  }
}
