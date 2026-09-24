// Central error handler. Never leaks driver/internal error details
// (MongoServerError, CastError, AxiosError, stack traces, etc.) to the client.
function notFound(req, res) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const httpStatus = err.httpStatus || 500;
  const code = err.code || 'SERVER_ERROR';
  const safeMessage =
    httpStatus < 500 ? err.message : 'Unable to process your request. Please try again.';

  if (httpStatus >= 500) {
    console.error('[error]', err);
  }

  res.status(httpStatus).json({ success: false, code, message: safeMessage });
}

module.exports = { notFound, errorHandler };
