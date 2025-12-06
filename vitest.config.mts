import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swc from 'unplugin-swc'
import { configDefaults, defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const coverageExclude = [
  ...configDefaults.exclude,
  '**/05-nest-clean/**',
]

const isE2E = process.env.TEST_TYPE === 'e2e'

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, '**/05-nest-clean/**', '**/clean-forum-node-api/**'],
    include: isE2E ? ['**/*.e2e-spec.ts'] : ['**/*.test.ts'],
    globals: true,
    pool: 'forks',
    isolate: true,
    fileParallelism: true,
    silent: true,
    hideSkippedTests: true,
    setupFiles: isE2E ? ['./tests/setup-e2e.ts'] : [],
    coverage: {
      provider: 'istanbul',
      exclude: [
        ...coverageExclude,
        '**/*.e2e-spec.ts',
        '**/prisma/**',
        'test/**',
        'src/lib',
        'src/util',
        'src/external',
        'src/infra/adapters/http/http-server/fasitfy',
        'src/infra/persistence/repositories/cache',
        'src/infra/providers/cache/redis',
      ],
    },
  },
})
