import { Inject, Injectable } from '@nestjs/common'
import { UseCase } from '@/core/domain/application/use-case'
import { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import { ResourceNotFoundException } from '@/shared/application/exceptions/resource-not-found.exception'

type CommentOnQuestionRequest = {
  questionId: string
  content: string
  authorId: string
}

@Injectable()
export class CommentOnQuestionUseCase implements UseCase {
  constructor (
    @Inject(QuestionsRepository) private readonly questionsRepository: QuestionsRepository,
    @Inject(QuestionCommentsRepository) private readonly questionCommentsRepository: QuestionCommentsRepository
  ) {}

  async execute (request: CommentOnQuestionRequest): Promise<void> {
    const { questionId, content, authorId } = request
    const question = await this.questionsRepository.findById(questionId)
    if (!question) {
      throw new ResourceNotFoundException('Question')
    }
    const comment = QuestionComment.create({
      content,
      authorId,
      questionId,
    })
    await this.questionCommentsRepository.save(comment)
  }
}
