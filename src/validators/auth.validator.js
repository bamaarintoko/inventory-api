const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(100),
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

module.exports = { registerSchema, loginSchema };