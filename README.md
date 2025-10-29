# Clean Forum API

This project is a robust RESTful API for a forum application, built with Node.js, Fastify, and TypeScript. It follows the principles of Clean Architecture and Domain-Driven Design to create a scalable, maintainable, and testable codebase.


## 🛠️ Technologies

- [Node.js](https://nodejs.org/)
- [Fastify](https://www.fastify.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)
- [Redis](https://redis.io/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- [Docker](https://www.docker.com/)
- [Husky](https://typicode.github.io/husky/)


## 🏛️ Architecture

### 🎯 Clean Architecture

This project is structured following the principles of **Clean Architecture** by Robert C. Martin. This architectural style emphasizes the separation of concerns, creating a system that is independent of frameworks, UI, and databases.

![Clean Architecture Diagram](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

*Image courtesy of Robert C. Martin (Uncle Bob)*

The core of the application is built around the **Domain** and **Application** layers, which contain the business logic and are independent of any external frameworks. The outer layers, **Presentation** and **Infrastructure**, handle details like HTTP requests, database interactions, and other external services.

### 💎 Domain-Driven Design (DDD)

It uses concepts from **Domain-Driven Design** to model the business domain of the forum.

- **Entities**: Core objects of the domain with a unique identifier.
- **Value Objects**: Objects that represent a descriptive aspect of the domain without a conceptual identifier.

### 🔄 Communication Patterns

- **Pub/Sub (Publisher-Subscriber)**: A pattern for asynchronous communication where producers publish messages to queues and consumers subscribe to process them independently. Used in the email queue system where producers add email jobs to the queue and consumers process them asynchronously with retry logic and error handling.


## 🏗️ Design Patterns

- **Adapter**: Converts the interface of a class into another interface clients expect. Adapter lets classes work together that couldn't otherwise because of incompatible interfaces.
- **Strategy**: Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.
- **Proxy**: Provides a surrogate or placeholder for another object to control access to it. The proxy implements the same interface as the real subject, so it can be used in place of the real object.
- **Simple Factory**: Centralizes object creation in a single place, instantiating concrete classes without exposing construction details to the client.
- **Static Factory Method**: A static factory method is a static method that returns an instance of its class, providing an alternative to using a public constructor. Instead of directly invoking `new`, clients call this method, which may hide complex creation logic, apply validation, cache instances, or return subtypes.
- **Singleton**: Ensures a class has only one instance and provides a global point of access to it. This pattern prevents multiple instances from being created, which is useful for managing shared resources like database connections, cache instances, or queue connections.
- **Mapper**: An object that sets up a bidirectional mapping between two different representations, such as between an in-memory object model and a database.
- **Layer Supertype**: An abstract superclass that provides shared common behavior for all subclasses in a logical layer.
- **Repository**: Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.

## 🧪 Test Patterns & Quality

### 🎯 Test Structure (AAA Pattern)

All tests follow the **Arrange-Act-Assert (AAA)** pattern with visual separation using blank lines:

```typescript
it('should do something', async () => {
  // Arrange: setup test data and dependencies
  const entity = await createAndSave(makeEntity, repository, { prop: 'value' })
  const input = { id: entity.id, field: 'value' }

  // Act: execute the operation
  const result = await sut.execute(input)

  // Assert: verify expectations
  expectEntityToMatch(result, { expectedProp: 'value' })
})
```

### 🔬 Test Patterns

- **In-Memory Database**: Unit and integration tests use in-memory repositories for fast, isolated testing
- **Stubs**: Controlled, predictable behavior for external dependencies
- **Spies/Mocks**: Verify interactions between components
- **Factory Functions**: Generate consistent, repeatable test data
- **System Under Test (SUT)**: Consistent naming with `sut` variable for clarity
- **Test Data Builder**: Fluent API builders with method chaining for flexible test data creation

---

## 📂 Project Structure

```
clean-forum-node-api/
├── prisma/                         # Database Schemas & Migrations
│
├── src/
│   ├── core/                       # 🔌 Base abstractions Entity, UseCase, WebController
│   ├── domain/                     # 🏛️ Business logic independent of frameworks
│   │   ├── application/            # 📋 Application Business Rules
│   │   │   ├── usecases/           # ⚡ Use cases implementing business operations
│   │   │   └── repositories/       # 🔌 Repository interfaces for DIP
│   │   │
│   │   └── enterprise/             # 💎 Enterprise Business Rules
│   │       ├── entities/           # 🎭 Entities domain objects with unique identity
│   │       └── value-objects/      # 💠 Value Objects immutable domain concepts
│   │ 
│   ├── presentation/               # 🎨 Process API endpoints
│   │   ├── controllers/            # 🎮 Web controllers to handle HTTP requests invoking business operations
│   │   └── helpers/                # 📤 HTTP response builders
│   │
│   ├── infra/                      # ⚙️ External dependencies
│   │   │
│   │   ├── adapters/               # 🛡️ Anti-corruption layer for external services
│   │   │   ├── email/              # 📧 Email service (Nodemailer)
│   │   │   └── security/           # 🔐 Password hashing (Bcrypt)
│   │   │
│   │   ├── persistence/            # 💾 Data persistence layer
│   │   │   ├── mappers/            # 🔄 Domain ↔ Persistence mapping
│   │   │   └── repositories/       # 📦 Repository implementations
│   │   │       ├── prisma/         # 🐘 PostgreSQL with Prisma ORM
│   │   │       ├── in-memory/      # 🧪 In-memory for testing
│   │   │       └── cached/         # ⚡ Redis caching decorator
│   │   │
│   │   ├── http/                   # 🌐 HTTP infrastructure
│   │   │   ├── errors/             # ❌ HTTP-specific errors 
│   │   │   ├── fallback/           # 🚫 404 handler for unmatched routes
│   │   │   └── helpers/            # 🛠️ HTTP utilities
│   │   │
│   │   ├── auth/                   # 🔒 JWT authentication
│   │   ├── queues/                 # 📬 Background jobs (BullMQ)
│   │   ├── providers/              # 🔌 External providers (Redis)
│   │   ├── validation/             # ✅ Schema validation (Zod)
│   │   └── doubles/                # 🎭 Test doubles (stubs, mocks)
│   │
│   ├── main/                       # 🔧 Dependency injection and application entry
│   │   ├── factories/              # 🏭 Factory functions for controllers and use cases
│   │   └── fastify/                # 🚀 Fastify application setup
│   │       ├── helpers/            # 🔧 Route registration helpers
│   │       ├── middlewares/        # 🛡️ Authentication and error handling
│   │       ├── plugins/            # 🔌 Fastify plugins
│   │       └── routes/             # 🛣️ Route definitions by domain
│   │
│   ├── shared/                     # 🔄 Cross-cutting concerns shared across layers
│   ├── lib/                        # 📚 Reusable library utilities
│   └── types/                      # 📝 Global TypeScript type definitions
│
├── tests/                          # 🧪 END-TO-END TESTS
│   ├── e2e/                        # E2E test suites
│   ├── builders/                   # Test Data Builders (Fluent API)
│   └── helpers/                    # Test Helper Functions
│
├── .env.example                    # Example environment variables
├── docker-compose.development.yml  # Dev container config file
├── docker-compose.test.yml         # Test containers config file
├── tsconfig.json                   # TypeScript configuration
├── eslint.config.mjs               # ESLint configuration
├── vitest.config.ts                # Vitest test configuration
├── .lintstagedrc.mjs               # Lint-staged configuration
├── .husky/                         # Git hooks
└── package.json                    # Dependencies and scripts
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm
- Docker and Docker Compose

### Installation Steps

1.  **Clone the repository.**
2.  **Install dependencies** using `pnpm install`.
3.  **Set up development environment variables** by copying `.env.example` to `.env.development` and filling it with your database credentials.
    Example `.env.development`:
    ```
    DB_USER=<your_db_user>
    DB_PASSWORD=<your_db_password>
    DB_NAME=<your_db_name>
    DB_PORT=<your_db_port>
    ```
4.  **Start the database and Redis** using the provided `pnpm` script:
    ```bash
    pnpm run db:up:dev
    ```
5.  **Run database migrations** using the provided `pnpm` script:
    ```bash
    pnpm run migrate:dev
    ```

### Running the Application

-   **Development Mode**: `pnpm run start:dev`
-   **Production Mode**: `pnpm run build` and then `pnpm run start`

---

## 🧪 Testing

This project uses `vitest` for testing.

### Unit Tests

- **Run unit tests:**
  ```bash
  pnpm test:unit
  ```

### E2E Tests

The E2E (End-to-End) tests require a running PostgreSQL database. You can easily set one up using Docker Compose and the provided scripts.

**1. Set up the Test Database**

- **Create a `.env.test` file** in the root of the project. You can copy the example credentials below.

  Example `.env.test`:
  ```
  DB_USER=docker
  DB_PASSWORD=docker
  DB_NAME=forum_test
  DB_PORT=5433
  ```

- **Start the test database** with the following command:

  ```bash
  pnpm run db:up:test
  ```

  This will start a PostgreSQL container in the background.

- **Run database migrations** for the test database:
  ```bash
  pnpm run migrate:test
  ```

**2. Run E2E tests**

- Once the test database is running, you can run the E2E tests:
  ```bash
  pnpm run test:e2e
  ```

### Test Coverage

- **Generate test coverage report:**
  ```bash
  pnpm test:ci
  ```

---

## 📖 API Documentation

###  Swagger Documentation

This project uses Swagger for interactive API documentation. Once the application is running, the Swagger UI can be accessed at:

[http://localhost:3333/docs](http://localhost:3333/docs)

### Rate Limiting

This API implements rate limiting to prevent abuse and ensure fair usage across different endpoints. Rate limits are automatically disabled in test environments.

#### Rate Limit Configuration

- **Authentication Endpoints** (`/auth`): 5 requests per minute per IP/email combination
- **User Creation Endpoints** (`/users`): 10 requests per minute per IP
- **Email Validation Endpoints** (`/send-email-validation`, `/users/verify-email-validation`): 3 requests per 5 minutes per IP/email combination

#### Rate Limit Headers

When rate limiting is active, responses include the following headers:
- `X-RateLimit-Limit`: The request limit per time window
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when the rate limit window resets
- `Retry-After`: Seconds to wait before retrying (included when limit is exceeded)

#### Rate Limit Error Response

When the rate limit is exceeded, the API returns a `429 Too Many Requests` status with details:

```json
{
  "code": "AUTH_RATE_LIMIT_EXCEEDED",
  "error": "Too Many Requests",
  "message": "Too many authentication attempts. Please try again later.",
  "retryAfter": 60
}
```

Error codes by endpoint type:
- `AUTH_RATE_LIMIT_EXCEEDED`: Authentication endpoints
- `USER_CREATION_RATE_LIMIT_EXCEEDED`: User creation endpoints  
- `EMAIL_VALIDATION_RATE_LIMIT_EXCEEDED`: Email validation endpoints

### Authentication

Most routes require authentication using an JWT Token.

## Session

### Authenticates a user

*   **Method:** `POST`
*   **Path:** `/auth`
*   **Description:** Authenticates a user by verifying their email and password. If the credentials are correct, it returns a JWT token and a refresh token. This allows the user to access protected routes and to stay logged in.

**Request Body:**

```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "refreshToken": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "userId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
    "expiresAt": "2025-08-14T10:00:00.000Z"
  }
}
```

---

### Refresh access token

*   **Method:** `POST`
*   **Path:** `/auth/refresh-token`
*   **Description:** Refreshes an expired JWT token using a valid refresh token. This allows the user to maintain their session without having to log in again.

**Request Body:**

```json
{
  "refreshTokenId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```


## Users

### Creates a new user account

*   **Method:** `POST`
*   **Path:** `/users`
*   **Description:** Creates a new user account. It checks if the email is already registered and hashes the password before saving the user to the database.
*   **Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Pass123!"
}
```

**Validation Rules:**
- `name`: Required, minimum 1 character
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters, maximum 12 characters

**Response:**

*   **Status:** `201 Created`
*   **Body:** `null`

---

### Fetches a single user by email

*   **Method:** `GET`
*   **Path:** `/users/:email`
*   **Description:** Fetches a single user by their email address. This is useful for checking if a user exists or for retrieving user information.

**URL Parameters:**

```
email=john.doe@example.com
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2025-08-14T10:00:00.000Z"
}
```

---

### Deletes a user account

*   **Method:** `DELETE`
*   **Path:** `/users`
*   **Description:** Deletes a user account. This action also removes all the user's refresh tokens, effectively logging them out from all devices.

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

---

### Fetches a paginated list of users

*   **Method:** `GET`
*   **Path:** `/users`
*   **Description:** Fetches a paginated list of users. This is useful for administrative purposes, such as managing users.

**Query Parameters:**

```
page=1
pageSize=10
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "page": 1,
  "pageSize": 10,
  "totalItems": 100,
  "totalPages": 10,
  "items": [
    {
      "id": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-08-14T10:00:00.000Z"
    }
  ]
}
```

---

### Fetches user's questions

*   **Method:** `GET`
*   **Path:** `/users/:userId/questions`
*   **Description:** Fetches all questions created by a specific user.
*   **Authentication:** Required

**URL Parameters:**

```
userId=c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a
```

**Query Parameters:**

```
page=1
pageSize=10
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "page": 1,
  "pageSize": 10,
  "totalItems": 25,
  "totalPages": 3,
  "items": [
    {
      "id": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
      "title": "How to create a slug from a string?",
      "slug": "how-to-create-a-slug-from-a-string",
      "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
      "createdAt": "2025-08-14T09:00:00.000Z",
      "updatedAt": "2025-08-14T09:00:00.000Z"
    }
  ]
}
```


## Questions

### Creates a new question

*   **Method:** `POST`
*   **Path:** `/questions`
*   **Description:** Creates a new question. It checks if a question with the same title already exists to avoid duplicates.
*   **Authentication:** Required

**Request Body:**

```json
{
  "title": "How to use Fastify?",
  "content": "I'm new to Fastify and need help with basic setup."
}
```

**Response:**

*   **Status:** `201 Created`
*   **Body:** `null`

---

### Fetches a paginated list of questions

*   **Method:** `GET`
*   **Path:** `/questions`
*   **Description:** Fetches a paginated list of questions. This allows users to browse through the existing questions.

**Query Parameters:**

```
page=1
pageSize=10
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "page": 1,
  "pageSize": 10,
  "totalItems": 100,
  "totalPages": 10,
  "items": [
    {
      "id": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
      "title": "How to create a slug from a string?",
      "slug": "how-to-create-a-slug-from-a-string",
      "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
      "createdAt": "2025-08-14T09:00:00.000Z",
      "updatedAt": "2025-08-14T09:00:00.000Z"
    }
  ]
}
```

---

### Fetches a single question by slug

*   **Method:** `GET`
*   **Path:** `/questions/:slug`
*   **Description:** Fetches a single question by its slug. The slug is a user-friendly version of the title, used for SEO-friendly URLs. Answers are paginated and can be customized using query parameters.
*   **Authentication:** Required

**URL Parameters:**

```
slug=how-to-create-a-slug-from-a-string
```

**Query Parameters (Optional):**

*   `page` - Page number for answers (default: `1`)
*   `pageSize` - Number of answers per page (default: `20`)
*   `order` - Sort order for answers: `asc` or `desc` (default: `desc`)
*   `include` - Comma-separated list to include question data: `comments`, `attachments`, `author`
*   `answerIncludes` - Comma-separated list to include in each answer: `comments`, `attachments`, `author`

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "title": "How to create a slug from a string?",
  "content": "What is the best way to create a slug from a string in TypeScript?",
  "slug": "how-to-create-a-slug-from-a-string",
  "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "createdAt": "2025-08-14T09:00:00.000Z",
  "updatedAt": "2025-08-14T09:00:00.000Z",
  "answers": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 5,
    "totalPages": 1,
    "order": "desc",
    "items": [
      {
        "id": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
        "content": "This is an example answer.",
        "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
        "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
        "createdAt": "2025-08-14T10:00:00.000Z",
        "updatedAt": "2025-08-14T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Updates a question

*   **Method:** `PATCH`
*   **Path:** `/questions/:questionId`
*   **Description:** Updates a question title and/or content. Only the author of the question can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
questionId=b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a
```

