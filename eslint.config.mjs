import node from 'eslightning/node'

export default [
  {
    ignores: ['**/*', '!src/**', '!tests/**', '**/*.e2e-spec.ts'],
  },
  ...node,
  {
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      'lines-between-class-members': 'off',
    },
  },
]
