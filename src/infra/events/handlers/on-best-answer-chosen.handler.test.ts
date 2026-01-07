import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import type { Question } from '@/domain/enterprise/entities/question.entity'
import { BestAnswerChosenEvent } from '@/domain/events/best-answer-chosen/best-answer-chosen.event'
import { OnBestAnswerChosenHandler } from './on-best-answer-chosen.handler'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { makeQuestionData } from '@tests/factories/domain/make-question'
import { MockNotificationQueue } from '@tests/mocks/notification-queue.mock'

describe('OnBestAnswerChosenHandler', () => {
  let sut: OnBestAnswerChosenHandler
  let answersRepository: AnswersRepository
  let notificationQueue: MockNotificationQueue

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    notificationQueue = new MockNotificationQueue()
    // @ts-expect-error - mock queue for testing
    sut = new OnBestAnswerChosenHandler(answersRepository, notificationQueue)
  })

  it('should not queue notification when answer is not found', async () => {
    const question: Question = {
      id: 'question-1',
      ...makeQuestionData(),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new BestAnswerChosenEvent(question, 'non-existent-answer')

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should not queue notification when question author chose their own answer', async () => {
    const authorId = 'same-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId })
    )
    const question: Question = {
      id: 'question-1',
      ...makeQuestionData({ authorId }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new BestAnswerChosenEvent(question, answer.id)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should queue notification for answer author when different user chose best answer', async () => {
    const questionAuthorId = 'question-author-id'
    const answerAuthorId = 'answer-author-id'
    const answer: Answer = await answersRepository.create(
      makeAnswerData({ authorId: answerAuthorId })
    )
    const question: Question = {
      id: 'question-1',
      ...makeQuestionData({ authorId: questionAuthorId, title: 'Test Question' }),
      createdAt: new Date(),
      updatedAt: null,
    }
    const event = new BestAnswerChosenEvent(question, answer.id)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(1)
    const job = notificationQueue.findJob('best-answer')
    expect(job).not.toBeNull()
    expect(job?.data.recipientId).toBe(answerAuthorId)
    expect(job?.data.title).toBe('Your answer was chosen as best!')
    expect(job?.data.content).toBe('Your answer to "Test Question" was selected as the best answer.')
  })
})
