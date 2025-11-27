import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'
import tseslint from 'typescript-eslint'
import eslintPluginImport from 'eslint-plugin-import'
import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...neostandard({
    ignores: resolveIgnoresFromGitignore(),
  }),
  {
    ignores: ['**/*', '!src/**', '!tests/**', '**/*.e2e-spec.ts', 'clean-forum-node-api/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      vitest,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      import: eslintPluginImport,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'no-redeclare': 'off',
      'no-console': ['error', { allow: ['error'] }],
      'max-len': ['warn', {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreComments: false,
      }],
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/space-before-function-paren': ['warn', {
        anonymous: 'always',
        asyncArrow: 'always',
        named: 'always',
      }],
      '@stylistic/multiline-ternary': 'off',
      'padded-blocks': 'off',

      'lines-between-class-members': ['warn', {
        enforce: [
          { blankLine: 'never', prev: 'field', next: 'field' },
          { blankLine: 'always', prev: 'method', next: 'method' },
          { blankLine: 'always', prev: 'field', next: 'method' },
          { blankLine: 'always', prev: 'method', next: 'field' },
        ],
      }],
      'no-multiple-empty-lines': ['warn', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'neostandard/lines-between-class-members': 'off',
      'neostandard/padded-blocks': 'off',
      'neostandard/no-multiple-empty-lines': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/parameter-properties': ['error', {
        allow: [
          'readonly',
          'private',
          'private readonly',
          'protected',
          'protected readonly',
        ],
      }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreClassWithStaticInitBlock: true,
          reportUsedIgnorePattern: false
        },
      ],
      'no-unused-private-class-members': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'off',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              '^node:', '^[^@./]', '^zod', '^fastify', '^@fastify', '^vitest', '^supertest',
              '^@nestjs/*',
              '^@/external',
              '^@/core/presentation', '^@/core/application', '^@/core/domain',
              '^@/external',
              '^@/domain/entities', '^@/domain/value-objects',
              '^@/domain/application/.*',
              '^@/infra', '^@/infra/.*/ports', '^@/infra/.*/errors',
              '^@/domain',
              '^@/presentation',
              '^@/main',
              '^@/util',
              '^@/lib',
              '^@/shared',
              '^\.',
            ],
            
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      '@stylistic/padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: '*', next: 'export' },
        { blankLine: 'always', prev: '*', next: 'type' },
        { blankLine: 'always', prev: 'type', next: '*' },
        { blankLine: 'never', prev: 'singleline-const', next: 'singleline-const' },
        { blankLine: 'never', prev: 'singleline-let', next: 'singleline-let' },
        { blankLine: 'never', prev: 'singleline-const', next: 'singleline-let' },
        { blankLine: 'never', prev: 'singleline-let', next: 'singleline-const' },
        { blankLine: 'never', prev: 'multiline-const', next: 'const' },
        { blankLine: 'never', prev: 'multiline-let', next: 'let' },
        { blankLine: 'never', prev: 'const', next: 'const' },
        { blankLine: 'never', prev: 'let', next: 'let' },
        { blankLine: 'never', prev: 'const', next: 'let' },
        { blankLine: 'never', prev: 'let', next: 'const' },
        { blankLine: 'never', prev: 'expression', next: 'expression' },
        { blankLine: 'never', prev: 'expression', next: ['const', 'let', 'var'] },
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: 'expression' },
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: 'if' },
        { blankLine: 'never', prev: 'expression', next: 'if' },
        { blankLine: 'never', prev: 'if', next: 'expression' },
        { blankLine: 'never', prev: 'if', next: ['const', 'let', 'var'] },
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: 'try' },
        { blankLine: 'never', prev: 'expression', next: 'try' },
        { blankLine: 'never', prev: 'try', next: 'expression' },
        { blankLine: 'never', prev: 'try', next: ['const', 'let', 'var'] },
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: 'while' },
        { blankLine: 'never', prev: 'expression', next: 'while' },
        { blankLine: 'never', prev: 'while', next: 'expression' },
        { blankLine: 'never', prev: 'while', next: ['const', 'let', 'var'] },
        { blankLine: 'never', prev: ['const', 'let', 'var'], next: 'for' },
        { blankLine: 'never', prev: 'expression', next: 'for' },
        { blankLine: 'never', prev: 'for', next: 'expression' },
        { blankLine: 'never', prev: 'for', next: ['const', 'let', 'var'] },
        { blankLine: 'never', prev: '*', next: 'throw' },
        { blankLine: 'never', prev: '*', next: 'return' },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/setup-e2e.ts'],
    rules: {
      '@stylistic/padding-line-between-statements': 'off',
      '@stylistic/padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'never', prev: 'let', next: 'const' },
      ],
    },
  },
  {
    files: [
      'src/core/presentation/http.ts',
      'src/infra/persistence/repositories/in-memory/base/base-in-memory.repository.ts',
    ],
    rules: {
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }],
    },
  },
  {
    files: [
      'src/infra/persistence/repositories/prisma/prisma-questions.repository.ts',
      'src/main/server.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }],
    },
  },
  {
    files: ['vitest.config.mts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
