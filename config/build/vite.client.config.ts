import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const clientIndexFile = path.resolve(projectRoot, 'public/index.html')

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'promote-built-public-index',
            closeBundle() {
                const distClientDir = path.resolve(projectRoot, 'dist/client')
                const builtPublicIndex = path.join(distClientDir, 'public', 'index.html')
                const finalIndex = path.join(distClientDir, 'index.html')
                if (existsSync(builtPublicIndex)) {
                    copyFileSync(builtPublicIndex, finalIndex)
                    rmSync(path.join(distClientDir, 'public'), { recursive: true, force: true })
                }
            },
        },
    ],
    root: projectRoot,
    publicDir: path.resolve(projectRoot, 'public'),
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
        port: 5173,
        fs: {
            // Allow Vite dev server to serve prebuilt assets from linked engine package.
            allow: [projectRoot],
        },
    }
})
