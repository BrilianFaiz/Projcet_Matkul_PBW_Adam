const mongoose = require('mongoose');

const TransaksiSchema = new mongoose.Schema({
  tanggal: { 
    type: String, 
    default: () => new Date().toISOString() 
  },
  barang: { 
    type: String, 
    required: true 
  },
  // 🟢 LOKASI FISIK BARANG / TAHAPAN DI GUDANG
  stage: { 
    type: String, 
    required: true,
    enum: ['Warehouse RM', 'Proses', 'Finish Good'] 
  },
  // 🟢 JENIS AKSI / EVENT YANG TERJADI (Sangat membantu filter di Frontend)
  jenisTransaksi: {
    type: String,
    required: true,
    enum: ['Stok Awal', 'Request Bahan', 'Laporan Produksi', 'Barang Keluar', 'Adjusment'],
    default: 'Stok Awal'
  },
  in: { 
    type: Number, 
    default: 0 
  },
  out: { 
    type: Number, 
    default: 0 
  },
  reject: { 
    type: Number, 
    default: 0 
  },
  operatorName: { 
    type: String 
  },
  statusProduksi: { 
    type: String,
    enum: ['Pending', 'Disetujui', 'Selesai', 'Ditolak'],
    default: 'Selesai' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaksi', TransaksiSchema);