const express = require("express");
const router = express.Router();

const Data = require("../models/Transaksi");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

// =========================================================
// ➕ 1. ADD DATA BARU (POST)
// =========================================================
// Endpoint: http://localhost:1337/api/data
// Perubahan: Mengubah rute dari "/add" menjadi "/" agar selaras dengan pemanggilan frontend
router.post(
  "/", 
  auth, 
  checkRole("admin", "superadmin", "operator", "procurement", "qc"), 
  async (req, res) => {
    try {
      // Mengamankan 'operatorName' menggunakan nama dari token user login (mencegah manipulasi data)
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

// =========================================================
// 📋 2. GET ALL DATA (GET)
// =========================================================
// Endpoint: http://localhost:1337/api/data
// Perubahan: Mengubah rute dari "/data" menjadi "/" untuk menyelesaikan masalah Error 404
router.get(
  "/", 
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

// =========================================================
// 🔍 3. GET DATA BY ID (GET)
// =========================================================
// Endpoint: http://localhost:1337/api/data/:id
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

// =========================================================
// 🔄 4. UPDATE DATA EKSIS / AKUMULASI STOK & STATUS (PUT)
// =========================================================
// Endpoint: http://localhost:1337/api/data/:id
// Perubahan: Membuka izin bagi 'manager' dan 'qc' agar bisa memperbarui status dokumen/batch produksi
router.put(
  "/:id", 
  auth, 
  checkRole("admin", "superadmin", "manager", "qc"), 
  async (req, res) => {
    try {
      // Menggunakan operator $set bawaan MongoDB agar perubahan bersifat parsial tanpa merusak field lain
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

// =========================================================
// ❌ 5. DELETE DATA (DELETE)
// =========================================================
// Endpoint: http://localhost:1337/api/data/:id
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
      res.json({ message: "Data berhasil dihapus dari sistem" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// =========================================================
// ✔️ 6. APPROVAL REQUEST OPERATOR (POST)
// =========================================================
// Endpoint: http://localhost:1337/api/data/approve/:id
router.post(
  "/approve/:id", 
  auth, 
  checkRole("admin", "superadmin"), 
  async (req, res) => {
    try {
      const request = await Data.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Dokumen request tidak ditemukan" });
      }

      // Update status data request mentah
      request.statusProduksi = "Disetujui";
      await request.save();

      // Secara otomatis membuat mutasi riil barang keluar dari gudang (Warehouse RM)
      await Data.create({
        barang: request.barang,
        in: 0,
        out: request.out,
        stage: "Warehouse RM",
        operatorName: request.operatorName,
        statusProduksi: "Disetujui",
        tanggal: new Date().toISOString()
      });

      res.json({ message: "Aksi approval logistik sukses dijalankan" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;