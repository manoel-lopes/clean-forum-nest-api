import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swc from 'unplugin-swc'
import { configDefaults, defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    setupFiles: ['./tests/setup-e2e.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        isolate: true,
      },
    },
    fileParallelism: true,
    silent: true,
    hideSkippedTests: true,
  },
})
