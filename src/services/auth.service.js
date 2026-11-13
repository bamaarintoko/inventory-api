const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const register = async ({ name, email, password }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw new AppError('Email sudah terdaftar', 409);

  const hashed = await bcrypt.hash(password, 10);
  return userRepository.create({ name, email, password: hashed });
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  // Pesan error disamakan supaya penyerang tidak bisa menebak email mana yang terdaftar
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Email atau password salah', 401);
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

module.exports = { register, login };