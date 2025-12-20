import type { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { InMemoryAnswersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-answers.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import { AnswerQuestionUseCase } from './answer-question.usecase'
import { makeQuestion } from '@tests/factories/domain/make-question'
import { makeUser } from '@tests/factories/domain/make-user'

describe('AnswerQuestionUseCase', () => {
  let sut: AnswerQuestionUseCase
  let answersRepository: AnswersRepository
  let usersRepository: UsersRepository
  let questionsRepository: QuestionsRepository

  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    usersRepository = new InMemoryUsersRepository()
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new AnswerQuestionUseCase(answersRepository, usersRepository, questionsRepository)
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
    const author = makeUser()
    await usersRepository.save(author)

    const request = {
      questionId: 'inexistent-question-id',
      content: 'any-content',
      authorId: author.id,
    }

    await expect(sut.execute(request)).rejects.toThrow('Question not found')
  })

  it('should correctly answer a question', async () => {
    const author = makeUser()
    await usersRepository.save(author)
    const question = makeQuestion()
    await questionsRepository.save(question)

    const request = {
      questionId: question.id,
      content: 'any long answer, with more than 45 characters for an question',
      authorId: author.id,
    }

    await sut.execute(request)

    const answers = await answersRepository.findManyByQuestionId({ questionId: question.id, page: 1, pageSize: 10 })
    expect(answers.items).toHaveLength(1)
    expect(answers.items[0].content).toBe(request.content)
    expect(answers.items[0].authorId).toBe(author.id)
    expect(answers.items[0].questionId).toBe(question.id)
    expect(answers.items[0].excerpt).toBe('any long answer, with more than 45 characters...')
  })
})
