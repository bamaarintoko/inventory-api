const express = require('express');
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API jalan' }));
app.use('/auth', authRoutes);
app.use('/items', itemRoutes);

app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));
app.use(errorHandler);

module.exports = app;