import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import type { Comment, CommentProps } from '@/domain/enterprise/entities/comment.entity'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type CommentOnAnswerRequest = CommentProps

@Injectable()
export class CommentOnAnswerUseCase implements UseCase {
  constructor (
    @Inject(AnswersRepository) private readonly answersRepository: AnswersRepository,
    @Inject(CommentsRepository) private readonly commentsRepository: CommentsRepository
  ) {}

  async execute (request: CommentOnAnswerRequest): Promise<Comment> {
    const { answerId, content, authorId } = request
    const answer = await this.answersRepository.findById(answerId)
    if (!answer) {
      throw new ResourceNotFoundError('Answer')
    }
    const comment = await this.commentsRepository.create({ content, authorId, answerId })
    return comment
  }
}
