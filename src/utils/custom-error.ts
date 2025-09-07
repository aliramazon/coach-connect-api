interface ErrorDetails {
    [key: string]: any;

    field?: string;
    fields?: Record<string, string>;
    code?: string;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
}

export class CustomError extends Error {
    statusCode: number;
    errorType: string;
    clientErrorType: string;
    isOperational: boolean;
    details?: ErrorDetails;
    timestamp: Date;

    constructor(
        message: string,
        statusCode: number,
        clientErrorType?: string,
        details?: ErrorDetails,
    ) {
        super(message);

        this.name = this.constructor.name;

        this.statusCode = statusCode;
        this.errorType = statusCode.toString().startsWith('4')
            ? 'fail'
            : 'error';
        this.clientErrorType =
            clientErrorType || this.getDefaultClientType(statusCode);
        this.isOperational = true;
        this.details = details;
        this.timestamp = new Date();

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }

    private getDefaultClientType(statusCode: number): string {
        const typeMap: Record<number, string> = {
            400: 'VALIDATION_ERROR',
            401: 'AUTHENTICATION_ERROR',
            403: 'AUTHORIZATION_ERROR',
            404: 'RESOURCE_NOT_FOUND',
            409: 'RESOURCE_CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_ERROR',
            503: 'SERVICE_UNAVAILABLE',
        };
        return typeMap[statusCode] || 'UNKNOWN_ERROR';
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            errorType: this.errorType,
            clientErrorType: this.clientErrorType,
            isOperational: this.isOperational,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }

    static badRequest(
        message: string,
        clientType?: string,
        details?: ErrorDetails,
    ) {
        return new CustomError(
            message,
            400,
            clientType || 'VALIDATION_ERROR',
            details,
        );
    }

    static authenticationFailed(
        message: string = 'Invalid credentials',
        clientType?: string,
        details?: ErrorDetails,
    ) {
        return new CustomError(
            message,
            401,
            clientType || 'AUTHENTICATION_ERROR',
            details,
        );
    }

    static forbidden(
        message: string = 'Not authorized',
        clientType?: string,
        details?: ErrorDetails,
    ) {
        return new CustomError(
            message,
            403,
            clientType || 'AUTHORIZATION_ERROR',
            details,
        );
    }

    static notFound(
        message: string = 'Resource not found',
        clientType?: string,
        details?: ErrorDetails,
    ) {
        return new CustomError(
            message,
            404,
            clientType || 'RESOURCE_NOT_FOUND',
            details,
        );
    }

    static conflict(
        message: string = 'Resource conflict',
        clientType?: string,
        details?: ErrorDetails,
    ) {
        return new CustomError(
            message,
            409,
            clientType || 'RESOURCE_CONFLICT',
            details,
        );
    }

    static validation(
        message: string,
        clientType?: string,
        details?: ErrorDetails,
    ) {
        return new CustomError(
            message,
            422,
            clientType || 'VALIDATION_ERROR',
            details,
        );
    }

    static rateLimit(
        message: string = 'Too many requests',
        details?: ErrorDetails,
    ) {
        return new CustomError(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    }

    static internal(
        message: string = 'Internal server error',
        details?: ErrorDetails,
    ) {
        return new CustomError(message, 500, 'INTERNAL_ERROR', details);
    }

    static serviceUnavailable(
        message: string = 'Service unavailable',
        details?: ErrorDetails,
    ) {
        return new CustomError(message, 503, 'SERVICE_UNAVAILABLE', details);
    }
}

export class ValidationError extends CustomError {
    constructor(message: string, details?: ErrorDetails) {
        super(message, 422, 'VALIDATION_ERROR', details);
    }
}

export class AuthenticationError extends CustomError {
    constructor(
        message: string = 'Authentication required',
        clientType?: string,
        details?: ErrorDetails,
    ) {
        super(message, 401, clientType || 'AUTHENTICATION_ERROR', details);
    }
}

export class AuthorizationError extends CustomError {
    constructor(
        message: string = 'Insufficient permissions',
        details?: ErrorDetails,
    ) {
        super(message, 403, 'AUTHORIZATION_ERROR', details);
    }
}

export class NotFoundError extends CustomError {
    constructor(resource: string = 'Resource', details?: ErrorDetails) {
        super(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND', details);
    }
}
