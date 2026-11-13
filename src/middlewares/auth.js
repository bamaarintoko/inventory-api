const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
};

module.exports = authenticate;