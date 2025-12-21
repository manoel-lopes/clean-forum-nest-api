import 'reflect-metadata'
import { DataSource, DataSourceOptions } from 'typeorm'
import { Answer } from './src/domain/enterprise/entities/answer.entity'
import { AnswerAttachment } from './src/domain/enterprise/entities/answer-attachment.entity'
import { AnswerComment } from './src/domain/enterprise/entities/answer-comment.entity'
import { Attachment } from './src/domain/enterprise/entities/base/attachment.entity'
import { Comment } from './src/domain/enterprise/entities/base/comment.entity'
import { EmailValidation } from './src/domain/enterprise/entities/email-validation.entity'
import { Question } from './src/domain/enterprise/entities/question.entity'
import { QuestionAttachment } from './src/domain/enterprise/entities/question-attachment.entity'
import { QuestionComment } from './src/domain/enterprise/entities/question-comment.entity'
import { RefreshToken } from './src/domain/enterprise/entities/refresh-token.entity'
import { User } from './src/domain/enterprise/entities/user.entity'

const entities = [
  User,
  Question,
  Answer,
  Comment,
  QuestionComment,
  AnswerComment,
  Attachment,
  QuestionAttachment,
  AnswerAttachment,
  RefreshToken,
  EmailValidation,
]

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['./migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}

export default new DataSource(dataSourceOptions)
