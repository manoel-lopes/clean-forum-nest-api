import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { AnswerComment, AnswerCommentProps } from '@/domain/enterprise/entities/answer-comment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CommentOnAnswerRequest = AnswerCommentProps

@Injectable()
export class CommentOnAnswerUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(AnswerCommentsRepository) private readonly answerCommentsRepository: AnswerCommentsRepository
  ) {
    Object.freeze(this)
  }

  async execute (request: CommentOnAnswerRequest): Promise<AnswerComment> {
    const { answerId, content, authorId } = request
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const comment = await this.answerCommentsRepository.create({ content, authorId, answerId })
    return comment
  }
}
