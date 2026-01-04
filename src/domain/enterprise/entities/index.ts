import { Answer } from './answer/answer.entity'
import { AnswerAttachment } from './answer-attachment/answer-attachment.entity'
import { BaseAttachment } from './base/attachment.entity'
import { Comment } from './comment/comment.entity'
import { EmailValidation } from './email-validation/email-validation.entity'
import { Question } from './question/question.entity'
import { QuestionAttachment } from './question-attachment/question-attachment.entity'
import { RefreshToken } from './refresh-token/refresh-token.entity'
import { User } from './user/user.entity'

export const entities = [
  User,
  Question,
  Answer,
  Comment,
  BaseAttachment,
  QuestionAttachment,
  AnswerAttachment,
  RefreshToken,
  EmailValidation,
]

export {
  Answer,
  AnswerAttachment,
  BaseAttachment,
  Comment,
  EmailValidation,
  Question,
  QuestionAttachment,
  RefreshToken,
  User,
}
