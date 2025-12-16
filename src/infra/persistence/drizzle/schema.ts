import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  comments: many(comments),
  refreshTokens: many(refreshTokens),
}))

export const questions = pgTable('questions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  authorId: varchar('authorId', { length: 36 }).notNull().references(() => users.id),
  bestAnswerId: varchar('bestAnswerId', { length: 36 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('questions_authorId_idx').on(table.authorId),
  index('questions_createdAt_idx').on(table.createdAt),
  uniqueIndex('questions_slug_idx').on(table.slug),
])

export const questionsRelations = relations(questions, ({ one, many }) => ({
  author: one(users, { fields: [questions.authorId], references: [users.id] }),
  answers: many(answers),
  comments: many(comments),
  attachments: many(attachments),
}))

export const answers = pgTable('answers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  content: text('content').notNull(),
  authorId: varchar('authorId', { length: 36 }).notNull().references(() => users.id),
  questionId: varchar('questionId', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  excerpt: text('excerpt').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('answers_questionId_idx').on(table.questionId),
  index('answers_authorId_idx').on(table.authorId),
  index('answers_createdAt_idx').on(table.createdAt),
  index('answers_questionId_createdAt_idx').on(table.questionId, table.createdAt),
])

export const answersRelations = relations(answers, ({ one, many }) => ({
  author: one(users, { fields: [answers.authorId], references: [users.id] }),
  question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
  comments: many(comments),
  attachments: many(attachments),
}))

export const comments = pgTable('comments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  content: text('content').notNull(),
  authorId: varchar('authorId', { length: 36 }).notNull().references(() => users.id),
  questionId: varchar('questionId', { length: 36 }).references(() => questions.id, { onDelete: 'cascade' }),
  answerId: varchar('answerId', { length: 36 }).references(() => answers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => [
  index('comments_questionId_idx').on(table.questionId),
  index('comments_answerId_idx').on(table.answerId),
  index('comments_authorId_idx').on(table.authorId),
  index('comments_createdAt_idx').on(table.createdAt),
  index('comments_questionId_createdAt_idx').on(table.questionId, table.createdAt),
  index('comments_answerId_createdAt_idx').on(table.answerId, table.createdAt),
])

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  question: one(questions, { fields: [comments.questionId], references: [questions.id] }),
  answer: one(answers, { fields: [comments.answerId], references: [answers.id] }),
}))

export const attachments = pgTable('attachments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  title: text('title').notNull(),
  link: text('link').notNull(),
  questionId: varchar('questionId', { length: 36 }).references(() => questions.id, { onDelete: 'cascade' }),
  answerId: varchar('answerId', { length: 36 }).references(() => answers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => [
  index('attachments_questionId_idx').on(table.questionId),
  index('attachments_answerId_idx').on(table.answerId),
  index('attachments_createdAt_idx').on(table.createdAt),
  index('attachments_questionId_createdAt_idx').on(table.questionId, table.createdAt),
  index('attachments_answerId_createdAt_idx').on(table.answerId, table.createdAt),
])

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  question: one(questions, { fields: [attachments.questionId], references: [questions.id] }),
  answer: one(answers, { fields: [attachments.answerId], references: [answers.id] }),
}))

export const refreshTokens = pgTable('refresh_tokens', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  userId: varchar('userId', { length: 36 }).notNull().references(() => users.id),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('refresh_tokens_userId_idx').on(table.userId),
  index('refresh_tokens_expiresAt_idx').on(table.expiresAt),
])

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}))

export const emailValidations = pgTable('email_validations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7()),
  email: text('email').notNull().unique(),
  code: text('code').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  isVerified: boolean('isVerified').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('email_validations_email_idx').on(table.email),
  index('email_validations_createdAt_idx').on(table.createdAt),
])
