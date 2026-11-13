const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
};

module.exports = errorHandler