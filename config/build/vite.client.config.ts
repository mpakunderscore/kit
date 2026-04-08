import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const clientIndexFile = path.resolve(projectRoot, 'public/index.html')
const packageJsonPath = path.resolve(projectRoot, 'package.json')

const getGitValue = (command: string, fallback: string): string => {
    try {
        const output = execSync(command, {
            cwd: projectRoot,
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString()
            .trim()
        return output.length > 0 ? output : fallback
    } catch {
        return fallback
    }
}

const packageVersion = (() => {
    try {
        const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string }
        return parsed.version?.trim() || 'unknown'
    } catch {
        return 'unknown'
    }
})()

const formatBuildTime24h = (date: Date): string => {
    const pad2 = (value: number): string => value.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

export default defineConfig(({ mode }) => {
    const loadedEnv = loadEnv(mode, projectRoot, '')

    const defineBuildMetadata = {
        VERSION: JSON.stringify(packageVersion),
        GIT: JSON.stringify(getGitValue('git rev-parse --short HEAD', 'unknown')),
        BRANCH: JSON.stringify(getGitValue('git rev-parse --abbrev-ref HEAD', 'unknown')),
        BUILD_TIME: JSON.stringify(formatBuildTime24h(new Date())),
        NODE_ENV: JSON.stringify(loadedEnv.NODE_ENV ?? process.env.NODE_ENV ?? 'development'),
        PORT: JSON.stringify(loadedEnv.PORT ?? process.env.PORT ?? '4000'),
    } as const

    return {
        define: defineBuildMetadata,
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
    }
})
