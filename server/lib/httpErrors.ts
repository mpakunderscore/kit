// Import { Prisma } from '@prisma/client'
// import type { Response } from 'express'
//
// import { logger } from '@server/lib/logger'
//
// const httpErrorsLogger = logger.withContext({ scope: 'http_errors' })
//
// export class AppError extends Error {
//     readonly code: string
//     readonly status: number
//
//     constructor(message: string, status: number, code: string) {
//         super(message)
//         this.name = 'AppError'
//         this.status = status
//         this.code = code
//     }
// }
//
// export class ValidationError extends AppError {
//     constructor(message: string) {
//         super(message, 400, 'VALIDATION_ERROR')
//         this.name = 'ValidationError'
//     }
// }
//
// export class UnauthorizedError extends AppError {
//     constructor(message = 'Unauthorized') {
//         super(message, 401, 'UNAUTHORIZED')
//         this.name = 'UnauthorizedError'
//     }
// }
//
// export class NotFoundError extends AppError {
//     constructor(message = 'Not found') {
//         super(message, 404, 'NOT_FOUND')
//         this.name = 'NotFoundError'
//     }
// }
//
// const toAppError = (error: unknown): AppError => {
//     if (error instanceof AppError) {
//         return error
//     }
//
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         if (error.code === 'P2002') {
//             return new AppError('Conflict', 409, 'CONFLICT')
//         }
//
//         if (error.code === 'P2025') {
//             return new NotFoundError()
//         }
//
//         return new AppError('Database request failed', 500, 'DATABASE_ERROR')
//     }
//
//     if (error instanceof Error) {
//         return new AppError('Internal server error', 500, 'INTERNAL_ERROR')
//     }
//
//     return new AppError('Internal server error', 500, 'INTERNAL_ERROR')
// }
//
// export const sendApiError = (response: Response, error: unknown): void => {
//     const appError = toAppError(error)
//     if (appError.status >= 500) {
//         httpErrorsLogger.error('Sending API error response', {
//             status: appError.status,
//             code: appError.code,
//             error,
//         })
//     } else {
//         httpErrorsLogger.warn('Sending API error response', {
//             status: appError.status,
//             code: appError.code,
//             error,
//         })
//     }
//     response.status(appError.status).json({
//         error: appError.message,
//         code: appError.code,
//     })
// }
