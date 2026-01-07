import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import { AnswerQuestionUseCase } from './answer-question.usecase'
import { makeQuestionData } from '@tests/factories/domain/make-question'
import { makeUserData } from '@tests/factories/domain/make-user'
import { MockDomainEventEmitter } from '@tests/mocks/domain-event-emitter.mock'

describe('AnswerQuestionUseCase', () => {
  let sut: AnswerQuestionUseCase
  let answersRepository: AnswersRepository
  let usersRepository: UsersRepository
  let questionsRepository: QuestionsRepository
  let eventEmitter: MockDomainEventEmitter

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    usersRepository = new InMemoryUsersRepository()
    questionsRepository = new InMemoryQuestionsRepository()
    eventEmitter = new MockDomainEventEmitter()
    sut = new AnswerQuestionUseCase(answersRepository, usersRepository, questionsRepository, eventEmitter)
  })

  it('should not answer a question using an inexistent author', async () => {
    const request = {
      questionId: 'any-question-id',
      content: 'any-content',
      authorId: 'inexistent-user-id',
    }

    await expect(sut.execute(request)).rejects.toThrow('User not found')
  })

  it('should not answer an inexistent question', async () => {
    const author = await usersRepository.create(makeUserData())

    const request = {
      questionId: 'inexistent-question-id',
      content: 'any-content',
      authorId: author.id,
    }

    await expect(sut.execute(request)).rejects.toThrow('Question not found')
  })

  it('should correctly answer a question', async () => {
    const author = await usersRepository.create(makeUserData())
    const question = await questionsRepository.create(makeQuestionData())

    const request = {
      questionId: question.id,
      content: 'any long answer, with more than 45 characters for an question',
      authorId: author.id,
    }

    const response = await sut.execute(request)

    const answer = await answersRepository.findById(response.id)
    expect(response.id).toEqual(answer?.id)
    expect(response.content).toEqual(answer?.content)
    expect(response.authorId).toEqual(answer?.authorId)
    expect(response.questionId).toEqual(answer?.questionId)
    expect(response.createdAt).toEqual(answer?.createdAt)
    expect(response.updatedAt).toEqual(answer?.updatedAt)
    expect(response.excerpt).toBe('any long answer, with more than 45 characters...')
  })
})
