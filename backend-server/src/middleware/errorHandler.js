module.exports = function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    const statusCode = err.statusCode || err.status || 500;
    const code = err.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');

    const message = err.expose
        ? (err.message || 'Request failed')
        : (statusCode >= 500 ? 'Internal server error' : (err.message || 'Request failed'));

    const details = err.details;

    res.status(statusCode).json({
        error: message,
        code,
        details
    });
};