**Request Body:**

```json
{
  "title": "Updated question title",
  "content": "Updated question content with more details."
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "title": "Updated question title",
  "content": "Updated question content with more details.",
  "slug": "updated-question-title",
  "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "createdAt": "2025-08-14T09:00:00.000Z",
  "updatedAt": "2025-08-14T09:30:00.000Z"
}
```

---

### Deletes a question

*   **Method:** `DELETE`
*   **Path:** `/questions/:questionId`
*   **Description:** Deletes a question. Only the author of the question can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
questionId=b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a
```

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

---

### Choose an answer as the best answer for a question

*   **Method:** `PATCH`
*   **Path:** `/questions/:answerId/choose`
*   **Description:** Marks an answer as the best answer for a question. Only the author of the question can perform this action. This helps other users to quickly find the most helpful answer.
*   **Authentication:** Required

**URL Parameters:**

```
answerId=d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "title": "How to create a slug from a string?",
  "content": "What is the best way to create a slug from a string in TypeScript?",
  "slug": "how-to-create-a-slug-from-a-string",
  "bestAnswerId": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "createdAt": "2025-08-14T09:00:00.000Z",
  "updatedAt": "2025-08-14T10:00:00.000Z"
}
```

## Answers

### Answers a question

*   **Method:** `POST`
*   **Path:** `/answers`
*   **Description:** Submits an answer to a specific question.
*   **Authentication:** Required

**Request Body:**

```json
{
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "content": "This is my answer to the question."
}
```

**Response:**

*   **Status:** `201 Created`
*   **Body:**

```json
{
  "id": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "content": "This is my answer to the question.",
  "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "createdAt": "2025-08-14T10:00:00.000Z",
  "updatedAt": "2025-08-14T10:00:00.000Z"
}
```

---

### Fetches a paginated list of answers for a question

*   **Method:** `GET`
*   **Path:** `/questions/:questionId/answers`
*   **Description:** Fetches a paginated list of answers for a given question. This allows users to see all the answers for a specific question.
*   **Authentication:** Required

**URL Parameters:**

```
questionId=b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a
```

**Query Parameters:**

```
page=1
pageSize=10
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "page": 1,
  "pageSize": 10,
  "totalItems": 100,
  "totalPages": 10,
  "items": [
    {
      "id": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
      "content": "This is an example answer.",
      "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
      "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
      "createdAt": "2025-08-14T10:00:00.000Z",
      "updatedAt": "2025-08-14T10:00:00.000Z"
    }
  ]
}
```

---

### Deletes an answer

*   **Method:** `DELETE`
*   **Path:** `/answers/:answerId`
*   **Description:** Deletes an answer. Only the author of the answer can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
answerId=d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a
```

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

