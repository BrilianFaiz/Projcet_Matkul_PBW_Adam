const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// ➕ REGISTER (Opsi 1: Terbuka umum untuk mempermudah testing 6 pilihan role dari frontend)
router.post('/register', async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;

    // 1. Cek ketersediaan username di database
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username sudah terdaftar' });
    }

    const totalUsers = await User.countDocuments();
    let finalRole = role || 'operator';

    // Jika database benar-benar kosong, pendaftar pertama otomatis dipaksa menjadi superadmin
    if (totalUsers === 0) {
      finalRole = 'superadmin';
    }

    // 2. Hash password dan simpan user baru
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      nama, 
      username, 
      password: hashedPassword, 
      role: finalRole 
    });
    
    await user.save();

    res.status(201).json({ 
      message: `Registrasi berhasil sebagai ${finalRole}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    // Token membawa payload lengkap (id, nama, role)
    const token = jwt.sign(
      { id: user._id, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user._id, nama: user.nama, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 CEK DATA DIRI (GET PROFILE)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🛠️ MANAGEMENT USER (KHUSUS SUPERADMIN)
// ==========================================

// 👥 GET ALL USERS (Melihat daftar semua staf gudang)
router.get('/users', authMiddleware, checkRole('superadmin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE ROLE USER (Mengubah wewenang staff, misal operator dinaikkan ke qc)
router.put('/users/:id/role', authMiddleware, checkRole('superadmin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.json({ message: "Role berhasil diperbarui", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE USER (Menghapus akun staf)
router.delete('/users/:id', authMiddleware, checkRole('superadmin'), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: "Akun pengguna berhasil dihapus dari sistem" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;