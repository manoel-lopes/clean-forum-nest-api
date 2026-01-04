/* eslint-disable no-console */
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Answer, entities, Question, User } from '@/domain/enterprise/entities'

function getDatabaseUrl (): string {
  const dbUser = process.env.DB_USER || 'postgres'
  const dbPassword = process.env.DB_PASSWORD || 'postgres'
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = process.env.DB_PORT || '5432'
  const dbName = process.env.DB_NAME || 'forum_dev'
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`
}

async function main () {
  console.log('Connecting to database...')
  const dataSource = new DataSource({
    type: 'postgres',
    url: getDatabaseUrl(),
    schema: 'public',
    entities,
    synchronize: false,
    logging: true,
  })
  await dataSource.initialize()
  console.log('Database connected!')
  const userRepo = dataSource.getRepository(User)
  const questionRepo = dataSource.getRepository(Question)
  const answerRepo = dataSource.getRepository(Answer)
  console.log('Seeding database...')
  // Clean up existing data using CASCADE
  console.log('Cleaning up existing data...')
  await dataSource.query('TRUNCATE TABLE comments, attachments, answers, questions, email_validations, refresh_tokens, users CASCADE')
  // Create users
  console.log('Creating users...')
  const user1 = userRepo.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  })
  await userRepo.save(user1)
  const user2 = userRepo.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456',
  })
  await userRepo.save(user2)
  const user3 = userRepo.create({
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password789',
  })
  await userRepo.save(user3)
  console.log(`Created ${3} users`)
  // Create questions
  console.log('Creating questions...')
  const question1 = questionRepo.create({
    title: 'How to use NestJS with TypeORM?',
    slug: 'how-to-use-nestjs-with-typeorm',
    content: 'I want to integrate TypeORM with my NestJS application. What is the best approach?',
    authorId: user1.id,
  })
  await questionRepo.save(question1)
  const question2 = questionRepo.create({
    title: 'What is Clean Architecture?',
    slug: 'what-is-clean-architecture',
    content: 'Can someone explain the principles of Clean Architecture and how to implement it in Node.js?',
    authorId: user2.id,
  })
  await questionRepo.save(question2)
  const question3 = questionRepo.create({
    title: 'How to handle authentication in NestJS?',
    slug: 'how-to-handle-authentication-in-nestjs',
    content: 'What are the best practices for implementing JWT authentication in a NestJS application?',
    authorId: user3.id,
  })
  await questionRepo.save(question3)
  console.log(`Created ${3} questions`)
  // Create answers
  console.log('Creating answers...')
  const answer1 = answerRepo.create({
    content: 'You can use @nestjs/typeorm package to integrate TypeORM with NestJS. First, install it using npm, then configure the TypeOrmModule in your app module.',
    excerpt: 'You can use @nestjs/typeorm package to integrate TypeORM with NestJS...',
    questionId: question1.id,
    authorId: user2.id,
  })
  await answerRepo.save(answer1)
  const answer2 = answerRepo.create({
    content: 'Another approach is to create entity files with decorators. TypeORM uses decorators like @Entity(), @Column(), @PrimaryGeneratedColumn() to define your database schema.',
    excerpt: 'Another approach is to create entity files with decorators...',
    questionId: question1.id,
    authorId: user3.id,
  })
  await answerRepo.save(answer2)
  const answer3 = answerRepo.create({
    content: 'Clean Architecture is a software design philosophy that separates your code into layers. The key principle is the Dependency Rule: inner layers should not depend on outer layers.',
    excerpt: 'Clean Architecture is a software design philosophy that separates your code into layers...',
    questionId: question2.id,
    authorId: user1.id,
  })
  await answerRepo.save(answer3)
  const answer4 = answerRepo.create({
    content: 'For JWT authentication in NestJS, use @nestjs/passport and @nestjs/jwt packages. Create an AuthModule with JWT strategy, implement a login endpoint that returns a token.',
    excerpt: 'For JWT authentication in NestJS, use @nestjs/passport and @nestjs/jwt packages...',
    questionId: question3.id,
    authorId: user1.id,
  })
  await answerRepo.save(answer4)
  console.log(`Created ${4} answers`)
  // Set best answer for question 1
  await questionRepo.update(question1.id, { bestAnswerId: answer1.id })
  // Note: Comments and attachments use single table inheritance which requires
  // a 'type' column not present in the Prisma schema. Skipping for now.
  console.log('Database seeded successfully!')
  await dataSource.destroy()
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
