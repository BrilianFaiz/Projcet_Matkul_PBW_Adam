require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Transaksi = require('./models/Transaksi');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const checkRole = require('./middleware/checkRole');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// koneksi MongoDB
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WMS';
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Terhubung ✅'))
  .catch(err => console.log('MongoDB Error:', err));

// routes auth
app.use('/api/auth', authRoutes);

// tambah transaksi — operator & admin
app.post('/api/add', authMiddleware, checkRole('operator', 'admin'), async (req, res) => {
  try {
    const dataBaru = new Transaksi(req.body);
    await dataBaru.save();
    res.status(201).json({ message: 'Berhasil simpan!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ambil semua data — operator & admin
app.get('/api/data', authMiddleware, checkRole('operator', 'admin'), async (req, res) => {
  try {
    const data = await Transaksi.find().sort({ createdAt: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
});

// health check
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ status: state === 1 ? 'online' : 'offline' });
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT} 🚀`));