const StatusCode = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
}

const Status = {
    ERROR : "Error",
    SUCCES : "Succes"
}

class ApiResponse {
    constructor(
        status,
        statusCode,
        message,
        data = null,
    ){
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    send(res) {
        let responseObject = { status : this.status, message : this.message }
        if (this.data != null){
            responseObject.data = this.data
        }
        res.status(this.statusCode).json(responseObject);
    }
}

class UnauthroizedResponse extends ApiResponse {
    constructor(message = 'Unauthorized') {
        super(Status.ERROR, StatusCode.UNAUTHORIZED, message);
    }
}

class NotFoundResponse extends ApiResponse {
    constructor(message = 'Not found') {
        super(Status.ERROR, StatusCode.NOT_FOUND, message);
    }
}

class ForbiddenResponse extends ApiResponse {
    constructor(message = 'Forbidden') {
        super(Status.ERROR, StatusCode.FORBIDDEN, message);
    }
}

class BadRequestResponse extends ApiResponse {
    constructor(message = 'Bad request') {
        super(Status.ERROR, StatusCode.BAD_REQUEST, message);
    }
}

class InternalErrorResponse extends ApiResponse {
    constructor(message = 'Internal error') {
        super(Status.ERROR, StatusCode.INTERNAL_ERROR, message);
    }
}

class SuccessResponse extends ApiResponse {
    constructor(message, data=null) {
        super(Status.SUCCES, StatusCode.SUCCESS, message, data);
    }
}

class SuccessCreationResponse extends ApiResponse {
    constructor(message, data=null) {
        super(Status.SUCCES, StatusCode.CREATED, message, data);
    }
}

module.exports = {
    UnauthroizedResponse,
    NotFoundResponse,
    ForbiddenResponse,
    BadRequestResponse,
    InternalErrorResponse,
    SuccessResponse,
    SuccessCreationResponse
}