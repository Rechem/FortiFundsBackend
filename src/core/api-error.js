const {
    UnauthroizedResponse,
    NotFoundResponse,
    ForbiddenResponse,
    BadRequestResponse,
    InternalErrorResponse,
    AlreadyExistsResponse,
  } = require ('./api-response')

const ErrorType = {
    BAD_TOKEN: 'BadTokenError',
    TOKEN_EXPIRED: 'TokenExpiredError',
    UNAUTHORIZED: 'AuthFailureError',
    ACCESS_TOKEN: 'AccessTokenError',
    INTERNAL: 'InternalError',
    NOT_FOUND: 'NotFoundError',
    NO_ENTRY: 'NoEntryError',
    NO_DATA: 'NoDataError',
    BAD_REQUEST: 'BadRequestError',
    FORBIDDEN: 'ForbiddenError',
    ALREADY_EXISTS : 'AlreadyExistsError'
}

class ApiError extends Error {
    constructor(type, message = 'An error occured') {
        super(message);
        this.type = type
    }

    static handle(err, res) {
        switch (err.type) {
            case ErrorType.BAD_TOKEN:
            case ErrorType.TOKEN_EXPIRED:
            case ErrorType.UNAUTHORIZED:
            case ErrorType.ACCESS_TOKEN:
                return new UnauthroizedResponse(err.message).send(res);
            case ErrorType.INTERNAL:
                return new InternalErrorResponse(err.message).send(res);
            case ErrorType.NOT_FOUND:
            case ErrorType.NO_ENTRY:
            case ErrorType.NO_DATA:
                return new NotFoundResponse(err.message).send(res);
            case ErrorType.BAD_REQUEST:
                return new BadRequestResponse(err.message).send(res);
            case ErrorType.FORBIDDEN:
                return new ForbiddenResponse(err.message).send(res);
            case ErrorType.ALREADY_EXISTS:
                return new AlreadyExistsResponse(err.message).send(res);
            default: {
                let message = err.message;
                // Do not send failure message in production as it may send sensitive data
                if (process.env.NODE_ENV === 'production') message = 'Une erreur est survenue.';
                return new InternalErrorResponse(message).send(res);
            }
        }
    }
}

class AlreadyExistsError extends ApiError {
    constructor(message = 'Cet utilisateur existe déjà') {
        super(ErrorType.ALREADY_EXISTS, message);
    }
}

class AuthFailureError extends ApiError {
    constructor(message = 'Invalid credentials') {
        super(ErrorType.UNAUTHORIZED, message);
    }
}

class UnauthroizedError extends ApiError {
    constructor(message = 'Non autorisé, veuillez vous connecter.') {
        super(ErrorType.UNAUTHORIZED, message);
    }
}

class InternalError extends ApiError {
    constructor(message = 'Une erreur est survenue.') {
        super(ErrorType.INTERNAL, message);
    }
}

class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(ErrorType.BAD_REQUEST, message);
    }
}

class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(ErrorType.NOT_FOUND, message);
    }
}

class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(ErrorType.FORBIDDEN, message);
    }
}

class NoEntryError extends ApiError {
    constructor(message = "Entry don't exists") {
        super(ErrorType.NO_ENTRY, message);
    }
}

class BadTokenError extends ApiError {
    constructor(message = 'Token is not valid') {
        super(ErrorType.BAD_TOKEN, message);
    }
}

class TokenExpiredError extends ApiError {
    constructor(message = 'Expired Token') {
        super(ErrorType.TOKEN_EXPIRED, message);
    }
}

class NoDataError extends ApiError {
    constructor(message = 'No data available') {
        super(ErrorType.NO_DATA, message);
    }
}

class AccessTokenError extends ApiError {
    constructor(message = 'Invalid acces token') {
        super(ErrorType.ACCESS_TOKEN, message);
    }
}

module.exports = {
    AlreadyExistsError,
    ApiError,
    AuthFailureError,
    InternalError,
    BadRequestError,
    NotFoundError,
    ForbiddenError,
    NoEntryError,
    BadTokenError,
    TokenExpiredError,
    NoDataError,
    AccessTokenError,
    UnauthroizedError
}