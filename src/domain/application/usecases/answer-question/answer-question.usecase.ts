import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type AnswerQuestionRequest = Omit<AnswerProps, 'excerpt'>

@Injectable()
export class AnswerQuestionUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(UsersRepository) private readonly userRepository: UsersRepository,
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: AnswerQuestionRequest): Promise<Answer> {
    const { content, authorId, questionId } = req
    const author = await this.userRepository.findById(authorId)
    if (!author) {
      throw new ResourceNotFoundException('User')
    }
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    const answer = await this.answersRepository.create({
      content,
      authorId,
      questionId,
      excerpt: content.substring(0, 45).replace(/ $/, '').concat('...'),
    })
    return answer
  }
}
