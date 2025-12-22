# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clean Forum NestJS API - a backend forum application built with NestJS v11 (Fastify), TypeScript, PostgreSQL (Prisma), and BullMQ. Follows Clean Architecture, Domain-Driven Design, and SOLID principles.

## SOLID Principles

This codebase adheres to SOLID principles. These guidelines help build software that is easier to scale and maintain.

**S - Single Responsibility Principle (SRP)**
A class should have only one reason to change. Each class/module should focus on a single task.
```typescript
// ✅ Good: Each mapper handles one entity type
class PrismaQuestionCommentMapper {
  static toDomain(raw: Comment): QuestionComment { ... }
}

// ❌ Bad: One mapper handling multiple unrelated entities
class GenericMapper {
  static mapUser(raw: User) { ... }
  static mapQuestion(raw: Question) { ... }
  static mapComment(raw: Comment) { ... }
}
```

**O - Open-Closed Principle (OCP)**
Classes should be open for extension but closed for modification. Extend behavior without changing existing code.
```typescript
// ✅ Good: New payment methods extend interface without modifying existing code
interface PaymentProcessor { process(amount: number): Promise<void> }
class StripeProcessor implements PaymentProcessor { ... }
class PayPalProcessor implements PaymentProcessor { ... }
```

**L - Liskov Substitution Principle (LSP)**
Subtypes must be substitutable for their base types. Child classes should work anywhere parent is expected.
```typescript
// ✅ Good: Any repository implementation works with the interface
type UsersRepository = { findByEmail(email: string): Promise<User | null> }
class PrismaUsersRepository implements UsersRepository { ... }
class InMemoryUsersRepository implements UsersRepository { ... } // for tests
```

**I - Interface Segregation Principle (ISP)**
Clients should not depend on interfaces they don't use. Split large interfaces into smaller, focused ones.
```typescript
// ✅ Good: Separate interfaces for different capabilities
interface Readable { findById(id: string): Promise<Entity | null> }
interface Writable { create(data: Props): Promise<Entity> }
interface Deletable { delete(id: string): Promise<void> }

// ❌ Bad: One large interface forcing unused methods
interface Repository {
  findById(id: string): Promise<Entity | null>
  create(data: Props): Promise<Entity>
  delete(id: string): Promise<void>
  export(format: string): Promise<Buffer>  // Not all repos need this
}
```

**D - Dependency Inversion Principle (DIP)**
High-level modules should not depend on low-level modules. Both should depend on abstractions.
```typescript
// ✅ Good: Use case depends on abstraction (interface), not implementation
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
  ) {}
}
```

## DRY Principle

