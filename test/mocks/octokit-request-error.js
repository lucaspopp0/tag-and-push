class RequestError extends Error {
    constructor(message, statusCode, options) {
        super(message);
        this.name = 'HttpError';
        this.status = statusCode;
        this.request = options.request;
        this.response = options.response;
    }
}

module.exports = {
    RequestError,
};
