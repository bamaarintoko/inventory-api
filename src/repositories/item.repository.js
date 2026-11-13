const prisma = require('../config/prisma');

const buildWhere = (search) =>
  search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

const findMany = async ({ search, page, limit }) => {
  const where = buildWhere(search);
  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.item.count({ where }),
  ]);
  return { items, total };
};

const findById = (id) => prisma.item.findUnique({ where: { id } });

const create = (data) => prisma.item.create({ data });

const update = (id, data) => prisma.item.update({ where: { id }, data });

const remove = (id) => prisma.item.delete({ where: { id } });

// Update atomik: cek dan ubah stok dalam SATU query SQL.
// UPDATE items SET stock = stock + :qty WHERE id = :id AND stock >= :minStock
const adjustStock = (id, quantity) =>
  prisma.item.updateMany({
    where: { id, stock: { gte: quantity < 0 ? -quantity : 0 } },
    data: { stock: { increment: quantity } },
  });

module.exports = { findMany, findById, create, update, remove, adjustStock };