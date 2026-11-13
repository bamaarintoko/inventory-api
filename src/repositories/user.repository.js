const prisma = require('../config/prisma');

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

const create = (data) =>
  prisma.user.create({
    data,
    select: { id: true, name: true, email: true, createdAt: true },
  });

module.exports = { findByEmail, create };