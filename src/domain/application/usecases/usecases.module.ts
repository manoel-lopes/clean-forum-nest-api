import { Global, Module } from '@nestjs/common'
import { RepositoriesModule } from '@/infra/persistence/repositories/repositories.module'
import { AnswerQuestionUseCase } from './answer-question/answer-question.usecase'
import { AttachToAnswerUseCase } from './attach-to-answer/attach-to-answer.usecase'
import { AttachToQuestionUseCase } from './attach-to-question/attach-to-question.usecase'
import { AuthenticateUserUseCase } from './authenticate-user/authenticate-user.usecase'
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer/choose-question-best-answer.usecase'
import { CommentOnAnswerUseCase } from './comment-on-answer/comment-on-answer.usecase'
import { CreateAccountUseCase } from './create-account/create-account.usecase'
import { CreateQuestionUseCase } from './create-question/create-question.usecase'
import { DeleteAccountUseCase } from './delete-account/delete-account.usecase'
import { DeleteAnswerUseCase } from './delete-answer/delete-answer.usecase'
import { DeleteAnswerAttachmentUseCase } from './delete-answer-attachment/delete-answer-attachment.usecase'
import { DeleteCommentUseCase } from './delete-comment/delete-comment.usecase'
import { DeleteQuestionUseCase } from './delete-question/delete-question.usecase'
import { DeleteQuestionAttachmentUseCase } from './delete-question-attachment/delete-question-attachment.usecase'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers/fetch-question-answers.usecase'
import { FetchUserQuestionsUseCase } from './fetch-user-questions/fetch-user-questions.usecase'
import { GetQuestionBySlugUseCase } from './get-question-by-slug/get-question-by-slug.usecase'
import { GetUserByEmailUseCase } from './get-user-by-email/get-user-by-email.usecase'
import { RefreshAccessTokenUseCase } from './refresh-token/refresh-token.usecase'
import { SendEmailValidationUseCase } from './send-email-validation/send-email-validation.usecase'
import { UpdateAccountUseCase } from './update-account/update-account.usecase'
import { UpdateAnswerUseCase } from './update-answer/update-answer.usecase'
import { UpdateAnswerAttachmentUseCase } from './update-answer-attachment/update-answer-attachment.usecase'
import { UpdateCommentUseCase } from './update-comment/update-comment.usecase'
import { UpdateQuestionUseCase } from './update-question/update-question.usecase'
import { UpdateQuestionAttachmentUseCase } from './update-question-attachment/update-question-attachment.usecase'
import { UploadAttachmentUseCase } from './upload-attachment/upload-attachment.usecase'
import { VerifyEmailValidationUseCase } from './verify-email-validation/verify-email-validation.usecase'

@Global()
@Module({
  imports: [RepositoriesModule],
  providers: [
    AnswerQuestionUseCase,
    AttachToAnswerUseCase,
    AttachToQuestionUseCase,
    AuthenticateUserUseCase,
    ChooseQuestionBestAnswerUseCase,
    CommentOnAnswerUseCase,
    CreateAccountUseCase,
    CreateQuestionUseCase,
    DeleteAccountUseCase,
    DeleteAnswerUseCase,
    DeleteAnswerAttachmentUseCase,
    DeleteCommentUseCase,
    DeleteQuestionUseCase,
    DeleteQuestionAttachmentUseCase,
    FetchQuestionAnswersUseCase,
    FetchUserQuestionsUseCase,
    GetQuestionBySlugUseCase,
    GetUserByEmailUseCase,
    RefreshAccessTokenUseCase,
    SendEmailValidationUseCase,
    UpdateAccountUseCase,
    UpdateAnswerUseCase,
    UpdateAnswerAttachmentUseCase,
    UpdateCommentUseCase,
    UpdateQuestionUseCase,
    UpdateQuestionAttachmentUseCase,
    UploadAttachmentUseCase,
    VerifyEmailValidationUseCase,
  ],
  exports: [
    AnswerQuestionUseCase,
    AttachToAnswerUseCase,
    AttachToQuestionUseCase,
    AuthenticateUserUseCase,
    ChooseQuestionBestAnswerUseCase,
    CommentOnAnswerUseCase,
    CreateAccountUseCase,
    CreateQuestionUseCase,
    DeleteAccountUseCase,
    DeleteAnswerUseCase,
    DeleteAnswerAttachmentUseCase,
    DeleteCommentUseCase,
    DeleteQuestionUseCase,
    DeleteQuestionAttachmentUseCase,
    FetchQuestionAnswersUseCase,
    FetchUserQuestionsUseCase,
    GetQuestionBySlugUseCase,
    GetUserByEmailUseCase,
    RefreshAccessTokenUseCase,
    SendEmailValidationUseCase,
    UpdateAccountUseCase,
    UpdateAnswerUseCase,
    UpdateAnswerAttachmentUseCase,
    UpdateCommentUseCase,
    UpdateQuestionUseCase,
    UpdateQuestionAttachmentUseCase,
    UploadAttachmentUseCase,
    VerifyEmailValidationUseCase,
  ],
})
export class UseCasesModule {}
