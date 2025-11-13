import type { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import type { UsersRepository } from '@/domain/application/repositories/users.repository'
import { InMemoryQuestionsRepository } from '@/infra/persistence/repositories/in-memory/in-memory-questions.repository'
import { InMemoryUsersRepository } from '@/infra/persistence/repositories/in-memory/in-memory-users.repository'
import { makeUserData } from '@/shared/util/factories/domain/make-user'
import { CreateQuestionUseCase } from './create-question.usecase'
import { QuestionWithTitleAlreadyRegisteredError } from './errors/question-with-title-already-registered.error'

describe('CreateQuestionUseCase', () => {
  let sut: CreateQuestionUseCase
  let questionsRepository: QuestionsRepository
  let usersRepository: UsersRepository

  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateQuestionUseCase(questionsRepository)
  })

  it('should not create a question with a title already registered', async () => {
    const author = await usersRepository.create(makeUserData())

    const request = {
      title: 'Existing Question Title',
      content: 'Question content',
      authorId: author.id,
    }
    await sut.execute(request)

    await expect(sut.execute(request)).rejects.toThrowError(new QuestionWithTitleAlreadyRegisteredError())
  })

  it('should create an unanswered question', async () => {
    const author = await usersRepository.create(makeUserData())

    const request = {
      title: 'New Question Title',
      content: 'Question content',
      authorId: author.id,
    }

    await sut.execute(request)

    const question = await questionsRepository.findByTitle('New Question Title')

    expect(question).not.toBeNull()
    expect(question!.title).toBe('New Question Title')
    expect(question!.content).toBe('Question content')
    expect(question!.slug).toBe('new-question-title')
    expect(question!.authorId).toBe(author.id)
    expect(question?.bestAnswerId).toBeUndefined()
  })

  it('should create a question with a best answer', async () => {
    const author = await usersRepository.create(makeUserData())

    const request = {
      title: 'Question With Answer',
      content: 'Question content',
      bestAnswerId: 'best-answer-id',
      authorId: author.id,
    }

    await sut.execute(request)

    const question = await questionsRepository.findByTitle('Question With Answer')

    expect(question).not.toBeNull()
    expect(question!.title).toBe('Question With Answer')
    expect(question!.content).toBe('Question content')
    expect(question!.slug).toBe('question-with-answer')
    expect(question!.authorId).toBe(author.id)
    expect(question!.bestAnswerId).toBe('best-answer-id')
  })
})
