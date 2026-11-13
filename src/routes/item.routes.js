const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validators/item.validator');
const c = require('../controllers/item.controller');

router.use(authenticate); // semua endpoint /items wajib login

router.get('/', validate(v.listQuerySchema, 'query'), c.list);
router.post('/', validate(v.itemSchema), c.create);
router.put('/:id', validate(v.idParamSchema, 'params'), validate(v.itemSchema), c.update);
router.delete('/:id', validate(v.idParamSchema, 'params'), c.remove);
router.patch(
  '/:id/stock',
  validate(v.idParamSchema, 'params'),
  validate(v.adjustStockSchema),
  c.adjustStock
);

module.exports = router;