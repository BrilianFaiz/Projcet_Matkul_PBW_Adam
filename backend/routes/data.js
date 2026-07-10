const express = require("express");
const router = express.Router();

const Data = require("../models/Transaksi");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

// ➕ ADD DATA BARU (POST)
// Mengizinkan Admin, Superadmin, Operator, Procurement, dan QC untuk menambah data transaksi sesuai areanya
router.post(
  "/add", 
  auth, 
  checkRole("admin", "superadmin", "operator", "procurement", "qc"), 
  async (req, res) => {
    try {
      // 🟢 Penyempurnaan: Paksa 'operatorName' menggunakan nama asli dari user yang sedang login (aman dari manipulasi)
      const payload = {
        ...req.body,
        operatorName: req.user.nama 
      };

      const data = new Data(payload);
      await data.save();
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 📋 GET ALL DATA
// Semua role diberikan hak akses membaca data untuk kebutuhan transparansi dan pengisian dasbor masing-masing
router.get(
  "/data", 
  auth, 
  checkRole("superadmin", "admin", "operator", "manager", "procurement", "qc"), 
  async (req, res) => {
    try {
      const data = await Data.find().sort({ createdAt: -1 });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 🔍 GET DATA BY ID
router.get(
  "/:id", 
  auth, 
  checkRole("superadmin", "admin", "operator", "manager", "procurement", "qc"), 
  async (req, res) => {
    try {
      const data = await Data.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 🔄 UPDATE DATA EKSIS / AKUMULASI STOK (PUT)
// Dikunci ketat: Hanya Admin pusat dan Superadmin yang boleh mengubah master stok atau melakukan akumulasi
router.put(
  "/:id", 
  auth, 
  checkRole("admin", "superadmin"), 
  async (req, res) => {
    try {
      // Gunakan $set agar hanya memperbarui field yang dikirim dari frontend, 
      // tanpa merusak field lain yang sudah ada di dokumen tersebut
      const updated = await Data.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ❌ DELETE DATA
// Dikunci ketat: Hanya Superadmin yang memiliki wewenang menghapus jejak audit transaksi dari database
router.delete(
  "/:id", 
  auth, 
  checkRole("superadmin"), 
  async (req, res) => {
    try {
      const deleted = await Data.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json({ message: "Data berhasil dihapus" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✔️ APPROVAL REQUEST OPERATOR
// Hak persetujuan dipatok untuk Admin utama dan Superadmin.
router.post(
  "/approve/:id", 
  auth, 
  checkRole("admin", "superadmin"), 
  async (req, res) => {
    try {
      const request = await Data.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request tidak ditemukan" });
      }

      // Ubah status request asal menjadi Disetujui
      request.statusProduksi = "Disetujui";
      await request.save();

      // Buat jurnal pengeluaran bahan baku riil di Warehouse RM
      await Data.create({
        barang: request.barang,
        in: 0,
        out: request.out,
        stage: "Warehouse RM",
        operatorName: request.operatorName,
        statusProduksi: "Disetujui",
        tanggal: new Date().toISOString()
      });

      res.json({ message: "Approval berhasil" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;