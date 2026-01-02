import { Module } from '@nestjs/common'
import { AnswerQuestionController } from './answer-question/answer-question.controller'
import { AttachToAnswerController } from './attach-to-answer/attach-to-answer.controller'
import { AttachToQuestionController } from './attach-to-question/attach-to-question.controller'
import { AuthenticateUserController } from './authenticate-user/authenticate-user.controller'
import { ChooseQuestionBestAnswerController } from './choose-question-best-answer/choose-question-best-answer.controller'
import { CommentOnAnswerController } from './comment-on-answer/comment-on-answer.controller'
import { CreateAccountController } from './create-account/create-account.controller'
import { CreateQuestionController } from './create-question/create-question.controller'
import { DeleteAccountController } from './delete-account/delete-account.controller'
import { DeleteAnswerController } from './delete-answer/delete-answer.controller'
import { DeleteAnswerAttachmentController } from './delete-answer-attachment/delete-answer-attachment.controller'
import { DeleteCommentController } from './delete-comment/delete-comment.controller'
import { DeleteQuestionController } from './delete-question/delete-question.controller'
import { DeleteQuestionAttachmentController } from './delete-question-attachment/delete-question-attachment.controller'
import { FetchQuestionAnswersController } from './fetch-question-answers/fetch-question-answers.controller'
import { FetchQuestionsController } from './fetch-questions/fetch-questions.controller'
import { FetchUserQuestionsController } from './fetch-user-questions/fetch-user-questions.controller'
import { FetchUsersController } from './fetch-users/fetch-users.controller'
import { GetQuestionBySlugController } from './get-question-by-slug/get-question-by-slug.controller'
import { GetUserByEmailController } from './get-user-by-email/get-user-by-email.controller'
import { RefreshAccessTokenController } from './refresh-token/refresh-token.controller'
import { SendEmailValidationController } from './send-email-validation/send-email-validation.controller'
import { UpdateAnswerController } from './update-answer/update-answer.controller'
import { UpdateAnswerAttachmentController } from './update-answer-attachment/update-answer-attachment.controller'
import { UpdateCommentController } from './update-comment/update-comment.controller'
import { UpdateQuestionController } from './update-question/update-question.controller'
import { UpdateQuestionAttachmentController } from './update-question-attachment/update-question-attachment.controller'
import { UploadAttachmentController } from './upload-attachment/upload-attachment.controller'
import { VerifyEmailController } from './verify-email/verify-email.controller'

@Module({
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
export class ControllersModule {}
