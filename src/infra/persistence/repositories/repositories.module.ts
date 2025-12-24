import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswerCommentsRepository } from '@/domain/application/repositories/answer-comments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { QuestionCommentsRepository } from '@/domain/application/repositories/question-comments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { EnvService } from '@/infra/env/env.service'
import { TypeOrmAnswerAttachmentsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-answer-attachments.repository'
import { TypeOrmAnswerCommentsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-answer-comments.repository'
import { TypeOrmAnswersRepository } from '@/infra/persistence/repositories/typeorm/typeorm-answers.repository'
import { TypeOrmEmailValidationsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-email-validations.repository'
import { TypeOrmQuestionAttachmentsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-question-attachments.repository'
import { TypeOrmQuestionCommentsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-question-comments.repository'
import { TypeOrmQuestionsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-questions.repository'
import { TypeOrmRefreshTokensRepository } from '@/infra/persistence/repositories/typeorm/typeorm-refresh-tokens.repository'
import { TypeOrmUsersRepository } from '@/infra/persistence/repositories/typeorm/typeorm-users.repository'
import { Answer } from '@/domain/enterprise/entities/answer.entity'
import { AnswerAttachment } from '@/domain/enterprise/entities/answer-attachment.entity'
import { AnswerComment } from '@/domain/enterprise/entities/answer-comment.entity'
import { Attachment } from '@/domain/enterprise/entities/base/attachment.entity'
import { Comment } from '@/domain/enterprise/entities/base/comment.entity'
import { EmailValidation } from '@/domain/enterprise/entities/email-validation.entity'
import { Question } from '@/domain/enterprise/entities/question.entity'
import { QuestionAttachment } from '@/domain/enterprise/entities/question-attachment.entity'
import { QuestionComment } from '@/domain/enterprise/entities/question-comment.entity'
import { RefreshToken } from '@/domain/enterprise/entities/refresh-token.entity'
import { User } from '@/domain/enterprise/entities/user.entity'

const entities = [
  User,
  Question,
  Answer,
  Comment,
  QuestionComment,
  AnswerComment,
  Attachment,
  QuestionAttachment,
  AnswerAttachment,
  RefreshToken,
  EmailValidation,
]

function extractSchemaFromUrl (databaseUrl: string): string | undefined {
  try {
    const url = new URL(databaseUrl)
    return url.searchParams.get('schema') || undefined
  } catch {
    return undefined
  }
}

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        const databaseUrl = envService.getDatabaseUrl()
        const schema = extractSchemaFromUrl(databaseUrl)
        return {
          type: 'postgres',
          url: databaseUrl,
          schema,
          entities,
          synchronize: false,
          logging: envService.get('NODE_ENV') === 'development',
        }
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
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
export class RepositoriesModule {}
