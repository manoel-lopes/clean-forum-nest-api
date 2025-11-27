import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UseCasesModule } from './domain/application/usecases/usecases.module'
import { EmailModule } from './infra/adapters/email/email.module'
import { SecurityModule } from './infra/adapters/security/security.module'
import { AuthModule } from './infra/auth/auth.module'
import { envSchema } from './infra/env/env'
import { EnvModule } from './infra/env/env.module'
import { PrismaModule } from './infra/persistence/prisma.module'
import { RepositoriesModule } from './infra/persistence/repositories/repositories.module'
import { BullBoardConfigModule } from './infra/queues/bull-board.module'
import { AnswerQuestionController } from './presentation/controllers/answer-question/answer-question.controller'
import { AttachToAnswerController } from './presentation/controllers/attach-to-answer/attach-to-answer.controller'
import { AttachToQuestionController } from './presentation/controllers/attach-to-question/attach-to-question.controller'
import { AuthenticateUserController } from './presentation/controllers/authenticate-user/authenticate-user.controller'
import { ChooseQuestionBestAnswerController } from './presentation/controllers/choose-question-best-answer/choose-question-best-answer.controller'
import { CommentOnAnswerController } from './presentation/controllers/comment-on-answer/comment-on-answer.controller'
import { CommentOnQuestionController } from './presentation/controllers/comment-on-question/comment-on-question.controller'
import { CreateAccountController } from './presentation/controllers/create-account/create-account.controller'
import { CreateQuestionController } from './presentation/controllers/create-question/create-question.controller'
import { DeleteAccountController } from './presentation/controllers/delete-account/delete-account.controller'
import { DeleteAnswerController } from './presentation/controllers/delete-answer/delete-answer.controller'
import { DeleteAnswerAttachmentController } from './presentation/controllers/delete-answer-attachment/delete-answer-attachment.controller'
import { DeleteAnswerCommentController } from './presentation/controllers/delete-answer-comment/delete-answer-comment.controller'
import { DeleteQuestionController } from './presentation/controllers/delete-question/delete-question.controller'
import { DeleteQuestionAttachmentController } from './presentation/controllers/delete-question-attachment/delete-question-attachment.controller'
import { DeleteQuestionCommentController } from './presentation/controllers/delete-question-comment/delete-question-comment.controller'
import { FetchQuestionAnswersController } from './presentation/controllers/fetch-question-answers/fetch-question-answers.controller'
import { FetchQuestionsController } from './presentation/controllers/fetch-questions/fetch-questions.controller'
import { FetchUserQuestionsController } from './presentation/controllers/fetch-user-questions/fetch-user-questions.controller'
import { FetchUsersController } from './presentation/controllers/fetch-users/fetch-users.controller'
import { GetQuestionBySlugController } from './presentation/controllers/get-question-by-slug/get-question-by-slug.controller'
import { GetUserByEmailController } from './presentation/controllers/get-user-by-email/get-user-by-email.controller'
import { RefreshAccessTokenController } from './presentation/controllers/refresh-token/refresh-token.controller'
import { SendEmailValidationController } from './presentation/controllers/send-email-validation/send-email-validation.controller'
import { UpdateAnswerController } from './presentation/controllers/update-answer/update-answer.controller'
import { UpdateAnswerAttachmentController } from './presentation/controllers/update-answer-attachment/update-answer-attachment.controller'
import { UpdateAnswerCommentController } from './presentation/controllers/update-answer-comment/update-answer-comment.controller'
import { UpdateQuestionController } from './presentation/controllers/update-question/update-question.controller'
import { UpdateQuestionAttachmentController } from './presentation/controllers/update-question-attachment/update-question-attachment.controller'
import { UpdateQuestionCommentController } from './presentation/controllers/update-question-comment/update-question-comment.controller'
import { VerifyEmailValidationController } from './presentation/controllers/verify-email-validation/verify-email-validation.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    PrismaModule,
    RepositoriesModule,
    EmailModule,
    SecurityModule,
    AuthModule,
    UseCasesModule,
    BullBoardConfigModule,
  ],
  controllers: [
    AnswerQuestionController,
    AttachToAnswerController,
    AttachToQuestionController,
    AuthenticateUserController,
    ChooseQuestionBestAnswerController,
    CommentOnAnswerController,
    CommentOnQuestionController,
    CreateAccountController,
    CreateQuestionController,
    DeleteAccountController,
    DeleteAnswerController,
    DeleteAnswerAttachmentController,
    DeleteAnswerCommentController,
    DeleteQuestionController,
    DeleteQuestionAttachmentController,
    DeleteQuestionCommentController,
    FetchQuestionAnswersController,
    FetchQuestionsController,
    FetchUserQuestionsController,
    FetchUsersController,
    GetQuestionBySlugController,
    GetUserByEmailController,
    RefreshAccessTokenController,
    SendEmailValidationController,
    UpdateAnswerController,
    UpdateAnswerAttachmentController,
    UpdateAnswerCommentController,
    UpdateQuestionController,
    UpdateQuestionAttachmentController,
    UpdateQuestionCommentController,
    VerifyEmailValidationController,
  ],
})
export class AppModule {}
