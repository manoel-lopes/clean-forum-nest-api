import { uuidv7 } from 'uuidv7'
import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { BestAnswerChosenEvent } from '@/domain/events/best-answer-chosen/best-answer-chosen.event'
import { OnBestAnswerChosenHandler } from './on-best-answer-chosen.handler'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { makeQuestionData } from '@tests/factories/domain/make-question'
import { MockNotificationQueue } from '@tests/mocks/notification-queue.mock'

describe('OnBestAnswerChosenHandler', () => {
  let sut: OnBestAnswerChosenHandler
  let answersRepository: AnswersRepository
  let questionsRepository: QuestionsRepository
  let notificationQueue: MockNotificationQueue

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    questionsRepository = new InMemoryQuestionsRepository()
    notificationQueue = new MockNotificationQueue()
    sut = new OnBestAnswerChosenHandler(answersRepository, notificationQueue)
  })

  it('should not queue notification when answer is not found', async () => {
    const question = await questionsRepository.create(makeQuestionData())
    const event = new BestAnswerChosenEvent(question, uuidv7())

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should not queue notification when question author chose their own answer', async () => {
    const authorId = uuidv7()
    const answer = await answersRepository.create(
      makeAnswerData({ authorId })
    )
    const question = await questionsRepository.create(makeQuestionData({ authorId }))
    const event = new BestAnswerChosenEvent(question, answer.id)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should queue notification for answer author when different user chose best answer', async () => {
    const questionAuthorId = uuidv7()
    const answerAuthorId = uuidv7()
    const answer = await answersRepository.create(
      makeAnswerData({ authorId: answerAuthorId })
    )
    const question = await questionsRepository.create(makeQuestionData({
      authorId: questionAuthorId,
    }))
    const event = new BestAnswerChosenEvent(question, answer.id)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(1)
    const job = notificationQueue.findJob('best-answer')
    expect(job).not.toBeNull()
    expect(job?.data.recipientId).toBe(answerAuthorId)
    expect(job?.data.title).toBe('Your answer was chosen as best!')
    expect(job?.data.content).toBe(`Your answer to "${question.title}" was selected as the best answer.`)
  })
})
