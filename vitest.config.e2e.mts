import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config.mts'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./tests/setup-e2e.ts'],
  },
}))
