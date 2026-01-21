module.exports = function notFound(req, res, next) {
    const err = new Error('Route not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    err.details = { path: req.originalUrl, method: req.method };
    next(err);
};
