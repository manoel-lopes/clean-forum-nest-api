import { Column, Entity, OneToMany } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { Answer } from './answer.entity'
import { BaseEntity } from './base/base.entity'
import { Comment } from './base/comment.entity'
import { Question } from './question.entity'
import { RefreshToken } from './refresh-token.entity'

export type UserProps = Props<User>

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'text' })
  readonly name: string

  @Column({ type: 'text', unique: true })
  readonly email: string

  @Column({ type: 'text' })
  readonly password: string

  @OneToMany(() => Question, question => question.author)
  readonly questions: Question[]

  @OneToMany(() => Answer, answer => answer.author)
  readonly answers: Answer[]

  @OneToMany(() => Comment, comment => comment.author)
  readonly comments: Comment[]

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  readonly refreshTokens: RefreshToken[]

  private constructor (props: UserProps) {
    super()
    Object.assign(this, props)
  }

  static create (props: UserProps): User {
    return new User(props)
  }
}
