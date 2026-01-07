import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { QuestionAnsweredEvent } from '@/domain/events/question-answered/question-answered.event'
import { OnQuestionAnsweredHandler } from './on-question-answered.handler'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { makeQuestionData } from '@tests/factories/domain/make-question'
import { MockNotificationQueue } from '@tests/mocks/notification-queue.mock'

describe('OnQuestionAnsweredHandler', () => {
  let sut: OnQuestionAnsweredHandler
  let questionsRepository: QuestionsRepository
  let notificationQueue: MockNotificationQueue

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    notificationQueue = new MockNotificationQueue()
    sut = new OnQuestionAnsweredHandler(questionsRepository, notificationQueue)
  })

  it('should not queue notification when question is not found', async () => {
    const answer: Answer = {
      id: 'answer-1',
      ...makeAnswerData({ questionId: 'non-existent-question' }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new QuestionAnsweredEvent(answer)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should not queue notification when author answers their own question', async () => {
    const authorId = 'same-author-id'
    const question: Question = await questionsRepository.create(
      makeQuestionData({ authorId })
    )
    const answer: Answer = {
      id: 'answer-1',
      ...makeAnswerData({ questionId: question.id, authorId }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new QuestionAnsweredEvent(answer)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should queue notification for question author when different user answers', async () => {
    const questionAuthorId = 'question-author-id'
    const answerAuthorId = 'answer-author-id'
    const question: Question = await questionsRepository.create(
      makeQuestionData({ authorId: questionAuthorId, title: 'Test Question' })
    )
    const answer: Answer = {
      id: 'answer-1',
      ...makeAnswerData({ questionId: question.id, authorId: answerAuthorId }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new QuestionAnsweredEvent(answer)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(1)
    const job = notificationQueue.findJob('new-answer')
    expect(job).not.toBeNull()
    expect(job?.data.recipientId).toBe(questionAuthorId)
    expect(job?.data.title).toBe('New answer on "Test Question"')
    expect(job?.data.content).toBe(answer.excerpt)
  })
})
