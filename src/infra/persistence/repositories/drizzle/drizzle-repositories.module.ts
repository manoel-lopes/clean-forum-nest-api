import { Global, Module } from '@nestjs/common'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { DrizzleModule } from '@/infra/persistence/drizzle/drizzle.module'
import { DrizzleAnswerAttachmentsRepository } from './drizzle-answer-attachments.repository'
import { DrizzleAnswerCommentsRepository } from './drizzle-answer-comments.repository'
import { DrizzleAnswersRepository } from './drizzle-answers.repository'
import { DrizzleEmailValidationsRepository } from './drizzle-email-validations.repository'
import { DrizzleQuestionAttachmentsRepository } from './drizzle-question-attachments.repository'
import { DrizzleQuestionCommentsRepository } from './drizzle-question-comments.repository'
import { DrizzleQuestionsRepository } from './drizzle-questions.repository'
import { DrizzleRefreshTokensRepository } from './drizzle-refresh-tokens.repository'
import { DrizzleUsersRepository } from './drizzle-users.repository'

@Global()
@Module({
  imports: [DrizzleModule],
  providers: [
    { provide: UsersRepository, useClass: DrizzleUsersRepository },
    { provide: QuestionsRepository, useClass: DrizzleQuestionsRepository },
    { provide: AnswersRepository, useClass: DrizzleAnswersRepository },
    { provide: QuestionCommentsRepository, useClass: DrizzleQuestionCommentsRepository },
    { provide: AnswerCommentsRepository, useClass: DrizzleAnswerCommentsRepository },
    { provide: QuestionAttachmentsRepository, useClass: DrizzleQuestionAttachmentsRepository },
    { provide: AnswerAttachmentsRepository, useClass: DrizzleAnswerAttachmentsRepository },
    { provide: RefreshTokensRepository, useClass: DrizzleRefreshTokensRepository },
    { provide: EmailValidationsRepository, useClass: DrizzleEmailValidationsRepository },
  ],
  exports: [
    UsersRepository,
    QuestionsRepository,
    AnswersRepository,
    QuestionCommentsRepository,
    AnswerCommentsRepository,
    QuestionAttachmentsRepository,
    AnswerAttachmentsRepository,
    RefreshTokensRepository,
    EmailValidationsRepository,
  ],
})
export class DrizzleRepositoriesModule {}
