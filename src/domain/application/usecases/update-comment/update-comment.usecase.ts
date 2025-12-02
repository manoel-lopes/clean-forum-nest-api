import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import type { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import type { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import type { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type UpdateCommentRequest = {
  commentId: string
  authorId: string
  content: string
}

@Injectable()
export class UpdateCommentUseCase implements UseCase {
  constructor (
    @Inject(QuestionCommentsRepository) private readonly questionCommentsRepository: QuestionCommentsRepository,
    @Inject(AnswerCommentsRepository) private readonly answerCommentsRepository: AnswerCommentsRepository
  ) {}

  async execute (req: UpdateCommentRequest): Promise<Comment> {
    const { commentId, authorId, content } = req
    let comment: QuestionComment | AnswerComment | null = await this.questionCommentsRepository.findById(commentId)
    let repository: QuestionCommentsRepository | AnswerCommentsRepository = this.questionCommentsRepository
    if (!comment) {
      comment = await this.answerCommentsRepository.findById(commentId)
      repository = this.answerCommentsRepository
    }
    if (!comment) {
      throw new ResourceNotFoundException('Comment')
    }
    if (comment.authorId !== authorId) {
      throw new NotAuthorException('comment')
    }
    const updatedComment = await repository.update({
      where: { id: commentId },
      data: { content },
    })
    return updatedComment
  }
}
