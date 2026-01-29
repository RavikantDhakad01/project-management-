class apiErrors extends Error {
    constructor(
        statusCode, message, errors=[], stack=""
    ) {
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.data = null
        this.sucess = false
        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export{apiErrors}