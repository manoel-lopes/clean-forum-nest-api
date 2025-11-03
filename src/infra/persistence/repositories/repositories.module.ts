import { Global, Module } from '@nestjs/common'

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

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PrismaUsersRepository,
    PrismaQuestionsRepository,
    PrismaAnswersRepository,
    PrismaQuestionCommentsRepository,
    PrismaAnswerCommentsRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaAnswerAttachmentsRepository,
    PrismaRefreshTokensRepository,
    PrismaEmailValidationsRepository,
  ],
  exports: [
    PrismaUsersRepository,
    PrismaQuestionsRepository,
    PrismaAnswersRepository,
    PrismaQuestionCommentsRepository,
    PrismaAnswerCommentsRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaAnswerAttachmentsRepository,
    PrismaRefreshTokensRepository,
    PrismaEmailValidationsRepository,
  ],
})
export class RepositoriesModule {}
