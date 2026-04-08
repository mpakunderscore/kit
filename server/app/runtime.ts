export type RuntimeMode = 'development' | 'production'

const rawNodeEnv = process.env.NODE_ENV?.trim() ?? ''

export const nodeEnv: RuntimeMode = rawNodeEnv === 'production' ? 'production' : 'development'
export const isDev = nodeEnv === 'development'
