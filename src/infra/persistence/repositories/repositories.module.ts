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
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: QuestionsRepository, useClass: PrismaQuestionsRepository },
    { provide: AnswersRepository, useClass: PrismaAnswersRepository },
    { provide: QuestionCommentsRepository, useClass: PrismaQuestionCommentsRepository },
    { provide: AnswerCommentsRepository, useClass: PrismaAnswerCommentsRepository },
    { provide: QuestionAttachmentsRepository, useClass: PrismaQuestionAttachmentsRepository },
    { provide: AnswerAttachmentsRepository, useClass: PrismaAnswerAttachmentsRepository },
    { provide: RefreshTokensRepository, useClass: PrismaRefreshTokensRepository },
    { provide: EmailValidationsRepository, useClass: PrismaEmailValidationsRepository },
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
