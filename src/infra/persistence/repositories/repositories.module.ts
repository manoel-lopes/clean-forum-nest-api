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
import { CacheModule } from '@/infra/cache/cache.module'
import {
  CachedAnswerAttachmentsRepository,
  TypeOrmAnswerAttachmentsRepositoryToken,
} from '@/infra/cache/repositories/cached-answer-attachments.repository'
import {
  CachedAnswerCommentsRepository,
  TypeOrmAnswerCommentsRepositoryToken,
} from '@/infra/cache/repositories/cached-answer-comments.repository'
import {
  CachedAnswersRepository,
  TypeOrmAnswersRepositoryToken,
} from '@/infra/cache/repositories/cached-answers.repository'
import {
  CachedEmailValidationsRepository,
  TypeOrmEmailValidationsRepositoryToken,
} from '@/infra/cache/repositories/cached-email-validations.repository'
import {
  CachedQuestionAttachmentsRepository,
  TypeOrmQuestionAttachmentsRepositoryToken,
} from '@/infra/cache/repositories/cached-question-attachments.repository'
import {
  CachedQuestionCommentsRepository,
  TypeOrmQuestionCommentsRepositoryToken,
} from '@/infra/cache/repositories/cached-question-comments.repository'
import {
  CachedQuestionsRepository,
  TypeOrmQuestionsRepositoryToken,
} from '@/infra/cache/repositories/cached-questions.repository'
import {
  CachedRefreshTokensRepository,
  TypeOrmRefreshTokensRepositoryToken,
} from '@/infra/cache/repositories/cached-refresh-tokens.repository'
import {
  CachedUsersRepository,
  TypeOrmUsersRepositoryToken,
} from '@/infra/cache/repositories/cached-users.repository'
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
    CacheModule,
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
    // TypeORM repositories (internal)
    { provide: TypeOrmUsersRepositoryToken, useClass: TypeOrmUsersRepository },
    { provide: TypeOrmQuestionsRepositoryToken, useClass: TypeOrmQuestionsRepository },
    { provide: TypeOrmAnswersRepositoryToken, useClass: TypeOrmAnswersRepository },
    { provide: TypeOrmQuestionCommentsRepositoryToken, useClass: TypeOrmQuestionCommentsRepository },
    { provide: TypeOrmAnswerCommentsRepositoryToken, useClass: TypeOrmAnswerCommentsRepository },
    { provide: TypeOrmQuestionAttachmentsRepositoryToken, useClass: TypeOrmQuestionAttachmentsRepository },
    { provide: TypeOrmAnswerAttachmentsRepositoryToken, useClass: TypeOrmAnswerAttachmentsRepository },
    { provide: TypeOrmRefreshTokensRepositoryToken, useClass: TypeOrmRefreshTokensRepository },
    { provide: TypeOrmEmailValidationsRepositoryToken, useClass: TypeOrmEmailValidationsRepository },

    // Cached repositories (public)
    { provide: UsersRepository, useClass: CachedUsersRepository },
    { provide: QuestionsRepository, useClass: CachedQuestionsRepository },
    { provide: AnswersRepository, useClass: CachedAnswersRepository },
    { provide: QuestionCommentsRepository, useClass: CachedQuestionCommentsRepository },
    { provide: AnswerCommentsRepository, useClass: CachedAnswerCommentsRepository },
    { provide: QuestionAttachmentsRepository, useClass: CachedQuestionAttachmentsRepository },
    { provide: AnswerAttachmentsRepository, useClass: CachedAnswerAttachmentsRepository },
    { provide: RefreshTokensRepository, useClass: CachedRefreshTokensRepository },
    { provide: EmailValidationsRepository, useClass: CachedEmailValidationsRepository },
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
