import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import type { PluginOption } from 'vite'

type CreateClientPluginsOptions = {
    readonly clientIndexFile: string
    readonly projectRoot: string
}

export const createClientPlugins = ({
    clientIndexFile,
    projectRoot,
}: CreateClientPluginsOptions): PluginOption[] => {
    return [
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
                    if (req.method !== 'GET') {
                        next()
                        return
                    }

                    const requestUrl = req.url ?? '/'
                    const url = new URL(requestUrl, 'http://localhost')
                    const pathname = url.pathname.toLowerCase()
                    const acceptHeader = req.headers.accept ?? ''
                    const acceptsHtml = acceptHeader.includes('text/html')
                    const hasFileExtension = path.extname(pathname).length > 0

                    const isApiRoute = pathname.startsWith('/api')
                    const isViteInternalRoute =
                        pathname.startsWith('/@') ||
                        pathname.startsWith('/__vite') ||
                        pathname.startsWith('/@fs/')

                    if (!acceptsHtml || isApiRoute || isViteInternalRoute || hasFileExtension) {
                        next()
                        return
                    }

                    try {
                        const html = readFileSync(clientIndexFile, 'utf-8')
                        const transformed = await server.transformIndexHtml(pathname, html)
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'text/html')
                        res.end(transformed)
                    } catch (error) {
                        next(error)
                    }
                })
            },
        },
    ]
}
