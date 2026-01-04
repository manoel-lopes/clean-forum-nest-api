import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { CacheModule } from '@/infra/cache/cache.module'
import {
  CachedAnswerAttachmentsRepository,
  TypeOrmAnswerAttachmentsRepositoryToken,
} from '@/infra/cache/repositories/cached-answer-attachments.repository'
import {
  CachedAnswersRepository,
  TypeOrmAnswersRepositoryToken,
} from '@/infra/cache/repositories/cached-answers.repository'
import {
  CachedCommentsRepository,
  TypeOrmCommentsRepositoryToken,
} from '@/infra/cache/repositories/cached-comments.repository'
import {
  CachedEmailValidationsRepository,
  TypeOrmEmailValidationsRepositoryToken,
} from '@/infra/cache/repositories/cached-email-validations.repository'
import {
  CachedQuestionAttachmentsRepository,
  TypeOrmQuestionAttachmentsRepositoryToken,
} from '@/infra/cache/repositories/cached-question-attachments.repository'
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
import { TypeOrmAnswersRepository } from '@/infra/persistence/repositories/typeorm/typeorm-answers.repository'
import { TypeOrmCommentsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-comments.repository'
import { TypeOrmEmailValidationsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-email-validations.repository'
import { TypeOrmQuestionAttachmentsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-question-attachments.repository'
import { TypeOrmQuestionsRepository } from '@/infra/persistence/repositories/typeorm/typeorm-questions.repository'
import { TypeOrmRefreshTokensRepository } from '@/infra/persistence/repositories/typeorm/typeorm-refresh-tokens.repository'
import { TypeOrmUsersRepository } from '@/infra/persistence/repositories/typeorm/typeorm-users.repository'
import { entities } from '@/domain/enterprise/entities'

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
    { provide: TypeOrmCommentsRepositoryToken, useClass: TypeOrmCommentsRepository },
    { provide: TypeOrmQuestionAttachmentsRepositoryToken, useClass: TypeOrmQuestionAttachmentsRepository },
    { provide: TypeOrmAnswerAttachmentsRepositoryToken, useClass: TypeOrmAnswerAttachmentsRepository },
    { provide: TypeOrmRefreshTokensRepositoryToken, useClass: TypeOrmRefreshTokensRepository },
    { provide: TypeOrmEmailValidationsRepositoryToken, useClass: TypeOrmEmailValidationsRepository },
    TypeOrmUsersRepository,
    TypeOrmQuestionsRepository,
    TypeOrmAnswersRepository,
    TypeOrmCommentsRepository,
    TypeOrmQuestionAttachmentsRepository,
    TypeOrmAnswerAttachmentsRepository,
    TypeOrmRefreshTokensRepository,
    TypeOrmEmailValidationsRepository,
    CachedUsersRepository,
    CachedQuestionsRepository,
    CachedAnswersRepository,
    CachedCommentsRepository,
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
      provide: CommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedCommentsRepository,
        typeorm: TypeOrmCommentsRepository
      ) => isCacheEnabled(envService) ? cached : typeorm,
      inject: [EnvService, CachedCommentsRepository, TypeOrmCommentsRepository],
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
    CommentsRepository,
    QuestionAttachmentsRepository,
    AnswerAttachmentsRepository,
    RefreshTokensRepository,
    EmailValidationsRepository,
  ],
})
export class RepositoriesModule {}
