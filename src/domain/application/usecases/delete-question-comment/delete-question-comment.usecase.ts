import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { NotAuthorException } from '@/shared/application/exceptions/not-author.exception'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type DeleteQuestionCommentRequest = {
  commentId: string
  authorId: string
}

@Injectable()
export class DeleteQuestionCommentUseCase implements UseCase {
  constructor (
    @Inject(QuestionCommentsRepository) private readonly questionCommentsRepository: QuestionCommentsRepository,
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: DeleteQuestionCommentRequest) {
    const { commentId, authorId } = req
    const comment = await this.questionCommentsRepository.findById(commentId)
    if (!comment) {
      throw new ResourceNotFoundException('Comment')
    }
    const question = await this.questionsRepository.findById(comment.questionId)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    const isCommentAuthor = comment.authorId === authorId
    const isQuestionAuthor = question.authorId === authorId
    if (!isCommentAuthor && !isQuestionAuthor) {
      throw new NotAuthorException('comment')
    }
    await this.questionCommentsRepository.delete(commentId)
  }
}
