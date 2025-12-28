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
import { EnvService } from '@/infra/env/env.service'
import { PrismaAnswerAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-attachment.mapper'
import { PrismaAnswerCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-comment.mapper'
import { PrismaQuestionAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-attachment.mapper'
import { PrismaQuestionCommentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-comment.mapper'
import { PrismaModule } from '@/infra/persistence/prisma.module'
import { CacheModule } from '@/infra/persistence/repositories/cache/cache.module'
import {
  CachedAnswerAttachmentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-answer-attachments.repository'
import {
  CachedAnswerCommentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-answer-comments.repository'
import {
  CachedAnswersRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-answers.repository'
import {
  CachedEmailValidationsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-email-validations.repository'
import {
  CachedQuestionAttachmentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-question-attachments.repository'
import {
  CachedQuestionCommentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-question-comments.repository'
import {
  CachedQuestionsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-questions.repository'
import {
  CachedRefreshTokensRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-refresh-tokens.repository'
import {
  CachedUsersRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-users.repository'
import { PrismaAnswerAttachmentsRepository } from '@/infra/persistence/repositories/prisma/prisma-answer-attachments.repository'
import { PrismaAnswerCommentsRepository } from '@/infra/persistence/repositories/prisma/prisma-answer-comments.repository'
import { PrismaAnswersRepository } from '@/infra/persistence/repositories/prisma/prisma-answers.repository'
import { PrismaEmailValidationsRepository } from '@/infra/persistence/repositories/prisma/prisma-email-validations.repository'
import { PrismaQuestionAttachmentsRepository } from '@/infra/persistence/repositories/prisma/prisma-question-attachments.repository'
import { PrismaQuestionCommentsRepository } from '@/infra/persistence/repositories/prisma/prisma-question-comments.repository'
import { PrismaQuestionsRepository } from '@/infra/persistence/repositories/prisma/prisma-questions.repository'
import { PrismaRefreshTokensRepository } from '@/infra/persistence/repositories/prisma/prisma-refresh-tokens.repository'
import { PrismaUsersRepository } from '@/infra/persistence/repositories/prisma/prisma-users.repository'

const isCacheEnabled = (envService: EnvService) => {
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
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: QuestionsRepository, useClass: PrismaQuestionsRepository },
    { provide: AnswersRepository, useClass: PrismaAnswersRepository },
    { provide: QuestionCommentsRepository, useClass: PrismaQuestionCommentsRepository },
    { provide: AnswerCommentsRepository, useClass: PrismaAnswerCommentsRepository },
    { provide: QuestionAttachmentsRepository, useClass: PrismaQuestionAttachmentsRepository },
    { provide: AnswerAttachmentsRepository, useClass: PrismaAnswerAttachmentsRepository },
    { provide: RefreshTokensRepository, useClass: PrismaRefreshTokensRepository },
    { provide: EmailValidationsRepository, useClass: PrismaEmailValidationsRepository },

    {
      provide: UsersRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedUsersRepository,
        prisma: PrismaUsersRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedUsersRepository, UsersRepository],
    },
    {
      provide: QuestionsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionsRepository,
        prisma: PrismaQuestionsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionsRepository, QuestionsRepository],
    },
    {
      provide: AnswersRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswersRepository,
        prisma: PrismaAnswersRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswersRepository, AnswersRepository],
    },
    {
      provide: QuestionCommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionCommentsRepository,
        prisma: PrismaQuestionCommentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionCommentsRepository, QuestionCommentsRepository],
    },
    {
      provide: AnswerCommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerCommentsRepository,
        prisma: PrismaAnswerCommentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswerCommentsRepository, AnswerCommentsRepository],
    },
    {
      provide: QuestionAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionAttachmentsRepository,
        prisma: PrismaQuestionAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionAttachmentsRepository, QuestionAttachmentsRepository],
    },
    {
      provide: AnswerAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerAttachmentsRepository,
        prisma: PrismaAnswerAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswerAttachmentsRepository, AnswerAttachmentsRepository],
    },
    {
      provide: RefreshTokensRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedRefreshTokensRepository,
        prisma: PrismaRefreshTokensRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedRefreshTokensRepository, RefreshTokensRepository],
    },
    {
      provide: EmailValidationsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedEmailValidationsRepository,
        prisma: PrismaEmailValidationsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedEmailValidationsRepository, EmailValidationsRepository],
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
