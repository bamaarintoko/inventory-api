const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.validated.body);
    res.status(201).json({ message: 'Registrasi berhasil', data: user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validated.body);
    res.json({ message: 'Login berhasil', data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };