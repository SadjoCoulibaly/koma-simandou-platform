const DB_ERROR_CODES = ['23502', '23503', '23505', '23514']
const DB_ERROR_PATTERNS = ['violates', 'duplicate key', 'foreign key', 'null value']

function isDbError(err) {
  if (DB_ERROR_CODES.includes(err.code)) return true
  return DB_ERROR_PATTERNS.some(p => err.message?.toLowerCase().includes(p))
}

export function errorHandler(err, _req, res, _next) {
  console.error('❌', err.code ?? '', err.message)

  if (isDbError(err)) {
    return res.status(400).json({ message: 'Données invalides. Vérifiez les informations saisies et réessayez.' })
  }

  const status = err.status || err.statusCode || 500
  const message = status === 500
    ? 'Une erreur est survenue. Veuillez réessayer.'
    : err.message || 'Erreur interne du serveur'

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
