import type { UseCase } from '@/core/domain/application/use-case'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import type { Answer, AnswerProps } from '@/domain/enterprise/entities/answer.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type AnswerQuestionRequest = Omit<AnswerProps, 'excerpt'>

export class AnswerQuestionUseCase implements UseCase {
  constructor (
    private readonly answersRepository: AnswersRepository,
    private readonly userRepository: UsersRepository,
    private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: AnswerQuestionRequest): Promise<Answer> {
    const { content, authorId, questionId } = req
    const author = await this.userRepository.findById(authorId)
    if (!author) {
      throw new ResourceNotFoundError('User')
    }
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
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
