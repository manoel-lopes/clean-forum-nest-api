import { Global, Module } from '@nestjs/common'
import { RepositoriesModule } from '@/infra/persistence/repositories/repositories.module'
import { AnswerQuestionUseCase } from './answer-question/answer-question.usecase'
import { AttachToAnswerUseCase } from './attach-to-answer/attach-to-answer.usecase'
import { AttachToQuestionUseCase } from './attach-to-question/attach-to-question.usecase'
import { AuthenticateUserUseCase } from './authenticate-user/authenticate-user.usecase'
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer/choose-question-best-answer.usecase'
import { CommentOnAnswerUseCase } from './comment-on-answer/comment-on-answer.usecase'
import { CommentOnQuestionUseCase } from './comment-on-question/comment-on-question.usecase'
import { CreateAccountUseCase } from './create-account/create-account.usecase'
import { CreateQuestionUseCase } from './create-question/create-question.usecase'
import { DeleteAccountUseCase } from './delete-account/delete-account.usecase'
import { DeleteAnswerUseCase } from './delete-answer/delete-answer.usecase'
import { DeleteAnswerAttachmentUseCase } from './delete-answer-attachment/delete-answer-attachment.usecase'
import { DeleteAnswerCommentUseCase } from './delete-answer-comment/delete-answer-comment.usecase'
import { DeleteQuestionUseCase } from './delete-question/delete-question.usecase'
import { DeleteQuestionAttachmentUseCase } from './delete-question-attachment/delete-question-attachment.usecase'
import { DeleteQuestionCommentUseCase } from './delete-question-comment/delete-question-comment.usecase'
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
    CommentOnQuestionUseCase,
    CreateAccountUseCase,
    CreateQuestionUseCase,
    DeleteAccountUseCase,
    DeleteAnswerUseCase,
    DeleteAnswerAttachmentUseCase,
    DeleteAnswerCommentUseCase,
    DeleteQuestionUseCase,
    DeleteQuestionAttachmentUseCase,
    DeleteQuestionCommentUseCase,
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
    VerifyEmailValidationUseCase,
  ],
  exports: [
    AnswerQuestionUseCase,
    AttachToAnswerUseCase,
    AttachToQuestionUseCase,
    AuthenticateUserUseCase,
    ChooseQuestionBestAnswerUseCase,
    CommentOnAnswerUseCase,
    CommentOnQuestionUseCase,
    CreateAccountUseCase,
    CreateQuestionUseCase,
    DeleteAccountUseCase,
    DeleteAnswerUseCase,
    DeleteAnswerAttachmentUseCase,
    DeleteAnswerCommentUseCase,
    DeleteQuestionUseCase,
    DeleteQuestionAttachmentUseCase,
    DeleteQuestionCommentUseCase,
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
    VerifyEmailValidationUseCase,
  ],
})
export class UseCasesModule {}
