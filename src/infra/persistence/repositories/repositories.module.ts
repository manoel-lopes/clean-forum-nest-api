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
import { CacheModule } from '@/infra/cache/cache.module'
import {
  CachedAnswerAttachmentsRepository,
  PrismaAnswerAttachmentsRepositoryToken,
} from '@/infra/cache/repositories/cached-answer-attachments.repository'
import {
  CachedAnswerCommentsRepository,
  PrismaAnswerCommentsRepositoryToken,
} from '@/infra/cache/repositories/cached-answer-comments.repository'
import {
  CachedAnswersRepository,
  PrismaAnswersRepositoryToken,
} from '@/infra/cache/repositories/cached-answers.repository'
import {
  CachedEmailValidationsRepository,
  PrismaEmailValidationsRepositoryToken,
} from '@/infra/cache/repositories/cached-email-validations.repository'
import {
  CachedQuestionAttachmentsRepository,
  PrismaQuestionAttachmentsRepositoryToken,
} from '@/infra/cache/repositories/cached-question-attachments.repository'
import {
  CachedQuestionCommentsRepository,
  PrismaQuestionCommentsRepositoryToken,
} from '@/infra/cache/repositories/cached-question-comments.repository'
import {
  CachedQuestionsRepository,
  PrismaQuestionsRepositoryToken,
} from '@/infra/cache/repositories/cached-questions.repository'
import {
  CachedRefreshTokensRepository,
  PrismaRefreshTokensRepositoryToken,
} from '@/infra/cache/repositories/cached-refresh-tokens.repository'
import {
  CachedUsersRepository,
  PrismaUsersRepositoryToken,
} from '@/infra/cache/repositories/cached-users.repository'
import { EnvService } from '@/infra/env/env.service'
import { PrismaAnswerAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-attachment.mapper'
import { PrismaAnswerCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-comment.mapper'
import { PrismaQuestionAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-attachment.mapper'
import { PrismaQuestionCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-comment.mapper'
import { PrismaModule } from '@/infra/persistence/prisma.module'
import { PrismaAnswerAttachmentsRepository } from '@/infra/persistence/repositories/prisma/prisma-answer-attachments.repository'
import { PrismaAnswerCommentsRepository } from '@/infra/persistence/repositories/prisma/prisma-answer-comments.repository'
import { PrismaAnswersRepository } from '@/infra/persistence/repositories/prisma/prisma-answers.repository'
import { PrismaEmailValidationsRepository } from '@/infra/persistence/repositories/prisma/prisma-email-validations.repository'
import { PrismaQuestionAttachmentsRepository } from '@/infra/persistence/repositories/prisma/prisma-question-attachments.repository'
import { PrismaQuestionCommentsRepository } from '@/infra/persistence/repositories/prisma/prisma-question-comments.repository'
import { PrismaQuestionsRepository } from '@/infra/persistence/repositories/prisma/prisma-questions.repository'
import { PrismaRefreshTokensRepository } from '@/infra/persistence/repositories/prisma/prisma-refresh-tokens.repository'
import { PrismaUsersRepository } from '@/infra/persistence/repositories/prisma/prisma-users.repository'

const isCacheEnabled = (envService: EnvService): boolean => {
  return envService.get('NODE_ENV') !== 'test'
}

@Global()
@Module({
  imports: [PrismaModule, CacheModule],
  providers: [
    { provide: PrismaQuestionCommentMapper, useValue: PrismaQuestionCommentMapper },
    { provide: PrismaAnswerCommentMapper, useValue: PrismaAnswerCommentMapper },
    { provide: PrismaQuestionAttachmentMapper, useValue: PrismaQuestionAttachmentMapper },
    { provide: PrismaAnswerAttachmentMapper, useValue: PrismaAnswerAttachmentMapper },

    { provide: PrismaUsersRepositoryToken, useClass: PrismaUsersRepository },
    { provide: PrismaQuestionsRepositoryToken, useClass: PrismaQuestionsRepository },
    { provide: PrismaAnswersRepositoryToken, useClass: PrismaAnswersRepository },
    { provide: PrismaQuestionCommentsRepositoryToken, useClass: PrismaQuestionCommentsRepository },
    { provide: PrismaAnswerCommentsRepositoryToken, useClass: PrismaAnswerCommentsRepository },
    { provide: PrismaQuestionAttachmentsRepositoryToken, useClass: PrismaQuestionAttachmentsRepository },
    { provide: PrismaAnswerAttachmentsRepositoryToken, useClass: PrismaAnswerAttachmentsRepository },
    { provide: PrismaRefreshTokensRepositoryToken, useClass: PrismaRefreshTokensRepository },
    { provide: PrismaEmailValidationsRepositoryToken, useClass: PrismaEmailValidationsRepository },

    {
      provide: UsersRepository,
      useFactory: (envService: EnvService, cached: CachedUsersRepository, prisma: PrismaUsersRepository) =>
        isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedUsersRepository, PrismaUsersRepositoryToken],
    },
    {
      provide: QuestionsRepository,
      useFactory: (envService: EnvService, cached: CachedQuestionsRepository, prisma: PrismaQuestionsRepository) =>
        isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionsRepository, PrismaQuestionsRepositoryToken],
    },
    {
      provide: AnswersRepository,
      useFactory: (envService: EnvService, cached: CachedAnswersRepository, prisma: PrismaAnswersRepository) =>
        isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswersRepository, PrismaAnswersRepositoryToken],
    },
    {
      provide: QuestionCommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionCommentsRepository,
        prisma: PrismaQuestionCommentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionCommentsRepository, PrismaQuestionCommentsRepositoryToken],
    },
    {
      provide: AnswerCommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerCommentsRepository,
        prisma: PrismaAnswerCommentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswerCommentsRepository, PrismaAnswerCommentsRepositoryToken],
    },
    {
      provide: QuestionAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionAttachmentsRepository,
        prisma: PrismaQuestionAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionAttachmentsRepository, PrismaQuestionAttachmentsRepositoryToken],
    },
    {
      provide: AnswerAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerAttachmentsRepository,
        prisma: PrismaAnswerAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswerAttachmentsRepository, PrismaAnswerAttachmentsRepositoryToken],
    },
    {
      provide: RefreshTokensRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedRefreshTokensRepository,
        prisma: PrismaRefreshTokensRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedRefreshTokensRepository, PrismaRefreshTokensRepositoryToken],
    },
    {
      provide: EmailValidationsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedEmailValidationsRepository,
        prisma: PrismaEmailValidationsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedEmailValidationsRepository, PrismaEmailValidationsRepositoryToken],
    },

    CachedUsersRepository,
    CachedQuestionsRepository,
    CachedAnswersRepository,
    CachedQuestionCommentsRepository,
    CachedAnswerCommentsRepository,
    CachedQuestionAttachmentsRepository,
    CachedAnswerAttachmentsRepository,
    CachedRefreshTokensRepository,
    CachedEmailValidationsRepository,
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
