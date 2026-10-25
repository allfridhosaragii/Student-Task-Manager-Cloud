function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url} ->`, err.stack || err.message);

  // PostgreSQL specific error handling
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Data duplikat telah ada dalam database'
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'Data melanggar batasan nilai validasi database (CHECK constraint)'
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Layanan database tidak dapat dijangkau saat ini'
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Terjadi kesalahan internal pada server'
  });
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
