import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(configDir, '..', '..')

export default defineConfig({
    resolve: {
        alias: {
            '@src': path.resolve(projectRoot, 'src'),
            '@server': path.resolve(projectRoot, 'server'),
            '@electron': path.resolve(projectRoot, 'electron'),
        },
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        root: projectRoot,
    },
})
