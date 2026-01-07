import { Global, Module } from '@nestjs/common'
import { AnswerAttachmentsRepository } from '@/domain/application/repositories/answer-attachments.repository'
import { AnswersRepository } from '@/domain/application/repositories/answers.repository'
import { CommentsRepository } from '@/domain/application/repositories/comments.repository'
import { EmailValidationsRepository } from '@/domain/application/repositories/email-validations.repository'
import { NotificationsRepository } from '@/domain/application/repositories/notifications.repository'
import { QuestionAttachmentsRepository } from '@/domain/application/repositories/question-attachments.repository'
import { QuestionsRepository } from '@/domain/application/repositories/questions.repository'
import { RefreshTokensRepository } from '@/domain/application/repositories/refresh-tokens.repository'
import { UsersRepository } from '@/domain/application/repositories/users.repository'
import { EnvService } from '@/infra/env/env.service'
import { PrismaAnswerAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-answer-attachment.mapper'
import { PrismaQuestionAttachmentMapper } from '@/infra/persistence/mappers/prisma/prisma-question-attachment.mapper'
import { PrismaModule } from '@/infra/persistence/prisma.module'
import { CacheModule } from '@/infra/persistence/repositories/cache/cache.module'
import {
  CachedAnswerAttachmentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-answer-attachments.repository'
import {
  CachedAnswersRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-answers.repository'
import {
  CachedCommentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-comments.repository'
import {
  CachedEmailValidationsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-email-validations.repository'
import {
  CachedQuestionAttachmentsRepository,
} from '@/infra/persistence/repositories/cache/repositories/cached-question-attachments.repository'
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
import { PrismaAnswersRepository } from '@/infra/persistence/repositories/prisma/prisma-answers.repository'
import { PrismaCommentsRepository } from '@/infra/persistence/repositories/prisma/prisma-comments.repository'
import { PrismaEmailValidationsRepository } from '@/infra/persistence/repositories/prisma/prisma-email-validations.repository'
import { PrismaNotificationsRepository } from '@/infra/persistence/repositories/prisma/prisma-notifications.repository'
import { PrismaQuestionAttachmentsRepository } from '@/infra/persistence/repositories/prisma/prisma-question-attachments.repository'
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
    { provide: PrismaQuestionAttachmentMapper, useValue: PrismaQuestionAttachmentMapper },
    { provide: PrismaAnswerAttachmentMapper, useValue: PrismaAnswerAttachmentMapper },

    PrismaUsersRepository,
    PrismaQuestionsRepository,
    PrismaAnswersRepository,
    PrismaCommentsRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaAnswerAttachmentsRepository,
    PrismaRefreshTokensRepository,
    PrismaEmailValidationsRepository,
    PrismaNotificationsRepository,

    {
      provide: UsersRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedUsersRepository,
        prisma: PrismaUsersRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedUsersRepository, PrismaUsersRepository],
    },
    {
      provide: QuestionsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionsRepository,
        prisma: PrismaQuestionsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionsRepository, PrismaQuestionsRepository],
    },
    {
      provide: AnswersRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswersRepository,
        prisma: PrismaAnswersRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswersRepository, PrismaAnswersRepository],
    },
    {
      provide: CommentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedCommentsRepository,
        prisma: PrismaCommentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedCommentsRepository, PrismaCommentsRepository],
    },
    {
      provide: QuestionAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedQuestionAttachmentsRepository,
        prisma: PrismaQuestionAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedQuestionAttachmentsRepository, PrismaQuestionAttachmentsRepository],
    },
    {
      provide: AnswerAttachmentsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedAnswerAttachmentsRepository,
        prisma: PrismaAnswerAttachmentsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedAnswerAttachmentsRepository, PrismaAnswerAttachmentsRepository],
    },
    {
      provide: RefreshTokensRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedRefreshTokensRepository,
        prisma: PrismaRefreshTokensRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedRefreshTokensRepository, PrismaRefreshTokensRepository],
    },
    {
      provide: EmailValidationsRepository,
      useFactory: (
        envService: EnvService,
        cached: CachedEmailValidationsRepository,
        prisma: PrismaEmailValidationsRepository
      ) => isCacheEnabled(envService) ? cached : prisma,
      inject: [EnvService, CachedEmailValidationsRepository, PrismaEmailValidationsRepository],
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },

    CachedUsersRepository,
    CachedQuestionsRepository,
    CachedAnswersRepository,
    CachedCommentsRepository,
    CachedQuestionAttachmentsRepository,
    CachedAnswerAttachmentsRepository,
    CachedRefreshTokensRepository,
    CachedEmailValidationsRepository,
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
    NotificationsRepository,
  ],
})
export class RepositoriesModule {}
