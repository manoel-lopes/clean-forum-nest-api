import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const exclude = [
  ...configDefaults.exclude,
  'src/main',
]

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    exclude,
    globals: true,
    coverage: {
      provider: 'istanbul',
      exclude: [
        ...exclude,
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
