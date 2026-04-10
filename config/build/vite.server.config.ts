import path from 'node:path'
import { builtinModules } from 'node:module'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

import { createCoreBuildMetadata } from './buildMetadata'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const serverEntry = path.resolve(projectRoot, 'server/server.ts')

const builtins = new Set([
    ...builtinModules,
    ...builtinModules.map((moduleName) => `node:${moduleName}`),
])

const isExternal = (id: string): boolean => {
    if (id.startsWith('@server/') || id.startsWith('@src/')) {
        return false
    }
    if (builtins.has(id)) {
        return true
    }
    if (id.startsWith('.') || path.isAbsolute(id)) {
        return false
    }
    return true
}

export default defineConfig({
    define: createCoreBuildMetadata(projectRoot),
    root: projectRoot,
    publicDir: false,
    resolve: {
        alias: {
            '@server': path.resolve(projectRoot, 'server'),
            '@src': path.resolve(projectRoot, 'src'),
        },
    },
    build: {
        ssr: serverEntry,
        outDir: path.resolve(projectRoot, 'dist/server'),
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: isExternal,
            output: {
                format: 'cjs',
                entryFileNames: 'server.cjs',
                inlineDynamicImports: true,
            },
        },
    },
})