---

### Updates an answer

*   **Method:** `PATCH`
*   **Path:** `/answers/:answerId`
*   **Description:** Updates an answer content. Only the author of the answer can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
answerId=d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a
```

**Request Body:**

```json
{
  "content": "Updated answer content with more details."
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "content": "Updated answer content with more details.",
  "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "createdAt": "2025-08-14T10:00:00.000Z",
  "updatedAt": "2025-08-14T10:30:00.000Z"
}
```

---

### Comments on an answer

*   **Method:** `POST`
*   **Path:** `/answers/:answerId/comments`
*   **Description:** Adds a comment to an answer.
*   **Authentication:** Required

**URL Parameters:**

```
answerId=d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a
```

**Request Body:**

```json
{
  "answerId": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "content": "Great answer! This helped me understand the concept."
}
```

**Response:**

*   **Status:** `201 Created`
*   **Body:**

```json
{
  "id": "e1a1c1e0-1e0a-4b0e-1b0a-1e0a1b0e1b0a",
  "content": "Great answer! This helped me understand the concept.",
  "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "answerId": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "createdAt": "2025-08-14T11:00:00.000Z"
}
```

## Comments

### Comments on a question

*   **Method:** `POST`
*   **Path:** `/questions/:questionId/comments`
*   **Description:** Adds a comment to a question.
*   **Authentication:** Required

**URL Parameters:**

```
questionId=b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a
```

**Request Body:**

```json
{
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "content": "Interesting question! I'm curious about this too."
}
```

**Response:**

*   **Status:** `201 Created`
*   **Body:**

```json
{
  "id": "f2b2d2e0-2e0a-4b0e-2b0a-2e0a2b0e2b0a",
  "content": "Interesting question! I'm curious about this too.",
  "authorId": "c8a8b8e0-8e0a-4b0e-8b0a-8e0a8b0e8b0a",
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "createdAt": "2025-08-14T11:00:00.000Z"
}
```

---

### Updates a question comment

*   **Method:** `PATCH`
*   **Path:** `/comments/questions/:commentId`
*   **Description:** Updates a comment on a question. Only the comment author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
commentId=f2b2d2e0-2e0a-4b0e-2b0a-2e0a2b0e2b0a
```

