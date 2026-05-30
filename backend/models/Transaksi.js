const mongoose = require('mongoose');

const TransaksiSchema = new mongoose.Schema({
  tanggal: String,
  barang: String,
  stage: String,
  in: { type: Number, default: 0 },
  out: { type: Number, default: 0 },
  
  // 🔴 TAMBAHKAN FIELD INI AGAR DATA CACAT/REJECT DISIMPAN BACKEND
  reject: { type: Number, default: 0 },
  
  // Tambahan field operasional (Biar data tracking nama & status lancar)
  operatorName: String,
  statusProduksi: String
}, { timestamps: true });

module.exports = mongoose.model('Transaksi', TransaksiSchema);