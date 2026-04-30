const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect('mongodb://localhost:27017/WMS')
    .then(() => console.log('MongoDB Terhubung... ✅'))
    .catch(err => console.log(err));

// API untuk Simpan Data (POST)
app.post('/api/user', async (req, res) => {
    console.log("Menerima data:", req.body); // Debug: Cek data yang diterima
  try {
    const dataBaru = new User(req.body);
    await dataBaru.save();
    res.status(201).json({ message: "Berhasil simpan!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API untuk Ambil Data (GET)
app.get('/api/User', async (req, res) => {
  try {
    const data = await User.find(); // Mencari semua data di koleksi User
    res.json(data); // Kirim data dalam format JSON murni
  } catch (err) {
    console.error("Gagal ambil data:", err);
    res.status(500).json({ message: "Gagal mengambil data dari database" });
  }
});

app.listen(5000, () => console.log('Server jalan di port 5000'));