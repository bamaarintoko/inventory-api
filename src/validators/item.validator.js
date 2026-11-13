const { z } = require('zod');

const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID tidak valid'),
});

const itemSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  stock: z.number().int('Stok harus bilangan bulat').min(0, 'Stok tidak boleh negatif'),
  price: z.number().nonnegative('Harga tidak boleh negatif').multipleOf(0.01, 'Maksimal 2 angka desimal'),
});

const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const adjustStockSchema = z.object({
  quantity: z.number().int().refine((v) => v !== 0, 'Quantity tidak boleh 0'),
});

module.exports = { idParamSchema, itemSchema, listQuerySchema, adjustStockSchema };