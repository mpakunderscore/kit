import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

import { createClientBuildMetadata } from './buildMetadata'
import { createClientPlugins } from './vite.client.plugins'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const clientIndexFile = path.resolve(projectRoot, 'public/index.html')

export default defineConfig(({ mode }) => {
    const loadedEnv = loadEnv(mode, projectRoot, '')

    return {
        define: createClientBuildMetadata(projectRoot, loadedEnv),
        plugins: createClientPlugins({ clientIndexFile, projectRoot }),
        root: projectRoot,
        publicDir: path.resolve(projectRoot, 'public'),
        base: './',
        build: {
            outDir: path.resolve(projectRoot, 'dist/client'),
            emptyOutDir: true,
            rollupOptions: {
                input: clientIndexFile,
            },
        },
        resolve: {
            alias: {
                '@src': path.resolve(projectRoot, 'src'),
            },
            // Ensure a single React instance when using symlinked workspace packages (file:../engine).
            dedupe: [
                'react',
                'react-dom',
                'react-dom/client',
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
            ],
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: true,
            fs: {
                // Allow Vite dev server to serve prebuilt assets from linked engine package.
                allow: [projectRoot],
            },
        },
    }
})
