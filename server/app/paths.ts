import { existsSync } from 'fs'
import path from 'path'

export type AppStaticPaths = {
    distDir: string
    appIndexFile: string
}

export const resolveAppStaticPaths = (serverDirname: string): AppStaticPaths => {
    const distDirCandidates = [
        // Runtime from bundled server output (`dist/server`).
        path.resolve(serverDirname, '../client'),
        // Runtime from source in dev (`server/app`).
        path.resolve(serverDirname, '../../dist/client'),
        // Fallback to process cwd.
        path.resolve(process.cwd(), 'dist/client'),
    ]
    const distDir =
        distDirCandidates.find((candidateDir) =>
            existsSync(path.join(candidateDir, 'index.html'))
        ) ?? distDirCandidates.at(-1)!

    return {
        distDir,
        appIndexFile: path.join(distDir, 'index.html'),
    }
}