**Request Body:**

```json
{
  "content": "Updated comment content."
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:** Updated comment

---

### Updates an answer comment

*   **Method:** `PATCH`
*   **Path:** `/comments/answers/:commentId`
*   **Description:** Updates a comment on an answer. Only the comment author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
commentId=e1a1c1e0-1e0a-4b0e-1b0a-1e0a1b0e1b0a
```

**Request Body:**

```json
{
  "content": "Updated comment content."
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:** Updated comment

---

### Deletes a question comment

*   **Method:** `DELETE`
*   **Path:** `/comments/questions/:commentId`
*   **Description:** Deletes a comment from a question. Only the comment author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
commentId=f2b2d2e0-2e0a-4b0e-2b0a-2e0a2b0e2b0a
```

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

---

### Deletes an answer comment

*   **Method:** `DELETE`
*   **Path:** `/comments/answers/:commentId`
*   **Description:** Deletes a comment from an answer. Only the comment author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
commentId=e1a1c1e0-1e0a-4b0e-1b0a-1e0a1b0e1b0a
```

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

## Attachments

### Attach file to question

*   **Method:** `POST`
*   **Path:** `/questions/:questionId/attachments`
*   **Description:** Attaches a file (link) to a question.
*   **Authentication:** Required

**URL Parameters:**

```
questionId=b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a
```

**Request Body:**

```json
{
  "title": "API Documentation",
  "url": "https://example.com/docs/api.pdf"
}
```

**Response:**

*   **Status:** `201 Created`
*   **Body:**

```json
{
  "id": "a1b1c1d1-1e1a-4b1e-1b1a-1e1a1b1e1b1a",
  "title": "API Documentation",
  "url": "https://example.com/docs/api.pdf",
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "createdAt": "2025-08-14T12:00:00.000Z"
}
```

---

### Attach file to answer

*   **Method:** `POST`
*   **Path:** `/answers/:answerId/attachments`
*   **Description:** Attaches a file (link) to an answer.
*   **Authentication:** Required

**URL Parameters:**

```
answerId=d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a
```

**Request Body:**

```json
{
  "title": "Code Example",
  "url": "https://github.com/user/repo/blob/main/example.ts"
}
```

**Response:**

*   **Status:** `201 Created`
*   **Body:**

```json
{
  "id": "b2c2d2e2-2e2a-4b2e-2b2a-2e2a2b2e2b2a",
  "title": "Code Example",
  "url": "https://github.com/user/repo/blob/main/example.ts",
  "answerId": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "createdAt": "2025-08-14T12:00:00.000Z"
}
```

---

### Update question attachment

*   **Method:** `PATCH`
*   **Path:** `/questions/attachments/:attachmentId`
*   **Description:** Updates a question attachment. Only the question author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
attachmentId=a1b1c1d1-1e1a-4b1e-1b1a-1e1a1b1e1b1a
```

