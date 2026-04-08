import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const engineDistRoot = path.resolve(projectRoot, '../engine/dist')

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        // Plugin to handle .wgsl files as raw text
        {
            name: 'wgsl-loader',
            load(id) {
                if (id.endsWith('.wgsl')) {
                    try {
                        const content = readFileSync(id, 'utf-8')
                        return `export default ${JSON.stringify(content)}`
                    } catch (error) {
                        console.error(`Failed to load WGSL file: ${id}`, error)
                        throw error
                    }
                }
            },
        },
        // Serve ./public/index.html at /, but run it through Vite's HTML transform
        // pipeline (critical for @vitejs/plugin-react Fast Refresh preamble).
        {
            name: 'serve-public-index',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    try {
                        if (req.url === '/' || req.url === '/index.html') {
                            const htmlPath = path.resolve(projectRoot, 'public/index.html')
                            const rawHtml = readFileSync(htmlPath, 'utf-8')
                            const transformed = await server.transformIndexHtml(req.url, rawHtml)
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'text/html')
                            res.end(transformed)
                            return
                        }
                        next()
                    } catch (error) {
                        next(error as any)
                    }
                })
            },
        },
    ],
    root: projectRoot,
    publicDir: path.resolve(projectRoot, 'public'),
    assetsInclude: ['**/*.wgsl'],
    build: {
        outDir: path.resolve(projectRoot, 'dist/client'),
        rollupOptions: {
            input: path.resolve(projectRoot, 'public/index.html'),
        },
    },
    resolve: {
        alias: {
            '@src': path.resolve(projectRoot, 'src'),
            '@client': path.resolve(projectRoot, 'src/client'),
            '@server': path.resolve(projectRoot, 'src/server'),
            '@shared': path.resolve(projectRoot, 'src/shared'),
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
            allow: [projectRoot, engineDistRoot],
        },
    },
    optimizeDeps: {
        rolldownOptions: {
            moduleTypes: {
                '.wgsl': 'text',
            },
        },
    },
})
