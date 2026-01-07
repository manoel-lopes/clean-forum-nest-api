export type UserResult = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string | null
}

export type AuthenticatedUserResult = {
  user: UserResult
  token: string
  refreshTokenId: string
  credentials: {
    email: string
    password: string
  }
}

export type QuestionResult = {
  id: string
  authorId: string
  title: string
  content: string
  slug: string
  bestAnswerId?: string | null
  createdAt: string
  updatedAt: string | null
}

export type AnswerResult = {
  id: string
  questionId: string
  authorId: string
  content: string
  excerpt: string
  createdAt: string
  updatedAt: string | null
}

export type CommentResult = {
  id: string
  authorId: string
  answerId: string
  content: string
  createdAt: string
  updatedAt: string | null
}

export type CreateUserOptions = {
  name?: string
  email?: string
  password?: string
}

export type CreateQuestionOptions = {
  title?: string
  content?: string
}

export type CreateAnswerOptions = {
  content?: string
}

export type CreateCommentOptions = {
  content?: string
}