**Request Body:**

```json
{
  "title": "Updated API Documentation",
  "url": "https://example.com/docs/api-v2.pdf"
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "a1b1c1d1-1e1a-4b1e-1b1a-1e1a1b1e1b1a",
  "title": "Updated API Documentation",
  "url": "https://example.com/docs/api-v2.pdf",
  "questionId": "b7a7b7e0-7e0a-4b0e-7b0a-7e0a7b0e7b0a",
  "createdAt": "2025-08-14T12:00:00.000Z",
  "updatedAt": "2025-08-14T12:30:00.000Z"
}
```

---

### Update answer attachment

*   **Method:** `PATCH`
*   **Path:** `/answers/attachments/:attachmentId`
*   **Description:** Updates an answer attachment. Only the answer author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
attachmentId=b2c2d2e2-2e2a-4b2e-2b2a-2e2a2b2e2b2a
```

**Request Body:**

```json
{
  "title": "Updated Code Example",
  "url": "https://github.com/user/repo/blob/main/example-v2.ts"
}
```

**Response:**

*   **Status:** `200 OK`
*   **Body:**

```json
{
  "id": "b2c2d2e2-2e2a-4b2e-2b2a-2e2a2b2e2b2a",
  "title": "Updated Code Example",
  "url": "https://github.com/user/repo/blob/main/example-v2.ts",
  "answerId": "d9b9c9e0-9e0a-4b0e-9b0a-9e0a9b0e9b0a",
  "createdAt": "2025-08-14T12:00:00.000Z",
  "updatedAt": "2025-08-14T12:30:00.000Z"
}
```

---

### Delete question attachment

*   **Method:** `DELETE`
*   **Path:** `/questions/attachments/:attachmentId`
*   **Description:** Deletes a question attachment. Only the question author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
attachmentId=a1b1c1d1-1e1a-4b1e-1b1a-1e1a1b1e1b1a
```

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

