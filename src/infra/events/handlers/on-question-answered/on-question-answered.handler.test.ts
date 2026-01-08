import { uuidv7 } from 'uuidv7'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { QuestionAnsweredEvent } from '@/domain/events/question-answered/question-answered.event'
import { OnQuestionAnsweredHandler } from './on-question-answered.handler'
import { makeAnswerData } from '@tests/factories/domain/make-answer'
import { makeQuestionData } from '@tests/factories/domain/make-question'
import { MockNotificationQueue } from '@tests/mocks/notification-queue.mock'

describe('OnQuestionAnsweredHandler', () => {
  let sut: OnQuestionAnsweredHandler
  let questionsRepository: QuestionsRepository
  let answersRepository: AnswersRepository
  let notificationQueue: MockNotificationQueue

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    questionsRepository = new InMemoryQuestionsRepository()
    notificationQueue = new MockNotificationQueue()
    sut = new OnQuestionAnsweredHandler(questionsRepository, notificationQueue)
  })

  it('should not queue notification when question is not found', async () => {
    const answer = await answersRepository.create(makeAnswerData({
      questionId: uuidv7(),
    }))
    const event = new QuestionAnsweredEvent(answer)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should not queue notification when author answers their own question', async () => {
    const authorId = uuidv7()
    const question = await questionsRepository.create(
      makeQuestionData({ authorId })
    )
    const answer = await answersRepository.create(makeAnswerData({
      questionId: question.id,
      authorId,
    }))
    const event = new QuestionAnsweredEvent(answer)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(0)
  })

  it('should queue notification for question author when different user answers', async () => {
    const questionAuthorId = uuidv7()
    const answerAuthorId = uuidv7()
    const question = await questionsRepository.create(
      makeQuestionData({ authorId: questionAuthorId })
    )
    const answer = await answersRepository.create(makeAnswerData({
      questionId: question.id,
      authorId: answerAuthorId,
    }))
    const event = new QuestionAnsweredEvent(answer)

    await sut.handle(event)

    expect(notificationQueue.addedJobs).toHaveLength(1)
    const job = notificationQueue.findJob('new-answer')
    expect(job).not.toBeNull()
    expect(job?.data.recipientId).toBe(questionAuthorId)
    expect(job?.data.title).toBe(`New answer on "${question.title}"`)
    expect(job?.data.content).toBe(answer.excerpt)
  })
})
