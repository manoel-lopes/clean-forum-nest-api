import type {
  AnswersRepository,
  FindManyByQuestionIdParams,
  PaginatedAnswers,
  UpdateAnswerData,
} from '@/domain/application/repositories/answers.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { BaseInMemoryRepository as BaseRepository } from './base/base-in-memory.repository'

export class InMemoryAnswersRepository extends BaseRepository<Answer> implements AnswersRepository {
  async update (answerData: UpdateAnswerData): Promise<Answer> {
    const updatedAnswer = await this.updateOne(answerData)
    return updatedAnswer
  }

  async findManyByQuestionId (params: FindManyByQuestionIdParams): Promise<PaginatedAnswers> {
    const { questionId, page, pageSize, order } = params
    const result = await this.findManyItemsBy({
      where: { questionId },
      params: { page, pageSize, order },
    })
    return result
  }
}
