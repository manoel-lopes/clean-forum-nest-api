import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import type { Env } from '../src/infra/env/env'
import type { PrismaClient } from '@prisma/client'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
class SeedModule {}

function getDatabaseUrl (config: ConfigService<Env, true>): string {
  const value = config.get('DATABASE_URL', { infer: true })
  if (value) return value
  const dbUser = config.get('DB_USER', { infer: true })
  const dbPassword = config.get('DB_PASSWORD', { infer: true })
  const dbHost = config.get('DB_HOST', { infer: true })
  const dbPort = config.get('DB_PORT', { infer: true })
  const dbName = config.get('DB_NAME', { infer: true })
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`
}

let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>
let prisma: PrismaClient

async function main () {
  app = await NestFactory.createApplicationContext(SeedModule)
  const config = app.get(ConfigService)
  // Set DATABASE_URL before importing prisma client
  process.env.DATABASE_URL = getDatabaseUrl(config)
  prisma = (await import('../src/infra/persistence/prisma/client')).prisma

  console.log('🌱 Starting database seed...')

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...')
  await prisma.comment.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.emailValidation.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('👤 Creating users...')
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123', // In production, this would be hashed
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: 'password789',
    },
  })

  console.log(`✅ Created ${3} users`)

  // Create questions
  console.log('❓ Creating questions...')
  const question1 = await prisma.question.create({
    data: {
      title: 'How to use NestJS with Prisma?',
      slug: 'how-to-use-nestjs-with-prisma',
      content: 'I want to integrate Prisma ORM with my NestJS application. What is the best approach?',
      authorId: user1.id,
    },
  })

  const question2 = await prisma.question.create({
    data: {
      title: 'What is Clean Architecture?',
      slug: 'what-is-clean-architecture',
      content: 'Can someone explain the principles of Clean Architecture and how to implement it in Node.js?',
      authorId: user2.id,
    },
  })

  const question3 = await prisma.question.create({
    data: {
      title: 'How to handle authentication in NestJS?',
      slug: 'how-to-handle-authentication-in-nestjs',
      content: 'What are the best practices for implementing JWT authentication in a NestJS application?',
      authorId: user3.id,
    },
  })

  console.log(`✅ Created ${3} questions`)

  // Create answers
  console.log('💡 Creating answers...')
  const answer1 = await prisma.answer.create({
    data: {
      content: 'You can use the @nestjs/prisma package to integrate Prisma with NestJS. First, install it using npm, then create a PrismaService that extends PrismaClient. Make it a global module for easy access across your app.',
      excerpt: 'You can use the @nestjs/prisma package to integrate Prisma with NestJS. First, install it using...',
      questionId: question1.id,
      authorId: user2.id,
    },
  })

  const answer2 = await prisma.answer.create({
    data: {
      content: 'Another approach is to create a custom Prisma module. Create a prisma.service.ts file that extends PrismaClient and implements OnModuleInit and OnModuleDestroy for proper connection handling.',
      excerpt: 'Another approach is to create a custom Prisma module. Create a prisma.service.ts file that exten...',
      questionId: question1.id,
      authorId: user3.id,
    },
  })

  const answer3 = await prisma.answer.create({
    data: {
      content: 'Clean Architecture is a software design philosophy that separates your code into layers. The key principle is the Dependency Rule: inner layers should not depend on outer layers. The core business logic is at the center, isolated from frameworks and external dependencies.',
      excerpt: 'Clean Architecture is a software design philosophy that separates your code into layers. The key...',
      questionId: question2.id,
      authorId: user1.id,
    },
  })

  const answer4 = await prisma.answer.create({
    data: {
      content: 'For JWT authentication in NestJS, use @nestjs/passport and @nestjs/jwt packages. Create an AuthModule with JWT strategy, implement a login endpoint that returns a token, and use guards to protect your routes.',
      excerpt: 'For JWT authentication in NestJS, use @nestjs/passport and @nestjs/jwt packages. Create an Auth...',
      questionId: question3.id,
      authorId: user1.id,
    },
  })

  console.log(`✅ Created ${4} answers`)

  // Set best answer for question 1
  await prisma.question.update({
    where: { id: question1.id },
    data: { bestAnswerId: answer1.id },
  })

  // Create comments
  console.log('💬 Creating comments...')
  await prisma.comment.create({
    data: {
      content: 'Great question! I was wondering the same thing.',
      questionId: question1.id,
      authorId: user3.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Thanks! This helped me a lot.',
      answerId: answer1.id,
      authorId: user1.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Very detailed explanation!',
      answerId: answer3.id,
      authorId: user2.id,
    },
  })

  console.log(`✅ Created ${3} comments`)

  // Create attachments
  console.log('📎 Creating attachments...')
  await prisma.attachment.create({
    data: {
      title: 'NestJS Prisma Integration Guide',
      url: 'https://docs.nestjs.com/recipes/prisma',
      questionId: question1.id,
    },
  })

  await prisma.attachment.create({
    data: {
      title: 'Clean Architecture Diagram',
      url: 'https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg',
      questionId: question2.id,
    },
  })

  console.log(`✅ Created ${2} attachments`)

  console.log('✨ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await app.close()
    await prisma.$disconnect()
  })
