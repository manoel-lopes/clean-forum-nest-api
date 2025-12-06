import node from 'eslightning/node'

export default [
  {
    ignores: ['**/*', '!src/**', '!tests/**', '**/*.e2e-spec.ts',],
  },
  ...node,
  {
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
    ],
  },
]
