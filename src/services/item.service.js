const itemRepository = require('../repositories/item.repository');
const AppError = require('../utils/AppError');

const list = async (query) => {
  const { items, total } = await itemRepository.findMany(query);
  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

const getOrFail = async (id) => {
  const item = await itemRepository.findById(id);
  if (!item) throw new AppError('Barang tidak ditemukan', 404);
  return item;
};

const create = (data, userId) => itemRepository.create({ ...data, createdBy: userId });

const update = async (id, data) => {
  await getOrFail(id);
  return itemRepository.update(id, data);
};

const remove = async (id) => {
  await getOrFail(id);
  await itemRepository.remove(id);
};

const adjustStock = async (id, quantity) => {
  const { count } = await itemRepository.adjustStock(id, quantity);
  if (count === 0) {
    await getOrFail(id); // lempar 404 kalau barangnya memang tidak ada
    throw new AppError('Stok tidak mencukupi', 409);
  }
  return itemRepository.findById(id);
};

module.exports = { list, getOrFail, create, update, remove, adjustStock };