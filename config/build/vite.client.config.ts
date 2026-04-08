import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
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
        {
            name: 'serve-public-index-in-dev',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.method !== 'GET' || req.url !== '/') {
                        next()
                        return
                    }

                    try {
                        const html = readFileSync(clientIndexFile, 'utf-8')
                        const transformed = await server.transformIndexHtml('/', html)
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'text/html')
                        res.end(transformed)
                    } catch (error) {
                        next(error)
                    }
                })
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
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        fs: {
            // Allow Vite dev server to serve prebuilt assets from linked engine package.
            allow: [projectRoot],
        },
    },
})
