export const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Application Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
    });
};
