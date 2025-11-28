/** @type {import('@stryker-mutator/api').PartialStrykerOptions} */
export default {
  packageManager: 'pnpm',
  plugins: [
    '@stryker-mutator/vitest-runner',
  ],
  testRunner: 'vitest',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/index.ts',
    '!src/main/**',
    '!src/core/**',
    '!src/infra/persistence/repositories/in-memory/**',
    '!src/infra/adapters/**/stubs/**',
    '!src/infra/doubles/**',
  ],
  jsonReporter: {
    fileName: 'mutation-report.json',
  },
  timeoutMS: 60000,
  concurrency: 4,
  ignoreStatic: true,
}
