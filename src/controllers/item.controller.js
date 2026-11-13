const itemService = require('../services/item.service');

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

const list = wrap(async (req, res) => {
  const result = await itemService.list(req.validated.query);
  res.json({ message: 'OK', data: result.items, pagination: result.pagination });
});

const create = wrap(async (req, res) => {
  const item = await itemService.create(req.validated.body, req.user.id);
  res.status(201).json({ message: 'Barang berhasil ditambahkan', data: item });
});

const update = wrap(async (req, res) => {
  const item = await itemService.update(req.validated.params.id, req.validated.body);
  res.json({ message: 'Barang berhasil diperbarui', data: item });
});

const remove = wrap(async (req, res) => {
  await itemService.remove(req.validated.params.id);
  res.json({ message: 'Barang berhasil dihapus' });
});

const adjustStock = wrap(async (req, res) => {
  const item = await itemService.adjustStock(
    req.validated.params.id,
    req.validated.body.quantity
  );
  res.json({ message: 'Stok berhasil diperbarui', data: item });
});

module.exports = { list, create, update, remove, adjustStock };