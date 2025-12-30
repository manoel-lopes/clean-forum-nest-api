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

const isCacheEnabled = (envService: EnvService) => {
  return envService.get('NODE_ENV') !== 'test'
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
    { provide: TypeOrmUsersRepositoryToken, useClass: TypeOrmUsersRepository },
    { provide: TypeOrmQuestionsRepositoryToken, useClass: TypeOrmQuestionsRepository },
    { provide: TypeOrmAnswersRepositoryToken, useClass: TypeOrmAnswersRepository },
    { provide: TypeOrmQuestionCommentsRepositoryToken, useClass: TypeOrmQuestionCommentsRepository },
    { provide: TypeOrmAnswerCommentsRepositoryToken, useClass: TypeOrmAnswerCommentsRepository },
    { provide: TypeOrmQuestionAttachmentsRepositoryToken, useClass: TypeOrmQuestionAttachmentsRepository },
    { provide: TypeOrmAnswerAttachmentsRepositoryToken, useClass: TypeOrmAnswerAttachmentsRepository },
    { provide: TypeOrmRefreshTokensRepositoryToken, useClass: TypeOrmRefreshTokensRepository },
    { provide: TypeOrmEmailValidationsRepositoryToken, useClass: TypeOrmEmailValidationsRepository },
    TypeOrmUsersRepository,
    TypeOrmQuestionsRepository,
    TypeOrmAnswersRepository,
    TypeOrmQuestionCommentsRepository,
    TypeOrmAnswerCommentsRepository,
    TypeOrmQuestionAttachmentsRepository,
    TypeOrmAnswerAttachmentsRepository,
    TypeOrmRefreshTokensRepository,
    TypeOrmEmailValidationsRepository,
    CachedUsersRepository,
    CachedQuestionsRepository,
    CachedAnswersRepository,
    CachedQuestionCommentsRepository,
    CachedAnswerCommentsRepository,
    CachedQuestionAttachmentsRepository,
    CachedAnswerAttachmentsRepository,
    CachedRefreshTokensRepository,
    CachedEmailValidationsRepository,

    {
      provide: UsersRepository,
      useFactory: (envService: EnvService, cached: CachedUsersRepository, typeorm: TypeOrmUsersRepository) =>
        isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedUsersRepository, TypeOrmUsersRepository],
    },
    {
      provide: QuestionsRepository,
      useFactory: (envService: EnvService, cached: CachedQuestionsRepository, typeorm: TypeOrmQuestionsRepository) =>
        isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedQuestionsRepository, TypeOrmQuestionsRepository],
    },
    {
      provide: AnswersRepository,
      useFactory: (envService: EnvService, cached: CachedAnswersRepository, typeorm: TypeOrmAnswersRepository) =>
        isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedAnswersRepository, TypeOrmAnswersRepository],
    },
    {
      provide: QuestionCommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionCommentsRepository,
        typeorm: TypeOrmQuestionCommentsRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedQuestionCommentsRepository, TypeOrmQuestionCommentsRepository],
    },
    {
      provide: AnswerCommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerCommentsRepository,
        typeorm: TypeOrmAnswerCommentsRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedAnswerCommentsRepository, TypeOrmAnswerCommentsRepository],
    },
    {
      provide: QuestionAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionAttachmentsRepository,
        typeorm: TypeOrmQuestionAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedQuestionAttachmentsRepository, TypeOrmQuestionAttachmentsRepository],
    },
    {
      provide: AnswerAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerAttachmentsRepository,
        typeorm: TypeOrmAnswerAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedAnswerAttachmentsRepository, TypeOrmAnswerAttachmentsRepository],
    },
    {
      provide: RefreshTokensRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedRefreshTokensRepository,
        typeorm: TypeOrmRefreshTokensRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedRefreshTokensRepository, TypeOrmRefreshTokensRepository],
    },
    {
      provide: EmailValidationsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedEmailValidationsRepository,
        typeorm: TypeOrmEmailValidationsRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedEmailValidationsRepository, TypeOrmEmailValidationsRepository],
    },
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
