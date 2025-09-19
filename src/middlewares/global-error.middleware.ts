import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/custom-error';

interface PostgreSQLError extends Error {
    code?: string;
    detail?: string;
    constraint?: string;
    table?: string;
    column?: string;
    severity?: string;
    routine?: string;
}

export class GlobalError {
    static handle(
        err: CustomError | PostgreSQLError | Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const success = false;
        let statusCode = 500;
        let message = err.message || 'Internal Server Error';
        let isOperational = false;
        let errorCode = 'UNKNOWN_ERROR';

        if (err instanceof CustomError) {
            statusCode = err.statusCode;
            isOperational = true;
            errorCode = err.errorCode;
        } else if (
            err &&
            typeof err === 'object' &&
            'code' in err &&
            typeof err.code === 'string'
        ) {
            const pgError = err as PostgreSQLError;
            isOperational = true;

            // Log the full error details for developers
            console.error('PostgreSQL Error:', {
                code: pgError.code,
                message: pgError.message,
                detail: pgError.detail,
                constraint: pgError.constraint,
                table: pgError.table,
                column: pgError.column,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });

            switch (pgError.code) {
                // Unique violation - safe to indicate duplicate
                case '23505':
                    statusCode = 409;
                    message = 'This resource already exists';
                    errorCode = 'RESOURCE_CONFLICT';
                    break;

                // Foreign key violation - generic message
                case '23503':
                    statusCode = 400;
                    message =
                        'Cannot perform this operation due to related data';
                    errorCode = 'VALIDATION_ERROR';
                    break;

                case '23502':
                    statusCode = 400;
                    message = 'Required information is missing';
                    errorCode = 'VALIDATION_ERROR';
                    break;

                // Check violation - generic validation message
                case '23514':
                    statusCode = 400;
                    message = 'Invalid data provided';
                    errorCode = 'VALIDATION_ERROR';
                    break;

                // Connection errors - generic service message
                case 'ECONNREFUSED':
                case 'ENOTFOUND':
                case 'ETIMEDOUT':
                case '53300': // too many connections
                    statusCode = 503;
                    message = 'Service temporarily unavailable';
                    errorCode = 'SERVICE_UNAVAILABLE';
                    break;

                // Server-side errors - these are code bugs, not user errors
                case '42601': // syntax error
                    statusCode = 500;
                    message = 'Internal server error';
                    errorCode = 'DATABASE_ERROR';
                    console.error('SQL Syntax Error - Fix your query!', {
                        code: pgError.code,
                        message: pgError.message,
                        detail: pgError.detail,
                        url: req.url,
                        method: req.method,
                    });
                    break;

                case '42P01': // undefined table
                    statusCode = 500;
                    message = 'Internal server error';
                    errorCode = 'DATABASE_ERROR';
                    console.error('Table Not Found - Check table name!', {
                        code: pgError.code,
                        message: pgError.message,
                        table: pgError.table,
                        url: req.url,
                        method: req.method,
                    });
                    break;

                case '42703': // undefined column
                    statusCode = 500;
                    message = 'Internal server error';
                    errorCode = 'DATABASE_ERROR';
                    console.error('Column Not Found - Check column name!', {
                        code: pgError.code,
                        message: pgError.message,
                        column: pgError.column,
                        table: pgError.table,
                        url: req.url,
                        method: req.method,
                    });
                    break;

                default:
                    statusCode = 500;
                    message = 'Internal server error';
                    errorCode = 'DATABASE_ERROR';
                    // Log unhandled codes for monitoring
                    console.error(
                        `Unhandled PostgreSQL error code: ${pgError.code}`,
                        {
                            code: pgError.code,
                            message: pgError.message,
                            detail: pgError.detail,
                            url: req.url,
                            method: req.method,
                        },
                    );
            }
        }

        // Handle unexpected errors
        else {
            // Always log unexpected errors with full context
            console.error('Unexpected error:', {
                message: err.message,
                stack: err.stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.body,
                params: req.params,
                query: req.query,
            });

            // Generic message for production
            statusCode = 500;
            message = 'Internal server error';
            errorCode = 'INTERNAL_ERROR';
            isOperational = false;
        }

        // Response payload - clean and safe
        const response: any = {
            success,
            message,
            errorCode,
            isOperational,
            timestamp: new Date().toISOString(),
        };

        // Only add sensitive debug info in development
        if (process.env.NODE_ENV === 'development') {
            response.debug = {
                originalMessage: err.message,
                stack: err.stack,
                ...(err instanceof CustomError && {
                    details: err.details,
                    name: err.name,
                }),
                ...(err &&
                    typeof err === 'object' &&
                    'code' in err && {
                        pgErrorCode: (err as PostgreSQLError).code,
                        pgConstraint: (err as PostgreSQLError).constraint,
                        pgTable: (err as PostgreSQLError).table,
                        pgColumn: (err as PostgreSQLError).column,
                    }),
                request: {
                    method: req.method,
                    url: req.url,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                },
            };
        }

        res.status(statusCode).json(response);
    }

    // Optional: Separate method for handling 404 routes
    static notFound(req: Request, res: Response) {
        res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} not found`,
            errorCode: 'ROUTE_NOT_FOUND',
            isOperational: true,
            timestamp: new Date().toISOString(),
        });
    }

    // Optional: Separate method for handling unhandled promise rejections
    static handleUnhandledRejection(reason: any, promise: Promise<any>) {
        console.error('Unhandled Promise Rejection:', {
            reason: reason.message || reason,
            stack: reason.stack,
            promise,
        });

        // In production, you might want to gracefully shutdown
        if (process.env.NODE_ENV === 'production') {
            console.log('Shutting down due to unhandled promise rejection');
            process.exit(1);
        }
    }

    // Optional: Separate method for handling uncaught exceptions
    static handleUncaughtException(error: Error) {
        console.error('Uncaught Exception:', {
            message: error.message,
            stack: error.stack,
        });

        // Always exit on uncaught exceptions
        console.log('Shutting down due to uncaught exception');
        process.exit(1);
    }
}
