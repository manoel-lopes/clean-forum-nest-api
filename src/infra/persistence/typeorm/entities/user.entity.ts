import { Column, Entity, OneToMany } from 'typeorm'
import { AnswerEntity } from './answer.entity'
import { BaseEntity } from './base.entity'
import { CommentEntity } from './comment.entity'
import { QuestionEntity } from './question.entity'
import { RefreshTokenEntity } from './refresh-token.entity'

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string

  @Column({ type: 'text', unique: true })
  email: string

  @Column({ type: 'text' })
  password: string

  @OneToMany(() => QuestionEntity, question => question.author)
  questions: QuestionEntity[]

  @OneToMany(() => AnswerEntity, answer => answer.author)
  answers: AnswerEntity[]

  @OneToMany(() => CommentEntity, comment => comment.author)
  comments: CommentEntity[]

  @OneToMany(() => RefreshTokenEntity, refreshToken => refreshToken.user)
  refreshTokens: RefreshTokenEntity[]
}
