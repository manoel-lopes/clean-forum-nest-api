import type { Question } from '@/domain/enterprise/entities/question.entity'
import { BestAnswerChosenEvent } from './best-answer-chosen.event'
import { makeQuestionData } from '@tests/factories/domain/make-question'

describe('BestAnswerChosenEvent', () => {
  it('should have correct event name', () => {
    const question: Question = {
      id: 'question-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeQuestionData(),
    }
    const answerId = 'answer-1'

    const event = new BestAnswerChosenEvent(question, answerId)

    expect(event.eventName).toBe('question.best-answer-chosen')
  })

  it('should set occurredAt to current date', () => {
    const question: Question = {
      id: 'question-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeQuestionData(),
    }
    const answerId = 'answer-1'
    const before = new Date()

    const event = new BestAnswerChosenEvent(question, answerId)

    const after = new Date()
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should store the question and answerId', () => {
    const question: Question = {
      id: 'question-1',
      createdAt: new Date(),
      updatedAt: null,
      ...makeQuestionData(),
    }
    const answerId = 'answer-1'

    const event = new BestAnswerChosenEvent(question, answerId)

    expect(event.question).toBe(question)
    expect(event.answerId).toBe(answerId)
  })
})
