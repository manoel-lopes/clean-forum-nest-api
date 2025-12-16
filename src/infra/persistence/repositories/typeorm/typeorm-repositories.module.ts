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
import { TypeOrmPersistenceModule } from '@/infra/persistence/typeorm/typeorm.module'
import { TypeOrmAnswerAttachmentsRepository } from './typeorm-answer-attachments.repository'
import { TypeOrmAnswerCommentsRepository } from './typeorm-answer-comments.repository'
import { TypeOrmAnswersRepository } from './typeorm-answers.repository'
import { TypeOrmEmailValidationsRepository } from './typeorm-email-validations.repository'
import { TypeOrmQuestionAttachmentsRepository } from './typeorm-question-attachments.repository'
import { TypeOrmQuestionCommentsRepository } from './typeorm-question-comments.repository'
import { TypeOrmQuestionsRepository } from './typeorm-questions.repository'
import { TypeOrmRefreshTokensRepository } from './typeorm-refresh-tokens.repository'
import { TypeOrmUsersRepository } from './typeorm-users.repository'

@Global()
@Module({
  imports: [TypeOrmPersistenceModule],
  providers: [
    { provide: UsersRepository, useClass: TypeOrmUsersRepository },
    { provide: QuestionsRepository, useClass: TypeOrmQuestionsRepository },
    { provide: AnswersRepository, useClass: TypeOrmAnswersRepository },
    { provide: QuestionCommentsRepository, useClass: TypeOrmQuestionCommentsRepository },
    { provide: AnswerCommentsRepository, useClass: TypeOrmAnswerCommentsRepository },
    { provide: QuestionAttachmentsRepository, useClass: TypeOrmQuestionAttachmentsRepository },
    { provide: AnswerAttachmentsRepository, useClass: TypeOrmAnswerAttachmentsRepository },
    { provide: RefreshTokensRepository, useClass: TypeOrmRefreshTokensRepository },
    { provide: EmailValidationsRepository, useClass: TypeOrmEmailValidationsRepository },
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
export class TypeOrmRepositoriesModule {}