---

### Delete answer attachment

*   **Method:** `DELETE`
*   **Path:** `/answers/attachments/:attachmentId`
*   **Description:** Deletes an answer attachment. Only the answer author can perform this action.
*   **Authentication:** Required

**URL Parameters:**

```
attachmentId=b2c2d2e2-2e2a-4b2e-2b2a-2e2a2b2e2b2a
```

**Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

## Email Validation

### Send email validation

*   **Method:** `POST`
*   **Path:** `/users/send-email-validation`
*   **Description:** Sends a validation code to the user's email address.
*   **Authentication:** Not required
*   **Rate Limit:** 3 requests per 5 minutes per IP/email

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Success Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

**Error Responses:**

*   **Status:** `400 Bad Request` - Email is missing
*   **Status:** `422 Unprocessable Entity` - Invalid email format
*   **Status:** `503 Service Unavailable` - Email service unavailable

---

### Verify email validation

*   **Method:** `POST`
*   **Path:** `/users/verify-email-validation`
*   **Description:** Verifies the email validation code sent to the user.
*   **Authentication:** Not required
*   **Rate Limit:** 3 requests per 5 minutes per IP/email

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

**Success Response:**

*   **Status:** `204 No Content`
*   **Body:** `null`

**Error Responses:**

*   **Status:** `404 Not Found` - Email validation not found
*   **Status:** `400 Bad Request` - Invalid code, expired code, or email already verified
*   **Status:** `422 Unprocessable Entity` - Invalid request format

## License

This project is licensed under the MIT License.
