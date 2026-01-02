import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AnswerQuestionController } from '@/infra/http/presentation/controllers/answer-question/answer-question.controller'
import { AttachToAnswerController } from '@/infra/http/presentation/controllers/attach-to-answer/attach-to-answer.controller'
import { AttachToQuestionController } from '@/infra/http/presentation/controllers/attach-to-question/attach-to-question.controller'
import { AuthenticateUserController } from '@/infra/http/presentation/controllers/authenticate-user/authenticate-user.controller'
import { ChooseQuestionBestAnswerController } from '@/infra/http/presentation/controllers/choose-question-best-answer/choose-question-best-answer.controller'
import { CommentOnAnswerController } from '@/infra/http/presentation/controllers/comment-on-answer/comment-on-answer.controller'
import { CreateAccountController } from '@/infra/http/presentation/controllers/create-account/create-account.controller'
import { CreateQuestionController } from '@/infra/http/presentation/controllers/create-question/create-question.controller'
import { DeleteAccountController } from '@/infra/http/presentation/controllers/delete-account/delete-account.controller'
import { DeleteAnswerController } from '@/infra/http/presentation/controllers/delete-answer/delete-answer.controller'
import { DeleteAnswerAttachmentController } from '@/infra/http/presentation/controllers/delete-answer-attachment/delete-answer-attachment.controller'
import { DeleteCommentController } from '@/infra/http/presentation/controllers/delete-comment/delete-comment.controller'
import { DeleteQuestionController } from '@/infra/http/presentation/controllers/delete-question/delete-question.controller'
import { DeleteQuestionAttachmentController } from '@/infra/http/presentation/controllers/delete-question-attachment/delete-question-attachment.controller'
import { FetchQuestionAnswersController } from '@/infra/http/presentation/controllers/fetch-question-answers/fetch-question-answers.controller'
import { FetchQuestionsController } from '@/infra/http/presentation/controllers/fetch-questions/fetch-questions.controller'
import { FetchUserQuestionsController } from '@/infra/http/presentation/controllers/fetch-user-questions/fetch-user-questions.controller'
import { FetchUsersController } from '@/infra/http/presentation/controllers/fetch-users/fetch-users.controller'
import { GetQuestionBySlugController } from '@/infra/http/presentation/controllers/get-question-by-slug/get-question-by-slug.controller'
import { GetUserByEmailController } from '@/infra/http/presentation/controllers/get-user-by-email/get-user-by-email.controller'
import { RefreshAccessTokenController } from '@/infra/http/presentation/controllers/refresh-token/refresh-token.controller'
import { SendEmailValidationController } from '@/infra/http/presentation/controllers/send-email-validation/send-email-validation.controller'
import { UpdateAnswerController } from '@/infra/http/presentation/controllers/update-answer/update-answer.controller'
import { UpdateAnswerAttachmentController } from '@/infra/http/presentation/controllers/update-answer-attachment/update-answer-attachment.controller'
import { UpdateCommentController } from '@/infra/http/presentation/controllers/update-comment/update-comment.controller'
import { UpdateQuestionController } from '@/infra/http/presentation/controllers/update-question/update-question.controller'
import { UpdateQuestionAttachmentController } from '@/infra/http/presentation/controllers/update-question-attachment/update-question-attachment.controller'
import { UploadAttachmentController } from '@/infra/http/presentation/controllers/upload-attachment/upload-attachment.controller'
import { VerifyEmailController } from '@/infra/http/presentation/controllers/verify-email/verify-email.controller'
import { UseCasesModule } from './domain/application/usecases/usecases.module'
import { EmailModule } from './infra/adapters/email/email.module'
import { SecurityModule } from './infra/adapters/security/security.module'
import { StorageModule } from './infra/adapters/storage/storage.module'
import { AuthModule } from './infra/auth/auth.module'
import { envSchema } from './infra/env/env'
import { EnvModule } from './infra/env/env.module'
import { RepositoriesModule } from './infra/persistence/repositories/repositories.module'
import { BullBoardConfigModule } from './infra/queues/bull-board.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    RepositoriesModule,
    EmailModule,
    SecurityModule,
    StorageModule,
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
    CreateAccountController,
    CreateQuestionController,
    DeleteAccountController,
    DeleteAnswerController,
    DeleteAnswerAttachmentController,
    DeleteCommentController,
    DeleteQuestionController,
    DeleteQuestionAttachmentController,
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
    UpdateCommentController,
    UpdateQuestionController,
    UpdateQuestionAttachmentController,
    UploadAttachmentController,
    VerifyEmailController,
  ],
})
export class AppModule {}
