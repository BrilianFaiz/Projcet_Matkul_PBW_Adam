require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Transaksi = require('./models/Transaksi');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const checkRole = require('./middleware/checkRole');

const app = express();

app.use(cors());
app.use(express.json());

// koneksi MongoDB
  const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/db_wms";
  mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Terhubung ✅'))
  .catch(err => console.log('MongoDB Error:', err));

// routes auth
app.use('/api/auth', authRoutes);

// OPERATOR & ADMIN: Boleh tambah data
app.post('/api/add', authMiddleware, checkRole('operator', 'admin'), async (req, res) => {
  // ... kode simpan data ...
});

// HANYA ADMIN: Yang boleh ambil semua data untuk visualisasi dashboard
app.get('/api/data', authMiddleware, checkRole('admin'), async (req, res) => {
  // ... kode ambil data ...
});

// API transaksi (dilindungi login)
app.post('/api/add', authMiddleware, async (req, res) => {
  try {
    const dataBaru = new Transaksi(req.body);
    await dataBaru.save();
    res.status(201).json({ message: 'Berhasil simpan!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/data', authMiddleware, async (req, res) => {
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