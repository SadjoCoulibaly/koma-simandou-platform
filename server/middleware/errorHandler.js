export function errorHandler(err, _req, res, _next) {
  console.error('❌', err.message)

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
