// Validasi req.body dengan schema zod, lalu ganti req.body dengan data yang sudah bersih
const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validasi gagal',
        errors: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.validated = { ...(req.validated || {}), [source]: result.data };
    next();
  };
  
  module.exports = validate;