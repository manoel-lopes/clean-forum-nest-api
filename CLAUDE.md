# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clean Forum NestJS API - a backend forum application built with NestJS v11 (Fastify), TypeScript, PostgreSQL (Prisma), and BullMQ. Follows Clean Architecture and Domain-Driven Design principles.

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

**Repository Injection** - Use abstract classes as injection tokens:
```typescript
@Injectable()
export class MyUseCase implements UseCase {
  constructor(
    @Inject(UsersRepository) private readonly usersRepository: IUsersRepository,
  ) {}
}
```

**Global Modules** - No need to import these: `PrismaModule`, `RepositoriesModule`, `UseCasesModule`, `EnvModule`

**Error Handling Flow**:
1. Domain/Use Cases: Throw domain errors (`ResourceNotFoundError`, `NotAuthorError`)
2. Repositories: Let errors bubble up (no try-catch)
3. Controllers: Catch domain errors → map to HTTP exceptions

## Code Style Rules

**Critical Rules**:
- `no-explicit-any`: ERROR (exceptions: some Prisma query files)
- `no-type-assertions`: ERROR (no `as` keyword)
- `no-console`: ERROR
- `max-len`: 120 characters
- **NEVER use `undefined` as a value** - use `null` or omit property
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
- `*.test.ts` - Unit tests (co-located with source)
- `*.spec.ts` - Integration tests
- `*.e2e-spec.ts` - E2E tests (in `src/presentation/controllers/*/`)

**Path Aliases**:
- `@/` - src imports
- `@tests/` - test helpers (`@tests/helpers/`, `@tests/builders/`)

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

## Troubleshooting

**"Cannot find module '@/...'"** - Check `tsconfig.json` path aliases, run `pnpm run build`

**"Nest can't resolve dependencies"** - Ensure `@Injectable()` decorator present, use `@Inject(AbstractClass)` for repositories

**Database connection errors** - Verify `.env.development` exists, run `pnpm run db:up:dev`

**E2E tests failing** - Run `pnpm run db:up:test && pnpm run migrate:test` first