**DRY (Don't Repeat Yourself)** - Every piece of knowledge must have a single, authoritative representation.

```typescript
// ❌ Bad: Duplicated logic in multiple places
const schema1 = z.string().transform(value => {
  if (!value) return {}
  const allowed = new Set(['a', 'b', 'c'])
  const result: Record<string, boolean> = {}
  for (const item of value.split(',')) {
    if (allowed.has(item)) result[item] = true
  }
  return result
})

const schema2 = z.string().transform(value => {
  if (!value) return {}
  const allowed = new Set(['a', 'b', 'c'])  // Same logic duplicated!
  const result: Record<string, boolean> = {}
  for (const item of value.split(',')) {
    if (allowed.has(item)) result[item] = true
  }
  return result
})

// ✅ Good: Extract to reusable function
function parseOptions(value: string | null): Record<string, boolean> {
  if (!value) return {}
  const allowed = new Set(['a', 'b', 'c'])
  const result: Record<string, boolean> = {}
  for (const item of value.split(',')) {
    if (allowed.has(item)) result[item] = true
  }
  return result
}

const schema1 = z.string().transform(parseOptions)
const schema2 = z.string().transform(parseOptions)
```

DRY applies to:
- Code logic (extract to functions/methods)
- Data structures (single source of truth)
- Configuration (centralize settings)
- Knowledge/intent (not just literal code)

## Quick Reference

### Essential Commands
```bash
pnpm install                    # Install dependencies
pnpm run start:dev              # Development mode with hot reload
pnpm run build                  # Compile TypeScript
pnpm run check-types            # Type check without emitting
pnpm run lint                   # ESLint with auto-fix
```

### Testing
```bash
pnpm test                       # Run all tests
pnpm test:unit                  # Unit tests only (src/)
pnpm test:e2e                   # E2E tests (src/presentation/controllers/)
pnpm test -- <pattern>          # Run tests matching pattern (e.g., pnpm test -- slug)
pnpm test:dir <path>            # Run tests in directory (e.g., pnpm test:dir src/domain)
pnpm test:watch                 # Watch mode
pnpm test:coverage              # With coverage report
```

### Database
```bash
# Development
pnpm run db:up:dev              # Start PostgreSQL, Redis & MailHog containers
pnpm run migrate:dev            # Run migrations
pnpm run migrate:reset:dev      # Reset database
pnpm run db:seed                # Seed with test data

# Test (required before running E2E tests)
pnpm run db:up:test             # Start test database container
pnpm run migrate:test           # Run test migrations
```

### Environment Setup
```bash
cp .env.example .env.development
cp .env.example .env.test
```

## Architecture

### Layer Structure
```
src/
├── core/                    # Base abstractions (Entity, UseCase, WebController)
├── domain/                  # Business logic (framework-independent)
│   ├── application/
│   │   ├── repositories/    # Repository interfaces
│   │   └── usecases/        # Use cases with UseCasesModule (global)
│   └── enterprise/
│       ├── entities/        # Domain entities
│       └── value-objects/   # Slug, EmailValidationCode
├── infra/                   # External dependencies
│   ├── adapters/            # Email, security adapters (ports pattern)
│   ├── persistence/         # Prisma repositories with RepositoriesModule (global)
│   ├── queues/              # BullMQ email processing
│   └── doubles/             # Test doubles (UseCaseStub)
├── presentation/            # HTTP layer
│   ├── controllers/         # NestJS controllers (+ E2E tests as *.e2e-spec.ts)
│   ├── helpers/             # HTTP response builders (ok, created, etc.)
│   └── interceptors/        # HttpResponseInterceptor
└── main/                    # Application factory (server.ts)
```

### Key Patterns

**Interface Adapter Pattern** - All repositories and adapters (PasswordHasher, EmailService, etc.) follow the same pattern:

1. Define interface + Symbol with the same name in a port file:
```typescript
// src/domain/application/repositories/users.repository.ts
export type UsersRepository = {
  create(user: UserProps): Promise<User>
  findByEmail(email: string): Promise<User | null>
}
export const UsersRepository = Symbol('UsersRepository')

// src/infra/adapters/security/ports/password-hasher.ts
export interface PasswordHasher {
  hash(password: string): Promise<string>
  compare(password: string, hashedPassword: string): Promise<boolean>
}
export const PasswordHasher = Symbol('PasswordHasher')
```

2. Register in the module using the Symbol as provider token:
```typescript
// repositories.module.ts or security.module.ts
@Global()
@Module({
  providers: [
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
  exports: [UsersRepository, PasswordHasher],
})
```

3. Inject using the Symbol (import provides both type and Symbol):
```typescript
@Injectable()
export class MyUseCase implements UseCase {
  constructor(
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
  ) {}
}
```

**Use Case Injection** - Use cases are registered as classes (not Symbols), so controllers can inject them directly:
```typescript
@Controller('questions')
export class CreateQuestionController {
  constructor(private readonly createQuestionUseCase: CreateQuestionUseCase) {}
}
```

**Global Modules** - No need to import these: `PrismaModule`, `RepositoriesModule`, `UseCasesModule`, `EnvModule`, `SecurityModule`

**Error Handling Flow**:
1. Domain/Use Cases: Throw domain exceptions (`ResourceNotFoundException`, `NotAuthorException`)
2. Repositories: Let errors bubble up (no try-catch)
3. Controllers: Catch domain exceptions → map to HTTP exceptions

**Exception Naming Convention**: All custom exceptions use the `*Exception` suffix and `.exception.ts` file extension:
- `src/shared/application/exceptions/` - Shared exceptions (ResourceNotFoundException, NotAuthorException)
- `src/domain/application/usecases/<name>/exceptions/` - Use-case-specific exceptions
- `src/presentation/helpers/errors/` - HTTP exceptions (HttpException)

## Code Style Rules

**Programming Style**: Use OOP for structure, declarative programming inside methods.
```typescript
// ✅ Good: OOP structure with declarative method body
class PrismaQuestionsRepository extends BasePrismaRepository {
  async findMany ({ page, pageSize, order, include }: FindManyParams) {
    const [questions, totalItems] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: order },
        include,
      }),
      this.prisma.question.count(),
    ])
    return { page, pageSize, totalItems, items: questions }
  }
}

// ❌ Bad: Imperative style with mutations and complex logic
class PrismaQuestionsRepository {
  async findMany (params: FindManyParams) {
    const pagination = this.buildPagination(params)
    const includeObj = this.pickIncludes(params.include, ['a', 'b'])
    let questions = await this.prisma.question.findMany({ ... })
    questions = this.mapResults(questions)
    return this.formatResponse(questions, pagination)
  }
}
```

**Critical Rules**:
- **ALL tests must pass before a task is considered done** - Run `pnpm test` and ensure 0 failures
- `no-explicit-any`: ERROR (exceptions: `vitest.config.mts`, some Prisma query files)
- **NO type assertions with `as`** - Use type guards, explicit typing, or refactor instead
- `no-console`: ERROR
- `max-len`: 120 characters
- **NEVER use `undefined` as a value** - use `null` or omit property:
```typescript
// ❌ Bad: returning or assigning undefined
function getValue(): string | undefined {
  if (!condition) return undefined
  return 'value'
}

// ✅ Good: return null or use early return without value
function getValue(): string | null {
  if (!condition) return null
  return 'value'
}

// ✅ Good: omit property instead of setting to undefined
const obj = condition ? { include: value } : {}
```
- **NO nested ternaries** - use registry pattern (lookup object)
- **NO if/else if chains** - use registry pattern

**Registry Pattern Example**:
```typescript
// ❌ Bad: nested ternary or if/else chain
const level = env === 'test' ? 'silent' : env === 'dev' ? 'info' : 'error'

// ✅ Good: lookup object
const logLevels: Record<string, string> = {
  test: 'silent',
  development: 'info',
  production: 'error',
}
const level = logLevels[env] || 'error'
```

**Import Order**: node → external → @/core → @/domain → @/infra → @/presentation → @/shared → @/lib

## Testing

**Test File Conventions**:
- `*.test.ts` - Unit tests (co-located with source, run via `pnpm test:unit`)
- `*.e2e-spec.ts` - E2E tests (in `src/presentation/controllers/*/`, run via `pnpm test:e2e`)

**Path Aliases**:
- `@/` - src imports
- `@tests/` - test utilities (`@tests/factories/`, `@tests/builders/`)

**Test Data Generation**:
- `tests/factories/domain/` - Factory functions (`makeQuestionData()`, `makeUserData()`) return domain entity props for unit tests
- `tests/builders/` - Fluent builders (`aQuestion().withTitle().build()`) create HTTP request bodies for E2E tests (use `unknown` types for invalid input testing)
- `tests/helpers/` - Request helpers (`createQuestion()`, `authenticateUser()`) encapsulate HTTP calls for E2E tests

**Test Pattern (AAA)**:
```typescript
it('should do something', async () => {
  // Arrange
  const input = { ... }

  // Act
  const result = await sut.execute(input)

  // Assert
  expect(result).toEqual(...)
})
```

**Test Best Practices**:
- **Always create request objects** - Extract inline objects to named `request` variables for better readability:
```typescript
// ❌ Bad: inline object
await expect(sut.execute({ questionId: question.id, authorId: 'different-author' })).rejects.toThrow()

// ✅ Good: named request object
const request = {
  questionId: question.id,
  authorId: 'different-author',
}
await expect(sut.execute(request)).rejects.toThrow()
```

- **Exception messages must start with uppercase** - All error messages should begin with a capital letter:
```typescript
// ❌ Bad
super('user not found')

// ✅ Good
super('User not found')
```

- **Use explicit boolean assertions** - Always use `toBe(true)` and `toBe(false)` for boolean values:
```typescript
// ❌ Bad
expect(result.isVerified).toBeTruthy()
expect(result.isActive).toBeFalsy()

// ✅ Good
expect(result.isVerified).toBe(true)
expect(result.isActive).toBe(false)
```

**Test Database**: Before running E2E tests, ensure test DB is running:
```bash
pnpm run db:up:test && pnpm run migrate:test
```

## Adding New Features

1. **Entity** (if needed): `src/domain/enterprise/entities/`
2. **Repository Interface**: `src/domain/application/repositories/`
3. **Repository Implementation**: `src/infra/persistence/repositories/prisma/`
4. **Mapper** (if needed): `src/infra/persistence/mappers/prisma/`
5. **Register Repository**: Add to `RepositoriesModule` providers/exports
6. **Use Case**: `src/domain/application/usecases/<name>/`
7. **Register Use Case**: Add to `UseCasesModule` providers/exports
8. **Controller**: `src/presentation/controllers/<name>/`
9. **Register Controller**: Add to `AppModule` controllers
10. **Tests**: Unit test for use case, E2E test for controller

## Git Commit Rules

**Critical Rules**:
- **NEVER use `--no-verify`** - Always let pre-commit hooks run to ensure code quality
- If hooks fail, fix the underlying issues instead of bypassing them
- Commits should pass lint and type-check before being created
- Commits must be as small and specific as possible

**Conventional Commits Format**: `<type>[optional scope]: <description>`

**Allowed Types**:
- `feat`: adds, adjusts, or removes a feature
- `fix`: fixes a bug
- `refactor`: restructures code without changing behavior
- `perf`: performance improvements
- `style`: code style only (formatting, imports, whitespace)
- `test`: adds or corrects tests
- `docs`: documentation only
- `build`: changes to build tools, CI/CD, dependencies, versioning
- `chore`: config changes, dependency updates, misc

**Scope**: Optional, describes context (e.g., `feat(api)`, `fix(auth)`). Do not use filenames or issue IDs.

**Description**: Mandatory, short phrase in imperative, lowercase, no ending period.

**Examples**:
```
feat: add email notifications on new direct messages
fix(api): correct request checksum calculation
refactor(auth): extract token validation logic
chore: configure husky and lint-staged
```

**Splitting Commits**:
- Same file with different changes → separate commits
- Multiple files with identical diff → may group
- Only formatting changes → may group by directory

## Troubleshooting

**"Cannot find module '@/...'"** - Check `tsconfig.json` path aliases, run `pnpm run build`

**"Nest can't resolve dependencies"** - Ensure `@Injectable()` decorator present, use `@Inject(AbstractClass)` for repositories

**Database connection errors** - Verify `.env.development` exists, run `pnpm run db:up:dev`

**E2E tests failing** - Run `pnpm run db:up:test && pnpm run migrate:test` first
