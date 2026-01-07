import type { Answer } from '@/domain/enterprise/entities/answer.entity'
import { QuestionAnsweredEvent } from './question-answered.event'
import { makeAnswerData } from '@tests/factories/domain/make-answer'

describe('QuestionAnsweredEvent', () => {
  it('should have correct event name', () => {
    const answer: Answer = {
      id: 'answer-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeAnswerData(),
    }

    const event = new QuestionAnsweredEvent(answer)

    expect(event.eventName).toBe('question.answered')
  })

  it('should set occurredAt to current date', () => {
    const answer: Answer = {
      id: 'answer-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeAnswerData(),
    }
    const before = new Date()

    const event = new QuestionAnsweredEvent(answer)

    const after = new Date()
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should store the answer', () => {
    const answer: Answer = {
      id: 'answer-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeAnswerData(),
    }

    const event = new QuestionAnsweredEvent(answer)

    expect(event.answer).toBe(answer)
  })
})
