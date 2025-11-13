import type { UseCase } from '@/core/domain/application/use-case'
import type { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { NotAuthorError } from '@/shared/application/errors/not-author.error'
import { ResourceNotFoundError } from '@/shared/application/errors/resource-not-found.error'

type DeleteQuestionCommentRequest = {
  commentId: string
  authorId: string
}

export class DeleteQuestionCommentUseCase implements UseCase {
  constructor (
    private readonly questionCommentsRepository: QuestionCommentsRepository,
    private readonly questionsRepository: QuestionsRepository
  ) {}

  async execute (req: DeleteQuestionCommentRequest) {
    const { commentId, authorId } = req
    const comment = await this.questionCommentsRepository.findById(commentId)
    if (!comment) {
      throw new ResourceNotFoundError('Comment')
    }
    const question = await this.questionsRepository.findById(comment.questionId)
    if (!question) {
      throw new ResourceNotFoundError('Question')
    }
    const isCommentAuthor = comment.authorId === authorId
    const isQuestionAuthor = question.authorId === authorId
    if (!isCommentAuthor && !isQuestionAuthor) {
      throw new NotAuthorError('comment')
    }
    await this.questionCommentsRepository.delete(commentId)
  }
}
