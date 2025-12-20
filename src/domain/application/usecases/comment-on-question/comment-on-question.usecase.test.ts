import type { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionCommentsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-question-comments.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { CommentOnQuestionUseCase } from './comment-on-question.usecase'
import { makeQuestion } from '@tests/factories/domain/make-question'

describe('CommentOnQuestionUseCase', () => {
  let sut: CommentOnQuestionUseCase
  let questionsRepository: QuestionsRepository
  let questionCommentsRepository: QuestionCommentsRepository

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    questionCommentsRepository = new InMemoryQuestionCommentsRepository()
    sut = new CommentOnQuestionUseCase(questionsRepository, questionCommentsRepository)
  })

  it('should not comment on a inexistent question', async () => {
    const request = {
      questionId: 'nonexistent-question-id',
      content: 'Test comment content',
      authorId: 'author-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('Question not found')
  })

  it('should comment on a question', async () => {
    const questionId = 'question-id'
    await questionsRepository.save(makeQuestion({ id: questionId }))
    const question = await questionsRepository.findById(questionId)

    const request = {
      questionId,
      content: 'Test comment content',
      authorId: 'author-id',
    }

    await sut.execute(request)

    const comments = await questionCommentsRepository.findManyByQuestionId(question.id, {
      page: 1,
      pageSize: 10,
    })

    expect(comments.items).toHaveLength(1)
    expect(comments.items[0].content).toBe('Test comment content')
    expect(comments.items[0].authorId).toBe('author-id')
    expect(comments.items[0].questionId).toBe(question.id)
  })
})
