require('dotenv').config({
  path: './mongo.env'
});

console.log("JWT Secret Loaded:", process.env.JWT_SECRET ? "YES" : "NO");
console.log("MONGO URI Loaded:", process.env.MONGO_URI ? "YES" : "NO");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dataRoutes = require("./routes/data");

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Koneksi MongoDB
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WMS';
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Terhubung ✅'))
  .catch(err => console.log('MongoDB Error:', err));

// ==========================================
// 🚀 DELEGASI ROUTER UTAMA
// ==========================================

// Menangani authentikasi & management user (register, login, me, users)
app.use('/api/auth', authRoutes);

// Menangani seluruh urusan transaksi (add, data, :id, approve)
// Semua pembatasan 6 role sudah dihandle secara rapi di dalam file routes/data.js
app.use('/api/data', dataRoutes);

// ==========================================
// 🛠️ MAINTENANCE & HEALTH
// ==========================================

// Health Check untuk memantau status server & database
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ 
    status: state === 1 ? 'online' : 'offline',
    database: state === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT} 🚀`));